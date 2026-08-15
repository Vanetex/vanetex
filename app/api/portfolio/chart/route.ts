import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";

export const runtime = "nodejs";

const FINNHUB_BASE = "https://finnhub.io/api/v1";

type ChartPoint = { date: string; value: number };

// Raw Finnhub fetch — no caching here. Throws on a real fetch/network
// failure rather than swallowing it to {} — unstable_cache below only
// caches a successful return, so a transient failure doesn't get memoized
// as "no candle data" for the full revalidate window.
async function _fetchCandles(
  symbol: string,
  from: number,
  to: number,
  apiKey: string,
): Promise<Record<string, number>> {
  const res = await fetch(
    `${FINNHUB_BASE}/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=D&from=${from}&to=${to}&token=${apiKey}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error(`Finnhub candle fetch failed for ${symbol}: ${res.status}`);
  const data = (await res.json()) as { s: string; t: number[]; c: number[] };
  // Finnhub's "no_data" status is a real, legitimate empty result — distinct
  // from the fetch failure above, which throws instead of being cached as
  // if it were this.
  if (data.s !== "ok" || !data.t) return {};
  const map: Record<string, number> = {};
  data.t.forEach((ts, i) => {
    const dateStr = new Date(ts * 1000).toISOString().split("T")[0];
    map[dateStr] = data.c[i];
  });
  return map;
}

// Cached at module level — daily candles don't change during the trading day.
// Key includes symbol + date window so different users/dates get their own entries.
const fetchDailyCandles = unstable_cache(
  (symbol: string, from: number, to: number, apiKey: string) =>
    _fetchCandles(symbol, from, to, apiKey),
  ["finnhub-candles"],
  { revalidate: 3600 }, // 1 hour — candles for past days never change
);

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("portfolio:chart", clientIdFromRequest(request), 10, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "FINNHUB_API_KEY not configured" },
      { status: 500 },
    );
  }

  // Get portfolio
  const { data: portfolio } = await supabase
    .from("paper_portfolios")
    .select("id, cash, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!portfolio) {
    return NextResponse.json({
      portfolioPoints: [],
      spyPoints: [],
      annualReturn: 0,
      totalReturn: 0,
    });
  }

  // Get all trades
  const { data: trades } = await supabase
    .from("paper_trades")
    .select(
      "ticker, trade_type, shares, price_per_share, total_value, created_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const now = new Date();
  const startDate = new Date(portfolio.created_at as string);

  // No trades yet — flat line at current cash balance
  if (!trades || trades.length === 0) {
    const todayStr = now.toISOString().split("T")[0];
    const startStr = startDate.toISOString().split("T")[0];
    const cashValue = Number(portfolio.cash);
    // Ensure portfolio_value is set so this user appears on the leaderboard
    await supabase
      .from("paper_portfolios")
      .update({ portfolio_value: cashValue, value_updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
    return NextResponse.json({
      portfolioPoints: [
        { date: startStr, value: cashValue },
        { date: todayStr, value: cashValue },
      ],
      spyPoints: [],
      annualReturn: 0,
      totalReturn: 0,
    });
  }

  const fromUnix = Math.floor(startDate.getTime() / 1000);
  const toUnix = Math.floor(now.getTime() / 1000);

  // Unique tickers ever traded
  const tickers = [...new Set(trades.map((t) => t.ticker as string))];

  // Fetch candles for all tickers + SPY concurrently. A real fetch failure
  // (as opposed to a symbol legitimately having no candles) degrades to
  // the existing first-buy-price fallback below for chart continuity, but
  // must NOT feed a stale/wrong number into the leaderboard-facing
  // portfolio_value write further down.
  let spyCandles: Record<string, number> = {};
  let tickerCandlesList: Record<string, number>[] = tickers.map(() => ({}));
  let candleFetchFailed = false;
  try {
    [spyCandles, ...tickerCandlesList] = await Promise.all([
      fetchDailyCandles("SPY", fromUnix, toUnix, apiKey),
      ...tickers.map((ticker) => fetchDailyCandles(ticker, fromUnix, toUnix, apiKey)),
    ]);
  } catch (err) {
    console.error("[portfolio/chart] candle fetch failed:", err);
    candleFetchFailed = true;
  }

  const candlesByTicker: Record<string, Record<string, number>> = {};
  tickers.forEach((ticker, i) => {
    candlesByTicker[ticker] = tickerCandlesList[i];
  });

  // Generate all calendar days from start → today
  const allDays: string[] = [];
  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);
  const endDay = new Date(now);
  endDay.setHours(0, 0, 0, 0);
  while (cursor <= endDay) {
    allDays.push(cursor.toISOString().split("T")[0]);
    cursor.setDate(cursor.getDate() + 1);
  }

  // Group trades by date
  const tradesByDate: Record<string, typeof trades> = {};
  trades.forEach((trade) => {
    const d = (trade.created_at as string).split("T")[0];
    if (!tradesByDate[d]) tradesByDate[d] = [];
    tradesByDate[d].push(trade);
  });

  // Reconstruct daily portfolio value
  let cash = 10000;
  const positions: Record<string, number> = {}; // ticker -> shares
  const lastKnownPrice: Record<string, number> = {};
  const portfolioPoints: ChartPoint[] = [];

  for (const day of allDays) {
    // Apply trades for this day in order
    if (tradesByDate[day]) {
      for (const trade of tradesByDate[day]) {
        const ticker = trade.ticker as string;
        const shares = Number(trade.shares);
        const totalValue = Number(trade.total_value);
        if (trade.trade_type === "BUY") {
          cash -= totalValue;
          positions[ticker] = (positions[ticker] ?? 0) + shares;
        } else {
          cash += totalValue;
          positions[ticker] = (positions[ticker] ?? 0) - shares;
          if ((positions[ticker] ?? 0) <= 0.0001) delete positions[ticker];
        }
      }
    }

    // Carry-forward last known prices
    for (const ticker of tickers) {
      const price = candlesByTicker[ticker]?.[day];
      if (price) lastKnownPrice[ticker] = price;
    }

    // Portfolio value = cash + positions at last known price
    let positionValue = 0;
    for (const [ticker, shares] of Object.entries(positions)) {
      const price = lastKnownPrice[ticker];
      if (price) {
        positionValue += shares * price;
      } else {
        // Fallback: use first BUY price for this ticker
        const firstBuy = trades.find(
          (t) => t.ticker === ticker && t.trade_type === "BUY",
        );
        if (firstBuy) positionValue += shares * Number(firstBuy.price_per_share);
      }
    }

    portfolioPoints.push({
      date: day,
      value: parseFloat((cash + positionValue).toFixed(2)),
    });
  }

  // S&P 500 indexed to $10,000 from start
  let spyStart: number | null = null;
  for (const day of allDays) {
    if (spyCandles[day]) {
      spyStart = spyCandles[day];
      break;
    }
  }

  let lastSpyPrice: number | null = spyStart;
  const spyPoints: ChartPoint[] = [];
  if (spyStart) {
    for (const day of allDays) {
      if (spyCandles[day]) lastSpyPrice = spyCandles[day];
      if (lastSpyPrice !== null) {
        spyPoints.push({
          date: day,
          value: parseFloat(((lastSpyPrice / spyStart) * 10000).toFixed(2)),
        });
      }
    }
  }

  // Return stats
  const startValue = 10000;
  const currentValue =
    portfolioPoints[portfolioPoints.length - 1]?.value ?? startValue;
  const daysElapsed = Math.max(
    1,
    (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const totalReturn = ((currentValue - startValue) / startValue) * 100;
  // Annualizing less than 30 days of data produces wildly misleading figures
  // (e.g. +1% in a day = +3,678% annualised). Return null so the UI can hide it.
  const annualReturn =
    daysElapsed >= 30
      ? (Math.pow(currentValue / startValue, 365 / daysElapsed) - 1) * 100
      : null;

  // Persist current value so the trading leaderboard can rank without
  // Finnhub — but only when today's candles actually loaded. Writing a
  // value reconstructed from stale first-buy-price fallbacks (below) would
  // silently corrupt the leaderboard number the same way a $0 fallback would.
  if (!candleFetchFailed) {
    await supabase
      .from("paper_portfolios")
      .update({ portfolio_value: currentValue, value_updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
  }

  return NextResponse.json(
    {
      portfolioPoints,
      spyPoints,
      annualReturn: annualReturn !== null ? parseFloat(annualReturn.toFixed(2)) : null,
      totalReturn: parseFloat(totalReturn.toFixed(2)),
      dataMayBeStale: candleFetchFailed,
    },
    { headers: { "Cache-Control": "private, max-age=300, stale-while-revalidate=60" } },
  );
}
