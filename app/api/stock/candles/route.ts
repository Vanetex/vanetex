import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const CACHE_TTL_S = 30 * 60; // 30 minutes

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("stock:candles", clientIdFromRequest(request), 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const symbol = request.nextUrl.searchParams.get("symbol");
  if (!symbol) return NextResponse.json({ error: "symbol is required" }, { status: 400 });

  const rangeParam = request.nextUrl.searchParams.get("range") ?? "1M";
  const RANGE_MAP: Record<string, { interval: string; range: string; limit: number }> = {
    "1D":  { interval: "5m",  range: "1d",  limit: 78  },
    "5D":  { interval: "1h",  range: "5d",  limit: 40  },
    "1M":  { interval: "1d",  range: "1mo", limit: 30  },
    "6M":  { interval: "1wk", range: "6mo", limit: 26  },
    "1Y":  { interval: "1wk", range: "1y",  limit: 52  },
    "MAX": { interval: "1mo", range: "10y", limit: 120 },
  };
  const cfg = RANGE_MAP[rangeParam] ?? RANGE_MAP["1M"];
  const { interval, range, limit } = cfg;

  const cacheKey = `candles:${symbol.toUpperCase()}:${rangeParam}`;
  const cached = await kvGet<number[]>(cacheKey);
  if (cached) {
    return NextResponse.json({ prices: cached });
  }

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol.toUpperCase())}?interval=${interval}&range=${range}`,
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
    const prices = closes.filter((c) => c !== null && c !== undefined).slice(-limit);

    await kvSet(cacheKey, prices, CACHE_TTL_S);
    return NextResponse.json({ prices });
  } catch (err) {
    console.error("[stock/candles] error:", err);
    return NextResponse.json({ prices: [] });
  }
}
