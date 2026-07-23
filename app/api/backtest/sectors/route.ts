import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const CACHE_TTL_S = 7 * 24 * 60 * 60; // industry classification is stable — 7 days
const MAX_SYMBOLS = 12;

async function fetchIndustry(symbol: string, apiKey: string): Promise<string | null> {
  const cacheKey = `backtest:sector:${symbol}`;
  const cached = await kvGet<string | null>(cacheKey);
  if (cached !== null) return cached;

  try {
    const res = await fetch(`${FINNHUB_BASE}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { finnhubIndustry?: string };
    const industry = data.finnhubIndustry || null;
    await kvSet(cacheKey, industry, CACHE_TTL_S);
    return industry;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("backtest:sectors", clientIdFromRequest(request), 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const symbolsParam = request.nextUrl.searchParams.get("symbols");
  if (!symbolsParam) return NextResponse.json({ error: "symbols is required" }, { status: 400 });

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FINNHUB_API_KEY is not configured" }, { status: 500 });
  }

  const symbols = [...new Set(symbolsParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean))].slice(0, MAX_SYMBOLS);
  if (!symbols.length) return NextResponse.json({ error: "symbols is required" }, { status: 400 });

  try {
    // Small chunks with a gap — same fan-out lesson as every other
    // multi-symbol route in this app.
    const CHUNK = 4;
    const industries: Record<string, string | null> = {};
    for (let i = 0; i < symbols.length; i += CHUNK) {
      const chunk = symbols.slice(i, i + CHUNK);
      const results = await Promise.all(chunk.map((s) => fetchIndustry(s, apiKey)));
      chunk.forEach((s, j) => { industries[s] = results[j]; });
      if (i + CHUNK < symbols.length) await new Promise((r) => setTimeout(r, 300));
    }

    return NextResponse.json({ industries }, { headers: { "Cache-Control": "private, max-age=3600" } });
  } catch (err) {
    console.error("[backtest/sectors] error:", err);
    return NextResponse.json({ error: "Failed to fetch sector data" }, { status: 500 });
  }
}
