import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";

export const runtime = "nodejs";

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

type FinancialsEntry = {
  body: Record<string, unknown>;
  ts: number;
};
const cache = new Map<string, FinancialsEntry>();

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

  const key = symbol.toUpperCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) {
    return NextResponse.json(hit.body, {
      headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=300" },
    });
  }

  try {
    const res = await fetch(`${FINNHUB_BASE}/stock/metric?symbol=${encodeURIComponent(key)}&metric=all&token=${apiKey}`);
    if (!res.ok) throw new Error("Finnhub request failed");

    const data = (await res.json()) as { metric?: Record<string, number> };
    const m = data.metric ?? {};

    const body = {
      symbol: key,
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

    cache.set(key, { body, ts: Date.now() });

    return NextResponse.json(body, {
      headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=300" },
    });
  } catch (err) {
    console.error("[stock/financials] error:", err);
    return NextResponse.json({ error: "Failed to fetch financials" }, { status: 500 });
  }
}
