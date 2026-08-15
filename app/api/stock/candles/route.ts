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

  type Body = {
    prices: number[];
    times: number[];
    volume: number | null;
    week52High: number | null;
    week52Low: number | null;
  };

  const cacheKey = `candles:${symbol.toUpperCase()}:${rangeParam}:v3`;
  const cached = await kvGet<Body>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
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
        result?: Array<{
          timestamp?: number[];
          indicators: { quote: Array<{ close: number[] }> };
          meta?: { regularMarketVolume?: number; fiftyTwoWeekHigh?: number; fiftyTwoWeekLow?: number };
        }>;
        error?: { description: string };
      };
    };

    if (data.chart.error || !data.chart.result?.[0]) {
      return NextResponse.json({ prices: [], times: [], volume: null, week52High: null, week52Low: null });
    }

    const result = data.chart.result[0];
    const timestamps = result.timestamp ?? [];
    const closes = result.indicators.quote[0]?.close ?? [];
    // Filter both arrays together (not independently) so a null close at
    // index i can't desync the price from its real timestamp.
    const pairs = closes
      .map((c, i) => ({ c, t: timestamps[i] }))
      .filter((p): p is { c: number; t: number } => p.c != null && p.t != null)
      .slice(-limit);
    const prices = pairs.map((p) => p.c);
    const times = pairs.map((p) => p.t); // unix seconds

    const body: Body = {
      prices,
      times,
      volume: result.meta?.regularMarketVolume ?? null,
      week52High: result.meta?.fiftyTwoWeekHigh ?? null,
      week52Low: result.meta?.fiftyTwoWeekLow ?? null,
    };
    await kvSet(cacheKey, body, CACHE_TTL_S);
    return NextResponse.json(body);
  } catch (err) {
    console.error("[stock/candles] error:", err);
    // A real fetch/parse failure must not look identical to Yahoo
    // legitimately reporting no such symbol (the empty-array 200 above) —
    // callers need a real error status to distinguish "try again" from
    // "there's genuinely nothing here."
    return NextResponse.json({ error: "Failed to fetch chart data." }, { status: 502 });
  }
}
