import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const COT_URL = "https://www.cftc.gov/dea/newcot/deafut.txt";
const CACHE_TTL_S = 24 * 60 * 60; // CFTC publishes once a week, Fridays

// Maps this app's INSTRUMENTS codes to the exact market name string the
// CFTC "Legacy" futures-only report uses — confirmed by pulling the real
// file and matching each one by hand (these aren't derivable from the
// ticker/Yahoo symbol; the CFTC's naming is its own, e.g. NYMEX heating
// oil is filed as "NY HARBOR ULSD").
const MARKET_NAMES: Record<string, string> = {
  GOLD: "GOLD - COMMODITY EXCHANGE INC.",
  SILVER: "SILVER - COMMODITY EXCHANGE INC.",
  PLATINUM: "PLATINUM - NEW YORK MERCANTILE EXCHANGE",
  PALLADIUM: "PALLADIUM - NEW YORK MERCANTILE EXCHANGE",
  COPPER: "COPPER- #1 - COMMODITY EXCHANGE INC.",
  OIL: "WTI-PHYSICAL - NEW YORK MERCANTILE EXCHANGE",
  BRENT: "BRENT LAST DAY - NEW YORK MERCANTILE EXCHANGE",
  NATGAS: "NAT GAS NYME - NEW YORK MERCANTILE EXCHANGE",
  HEATOIL: "NY HARBOR ULSD - NEW YORK MERCANTILE EXCHANGE",
  GASOLINE: "GASOLINE RBOB - NEW YORK MERCANTILE EXCHANGE",
  CORN: "CORN - CHICAGO BOARD OF TRADE",
  WHEAT: "WHEAT-SRW - CHICAGO BOARD OF TRADE",
  SOYBEANS: "SOYBEANS - CHICAGO BOARD OF TRADE",
  COFFEE: "COFFEE C - ICE FUTURES U.S.",
  COTTON: "COTTON NO. 2 - ICE FUTURES U.S.",
  SUGAR: "SUGAR NO. 11 - ICE FUTURES U.S.",
};

type CotRow = {
  reportDate: string;
  openInterest: number;
  noncommLong: number;
  noncommShort: number;
  commLong: number;
  commShort: number;
  nonreportLong: number;
  nonreportShort: number;
};

// The CFTC's "Legacy" report is a flat CSV with only the first field
// (market name) ever quoted — every field after it is a bare number, so
// a plain split on the unquoted remainder is safe (no embedded commas
// inside those fields to worry about). Lines are \r\n-terminated; JS's
// `.` never matches \r (a line-terminator char, excluded from `.` even
// without the `m` flag), so a trailing \r left in `line` makes `(.*)$`
// unsatisfiable and the whole regex silently fails to match — every
// single row, not just some. Stripping it first is the fix.
function parseLine(rawLine: string): string[] | null {
  const line = rawLine.replace(/\r$/, "");
  const m = line.match(/^"([^"]*)",(.*)$/);
  if (!m) return null;
  return [m[1], ...m[2].split(",")];
}

async function fetchAllRows(): Promise<Record<string, CotRow>> {
  const cacheKey = "cftc-cot:all:v3";
  const cached = await kvGet<Record<string, CotRow>>(cacheKey);
  if (cached && Object.keys(cached).length) return cached;

  const res = await fetch(COT_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`CFTC COT fetch failed: ${res.status}`);
  const text = await res.text();

  const rows: Record<string, CotRow> = {};
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    const fields = parseLine(line);
    if (!fields || fields.length < 17) continue;
    const name = fields[0];
    const num = (v: string) => { const n = parseInt(v.trim(), 10); return Number.isNaN(n) ? 0 : n; };
    rows[name] = {
      reportDate: fields[2],
      openInterest: num(fields[7]),
      noncommLong: num(fields[8]),
      noncommShort: num(fields[9]),
      commLong: num(fields[11]),
      commShort: num(fields[12]),
      nonreportLong: num(fields[15]),
      nonreportShort: num(fields[16]),
    };
  }

  // A real fetch that somehow parses to zero rows (CFTC serving something
  // other than the expected format) must not get cached for 24h — that
  // would make a transient/format hiccup look identical to "no positioning
  // data exists" for every commodity, for the rest of the day.
  if (Object.keys(rows).length) await kvSet(cacheKey, rows, CACHE_TTL_S);
  return rows;
}

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("market:cftc-cot", clientIdFromRequest(request), 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const code = request.nextUrl.searchParams.get("code")?.toUpperCase();
  const marketName = code ? MARKET_NAMES[code] : null;
  if (!marketName) return NextResponse.json({ error: "Unsupported or missing code" }, { status: 400 });

  try {
    const rows = await fetchAllRows();
    const row = rows[marketName];
    if (!row) return NextResponse.json({ available: false });
    return NextResponse.json({ available: true, ...row }, { headers: { "Cache-Control": "public, max-age=86400" } });
  } catch (err) {
    console.error("[market/cftc-cot] error:", err);
    return NextResponse.json({ error: "Failed to fetch CFTC positioning data" }, { status: 502 });
  }
}
