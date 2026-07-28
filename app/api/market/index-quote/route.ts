import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const CACHE_TTL_S = 60;

// Fixed allow-list, never a client-supplied passthrough symbol — this
// proxies to Yahoo Finance, which has no auth of its own, so the
// mapping keeps it from being usable as a generic open proxy.
const SYMBOL_MAP: Record<string, string> = {
  SPX: "^GSPC",
  NDX: "^IXIC",
  VIX: "^VIX",
  GOLD: "GC=F",
  FTSE: "^FTSE",
  NIKKEI: "^N225",
  HSI: "^HSI",
  OIL: "CL=F",
  SILVER: "SI=F",
  NATGAS: "NG=F",
  COPPER: "HG=F",
  EURUSD: "EURUSD=X",
  USDJPY: "USDJPY=X",
  GBPUSD: "GBPUSD=X",
  // Deeper commodities — precious metals, energy, agriculture
  PLATINUM: "PL=F",
  PALLADIUM: "PA=F",
  BRENT: "BZ=F",
  HEATOIL: "HO=F",
  GASOLINE: "RB=F",
  CORN: "ZC=F",
  WHEAT: "ZW=F",
  SOYBEANS: "ZS=F",
  COFFEE: "KC=F",
  COTTON: "CT=F",
  SUGAR: "SB=F",
  // More US indices, and their futures counterparts
  DOW: "^DJI",
  RUSSELL2000: "^RUT",
  ES: "ES=F",
  NQ: "NQ=F",
  YM: "YM=F",
  RTY: "RTY=F",
};

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("market:index-quote", clientIdFromRequest(request), 40, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const key = request.nextUrl.searchParams.get("symbol")?.toUpperCase();
  const yahooSymbol = key ? SYMBOL_MAP[key] : undefined;
  if (!yahooSymbol) {
    return NextResponse.json({ error: "Unknown symbol" }, { status: 400 });
  }

  const cacheKey = `index-quote:${key}:v2`;
  const cached = await kvGet<Record<string, unknown>>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=30" } });
  }

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=5d`,
      { headers: { "User-Agent": "Mozilla/5.0" }, cache: "no-store" },
    );
    if (!res.ok) throw new Error(`Yahoo Finance returned ${res.status}`);

    const data = (await res.json()) as {
      chart: {
        result?: Array<{
          meta: { regularMarketPrice?: number; chartPreviousClose?: number; shortName?: string };
          indicators?: { quote?: Array<{ close?: Array<number | null> }> };
        }>;
      };
    };
    const result = data.chart.result?.[0];
    const meta = result?.meta;
    if (!meta?.regularMarketPrice) {
      return NextResponse.json({ error: "No price data" }, { status: 502 });
    }

    const price = meta.regularMarketPrice;
    // meta.chartPreviousClose is unreliable — verified live for both ^GSPC
    // and CL=F that it doesn't match any bar in the actual returned 5-day
    // series (it reflects a close from several sessions before the window,
    // not literally yesterday's), which silently produced a "day change"
    // spanning several real days of movement instead of one. The
    // second-to-last real close in the series itself is the genuine most
    // recent completed session's close.
    const closes = (result?.indicators?.quote?.[0]?.close ?? []).filter((c): c is number => c != null);
    const prevClose = closes.length >= 2 ? closes[closes.length - 2] : (meta.chartPreviousClose ?? price);
    const changePct = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;

    const body = { symbol: key, name: meta.shortName ?? key, price, changePct };
    await kvSet(cacheKey, body, CACHE_TTL_S);
    return NextResponse.json(body, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=30" } });
  } catch (err) {
    console.error("[market/index-quote] error:", err);
    return NextResponse.json({ error: "Failed to fetch index quote" }, { status: 500 });
  }
}
