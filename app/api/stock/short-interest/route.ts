import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const FINRA_URL = "https://api.finra.org/data/group/otcMarket/name/consolidatedShortInterest";
// Bi-monthly data (twice a month), published with an ~8-business-day lag —
// this cache TTL just needs to be shorter than that publish cadence, not
// track it exactly.
const CACHE_TTL_S = 24 * 60 * 60;
const MAX_CANDIDATES = 8; // ~4 months of settlement cycles

type Point = {
  settlementDate: string;
  shortInterest: number;
  previousShortInterest: number | null;
  avgDailyVolume: number | null;
  daysToCover: number | null;
  changePercent: number | null;
};

// FINRA short interest settles on the 15th and the last calendar day of
// each month (moved back to the nearest prior weekday when that date falls
// on a weekend — FINRA doesn't publish a holiday-adjusted calendar via this
// API, so this is a close approximation, not exact). Querying an ahead of
// the given date will just return no rows, which the caller filters out
// rather than treating as an error.
function candidateSettlementDates(count: number): string[] {
  const toWeekday = (d: Date) => {
    const day = d.getUTCDay();
    if (day === 0) d.setUTCDate(d.getUTCDate() - 2); // Sunday -> Friday
    else if (day === 6) d.setUTCDate(d.getUTCDate() - 1); // Saturday -> Friday
    return d;
  };
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const dates: string[] = [];
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);
  while (dates.length < count) {
    const lastDayOfMonth = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 0));
    const fifteenth = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), 15));
    for (const raw of [lastDayOfMonth, fifteenth]) {
      const adjusted = toWeekday(new Date(raw));
      if (adjusted <= cursor) dates.push(fmt(adjusted));
    }
    cursor.setUTCMonth(cursor.getUTCMonth() - 1);
  }
  return dates.sort((a, b) => (a < b ? 1 : -1)).slice(0, count); // newest first
}

// FINRA leaves empty fields (stockSplitFlag, revisionFlag) completely
// unquoted — a bare comma, e.g. `"146547784",,"58400983"`. Matching only
// quoted substrings (the naive regex approach) silently drops those empty
// tokens and shifts every field after them into the wrong column. This
// walks the line comma-by-comma so an unquoted empty field still produces
// a real (empty-string) entry in the output.
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let i = 0;
  while (i <= line.length) {
    if (line[i] === '"') {
      const end = line.indexOf('"', i + 1);
      fields.push(line.slice(i + 1, end === -1 ? line.length : end));
      i = (end === -1 ? line.length : end) + 2; // skip closing quote + comma
    } else {
      const end = line.indexOf(",", i);
      if (end === -1) { fields.push(line.slice(i)); break; }
      fields.push(line.slice(i, end));
      i = end + 1;
    }
  }
  return fields;
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const parseLine = parseCsvLine;
  const headers = parseLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ""; });
    return row;
  });
}

async function fetchOneDate(symbol: string, settlementDate: string): Promise<Point | null> {
  const res = await fetch(FINRA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      limit: 1,
      compareFilters: [
        { compareType: "EQUAL", fieldName: "symbolCode", fieldValue: symbol },
        { compareType: "EQUAL", fieldName: "settlementDate", fieldValue: settlementDate },
      ],
    }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const rows = parseCsv(await res.text());
  if (!rows.length) return null;
  const r = rows[0];
  const num = (v: string) => (v === "" || v == null ? null : Number(v));
  const shortInterest = num(r.currentShortPositionQuantity);
  if (shortInterest == null) return null;
  return {
    settlementDate: r.settlementDate,
    shortInterest,
    previousShortInterest: num(r.previousShortPositionQuantity),
    avgDailyVolume: num(r.averageDailyVolumeQuantity),
    daysToCover: num(r.daysToCoverQuantity),
    changePercent: num(r.changePercent),
  };
}

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("stock:short-interest", clientIdFromRequest(request), 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const symbolParam = request.nextUrl.searchParams.get("symbol");
  if (!symbolParam) return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  const sym = symbolParam.toUpperCase();

  // v2: fixes the CSV parser dropping unquoted empty fields, which
  // misaligned every column after stockSplitFlag/revisionFlag — bumped so
  // a stale v1 cache entry with wrong avgDailyVolume/daysToCover values
  // never gets served to the corrected frontend.
  const cacheKey = `short-interest:${sym}:v2`;
  const cached = await kvGet<{ points: Point[] }>(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const dates = candidateSettlementDates(MAX_CANDIDATES);
    const results = await Promise.all(dates.map((d) => fetchOneDate(sym, d)));
    const points = results.filter((p): p is Point => p != null).sort((a, b) => (a.settlementDate < b.settlementDate ? -1 : 1));

    if (!points.length) {
      // Genuinely no short interest on file for this symbol (thin float,
      // very new listing, or not an OTC-reportable equity) — not an error.
      return NextResponse.json({ points: [] }, { status: 404 });
    }

    const body = { points };
    await kvSet(cacheKey, body, CACHE_TTL_S);
    return NextResponse.json(body);
  } catch (err) {
    console.error("[stock/short-interest] error:", err);
    return NextResponse.json({ error: "Failed to fetch short interest data" }, { status: 502 });
  }
}
