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
