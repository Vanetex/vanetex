import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";

export const runtime = "nodejs";

const FINRA_URL = "https://api.finra.org/data/group/otcMarket/name/weeklySummary";
const FINNHUB_BASE = "https://finnhub.io/api/v1";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const LOOKBACK_DAYS = 60;
const DEFAULT_SYMBOLS = ["NVDA", "AAPL", "TSLA", "MSFT", "AVGO", "META"];
const MAX_SYMBOLS = 14;
const TRADING_DAYS_PER_WEEK = 5;

type DarkRow = {
  time: string;
  sym: string;
  size: string;
  notional: string;
  venue: string;
  pct: string;
  // Real dark-pool index / lit-dark split, derived from FINRA's total
  // off-exchange weekly volume divided by Finnhub's trailing 3-month
  // average daily volume (×5 trading days) as a consolidated-volume
  // proxy. null when avg volume isn't available for the symbol.
  dpiPct: number | null;
  litPct: number | null;
};

const cache = new Map<string, { body: DarkRow[]; missingSymbols: string[]; ts: number }>();

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const splitLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === "," && !inQuotes) {
        out.push(cur);
        cur = "";
      } else {
        cur += c;
      }
    }
    out.push(cur);
    return out;
  };

  const header = splitLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = splitLine(line);
    const row: Record<string, string> = {};
    header.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
}

function fmtShares(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function fmtMoney(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

async function fetchAvgWeeklyVolume(symbol: string, apiKey: string): Promise<number | null> {
  try {
    const res = await fetch(`${FINNHUB_BASE}/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all&token=${apiKey}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { metric?: Record<string, number> };
    const avgDaily = data.metric?.["3MonthAverageTradingVolume"];
    if (!avgDaily) return null;
    // Finnhub reports this in millions of shares.
    return avgDaily * 1_000_000 * TRADING_DAYS_PER_WEEK;
  } catch {
    return null;
  }
}

async function fetchSymbol(symbol: string, apiKey: string | undefined): Promise<DarkRow | null> {
  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const sinceStr = since.toISOString().slice(0, 10);

  const res = await fetch(FINRA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      limit: 50,
      compareFilters: [
        { compareType: "EQUAL", fieldName: "issueSymbolIdentifier", fieldValue: symbol },
        { compareType: "GREATER", fieldName: "weekStartDate", fieldValue: sinceStr },
      ],
    }),
  });
  if (!res.ok) return null;

  const text = await res.text();
  const rows = parseCsv(text);
  if (!rows.length) return null;

  let latestWeek = "";
  for (const row of rows) {
    if (row.weekStartDate > latestWeek) latestWeek = row.weekStartDate;
  }

  const weekRows = rows.filter((r) => r.weekStartDate === latestWeek);
  const total = weekRows.reduce((sum, r) => sum + (parseFloat(r.totalWeeklyShareQuantity) || 0), 0);
  if (!total) return null;

  weekRows.sort(
    (a, b) => (parseFloat(b.totalWeeklyShareQuantity) || 0) - (parseFloat(a.totalWeeklyShareQuantity) || 0),
  );
  const top = weekRows[0];
  const size = parseFloat(top.totalWeeklyShareQuantity) || 0;
  const notional = parseFloat(top.totalNotionalSum) || 0;
  const pct = (size / total) * 100;

  let dpiPct: number | null = null;
  let litPct: number | null = null;
  if (apiKey) {
    const weeklyConsolidated = await fetchAvgWeeklyVolume(symbol, apiKey);
    if (weeklyConsolidated) {
      dpiPct = Math.min(100, (total / weeklyConsolidated) * 100);
      litPct = 100 - dpiPct;
    }
  }

  return {
    time: latestWeek,
    sym: symbol,
    size: fmtShares(size),
    notional: fmtMoney(notional),
    venue: top.marketParticipantName || top.MPID || "ATS",
    pct: `${pct.toFixed(1)}%`,
    dpiPct,
    litPct,
  };
}

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("intel:darkpool", clientIdFromRequest(request), 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const symbolsParam = request.nextUrl.searchParams.get("symbols");
  const symbols = (symbolsParam ? symbolsParam.split(",") : DEFAULT_SYMBOLS)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, MAX_SYMBOLS);

  if (!symbols.length) {
    return NextResponse.json({ error: "symbols is required" }, { status: 400 });
  }

  const key = symbols.join(",");
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) {
    return NextResponse.json({ rows: hit.body, missingSymbols: hit.missingSymbols }, {
      headers: { "Cache-Control": "public, max-age=1800, stale-while-revalidate=300" },
    });
  }

  const apiKey = process.env.FINNHUB_API_KEY;

  try {
    const results = await Promise.all(symbols.map((s) => fetchSymbol(s, apiKey).catch(() => null)));
    const rows = results.filter((r): r is DarkRow => r !== null);
    // `fetchSymbol` returning null covers both "genuinely no prints this
    // week" and "the FINRA/Finnhub fetch for this symbol failed" — rows
    // alone can't tell a caller which symbols it's missing, or why.
    const missingSymbols = symbols.filter((s) => !rows.some((r) => r.sym === s));

    cache.set(key, { body: rows, missingSymbols, ts: Date.now() });

    return NextResponse.json({ rows, missingSymbols }, {
      headers: { "Cache-Control": "public, max-age=1800, stale-while-revalidate=300" },
    });
  } catch (err) {
    console.error("[intel/darkpool] error:", err);
    return NextResponse.json({ error: "Failed to fetch dark pool data" }, { status: 500 });
  }
}
