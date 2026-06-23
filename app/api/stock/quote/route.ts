import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const CACHE_TTL_S = 180; // 3 minutes

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

  const sym = symbol.toUpperCase();
  const cacheKey = `quote:${sym}`;
  const cached = await kvGet<Record<string, unknown>>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "Cache-Control": "private, max-age=180, stale-while-revalidate=60" },
    });
  }

  try {
    const [quoteRes, profileRes] = await Promise.all([
      fetch(`${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(sym)}&token=${apiKey}`),
      fetch(`${FINNHUB_BASE}/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${apiKey}`),
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
        { error: `No price data found for symbol: ${sym}` },
        { status: 404 },
      );
    }

    const body = {
      symbol: sym,
      name: profile.name ?? sym,
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

    await kvSet(cacheKey, body, CACHE_TTL_S);

    return NextResponse.json(body, {
      headers: { "Cache-Control": "private, max-age=180, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.error("[stock/quote] error:", err);
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 });
  }
}
