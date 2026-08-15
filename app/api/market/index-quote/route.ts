import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const CACHE_TTL_S = 60;
const MAX_BATCH_SYMBOLS = 40;

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

type IndexQuoteBody = { symbol: string; name: string; price: number; changePct: number };
type IndexQuoteResult =
  | { ok: true; body: IndexQuoteBody }
  | { ok: false; status: 400 | 502 | 500 };

// Cache-first fetch of one symbol's index quote — shared by the
// single-symbol and batch paths below.
async function fetchOneIndexQuote(key: string): Promise<IndexQuoteResult> {
  const yahooSymbol = SYMBOL_MAP[key];
  if (!yahooSymbol) return { ok: false, status: 400 };

  const cacheKey = `index-quote:${key}:v2`;
  const cached = await kvGet<IndexQuoteBody>(cacheKey);
  if (cached) return { ok: true, body: cached };

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=5d`,
      { headers: { "User-Agent": "Mozilla/5.0" }, cache: "no-store" },
    );
    if (!res.ok) return { ok: false, status: 500 };

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
    if (!meta?.regularMarketPrice) return { ok: false, status: 502 };

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

    const body: IndexQuoteBody = { symbol: key, name: meta.shortName ?? key, price, changePct };
    await kvSet(cacheKey, body, CACHE_TTL_S);
    return { ok: true, body };
  } catch (err) {
    console.error(`[market/index-quote] fetch failed for ${key}:`, err);
    return { ok: false, status: 500 };
  }
}

export async function GET(request: NextRequest) {
  const symbolsParam = request.nextUrl.searchParams.get("symbols");

  // Batch path — one request for many symbols instead of one Yahoo
  // round-trip per symbol (index.html and intelligence.html each load
  // 15-30+ of these tiles on a single page view).
  if (symbolsParam) {
    const rl = checkRateLimit("market:index-quote:batch", clientIdFromRequest(request), 20, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
    }
    const keys = [...new Set(symbolsParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean))].slice(0, MAX_BATCH_SYMBOLS);
    if (!keys.length) return NextResponse.json({ error: "symbols is required" }, { status: 400 });

    const quotes: Record<string, IndexQuoteBody> = {};
    const CHUNK = 5;
    for (let i = 0; i < keys.length; i += CHUNK) {
      const chunk = keys.slice(i, i + CHUNK);
      const results = await Promise.all(chunk.map((k) => fetchOneIndexQuote(k)));
      chunk.forEach((k, j) => { const r = results[j]; if (r.ok) quotes[k] = r.body; });
      if (i + CHUNK < keys.length) await new Promise((r) => setTimeout(r, 150));
    }
    const missingSymbols = keys.filter((k) => !(k in quotes));

    return NextResponse.json({ quotes, missingSymbols }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=30" } });
  }

  // Single-symbol path — unchanged behavior/response shape for existing
  // callers.
  const rl = checkRateLimit("market:index-quote", clientIdFromRequest(request), 40, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }
  const key = request.nextUrl.searchParams.get("symbol")?.toUpperCase();
  if (!key) {
    return NextResponse.json({ error: "Unknown symbol" }, { status: 400 });
  }
  const result = await fetchOneIndexQuote(key);
  if (!result.ok) {
    const message = result.status === 400 ? "Unknown symbol" : result.status === 502 ? "No price data" : "Failed to fetch index quote";
    return NextResponse.json({ error: message }, { status: result.status });
  }
  return NextResponse.json(result.body, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=30" } });
}
