import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const CACHE_TTL_S = 6 * 60 * 60; // 6 hours — analyst ratings update at most a few times a month

type FinnhubTrend = {
  buy: number;
  hold: number;
  period: string;
  sell: number;
  strongBuy: number;
  strongSell: number;
  symbol: string;
};

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("stock:recommendation", clientIdFromRequest(request), 40, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const symbol = request.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FINNHUB_API_KEY is not configured" }, { status: 500 });
  }

  const sym = symbol.toUpperCase();
  const cacheKey = `recommendation:${sym}`;
  const cached = await kvGet<Record<string, unknown>>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "Cache-Control": "private, max-age=21600, stale-while-revalidate=1800" },
    });
  }

  try {
    const res = await fetch(`${FINNHUB_BASE}/stock/recommendation?symbol=${encodeURIComponent(sym)}&token=${apiKey}`);
    if (!res.ok) throw new Error("Finnhub request failed");

    const trends = (await res.json()) as FinnhubTrend[];
    // Finnhub returns trends newest-first; take the most recent period.
    const latest = trends?.[0] ?? null;

    const body = latest
      ? {
          symbol: sym,
          period: latest.period,
          strongBuy: latest.strongBuy,
          buy: latest.buy,
          hold: latest.hold,
          sell: latest.sell,
          strongSell: latest.strongSell,
        }
      : { symbol: sym, period: null, strongBuy: 0, buy: 0, hold: 0, sell: 0, strongSell: 0 };

    await kvSet(cacheKey, body, CACHE_TTL_S);

    return NextResponse.json(body, {
      headers: { "Cache-Control": "private, max-age=21600, stale-while-revalidate=1800" },
    });
  } catch (err) {
    console.error("[stock/recommendation] error:", err);
    return NextResponse.json({ error: "Failed to fetch analyst ratings" }, { status: 500 });
  }
}
