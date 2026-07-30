import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";
// A cold-cache fetch of the max symbol count (chunked at 4 concurrent
// with a 300ms gap) measured at ~7-10s worst case — safely under this,
// but set explicitly since Vercel's default function timeout is 10s.
export const maxDuration = 60;

const YAHOO_CHART = "https://query1.finance.yahoo.com/v8/finance/chart";
const CACHE_TTL_S = 6 * 60 * 60; // monthly bars barely move intraday; the in-progress month is the only one that goes stale
const MAX_SYMBOLS = 50;
const BENCHMARK = "SPY";

type SeriesPoint = { t: number; v: number }; // unix seconds, dividend/split-adjusted close

// Real monthly history per symbol, back to inception — cached per symbol
// (not per requested date range) so every caller's request range slices
// the same cached series instead of fragmenting the cache by range.
async function fetchYahooSeries(symbol: string): Promise<SeriesPoint[] | null> {
  try {
    const res = await fetch(
      `${YAHOO_CHART}/${encodeURIComponent(symbol)}?interval=1mo&range=max`,
      { headers: { "User-Agent": "Mozilla/5.0" }, cache: "no-store" },
    );
    if (!res.ok) return null;

    const data = (await res.json()) as {
      chart: {
        result?: Array<{
          timestamp: number[];
          indicators: { adjclose?: Array<{ adjclose: (number | null)[] }> };
        }>;
      };
    };
    const r = data.chart.result?.[0];
    const adj = r?.indicators.adjclose?.[0]?.adjclose;
    if (!r || !adj) return null;

    const points: SeriesPoint[] = [];
    for (let i = 0; i < r.timestamp.length; i++) {
      const v = adj[i];
      if (v == null) continue;
      points.push({ t: r.timestamp[i], v });
    }
    if (!points.length) return null;
    return points;
  } catch {
    return null;
  }
}

async function fetchMonthlySeries(symbol: string): Promise<SeriesPoint[] | null> {
  const cacheKey = `backtest:prices:${symbol}`;
  const cached = await kvGet<SeriesPoint[]>(cacheKey);
  if (cached) return cached;

  let points = await fetchYahooSeries(symbol);
  // Yahoo represents US dual-class shares with a dash (BRK-B) rather than
  // the dot notation most people actually type (BRK.B). Try the symbol
  // as given first — this keeps dot-suffixed international tickers like
  // 7203.T working unchanged — and only fall back to a dash conversion
  // when the as-typed lookup genuinely comes back empty, rather than
  // guessing up front which dotted tickers are share classes.
  if (!points && symbol.includes(".")) {
    points = await fetchYahooSeries(symbol.replace(/\./g, "-"));
  }
  if (!points) return null;

  await kvSet(cacheKey, points, CACHE_TTL_S);
  return points;
}

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("backtest:prices", clientIdFromRequest(request), 15, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const symbolsParam = request.nextUrl.searchParams.get("symbols");
  if (!symbolsParam) return NextResponse.json({ error: "symbols is required" }, { status: 400 });

  const requested = [...new Set(symbolsParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean))].slice(0, MAX_SYMBOLS);
  if (!requested.length) return NextResponse.json({ error: "symbols is required" }, { status: 400 });

  const withBench = requested.includes(BENCHMARK) ? requested : [...requested, BENCHMARK];

  // Small chunks with a gap between them — bursting many concurrent
  // Yahoo requests at once is the same lesson learned with Finnhub
  // elsewhere in this app (sector heatmap, news): fan out gently.
  const CHUNK = 4;
  const bySymbol: Record<string, SeriesPoint[] | null> = {};
  for (let i = 0; i < withBench.length; i += CHUNK) {
    const chunk = withBench.slice(i, i + CHUNK);
    const chunkResults = await Promise.all(chunk.map((s) => fetchMonthlySeries(s)));
    chunk.forEach((s, j) => { bySymbol[s] = chunkResults[j]; });
    if (i + CHUNK < withBench.length) await new Promise((r) => setTimeout(r, 300));
  }

  const series: Record<string, SeriesPoint[]> = {};
  const errors: string[] = [];
  for (const s of withBench) {
    if (bySymbol[s]) series[s] = bySymbol[s]!;
    else errors.push(s);
  }

  return NextResponse.json(
    { series, errors, benchmark: BENCHMARK },
    { headers: { "Cache-Control": "private, max-age=300" } },
  );
}
