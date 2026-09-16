import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

const CACHE_KEY = "market:recession-probability";
const CACHE_TTL_S = 24 * 60 * 60; // the model updates once per month

// The New York Fed's own "Yield Curve as a Leading Indicator" model — the
// actual public probit model (Estrella/Mishkin), not a formula we'd have to
// reconstruct ourselves. Confirmed live: the "rec_prob" sheet's Rec_prob
// column for a given row is the probability of a recession occurring
// AT that row's date, computed from the 10Y-3M spread observed 12 months
// earlier — meaning the tail of the file extends ~12 months past the last
// real spread reading as pure forecast (spread column empty, Rec_prob
// still populated). This is the same data newyorkfed.org's own public
// chart plots.
const NYFED_URL = "https://www.newyorkfed.org/medialibrary/media/research/capital_markets/allmonth.xls";

type Row = [number, number | null, number | null, number | null, number | null, number | null, number | null];
type HistoryPoint = { date: string; spread: number | null; probability: number; nberRecession: boolean };
type Body = {
  asOf: string; // date the headline probability refers to (~12mo ahead of the latest real spread reading)
  probability: number; // 0-100
  latestSpread: { date: string; value: number } | null;
  history: HistoryPoint[];
};

function excelSerialToISODate(serial: number): string {
  const utcDays = Math.floor(serial - 25569);
  return new Date(utcDays * 86400 * 1000).toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("market:recession-probability", clientIdFromRequest(request), 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const cached = await kvGet<Body>(CACHE_KEY);
  if (cached) {
    return NextResponse.json(cached, { headers: { "Cache-Control": "public, max-age=86400" } });
  }

  try {
    const res = await fetch(NYFED_URL, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error(`NY Fed recession-probability fetch failed: ${res.status}`);
    const buffer = await res.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "buffer" });
    const sheet = wb.Sheets["rec_prob"];
    if (!sheet) throw new Error("NY Fed file has no rec_prob sheet");
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as Row[];
    const dataRows = rows.slice(1).filter((r) => r[0] != null);
    if (!dataRows.length) throw new Error("NY Fed file had no data rows");

    const history: HistoryPoint[] = dataRows
      .map((r) => ({
        date: excelSerialToISODate(r[0]),
        spread: r[4] ?? null,
        probability: r[5] != null ? r[5] * 100 : null,
        nberRecession: r[6] === 1,
      }))
      .filter((p): p is HistoryPoint => p.probability != null);

    if (!history.length) throw new Error("Could not extract any recession-probability rows");

    // The last row with a real spread reading is "today" as far as the
    // underlying Treasury data goes — everything after that in the file is
    // the model's own forward extrapolation, ending with the headline
    // "probability of recession ~12 months from now" figure.
    const lastAnchored = [...history].reverse().find((p) => p.spread != null);
    const headline = history[history.length - 1];

    const body: Body = {
      asOf: headline.date,
      probability: headline.probability,
      latestSpread: lastAnchored ? { date: lastAnchored.date, value: lastAnchored.spread as number } : null,
      // Trailing 15 years is plenty for a sparkline/history chart without
      // shipping 65+ years of monthly points to the client on every load.
      history: history.filter((p) => p.date >= "2010-01-01"),
    };
    await kvSet(CACHE_KEY, body, CACHE_TTL_S);
    return NextResponse.json(body, { headers: { "Cache-Control": "public, max-age=86400" } });
  } catch (err) {
    console.error("[market/recession-probability] error:", err);
    return NextResponse.json({ error: "Failed to fetch recession probability data" }, { status: 502 });
  }
}
