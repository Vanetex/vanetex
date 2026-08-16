import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const FRED_BASE = "https://api.stlouisfed.org/fred";
const CACHE_TTL_S = 6 * 60 * 60; // matches yield-curve's TTL — most series update at most once a day
// Any real FRED series ID is 25 chars or fewer (the longest published IDs
// run ~20-24 chars) — this just bounds an obviously-invalid/garbage id
// before it reaches Fred, not a real allow-list.
const SERIES_ID_RE = /^[A-Za-z0-9]{1,25}$/;

type FredObservation = { date: string; value: string };
type Point = { date: string; value: number };

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("intel:econ-series", clientIdFromRequest(request), 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const id = request.nextUrl.searchParams.get("id")?.trim().toUpperCase();
  if (!id || !SERIES_ID_RE.test(id)) {
    return NextResponse.json({ error: "A valid series id is required" }, { status: 400 });
  }

  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FRED_API_KEY is not configured" }, { status: 500 });
  }

  const cacheKey = `econ-series:${id}`;
  const cached = await kvGet<{ points: Point[] }>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { "Cache-Control": "public, max-age=21600" } });
  }

  try {
    const url = `${FRED_BASE}/series/observations?series_id=${encodeURIComponent(id)}&api_key=${apiKey}&file_type=json&sort_order=asc`;
    const res = await fetch(url);
    if (!res.ok) {
      // FRED returns a real 400 for an unknown/bad series id — distinct
      // from a genuine upstream failure.
      if (res.status === 400) return NextResponse.json({ error: "Unknown series id" }, { status: 404 });
      throw new Error(`FRED observations failed: ${res.status}`);
    }

    const data = (await res.json()) as { observations?: FredObservation[] };
    const points: Point[] = (data.observations ?? [])
      .filter((o) => o.value !== ".") // FRED's own marker for a real missing reading
      .map((o) => ({ date: o.date, value: parseFloat(o.value) }));

    if (!points.length) {
      return NextResponse.json({ error: "No observations available for this series" }, { status: 404 });
    }

    const body = { points };
    await kvSet(cacheKey, body, CACHE_TTL_S);
    return NextResponse.json(body, { headers: { "Cache-Control": "public, max-age=21600" } });
  } catch (err) {
    console.error("[intel/econ-series] error:", err);
    return NextResponse.json({ error: "Failed to fetch series data" }, { status: 500 });
  }
}
