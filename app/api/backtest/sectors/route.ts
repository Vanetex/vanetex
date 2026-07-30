import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";
export const maxDuration = 60; // same headroom rationale as backtest/prices — 50 symbols in chunks of 4

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const CACHE_TTL_S = 7 * 24 * 60 * 60; // industry/market-cap classification is stable — 7 days
const MAX_SYMBOLS = 50;

type Profile = { industry: string | null; marketCapUsdM: number | null; country: string | null };

async function fetchProfile(symbol: string, apiKey: string): Promise<Profile> {
  const cacheKey = `backtest:profile:${symbol}:v2`;
  const cached = await kvGet<Profile>(cacheKey);
  if (cached) return cached;

  const empty: Profile = { industry: null, marketCapUsdM: null, country: null };
  try {
    const res = await fetch(`${FINNHUB_BASE}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`);
    if (!res.ok) return empty;
    const data = (await res.json()) as {
      finnhubIndustry?: string;
      marketCapitalization?: number;
      country?: string;
      currency?: string;
    };
    // Finnhub reports marketCapitalization in the listing's LOCAL currency,
    // not always USD — confirmed live (TSM comes back in TWD, not USD).
    // Bucketing a non-USD figure as if it were USD would silently misclassify
    // the holding's size, so market cap is only kept when currency is USD.
    const profile: Profile = {
      industry: data.finnhubIndustry || null,
      marketCapUsdM: data.currency === "USD" ? data.marketCapitalization ?? null : null,
      country: data.country || null,
    };
    await kvSet(cacheKey, profile, CACHE_TTL_S);
    return profile;
  } catch {
    return empty;
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
    const profiles: Record<string, Profile> = {};
    for (let i = 0; i < symbols.length; i += CHUNK) {
      const chunk = symbols.slice(i, i + CHUNK);
      const results = await Promise.all(chunk.map((s) => fetchProfile(s, apiKey)));
      chunk.forEach((s, j) => { profiles[s] = results[j]; });
      if (i + CHUNK < symbols.length) await new Promise((r) => setTimeout(r, 300));
    }

    return NextResponse.json({ profiles }, { headers: { "Cache-Control": "private, max-age=3600" } });
  } catch (err) {
    console.error("[backtest/sectors] error:", err);
    return NextResponse.json({ error: "Failed to fetch sector data" }, { status: 500 });
  }
}
