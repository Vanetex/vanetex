import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";

export const runtime = "nodejs";

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

type CacheEntry = { prices: number[]; ts: number };
const cache = new Map<string, CacheEntry>();

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("stock:candles", clientIdFromRequest(request), 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const symbol = request.nextUrl.searchParams.get("symbol");
  if (!symbol) return NextResponse.json({ error: "symbol is required" }, { status: 400 });

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

  const key = symbol.toUpperCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) {
    return NextResponse.json({ prices: hit.prices });
  }

  const to = Math.floor(Date.now() / 1000);
  const from = to - 60 * 60 * 24 * 45; // 45 days back to ensure ~30 trading days

  try {
    const res = await fetch(
      `${FINNHUB_BASE}/stock/candle?symbol=${encodeURIComponent(key)}&resolution=D&from=${from}&to=${to}&token=${apiKey}`,
    );
    if (!res.ok) throw new Error("Finnhub candle request failed");

    const data = await res.json() as { s: string; c?: number[] };

    if (data.s !== "ok" || !data.c?.length) {
      return NextResponse.json({ prices: [] });
    }

    // Return last 30 close prices
    const prices = data.c.slice(-30);
    cache.set(key, { prices, ts: Date.now() });
    return NextResponse.json({ prices });
  } catch (err) {
    console.error("[stock/candles] error:", err);
    return NextResponse.json({ prices: [] });
  }
}
