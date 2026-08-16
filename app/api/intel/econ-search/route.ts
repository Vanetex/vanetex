import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const FRED_BASE = "https://api.stlouisfed.org/fred";
const CACHE_TTL_S = 24 * 60 * 60; // which real series match a keyword doesn't change day to day
const MAX_RESULTS = 8;

// FRED's own JSON shape — the "seriess" key (not a typo) is real, and
// documented at https://fred.stlouisfed.org/docs/api/fred/series_search.html
type FredSeries = {
  id: string;
  title: string;
  frequency: string;
  frequency_short: string;
  units: string;
  units_short: string;
  seasonal_adjustment_short: string;
  popularity: number;
  observation_start: string;
  observation_end: string;
};

type IndicatorResult = {
  id: string;
  title: string;
  frequency: string;
  units: string;
  seasonalAdjustment: string;
  observationStart: string;
  observationEnd: string;
};

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("intel:econ-search", clientIdFromRequest(request), 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FRED_API_KEY is not configured" }, { status: 500 });
  }

  const cacheKey = `econ-search:${q.toLowerCase()}`;
  const cached = await kvGet<{ results: IndicatorResult[] }>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { "Cache-Control": "public, max-age=86400" } });
  }

  try {
    const url = `${FRED_BASE}/series/search?search_text=${encodeURIComponent(q)}&search_type=full_text&api_key=${apiKey}&file_type=json&limit=${MAX_RESULTS}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`FRED search failed: ${res.status}`);

    const data = (await res.json()) as { seriess?: FredSeries[] };
    const results: IndicatorResult[] = (data.seriess ?? []).map((s) => ({
      id: s.id,
      title: s.title,
      frequency: s.frequency,
      units: s.units,
      seasonalAdjustment: s.seasonal_adjustment_short,
      observationStart: s.observation_start,
      observationEnd: s.observation_end,
    }));

    const body = { results };
    await kvSet(cacheKey, body, CACHE_TTL_S);
    return NextResponse.json(body, { headers: { "Cache-Control": "public, max-age=86400" } });
  } catch (err) {
    console.error("[intel/econ-search] error:", err);
    return NextResponse.json({ error: "Failed to search economic indicators" }, { status: 500 });
  }
}
