import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

// Finnhub's dividend endpoints (both /stock/dividend and the calendar
// variant) are Premium-only now — confirmed live against their docs
// sidebar. Yahoo's chart API carries real historical ex-dividend dates
// and per-share amounts for free via `events=div`, the same endpoint
// family already used for candles/extended-hours elsewhere in this app.
// Confirmed live: a non-payer (PLTR) simply omits the `events` key
// entirely — a clean, honest absence signal, not an error to work around.
const CACHE_TTL_S = 24 * 60 * 60; // real dividend history changes at most quarterly

type DivEvent = { date: number; amount: number }; // date = unix seconds

type DividendRow = {
  symbol: string;
  history: { date: string; amount: number }[];
  trailingTotal: number | null;
  frequency: "Monthly" | "Quarterly" | "Semi-Annual" | "Annual" | "Irregular" | null;
  lastExDate: string | null;
  lastAmount: number | null;
  // Last real ex-date plus the median gap between recent real payments —
  // an estimate of the next one, never an announced date. Null whenever
  // there isn't a stable enough cadence to project from.
  estimatedNextExDate: string | null;
};

const toIso = (unixSeconds: number) => new Date(unixSeconds * 1000).toISOString().slice(0, 10);

async function fetchDividendHistory(sym: string): Promise<DividendRow> {
  const cacheKey = `dividends:v1:${sym}`;
  const cached = await kvGet<DividendRow>(cacheKey);
  if (cached) return cached;

  const empty: DividendRow = {
    symbol: sym, history: [], trailingTotal: null, frequency: null,
    lastExDate: null, lastAmount: null, estimatedNextExDate: null,
  };

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=2y&events=div`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    if (!res.ok) { await kvSet(cacheKey, empty, CACHE_TTL_S); return empty; }

    const data = (await res.json()) as { chart?: { result?: Array<{ events?: { dividends?: Record<string, DivEvent> } }> } };
    const divs = data.chart?.result?.[0]?.events?.dividends;
    if (!divs) { await kvSet(cacheKey, empty, CACHE_TTL_S); return empty; }

    const events = Object.values(divs).sort((a, b) => a.date - b.date);
    const nowS = Date.now() / 1000;
    const trailing = events.filter((e) => nowS - e.date <= 366 * 86400);
    const trailingTotal = trailing.length ? trailing.reduce((s, e) => s + e.amount, 0) : null;

    // Frequency read off how many real payments actually landed in the
    // trailing year, not guessed from the company/sector.
    let frequency: DividendRow["frequency"] = null;
    if (trailing.length >= 10) frequency = "Monthly";
    else if (trailing.length >= 3) frequency = "Quarterly";
    else if (trailing.length === 2) frequency = "Semi-Annual";
    else if (trailing.length === 1) frequency = "Annual";
    else if (events.length >= 2) frequency = "Irregular"; // has history, but nothing in the last year on a stable cadence

    const last = events[events.length - 1];
    let estimatedNextExDate: string | null = null;
    if (last && events.length >= 2 && frequency && frequency !== "Irregular") {
      const recent = events.slice(-5);
      const gaps: number[] = [];
      for (let i = 1; i < recent.length; i++) gaps.push(recent[i].date - recent[i - 1].date);
      gaps.sort((a, b) => a - b);
      const medianGap = gaps[Math.floor(gaps.length / 2)];
      estimatedNextExDate = toIso(last.date + medianGap);
    }

    const row: DividendRow = {
      symbol: sym,
      history: events.slice(-8).map((e) => ({ date: toIso(e.date), amount: e.amount })),
      trailingTotal,
      frequency,
      lastExDate: last ? toIso(last.date) : null,
      lastAmount: last ? last.amount : null,
      estimatedNextExDate,
    };
    await kvSet(cacheKey, row, CACHE_TTL_S);
    return row;
  } catch {
    return empty;
  }
}

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("intel:dividends", clientIdFromRequest(request), 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const symbolsParam = request.nextUrl.searchParams.get("symbols");
  const symbols = (symbolsParam ?? "").split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
  if (!symbols.length) {
    return NextResponse.json({ rows: [] });
  }

  try {
    const rows = await Promise.all(symbols.map(fetchDividendHistory));
    // A non-payer isn't a failure, it's just not part of a dividend list.
    const payers = rows.filter((r) => r.history.length > 0);
    return NextResponse.json({ rows: payers }, { headers: { "Cache-Control": "private, max-age=3600" } });
  } catch (err) {
    console.error("[intel/dividends] error:", err);
    return NextResponse.json({ error: "Failed to fetch dividend data" }, { status: 500 });
  }
}
