"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getOrCreatePortfolio,
  listPositions,
  listTrades,
  type Portfolio,
  type Position,
  type Trade,
} from "@/lib/supabase/paperTrading";
import { listAwardedAchievements, awardAchievements } from "@/lib/supabase/achievements";
import { computeEligibleAchievements } from "@/lib/achievements";
import AchievementToast from "@/components/AchievementToast";
import { searchTopStocks } from "@/data/topStocks";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StockQuote = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  dayHigh: number;
  dayLow: number;
  open: number;
  prevClose: number;
  industry: string;
};

type SearchResult = { symbol: string; name: string };

type PositionWithQuote = Position & {
  currentPrice: number | null;
  marketValue: number | null;
  gainLoss: number | null;
  gainLossPct: number | null;
  dayChangePct: number | null;
};

type Tab = "portfolio" | "trade" | "history";

type ChartPoint = { date: string; value: number };

type ChartData = {
  portfolioPoints: ChartPoint[];
  spyPoints: ChartPoint[];
  annualReturn: number | null; // null when observation window < 30 days
  totalReturn: number;
} | null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtCurrency(n: number) {
  return "$" + fmt(n);
}

function fmtPct(n: number) {
  return (n >= 0 ? "+" : "") + fmt(n) + "%";
}

// ---------------------------------------------------------------------------
// Performance chart
// ---------------------------------------------------------------------------

function PerformanceChart({
  portfolioPoints,
  spyPoints,
}: {
  portfolioPoints: ChartPoint[];
  spyPoints: ChartPoint[];
}) {
  if (portfolioPoints.length < 2) return null;

  const W = 420;
  const H = 160;
  const PAD = { top: 10, right: 12, bottom: 26, left: 54 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const allValues = [
    ...portfolioPoints.map((p) => p.value),
    ...spyPoints.map((p) => p.value),
  ];
  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const padding = (rawMax - rawMin) * 0.08 || 500;
  const minVal = rawMin - padding;
  const maxVal = rawMax + padding;

  const allDates = portfolioPoints.map((p) => new Date(p.date).getTime());
  const minDate = Math.min(...allDates);
  const maxDate = Math.max(...allDates);
  const dateRange = maxDate - minDate || 1;

  const xOf = (date: string) =>
    PAD.left + ((new Date(date).getTime() - minDate) / dateRange) * innerW;
  const yOf = (val: number) =>
    PAD.top + innerH - ((val - minVal) / (maxVal - minVal)) * innerH;

  const toLinePath = (pts: ChartPoint[]) =>
    pts
      .map((p, i) => `${i === 0 ? "M" : "L"}${xOf(p.date).toFixed(1)},${yOf(p.value).toFixed(1)}`)
      .join(" ");

  const toAreaPath = (pts: ChartPoint[]) => {
    if (pts.length < 2) return "";
    const line = toLinePath(pts);
    const lastX = xOf(pts[pts.length - 1].date).toFixed(1);
    const firstX = xOf(pts[0].date).toFixed(1);
    const bottom = (PAD.top + innerH).toFixed(1);
    return `${line} L${lastX},${bottom} L${firstX},${bottom} Z`;
  };

  // Y-axis ticks
  const yTickCount = 4;
  const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) => {
    const val = minVal + ((maxVal - minVal) * i) / yTickCount;
    return { val, y: yOf(val) };
  });

  // X-axis labels — pick 4 evenly spaced
  const xLabelCount = Math.min(4, portfolioPoints.length);
  const xLabels = Array.from({ length: xLabelCount }, (_, i) => {
    const idx =
      xLabelCount === 1
        ? 0
        : Math.round((i * (portfolioPoints.length - 1)) / (xLabelCount - 1));
    const pt = portfolioPoints[idx];
    const d = new Date(pt.date);
    return {
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      x: xOf(pt.date),
    };
  });

  const fmtYLabel = (v: number) => {
    if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(1)}k`;
    return `$${v.toFixed(0)}`;
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: "160px" }}
      aria-label="Portfolio performance chart"
    >
      <defs>
        <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1F6FEB" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#1F6FEB" stopOpacity="0" />
        </linearGradient>
        <clipPath id="chartClip">
          <rect x={PAD.left} y={PAD.top} width={innerW} height={innerH} />
        </clipPath>
      </defs>

      {/* Grid lines */}
      {yTicks.map((t, i) => (
        <line
          key={i}
          x1={PAD.left}
          y1={t.y}
          x2={W - PAD.right}
          y2={t.y}
          stroke="rgba(0,0,0,0.06)"
          strokeWidth="1"
        />
      ))}

      {/* $10,000 baseline */}
      <line
        x1={PAD.left}
        y1={yOf(10000)}
        x2={W - PAD.right}
        y2={yOf(10000)}
        stroke="rgba(0,0,0,0.12)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />

      {/* SPY line */}
      {spyPoints.length > 1 && (
        <path
          d={toLinePath(spyPoints)}
          fill="none"
          stroke="rgba(0,0,0,0.22)"
          strokeWidth="1.5"
          strokeDasharray="5 3"
          clipPath="url(#chartClip)"
        />
      )}

      {/* Portfolio area fill */}
      <path
        d={toAreaPath(portfolioPoints)}
        fill="url(#portGrad)"
        clipPath="url(#chartClip)"
      />

      {/* Portfolio line */}
      <path
        d={toLinePath(portfolioPoints)}
        fill="none"
        stroke="#1F6FEB"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        clipPath="url(#chartClip)"
      />

      {/* End dot on portfolio */}
      <circle
        cx={xOf(portfolioPoints[portfolioPoints.length - 1].date)}
        cy={yOf(portfolioPoints[portfolioPoints.length - 1].value)}
        r="3"
        fill="#1F6FEB"
      />

      {/* Y-axis labels */}
      {yTicks.map((t, i) => (
        <text
          key={i}
          x={PAD.left - 5}
          y={t.y + 3.5}
          textAnchor="end"
          fontSize="9.5"
          fill="rgba(0,0,0,0.38)"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {fmtYLabel(t.val)}
        </text>
      ))}

      {/* X-axis labels */}
      {xLabels.map((l, i) => (
        <text
          key={i}
          x={l.x}
          y={H - 6}
          textAnchor="middle"
          fontSize="9.5"
          fill="rgba(0,0,0,0.38)"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {l.label}
        </text>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function TradePage() {
  const [tab, setTab] = useState<Tab>("portfolio");
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [positions, setPositions] = useState<PositionWithQuote[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData>(null);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  // Trade panel state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [candles, setCandles] = useState<number[]>([]);
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");
  const [sharesInput, setSharesInput] = useState("");
  const [executing, setExecuting] = useState(false);
  const [tradeError, setTradeError] = useState<string | null>(null);
  const [tradeSuccess, setTradeSuccess] = useState<string | null>(null);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSearchResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load portfolio data
  const loadData = useCallback(async () => {
    const [p, pos, t, chartRes] = await Promise.all([
      getOrCreatePortfolio(),
      listPositions(),
      listTrades(),
      fetch("/api/portfolio/chart").then((r) => r.json()).catch(() => null),
    ]);
    setChartData(chartRes);
    setPortfolio(p);
    setTrades(t);

    // Fetch live prices for positions
    if (pos.length > 0) {
      const enriched = await Promise.all(
        pos.map(async (position) => {
          try {
            const res = await fetch(
              `/api/stock/quote?symbol=${position.ticker}`,
            );
            if (!res.ok) throw new Error();
            const q: StockQuote = await res.json();
            const marketValue = q.price * position.shares;
            const costBasis = position.avgCost * position.shares;
            return {
              ...position,
              currentPrice: q.price,
              marketValue,
              gainLoss: marketValue - costBasis,
              gainLossPct: ((marketValue - costBasis) / costBasis) * 100,
              dayChangePct: q.changePct,
            };
          } catch {
            return {
              ...position,
              currentPrice: null,
              marketValue: null,
              gainLoss: null,
              gainLossPct: null,
              dayChangePct: null,
            };
          }
        }),
      );
      setPositions(enriched);
    } else {
      setPositions([]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Search stocks — instant prefix match from curated list, then Finnhub for the rest
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    // Show curated results immediately (no delay)
    const curated = searchTopStocks(searchQuery, 8).map((s) => ({
      symbol: s.ticker,
      name: s.name,
    }));
    setSearchResults(curated);
    setHighlightedIndex(0);

    // Then hit Finnhub to fill in any gaps not covered by the curated list
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/stock/search?q=${encodeURIComponent(searchQuery)}`,
        );
        const data = await res.json() as { results: SearchResult[] };
        const finnhubResults = data.results ?? [];
        const curatedTickers = new Set(curated.map((r) => r.symbol));
        const extra = finnhubResults.filter((r) => !curatedTickers.has(r.symbol));
        setSearchResults([...curated, ...extra].slice(0, 8));
      } catch {
        // Keep curated results if Finnhub fails
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [searchQuery]);

  async function selectStock(symbol: string) {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedStock(null);
    setTradeError(null);
    setTradeSuccess(null);
    setSharesInput("");
    setLoadingQuote(true);

    setCandles([]);
    try {
      const [quoteRes, candleRes] = await Promise.all([
        fetch(`/api/stock/quote?symbol=${symbol}`),
        fetch(`/api/stock/candles?symbol=${symbol}`),
      ]);
      if (!quoteRes.ok) throw new Error("Could not load quote");
      const q: StockQuote = await quoteRes.json();
      setSelectedStock(q);
      if (candleRes.ok) {
        const cd = await candleRes.json() as { prices: number[] };
        setCandles(cd.prices ?? []);
      }

      // Auto-switch to SELL if user owns shares
      const owns = positions.find((p) => p.ticker === symbol);
      if (owns) setTradeType("SELL");
      else setTradeType("BUY");
    } catch {
      setTradeError("Could not load quote for " + symbol);
    } finally {
      setLoadingQuote(false);
    }
  }

  async function executeTrade() {
    if (!selectedStock || !sharesInput || !portfolio) return;
    const shares = parseFloat(sharesInput);
    if (!Number.isFinite(shares) || shares <= 0) {
      setTradeError("Enter a valid number of shares.");
      return;
    }

    setExecuting(true);
    setTradeError(null);
    setTradeSuccess(null);

    // Unique key per click — server detects network-retry duplicates
    const idempotencyKey = crypto.randomUUID();

    try {
      const res = await fetch("/api/trade/execute", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ticker: selectedStock.symbol,
          tradeType,
          shares,
          idempotencyKey,
        }),
      });

      const data = await res.json() as {
        success?: boolean;
        error?: string;
        totalValue?: number;
        pricePerShare?: number;
      };

      if (!res.ok || !data.success) {
        setTradeError(data.error ?? "Trade failed. Please try again.");
      } else {
        const verb = tradeType === "BUY" ? "Bought" : "Sold";
        setTradeSuccess(
          `${verb} ${shares} share${shares !== 1 ? "s" : ""} of ${selectedStock.symbol} @ ${fmtCurrency(data.pricePerShare ?? 0)} — Total: ${fmtCurrency(data.totalValue ?? 0)}`,
        );
        setSharesInput("");
        await loadData();
        // Check trading achievements after data refresh
        const [freshTrades, awarded] = await Promise.all([
          listTrades(),
          listAwardedAchievements(),
        ]);
        const spyReturn = chartData
          ? (() => {
              const pts = chartData.spyPoints;
              if (pts.length < 2) return undefined;
              return ((pts[pts.length - 1].value - pts[0].value) / pts[0].value) * 100;
            })()
          : undefined;
        const eligible = computeEligibleAchievements({
          hasTrades: freshTrades.length > 0,
          portfolioReturnPct: chartData?.totalReturn,
          spyReturnPct: spyReturn,
        });
        const awardedSet = new Set(awarded.map((a) => a.id));
        const newlyAwarded = await awardAchievements(eligible.filter((id) => !awardedSet.has(id)));
        if (newlyAwarded.length > 0) setNewAchievements(newlyAwarded);
      }
    } catch {
      setTradeError("Network error. Please try again.");
    } finally {
      setExecuting(false);
    }
  }

  // Derived totals
  const investedValue = positions.reduce(
    (sum, p) => sum + (p.marketValue ?? p.avgCost * p.shares),
    0,
  );
  const totalValue = (portfolio?.cash ?? 0) + investedValue;
  const totalCostBasis = positions.reduce(
    (sum, p) => sum + p.avgCost * p.shares,
    0,
  );
  const totalGainLoss = investedValue - totalCostBasis;

  const sharesNum = parseFloat(sharesInput);
  const estimatedCost =
    selectedStock && !isNaN(sharesNum) && sharesNum > 0
      ? sharesNum * selectedStock.price
      : null;

  const ownedPosition = selectedStock
    ? positions.find((p) => p.ticker === selectedStock.symbol)
    : null;

  return (
    <section>
      {newAchievements.length > 0 && <AchievementToast newIds={newAchievements} />}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Paper Trading</h1>
        <span className="text-sm text-muted">
          Cash:{" "}
          {loading ? (
            <span className="inline-block h-4 w-16 animate-pulse rounded bg-black/10 align-middle" />
          ) : (
            <span className="font-medium text-ink">
              {fmtCurrency(portfolio?.cash ?? 0)}
            </span>
          )}
        </span>
      </div>

      {/* Tab bar */}
      <div className="mb-5 flex gap-1 rounded-xl bg-black/5 p-1">
        {(["portfolio", "trade", "history"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-1.5 text-sm font-medium capitalize transition ${
              tab === t
                ? "bg-white text-ink shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* PORTFOLIO TAB                                                        */}
      {/* ------------------------------------------------------------------ */}
      {tab === "portfolio" && (
        <div className="space-y-4">
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-24 rounded-2xl bg-black/5" />
              <div className="h-16 rounded-2xl bg-black/5" />
              <div className="h-16 rounded-2xl bg-black/5" />
            </div>
          ) : (
            <>
              {/* Summary card */}
              <div className="rounded-2xl border border-black/5 bg-white p-5">
                <p className="text-xs text-muted uppercase tracking-widest">
                  Total Portfolio Value
                </p>
                <p className="mt-1 text-3xl font-semibold tracking-tight">
                  {fmtCurrency(totalValue)}
                </p>
                <div className="mt-3 flex gap-6 text-sm">
                  <div>
                    <p className="text-muted">Cash</p>
                    <p className="font-medium">
                      {fmtCurrency(portfolio?.cash ?? 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted">Invested</p>
                    <p className="font-medium">{fmtCurrency(investedValue)}</p>
                  </div>
                  {positions.length > 0 && (
                    <div>
                      <p className="text-muted">Total P&L</p>
                      <p
                        className={`font-medium ${
                          totalGainLoss >= 0 ? "text-success" : "text-danger"
                        }`}
                      >
                        {totalGainLoss >= 0 ? "+" : ""}
                        {fmtCurrency(totalGainLoss)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Performance chart */}
              {chartData && (chartData.portfolioPoints.length >= 2 || chartData.totalReturn !== 0) && (
                <div className="rounded-2xl border border-black/5 bg-white p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-widest text-muted">
                      Performance
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <span className="inline-block h-0.5 w-4 rounded bg-accent" />
                        Portfolio
                      </span>
                      {chartData.spyPoints.length > 1 && (
                        <span className="flex items-center gap-1">
                          <span
                            className="inline-block h-0.5 w-4 rounded"
                            style={{
                              background:
                                "repeating-linear-gradient(to right, rgba(0,0,0,0.3) 0, rgba(0,0,0,0.3) 4px, transparent 4px, transparent 7px)",
                            }}
                          />
                          S&amp;P 500
                        </span>
                      )}
                    </div>
                  </div>

                  <PerformanceChart
                    portfolioPoints={chartData.portfolioPoints}
                    spyPoints={chartData.spyPoints}
                  />

                  <div className="mt-3 flex gap-4 border-t border-black/5 pt-3 text-sm">
                    <div>
                      <p className="text-xs text-muted">Total Return</p>
                      <p
                        className={`font-semibold ${
                          chartData.totalReturn >= 0 ? "text-success" : "text-danger"
                        }`}
                      >
                        {chartData.totalReturn >= 0 ? "+" : ""}
                        {chartData.totalReturn.toFixed(2)}%
                      </p>
                    </div>
                    {chartData.annualReturn !== null && (
                      <div>
                        <p className="text-xs text-muted">Annual Return</p>
                        <p
                          className={`font-semibold ${
                            chartData.annualReturn >= 0 ? "text-success" : "text-danger"
                          }`}
                        >
                          {chartData.annualReturn >= 0 ? "+" : ""}
                          {chartData.annualReturn.toFixed(2)}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Price alerts */}
              <PriceAlerts positions={positions} />

              {/* Allocation breakdown */}
              {positions.length > 0 && (
                <AllocationCard
                  positions={positions}
                  cash={portfolio?.cash ?? 0}
                  totalValue={totalValue}
                />
              )}

              {/* Positions */}
              {positions.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-black/10 bg-white px-8 py-12 text-center">
                  <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-success/8">
                    <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5}>
                      <polyline points="2,14 7,8 11,11 18,3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 17h16" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="font-semibold">$10,000 ready to invest</p>
                  <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
                    Search for any stock and make your first paper trade. No real money — all the real learning.
                  </p>
                  <button
                    onClick={() => setTab("trade")}
                    className="mt-5 rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper"
                  >
                    Make your first trade →
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {positions.map((pos) => (
                    <div
                      key={pos.ticker}
                      className="rounded-2xl border border-black/5 bg-white px-4 py-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{pos.ticker}</p>
                          <p className="text-xs text-muted">
                            {fmt(pos.shares, 4)} shares · avg{" "}
                            {fmtCurrency(pos.avgCost)}
                          </p>
                        </div>
                        <div className="text-right">
                          {pos.currentPrice !== null ? (
                            <>
                              <p className="font-medium">
                                {fmtCurrency(pos.marketValue!)}
                              </p>
                              <p
                                className={`text-xs font-medium ${
                                  pos.gainLoss! >= 0
                                    ? "text-success"
                                    : "text-danger"
                                }`}
                              >
                                {pos.gainLoss! >= 0 ? "+" : ""}
                                {fmtCurrency(pos.gainLoss!)} (
                                {fmtPct(pos.gainLossPct!)})
                              </p>
                            </>
                          ) : (
                            <p className="text-xs text-muted">Price unavailable</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => {
                            setTradeType("BUY");
                            setTab("trade");
                            selectStock(pos.ticker);
                          }}
                          className="flex-1 rounded-lg border border-success/30 py-1.5 text-xs font-medium text-success transition hover:bg-success hover:text-white"
                        >
                          Buy more
                        </button>
                        <button
                          onClick={() => {
                            setTradeType("SELL");
                            setTab("trade");
                            selectStock(pos.ticker);
                          }}
                          className="flex-1 rounded-lg border border-danger/30 py-1.5 text-xs font-medium text-danger transition hover:bg-danger hover:text-white"
                        >
                          Sell
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TRADE TAB                                                            */}
      {/* ------------------------------------------------------------------ */}
      {tab === "trade" && (
        <div className="space-y-4">
          {/* Stock search */}
          <div className="relative" ref={dropdownRef}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setHighlightedIndex(0);
              }}
              onKeyDown={(e) => {
                if (!searchResults.length) return;
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setHighlightedIndex((i) => Math.min(i + 1, searchResults.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setHighlightedIndex((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter" || e.key === "Tab") {
                  e.preventDefault();
                  const top = searchResults[highlightedIndex];
                  if (top) selectStock(top.symbol);
                } else if (e.key === "Escape") {
                  setSearchResults([]);
                }
              }}
              placeholder="Search by ticker or company name…"
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              autoComplete="off"
            />

            {/* Ghost-text autofill hint inside the input */}
            {searchResults.length > 0 && searchQuery && !searching && (
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-4">
                <span className="invisible text-sm">{searchQuery}</span>
                <span className="text-sm text-black/20">
                  {searchResults[highlightedIndex]?.symbol.startsWith(searchQuery.toUpperCase())
                    ? searchResults[highlightedIndex].symbol.slice(searchQuery.length)
                    : ""}
                </span>
              </div>
            )}

            {(searchResults.length > 0 || searching) && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl">
                {searching ? (
                  <p className="px-4 py-3 text-sm text-muted">Searching…</p>
                ) : (
                  <>
                    {searchResults.map((r, i) => (
                      <button
                        key={r.symbol}
                        onMouseEnter={() => setHighlightedIndex(i)}
                        onClick={() => selectStock(r.symbol)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition ${
                          i === highlightedIndex ? "bg-accent/8 text-ink" : "hover:bg-black/3"
                        }`}
                      >
                        <span className={`w-14 shrink-0 font-semibold ${i === highlightedIndex ? "text-accent" : ""}`}>
                          {r.symbol}
                        </span>
                        <span className="truncate text-muted">{r.name}</span>
                        {i === 0 && (
                          <span className="ml-auto shrink-0 text-xs text-black/20">↵ select</span>
                        )}
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Quote + trade panel */}
          {loadingQuote && (
            <div className="animate-pulse h-40 rounded-2xl bg-black/5" />
          )}

          {selectedStock && !loadingQuote && (
            <div className="rounded-2xl border border-black/5 bg-white p-5 space-y-4">
              {/* Stock header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-lg leading-tight">{selectedStock.symbol}</p>
                  <p className="text-sm text-muted">{selectedStock.name}</p>
                  {selectedStock.industry && (
                    <p className="mt-0.5 text-xs text-muted/70">{selectedStock.industry}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold">{fmtCurrency(selectedStock.price)}</p>
                  <p className={`text-sm font-medium ${selectedStock.change >= 0 ? "text-success" : "text-danger"}`}>
                    {selectedStock.change >= 0 ? "+" : ""}{fmtCurrency(selectedStock.change)} ({fmtPct(selectedStock.changePct)})
                  </p>
                </div>
              </div>

              {/* 30-day sparkline */}
              {candles.length > 1 && (
                <Sparkline prices={candles} />
              )}

              {/* Key stats grid */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["Open", fmtCurrency(selectedStock.open)],
                  ["Prev Close", fmtCurrency(selectedStock.prevClose)],
                  ["Day High", fmtCurrency(selectedStock.dayHigh)],
                  ["Day Low", fmtCurrency(selectedStock.dayLow)],
                  ...(candles.length > 1 ? [
                    ["30D High", fmtCurrency(Math.max(...candles))],
                    ["30D Low", fmtCurrency(Math.min(...candles))],
                  ] : []),
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-black/[0.03] px-3 py-2">
                    <p className="text-[10px] text-muted uppercase tracking-wide">{label}</p>
                    <p className="mt-0.5 text-sm font-medium">{value}</p>
                  </div>
                ))}
              </div>

              {/* Owned position info */}
              {ownedPosition && (
                <div className="rounded-xl bg-black/3 px-3 py-2 text-xs text-muted">
                  You own{" "}
                  <span className="font-medium text-ink">
                    {fmt(ownedPosition.shares, 4)} shares
                  </span>{" "}
                  · avg cost{" "}
                  <span className="font-medium text-ink">
                    {fmtCurrency(ownedPosition.avgCost)}
                  </span>
                </div>
              )}

              {/* BUY / SELL toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setTradeType("BUY")}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                    tradeType === "BUY"
                      ? "bg-success text-white"
                      : "border border-black/10 text-muted hover:text-ink"
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setTradeType("SELL")}
                  disabled={!ownedPosition}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                    tradeType === "SELL"
                      ? "bg-danger text-white"
                      : "border border-black/10 text-muted hover:text-ink disabled:opacity-30"
                  }`}
                >
                  Sell
                </button>
              </div>

              {/* Shares input */}
              <div>
                <label
                  htmlFor="shares"
                  className="block text-xs font-medium text-muted mb-1"
                >
                  Number of shares
                </label>
                <input
                  id="shares"
                  type="number"
                  min="0.0001"
                  step="1"
                  value={sharesInput}
                  onChange={(e) => {
                    setSharesInput(e.target.value);
                    setTradeError(null);
                    setTradeSuccess(null);
                  }}
                  placeholder="0"
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              {/* Cost estimate */}
              {estimatedCost !== null && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Estimated total</span>
                  <span className="font-medium">{fmtCurrency(estimatedCost)}</span>
                </div>
              )}

              {tradeType === "BUY" && portfolio && estimatedCost !== null && (
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>Cash remaining after trade</span>
                  <span
                    className={
                      portfolio.cash - estimatedCost < 0 ? "text-danger" : ""
                    }
                  >
                    {fmtCurrency(Math.max(0, portfolio.cash - estimatedCost))}
                  </span>
                </div>
              )}

              {/* Feedback */}
              {tradeError && (
                <p className="rounded-xl bg-danger/5 border border-danger/20 px-3 py-2 text-sm text-danger">
                  {tradeError}
                </p>
              )}
              {tradeSuccess && (
                <p className="rounded-xl bg-success/5 border border-success/20 px-3 py-2 text-sm text-success">
                  {tradeSuccess}
                </p>
              )}

              {/* Execute button */}
              <button
                onClick={executeTrade}
                disabled={executing || !sharesInput || parseFloat(sharesInput) <= 0}
                className={`w-full rounded-full py-3 text-sm font-medium text-white transition disabled:opacity-40 ${
                  tradeType === "BUY"
                    ? "bg-success hover:bg-success/90"
                    : "bg-danger hover:bg-danger/90"
                }`}
              >
                {executing
                  ? "Executing…"
                  : `${tradeType === "BUY" ? "Buy" : "Sell"} ${selectedStock.symbol}`}
              </button>
            </div>
          )}

          {/* Quick-access: own positions to sell */}
          {!selectedStock && !loadingQuote && positions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-widest text-muted">
                Your positions
              </p>
              {positions.map((pos) => (
                <button
                  key={pos.ticker}
                  onClick={() => selectStock(pos.ticker)}
                  className="flex w-full items-center justify-between rounded-2xl border border-black/5 bg-white px-4 py-3 text-left transition hover:border-accent/30"
                >
                  <div>
                    <p className="font-semibold">{pos.ticker}</p>
                    <p className="text-xs text-muted">
                      {fmt(pos.shares, 4)} shares
                    </p>
                  </div>
                  <span className="text-xs text-accent">Trade →</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* HISTORY TAB                                                          */}
      {/* ------------------------------------------------------------------ */}
      {tab === "history" && (
        <div className="space-y-2">
          {loading ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-2xl bg-black/5" />
              ))}
            </div>
          ) : trades.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-black/10 bg-white px-8 py-12 text-center">
              <p className="font-semibold">No trades yet</p>
              <p className="mt-1 text-sm text-muted">Your full trade history will appear here once you make your first trade.</p>
              <button
                onClick={() => setTab("trade")}
                className="mt-5 rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper"
              >
                Make your first trade →
              </button>
            </div>
          ) : (
            trades.map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between rounded-2xl border border-black/5 bg-white px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                      trade.tradeType === "BUY"
                        ? "bg-success/10 text-success"
                        : "bg-danger/10 text-danger"
                    }`}
                  >
                    {trade.tradeType}
                  </span>
                  <div>
                    <p className="font-medium">{trade.ticker}</p>
                    <p className="text-xs text-muted">
                      {fmt(trade.shares, 4)} shares @{" "}
                      {fmtCurrency(trade.pricePerShare)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{fmtCurrency(trade.totalValue)}</p>
                  <p className="text-xs text-muted">
                    {new Date(trade.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}

// ── Price alerts ───────────────────────────────────────────────────────────

const ALERT_THRESHOLDS = [20, 10, 5];

function PriceAlerts({ positions }: { positions: PositionWithQuote[] }) {
  const alerts = positions
    .filter((p) => p.dayChangePct !== null && Math.abs(p.dayChangePct) >= 5)
    .sort((a, b) => Math.abs(b.dayChangePct!) - Math.abs(a.dayChangePct!));

  if (!alerts.length) return null;

  return (
    <div className="space-y-2">
      {alerts.map((p) => {
        const pct = p.dayChangePct!;
        const up = pct >= 0;
        const threshold = ALERT_THRESHOLDS.find((t) => Math.abs(pct) >= t) ?? 5;
        const bg = up ? "bg-success/8 border-success/20" : "bg-danger/8 border-danger/20";
        const textColor = up ? "text-success" : "text-danger";
        const icon = up ? "↑" : "↓";
        const label = threshold >= 20 ? "Major move" : threshold >= 10 ? "Significant move" : "Notable move";

        return (
          <div key={p.ticker} className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${bg}`}>
            <div className="flex items-center gap-3">
              <span className={`text-lg font-bold ${textColor}`}>{icon}</span>
              <div>
                <p className={`text-sm font-semibold ${textColor}`}>
                  {p.ticker} is {up ? "up" : "down"} {Math.abs(pct).toFixed(2)}% to {fmtCurrency(p.currentPrice!)}
                </p>
                <p className="text-xs text-muted">{label} · {p.companyName}</p>
              </div>
            </div>
            <span className={`text-xs font-bold ${textColor}`}>
              {up ? "+" : ""}{pct.toFixed(1)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── 30-day sparkline ──────────────────────────────────────────────────────

function Sparkline({ prices }: { prices: number[] }) {
  const W = 600, H = 80, PAD = 4;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const up = prices[prices.length - 1] >= prices[0];
  const color = up ? "#16A34A" : "#DC2626";

  const pts = prices.map((p, i) => {
    const x = PAD + (i / (prices.length - 1)) * (W - PAD * 2);
    const y = PAD + ((max - p) / range) * (H - PAD * 2);
    return `${x},${y}`;
  });
  const polyline = pts.join(" ");
  const area = `${pts[0]} ${pts.slice(1).join(" ")} ${W - PAD},${H} ${PAD},${H}`;

  return (
    <div>
      <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted">
        30-Day Price
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 64 }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#spark-fill)" />
        <polyline points={polyline} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="flex justify-between text-[10px] text-muted mt-0.5">
        <span>{prices.length} trading days</span>
        <span className={up ? "text-success" : "text-danger"}>
          {up ? "+" : ""}{(((prices[prices.length - 1] - prices[0]) / prices[0]) * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

// ── Allocation breakdown ───────────────────────────────────────────────────

const ALLOC_COLORS = [
  "#1F6FEB", "#16A34A", "#8B5CF6", "#D97706",
  "#EC4899", "#0EA5E9", "#EF4444", "#F97316",
  "#14B8A6", "#A855F7",
];

function AllocationCard({
  positions,
  cash,
  totalValue,
}: {
  positions: PositionWithQuote[];
  cash: number;
  totalValue: number;
}) {
  if (totalValue <= 0) return null;

  const slices = positions.map((p, i) => ({
    label: p.ticker,
    value: p.marketValue ?? p.avgCost * p.shares,
    color: ALLOC_COLORS[i % ALLOC_COLORS.length],
  }));

  const cashPct = (cash / totalValue) * 100;

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5">
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted">
        Allocation
      </p>

      {/* Segmented bar */}
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-black/5">
        {slices.map((s) => {
          const pct = (s.value / totalValue) * 100;
          return (
            <div
              key={s.label}
              style={{ width: `${pct}%`, background: s.color }}
              title={`${s.label} ${pct.toFixed(1)}%`}
            />
          );
        })}
        <div
          style={{ width: `${cashPct}%`, background: "rgba(0,0,0,0.1)" }}
          title={`Cash ${cashPct.toFixed(1)}%`}
        />
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {slices.map((s) => {
          const pct = (s.value / totalValue) * 100;
          return (
            <div key={s.label} className="flex items-center gap-3">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: s.color }}
              />
              <span className="flex-1 text-sm font-medium">{s.label}</span>
              <span className="text-sm text-muted">{fmtCurrency(s.value)}</span>
              <span className="w-12 text-right text-sm font-semibold">
                {pct.toFixed(1)}%
              </span>
            </div>
          );
        })}
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-black/10" />
          <span className="flex-1 text-sm font-medium text-muted">Cash</span>
          <span className="text-sm text-muted">{fmtCurrency(cash)}</span>
          <span className="w-12 text-right text-sm font-semibold text-muted">
            {cashPct.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
