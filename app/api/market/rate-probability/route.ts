import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

const CACHE_KEY = "market:rate-probability";
const CACHE_TTL_S = 12 * 60 * 60; // the tracker updates once per business day
// The Atlanta Fed's own public data product for this exact panel — same
// numbers ustreasuryyieldcurve.com sources from "Atlanta Fed." Verified by
// hand: the nearest window's Prob: hike / Prob: cut for the latest date in
// this file matched that site's live "Rate Hike / Steady / Rate Cut" figures
// exactly (57.0% / 42.2% / 0.8% for the 2026-09-16 window as of 2026-08-20).
const MPT_URL = "https://www.atlantafed.org/-/media/Project/Atlanta/FRBA/Documents/cenfis/market-probability-tracker/mpt_histdata.xlsx";
const MAX_WINDOWS = 4; // matches the tracker's own "four nearest-expiring quarterly contracts"

type DataRow = { date: string; reference_start: number; target_range: string; field: string; value: number | string };
type Window = { referenceStart: string; targetRange: string; probHike: number; probCut: number; probSteady: number };
type Body = { asOf: string; windows: Window[] };

// The file stores reference_start as an Excel serial date (days since
// 1899-12-30, Excel's epoch) rather than a string — this is the standard
// serial->ISO conversion (25569 = days between the Excel epoch and the
// Unix epoch).
function excelSerialToISODate(serial: number): string {
  const utcDays = Math.floor(serial - 25569);
  return new Date(utcDays * 86400 * 1000).toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("market:rate-probability", clientIdFromRequest(request), 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const cached = await kvGet<Body>(CACHE_KEY);
  if (cached) {
    return NextResponse.json(cached, { headers: { "Cache-Control": "public, max-age=43200" } });
  }

  try {
    const res = await fetch(MPT_URL, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error(`Atlanta Fed MPT fetch failed: ${res.status}`);
    const buffer = await res.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "buffer" });
    const sheet = wb.Sheets["DATA"];
    if (!sheet) throw new Error("Atlanta Fed MPT file has no DATA sheet");
    const rows = XLSX.utils.sheet_to_json(sheet) as DataRow[];
    if (!rows.length) throw new Error("Atlanta Fed MPT file had no DATA rows");

    // Rows are long-format (date, reference_start, target_range, field,
    // value) — every date carries one row per statistic per 3-month
    // reference window, so the latest date's rows have to be grouped by
    // reference_start before the hike/cut probabilities can be pulled out.
    const latestDate = rows.reduce((max, r) => (r.date > max ? r.date : max), "");
    const todays = rows.filter((r) => r.date === latestDate);
    const refStarts = [...new Set(todays.map((r) => r.reference_start))].sort((a, b) => a - b);

    const windows: Window[] = [];
    for (const rs of refStarts.slice(0, MAX_WINDOWS)) {
      const group = todays.filter((r) => r.reference_start === rs);
      const hike = group.find((r) => r.field === "Prob: hike");
      const cut = group.find((r) => r.field === "Prob: cut");
      if (!hike || !cut) continue;
      const probHike = parseFloat(String(hike.value));
      const probCut = parseFloat(String(cut.value));
      if (Number.isNaN(probHike) || Number.isNaN(probCut)) continue;
      windows.push({
        referenceStart: excelSerialToISODate(rs),
        targetRange: group[0].target_range,
        probHike,
        probCut,
        // Derived, not published directly — the file only carries hike/cut
        // tail probabilities plus per-25bps-bucket ones, and "steady" is
        // exactly what's left over (matches the reference site's own
        // Hike/Steady/Cut breakdown, which sums to 100%).
        probSteady: Math.max(0, 100 - probHike - probCut),
      });
    }

    if (!windows.length) throw new Error("Could not extract any probability windows from the MPT file");

    const body: Body = { asOf: latestDate, windows };
    await kvSet(CACHE_KEY, body, CACHE_TTL_S);
    return NextResponse.json(body, { headers: { "Cache-Control": "public, max-age=43200" } });
  } catch (err) {
    console.error("[market/rate-probability] error:", err);
    return NextResponse.json({ error: "Failed to fetch rate probability data" }, { status: 502 });
  }
}
