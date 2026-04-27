import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";

export const runtime = "nodejs";

const CACHE_TTL_MS = 30 * 60 * 1000;

type CacheEntry = { prices: number[]; ts: number };
const cache = new Map<string, CacheEntry>();

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("stock:candles", clientIdFromRequest(request), 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const symbol = request.nextUrl.searchParams.get("symbol");
  if (!symbol) return NextResponse.json({ error: "symbol is required" }, { status: 400 });

  const key = symbol.toUpperCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) {
    return NextResponse.json({ prices: hit.prices });
  }

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(key)}?interval=1d&range=2mo`,
      {
        headers: { "User-Agent": "Mozilla/5.0" },
        cache: "no-store",
      },
    );

    if (!res.ok) throw new Error(`Yahoo Finance returned ${res.status}`);

    const data = await res.json() as {
      chart: {
        result?: Array<{ indicators: { quote: Array<{ close: number[] }> } }>;
        error?: { description: string };
      };
    };

    if (data.chart.error || !data.chart.result?.[0]) {
      return NextResponse.json({ prices: [] });
    }

    const closes = data.chart.result[0].indicators.quote[0]?.close ?? [];
    const prices = closes.filter((c) => c !== null && c !== undefined).slice(-30);

    cache.set(key, { prices, ts: Date.now() });
    return NextResponse.json({ prices });
  } catch (err) {
    console.error("[stock/candles] error:", err);
    return NextResponse.json({ prices: [] });
  }
}
