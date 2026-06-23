import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";

export const runtime = "nodejs";

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

type QuoteEntry = {
  body: Record<string, unknown>;
  ts: number;
};
const cache = new Map<string, QuoteEntry>();

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("stock:quote", clientIdFromRequest(request), 40, 60_000);
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
      headers: { "Cache-Control": "private, max-age=180, stale-while-revalidate=60" },
    });
  }

  try {
    const [quoteRes, profileRes] = await Promise.all([
      fetch(`${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(key)}&token=${apiKey}`),
      fetch(`${FINNHUB_BASE}/stock/profile2?symbol=${encodeURIComponent(key)}&token=${apiKey}`),
    ]);

    if (!quoteRes.ok || !profileRes.ok) throw new Error("Finnhub request failed");

    const quote = (await quoteRes.json()) as {
      c: number; d: number; dp: number; h: number; l: number; o: number; pc: number;
    };
    const profile = (await profileRes.json()) as {
      name?: string; exchange?: string; finnhubIndustry?: string;
    };

    if (!quote.c) {
      return NextResponse.json(
        { error: `No price data found for symbol: ${key}` },
        { status: 404 },
      );
    }

    const body = {
      symbol: key,
      name: profile.name ?? key,
      exchange: profile.exchange ?? "",
      industry: profile.finnhubIndustry ?? "",
      price: quote.c,
      change: quote.d,
      changePct: quote.dp,
      dayHigh: quote.h,
      dayLow: quote.l,
      open: quote.o,
      prevClose: quote.pc,
    };

    cache.set(key, { body, ts: Date.now() });

    return NextResponse.json(body, {
      headers: { "Cache-Control": "private, max-age=180, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.error("[stock/quote] error:", err);
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 });
  }
}
