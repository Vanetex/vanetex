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

  const cacheKey = `index-quote:${key}`;
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
      chart: { result?: Array<{ meta: { regularMarketPrice?: number; chartPreviousClose?: number; shortName?: string } }> };
    };
    const meta = data.chart.result?.[0]?.meta;
    if (!meta?.regularMarketPrice) {
      return NextResponse.json({ error: "No price data" }, { status: 502 });
    }

    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose ?? price;
    const changePct = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;

    const body = { symbol: key, name: meta.shortName ?? key, price, changePct };
    await kvSet(cacheKey, body, CACHE_TTL_S);
    return NextResponse.json(body, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=30" } });
  } catch (err) {
    console.error("[market/index-quote] error:", err);
    return NextResponse.json({ error: "Failed to fetch index quote" }, { status: 500 });
  }
}
