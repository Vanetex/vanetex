import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const CACHE_TTL_S = 30 * 60; // 30 minutes

export async function GET(request: NextRequest) {
  // Initial page load alone (watchlist sparklines, global markets tiles)
  // already burns a big share of a 20/60s budget; drilling into a
  // commodity's Instrument View now fires several more (main chart +
  // seasonality + correlation + volatility), so this needed headroom to
  // avoid legitimate navigation tripping the limit.
  const rl = checkRateLimit("stock:candles", clientIdFromRequest(request), 40, 60_000);
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
    // Daily granularity over 2 years — not used by the main chart (which
    // steps down to weekly/monthly beyond 1Y), only by the realized
    // volatility percentile calc, which needs real daily returns rather
    // than the coarser weekly/monthly bars the other ranges give.
    "2Y":  { interval: "1d",  range: "2y",  limit: 520 },
  };
  const cfg = RANGE_MAP[rangeParam] ?? RANGE_MAP["1M"];
  const { interval, range, limit } = cfg;

  type Body = {
    prices: number[];
    times: number[];
    opens: number[];
    highs: number[];
    lows: number[];
    volumes: number[];
    volume: number | null;
    week52High: number | null;
    week52Low: number | null;
    dayHigh: number | null;
    dayLow: number | null;
  };

  // v4: added real open/high/low/volume per bar (previously only close was
  // kept, even though Yahoo returns full OHLCV) — bumped so a stale v3
  // cache entry (missing these fields) never gets served to the new
  // candlestick-aware frontend.
  const cacheKey = `candles:${symbol.toUpperCase()}:${rangeParam}:v4`;
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
          indicators: { quote: Array<{ close: number[]; open?: number[]; high?: number[]; low?: number[]; volume?: number[] }> };
          meta?: {
            regularMarketVolume?: number;
            fiftyTwoWeekHigh?: number;
            fiftyTwoWeekLow?: number;
            regularMarketDayHigh?: number;
            regularMarketDayLow?: number;
          };
        }>;
        error?: { description: string };
      };
    };

    const empty: Body = { prices: [], times: [], opens: [], highs: [], lows: [], volumes: [], volume: null, week52High: null, week52Low: null, dayHigh: null, dayLow: null };
    if (data.chart.error || !data.chart.result?.[0]) {
      return NextResponse.json(empty);
    }

    const result = data.chart.result[0];
    const timestamps = result.timestamp ?? [];
    const quote = result.indicators.quote[0] ?? { close: [] };
    const closes = quote.close ?? [];
    const opensIn = quote.open ?? [];
    const highsIn = quote.high ?? [];
    const lowsIn = quote.low ?? [];
    const volumesIn = quote.volume ?? [];
    // Filter every series together (not independently) so a null close at
    // index i can't desync any field from its real timestamp. open/high/low
    // fall back to close, and volume to 0, only for the rare bar where
    // Yahoo's close exists but one of the other fields is individually
    // null — real market data, not a fabrication (a candle body needs SOME
    // open value to draw at all; falling back to that bar's own real close
    // just draws it as a doji rather than guessing a different number).
    const pairs = closes
      .map((c, i) => ({ c, t: timestamps[i], o: opensIn[i], h: highsIn[i], l: lowsIn[i], v: volumesIn[i] }))
      .filter((p) => p.c != null && p.t != null)
      .slice(-limit) as { c: number; t: number; o: number | null | undefined; h: number | null | undefined; l: number | null | undefined; v: number | null | undefined }[];

    const body: Body = {
      prices: pairs.map((p) => p.c),
      times: pairs.map((p) => p.t),
      opens: pairs.map((p) => p.o ?? p.c),
      highs: pairs.map((p) => p.h ?? p.c),
      lows: pairs.map((p) => p.l ?? p.c),
      volumes: pairs.map((p) => p.v ?? 0),
      volume: result.meta?.regularMarketVolume ?? null,
      week52High: result.meta?.fiftyTwoWeekHigh ?? null,
      week52Low: result.meta?.fiftyTwoWeekLow ?? null,
      dayHigh: result.meta?.regularMarketDayHigh ?? null,
      dayLow: result.meta?.regularMarketDayLow ?? null,
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
