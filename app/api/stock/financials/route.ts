import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const CACHE_TTL_S = 60 * 60; // 1 hour — financials change infrequently

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("stock:financials", clientIdFromRequest(request), 40, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const symbol = request.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FINNHUB_API_KEY is not configured" }, { status: 500 });
  }

  const sym = symbol.toUpperCase();
  const cacheKey = `financials:${sym}`;
  const cached = await kvGet<Record<string, unknown>>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "Cache-Control": "private, max-age=3600, stale-while-revalidate=300" },
    });
  }

  try {
    const res = await fetch(`${FINNHUB_BASE}/stock/metric?symbol=${encodeURIComponent(sym)}&metric=all&token=${apiKey}`);
    if (!res.ok) throw new Error("Finnhub request failed");

    const data = (await res.json()) as { metric?: Record<string, number> };
    const m = data.metric ?? {};

    const body = {
      symbol: sym,
      peTTM: m.peTTM ?? null,
      epsTTM: m.epsInclExtraItemsTTM ?? m.epsTTM ?? null,
      beta: m.beta ?? null,
      week52High: m["52WeekHigh"] ?? null,
      week52Low: m["52WeekLow"] ?? null,
      dividendYield: m.dividendYieldIndicatedAnnual ?? null,
      marketCapitalization: m.marketCapitalization ?? null,
      avgVolume10D: m["10DayAverageTradingVolume"] ?? null,
      avgVolume3M: m["3MonthAverageTradingVolume"] ?? null,
      // Extended financials — same Finnhub response, just more of it.
      // Percent-based fields (margins, growth, ROE/ROA, price returns) are
      // already expressed as e.g. 47.86 meaning 47.86%, not a 0-1 fraction.
      forwardPE: m.forwardPE ?? null,
      pegRatio: m.pegTTM ?? null,
      priceToBook: m.pbQuarterly ?? m.pbAnnual ?? m.pb ?? null,
      priceToSales: m.psTTM ?? null,
      evToEbitda: m.evEbitdaTTM ?? null,
      grossMargin: m.grossMarginTTM ?? null,
      operatingMargin: m.operatingMarginTTM ?? null,
      netMargin: m.netProfitMarginTTM ?? null,
      roe: m.roeTTM ?? null,
      roa: m.roaTTM ?? null,
      revenueGrowthYoy: m.revenueGrowthTTMYoy ?? null,
      epsGrowthYoy: m.epsGrowthTTMYoy ?? null,
      currentRatio: m.currentRatioQuarterly ?? m.currentRatioAnnual ?? null,
      debtToEquity: m["totalDebt/totalEquityQuarterly"] ?? m["totalDebt/totalEquityAnnual"] ?? null,
      priceReturn52W: m["52WeekPriceReturnDaily"] ?? null,
      priceReturnYtd: m.yearToDatePriceReturnDaily ?? null,
    };

    await kvSet(cacheKey, body, CACHE_TTL_S);

    return NextResponse.json(body, {
      headers: { "Cache-Control": "private, max-age=3600, stale-while-revalidate=300" },
    });
  } catch (err) {
    console.error("[stock/financials] error:", err);
    return NextResponse.json({ error: "Failed to fetch financials" }, { status: 500 });
  }
}
