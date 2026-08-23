import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const FRED_BASE = "https://api.stlouisfed.org/fred";
const CACHE_KEY = "intel:yield-curve:v2"; // v2: points now also carry prevYield for day-over-day change
const CACHE_TTL_S = 6 * 60 * 60; // Treasury yields post once per business day
// A historical date's published rate never changes after the fact, unlike
// "today" which updates once per business day — safe to cache far longer.
const HISTORICAL_CACHE_TTL_S = 30 * 24 * 60 * 60;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// FRED's Treasury Constant Maturity series — the standard free real-yield
// curve, same family as the risk-free-rate series used for backtesting.
const MATURITIES: { id: string; label: string; months: number }[] = [
  { id: "DGS1MO", label: "1M", months: 1 },
  { id: "DGS3MO", label: "3M", months: 3 },
  { id: "DGS6MO", label: "6M", months: 6 },
  { id: "DGS1", label: "1Y", months: 12 },
  { id: "DGS2", label: "2Y", months: 24 },
  { id: "DGS3", label: "3Y", months: 36 },
  { id: "DGS5", label: "5Y", months: 60 },
  { id: "DGS7", label: "7Y", months: 84 },
  { id: "DGS10", label: "10Y", months: 120 },
  { id: "DGS20", label: "20Y", months: 240 },
  { id: "DGS30", label: "30Y", months: 360 },
];

type Point = { label: string; months: number; yield: number; date: string; prevYield: number | null };

// Keeps the 2 most recent real observations (skipping "." no-data rows) so
// callers can show a day-over-day change, not just the latest level.
// Throws on a real fetch failure rather than returning null — Treasury
// Constant Maturity series essentially never legitimately have zero
// observations, so a null here would almost always mean "FRED request
// failed," and silently dropping that maturity from the curve (then
// caching the gap for 6h below) would misrepresent it as real data.
async function fetchLatestTwo(seriesId: string, apiKey: string, asOfDate?: string): Promise<{ value: number; date: string; prevValue: number | null } | null> {
  // With asOfDate, this finds the yield in effect on (or most recently
  // before) that date — a weekend/holiday has no observation of its own,
  // so "the curve as of a given date" always means the latest real reading
  // at or before it, same convention the reference sites use.
  let url = `${FRED_BASE}/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=5`;
  if (asOfDate) url += `&observation_end=${asOfDate}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FRED series ${seriesId} fetch failed: ${res.status}`);
  const data = (await res.json()) as { observations?: { date: string; value: string }[] };
  const real = (data.observations ?? []).filter((o) => o.value !== ".");
  if (!real.length) return null;
  return {
    value: parseFloat(real[0].value),
    date: real[0].date,
    prevValue: real.length > 1 ? parseFloat(real[1].value) : null,
  };
}

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("intel:yield-curve", clientIdFromRequest(request), 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const dateParam = request.nextUrl.searchParams.get("date");
  const today = new Date().toISOString().slice(0, 10);
  // An invalid or future date silently falls back to "today" rather than
  // erroring — a stray/garbage date param shouldn't break the whole curve.
  const asOfDate = dateParam && DATE_RE.test(dateParam) && dateParam <= today ? dateParam : undefined;
  const cacheKey = asOfDate ? `${CACHE_KEY}:${asOfDate}` : CACHE_KEY;
  const cacheTtl = asOfDate ? HISTORICAL_CACHE_TTL_S : CACHE_TTL_S;

  const cached = await kvGet<{ points: Point[] }>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { "Cache-Control": "public, max-age=21600" } });
  }

  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FRED_API_KEY is not configured" }, { status: 500 });
  }

  try {
    // Small chunks with a gap — same fan-out lesson as every other
    // multi-symbol route in this app.
    const CHUNK = 4;
    const results: (Awaited<ReturnType<typeof fetchLatestTwo>>)[] = [];
    for (let i = 0; i < MATURITIES.length; i += CHUNK) {
      const chunk = MATURITIES.slice(i, i + CHUNK);
      const chunkResults = await Promise.all(chunk.map((m) => fetchLatestTwo(m.id, apiKey, asOfDate)));
      results.push(...chunkResults);
      if (i + CHUNK < MATURITIES.length) await new Promise((r) => setTimeout(r, 300));
    }

    const points: Point[] = [];
    MATURITIES.forEach((m, i) => {
      const r = results[i];
      if (r) points.push({ label: m.label, months: m.months, yield: r.value, date: r.date, prevYield: r.prevValue });
    });

    // A date far enough back that none of the 11 maturities had started
    // trading yet (the shortest, 1M, only starts in 2001) legitimately has
    // zero points — that's real, not a fetch failure, so it's a 404 rather
    // than a 500.
    if (!points.length) {
      return NextResponse.json({ error: "No yield curve data available for this date" }, { status: 404 });
    }

    const y2 = points.find((p) => p.months === 24)?.yield ?? null;
    const y10 = points.find((p) => p.months === 120)?.yield ?? null;
    const spread10y2y = y2 != null && y10 != null ? y10 - y2 : null;

    const body = { points, spread10y2y, inverted: spread10y2y != null ? spread10y2y < 0 : null };
    await kvSet(cacheKey, body, cacheTtl);
    return NextResponse.json(body, { headers: { "Cache-Control": "public, max-age=21600" } });
  } catch (err) {
    console.error("[intel/yield-curve] error:", err);
    return NextResponse.json({ error: "Failed to fetch yield curve" }, { status: 500 });
  }
}
