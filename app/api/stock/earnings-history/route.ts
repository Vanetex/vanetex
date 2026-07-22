import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const CACHE_TTL_S = 6 * 60 * 60; // backward-looking quarterly data, changes at most once a quarter
const MAX_QUARTERS = 4; // Finnhub's free tier only returns the last 4

type FinnhubEarning = {
  period: string; // quarter end date, YYYY-MM-DD
  actual: number | null;
  estimate: number | null;
  surprise: number | null;
  surprisePercent: number | null;
  year: number;
  quarter: number;
};

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("stock:earnings-history", clientIdFromRequest(request), 40, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const symbol = request.nextUrl.searchParams.get("symbol");
  if (!symbol) return NextResponse.json({ error: "symbol is required" }, { status: 400 });

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FINNHUB_API_KEY is not configured" }, { status: 500 });
  }

  const sym = symbol.toUpperCase();
  const cacheKey = `earnings-history:${sym}`;
  const cached = await kvGet<{ quarters: unknown[] }>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { "Cache-Control": "private, max-age=21600" } });
  }

  try {
    const res = await fetch(`${FINNHUB_BASE}/stock/earnings?symbol=${encodeURIComponent(sym)}&token=${apiKey}`);
    if (!res.ok) throw new Error(`Finnhub returned ${res.status}`);

    const rows = (await res.json()) as FinnhubEarning[];
    const quarters = (rows ?? [])
      .filter((r) => r.period)
      .sort((a, b) => b.period.localeCompare(a.period))
      .slice(0, MAX_QUARTERS)
      .map((r) => ({
        period: r.period,
        year: r.year,
        quarter: r.quarter,
        actual: r.actual ?? null,
        estimate: r.estimate ?? null,
        surprisePercent: r.surprisePercent ?? null,
      }));

    const body = { symbol: sym, quarters };
    await kvSet(cacheKey, body, CACHE_TTL_S);
    return NextResponse.json(body, { headers: { "Cache-Control": "private, max-age=21600" } });
  } catch (err) {
    console.error("[stock/earnings-history] error:", err);
    return NextResponse.json({ error: "Failed to fetch earnings history" }, { status: 500 });
  }
}
