import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const CACHE_TTL_S = 6 * 60 * 60; // backward-looking quarterly data, changes at most once a quarter
const MAX_QUARTERS = 4; // Finnhub's free tier only returns the last 4
const MAX_BATCH_SYMBOLS = 40;

type FinnhubEarning = {
  period: string; // quarter end date, YYYY-MM-DD
  actual: number | null;
  estimate: number | null;
  surprise: number | null;
  surprisePercent: number | null;
  year: number;
  quarter: number;
};

type Quarter = {
  period: string;
  year: number;
  quarter: number;
  actual: number | null;
  estimate: number | null;
  surprisePercent: number | null;
};

type EarningsHistoryBody = { symbol: string; quarters: Quarter[] };

// Cache-first fetch of one symbol's earnings history — shared by the
// single-symbol and batch paths below.
async function fetchOneEarningsHistory(sym: string, apiKey: string): Promise<EarningsHistoryBody | null> {
  const cacheKey = `earnings-history:${sym}`;
  const cached = await kvGet<EarningsHistoryBody>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`${FINNHUB_BASE}/stock/earnings?symbol=${encodeURIComponent(sym)}&token=${apiKey}`);
    if (!res.ok) return null;

    const rows = (await res.json()) as FinnhubEarning[];
    const quarters: Quarter[] = (rows ?? [])
      .filter((r) => r.period)
      .sort((a, b) => b.period.localeCompare(a.period))
      .slice(0, MAX_QUARTERS)
      .map((r) => ({
        period: r.period,
        year: r.year,
        quarter: r.quarter,
        actual: r.actual ?? null,
        estimate: r.estimate ?? null,
        surprisePercent: r.surprisePercent ?? null,
      }));

    const body: EarningsHistoryBody = { symbol: sym, quarters };
    await kvSet(cacheKey, body, CACHE_TTL_S);
    return body;
  } catch (err) {
    console.error(`[stock/earnings-history] fetch failed for ${sym}:`, err);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const symbolsParam = request.nextUrl.searchParams.get("symbols");
  const symbolParam = request.nextUrl.searchParams.get("symbol");

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FINNHUB_API_KEY is not configured" }, { status: 500 });
  }

  // Batch path — one request for many symbols instead of one per symbol
  // (intelligence.html fetches this for the whole watchlist on load).
  if (symbolsParam) {
    const rl = checkRateLimit("stock:earnings-history:batch", clientIdFromRequest(request), 20, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
    }
    const symbols = [...new Set(symbolsParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean))].slice(0, MAX_BATCH_SYMBOLS);
    if (!symbols.length) return NextResponse.json({ error: "symbols is required" }, { status: 400 });

    const histories: Record<string, EarningsHistoryBody> = {};
    const CHUNK = 5;
    for (let i = 0; i < symbols.length; i += CHUNK) {
      const chunk = symbols.slice(i, i + CHUNK);
      const results = await Promise.all(chunk.map((s) => fetchOneEarningsHistory(s, apiKey)));
      chunk.forEach((s, j) => { const r = results[j]; if (r) histories[s] = r; });
      if (i + CHUNK < symbols.length) await new Promise((r) => setTimeout(r, 150));
    }
    const missingSymbols = symbols.filter((s) => !(s in histories));

    return NextResponse.json({ histories, missingSymbols }, { headers: { "Cache-Control": "private, max-age=21600" } });
  }

  // Single-symbol path — unchanged behavior/response shape.
  const rl = checkRateLimit("stock:earnings-history", clientIdFromRequest(request), 40, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }
  if (!symbolParam) return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  const sym = symbolParam.toUpperCase();
  const body = await fetchOneEarningsHistory(sym, apiKey);
  if (!body) {
    return NextResponse.json({ error: "Failed to fetch earnings history" }, { status: 500 });
  }
  return NextResponse.json(body, { headers: { "Cache-Control": "private, max-age=21600" } });
}
