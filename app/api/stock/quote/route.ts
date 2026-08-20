import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const CACHE_TTL_S = 180; // 3 minutes
const MAX_BATCH_SYMBOLS = 40;

type QuoteBody = {
  symbol: string;
  name: string;
  exchange: string;
  industry: string;
  logo: string | null;
  ipo: string | null;
  website: string | null;
  price: number;
  change: number;
  changePct: number;
  dayHigh: number;
  dayLow: number;
  open: number;
  prevClose: number;
  // Finnhub's stock/profile2 only covers companies — it comes back as an
  // empty object for every ETF/fund we've checked (SPDR, Vanguard,
  // iShares alike), regardless of issuer. That makes "no profile name"
  // a reliable, already-fetched signal for "this symbol is a fund," used
  // to explain (rather than silently hide) why holdings aren't shown for
  // non-SPDR funds.
  isFund: boolean;
};

type QuoteResult =
  | { ok: true; body: QuoteBody }
  | { ok: false; reason: "not_found" | "failed" };

// Cache-first fetch of one symbol's quote — shared by the single-symbol
// and batch paths below so a symbol warmed by one is warm for the other,
// and neither path duplicates a Finnhub call the other already made.
async function fetchOneQuote(sym: string, apiKey: string): Promise<QuoteResult> {
  const cacheKey = `quote:${sym}`;
  const cached = await kvGet<QuoteBody>(cacheKey);
  if (cached) return { ok: true, body: cached };

  try {
    const [quoteRes, profileRes] = await Promise.all([
      fetch(`${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(sym)}&token=${apiKey}`),
      fetch(`${FINNHUB_BASE}/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${apiKey}`),
    ]);
    if (!quoteRes.ok || !profileRes.ok) return { ok: false, reason: "failed" };

    const quote = (await quoteRes.json()) as {
      c: number; d: number; dp: number; h: number; l: number; o: number; pc: number;
    };
    const profile = (await profileRes.json()) as {
      name?: string; exchange?: string; finnhubIndustry?: string;
      logo?: string; ipo?: string; weburl?: string;
    };
    if (!quote.c) return { ok: false, reason: "not_found" };

    const body: QuoteBody = {
      symbol: sym,
      name: profile.name ?? sym,
      exchange: profile.exchange ?? "",
      industry: profile.finnhubIndustry ?? "",
      logo: profile.logo || null,
      ipo: profile.ipo || null,
      website: profile.weburl || null,
      isFund: !profile.name,
      price: quote.c,
      change: quote.d,
      changePct: quote.dp,
      dayHigh: quote.h,
      dayLow: quote.l,
      open: quote.o,
      prevClose: quote.pc,
    };
    await kvSet(cacheKey, body, CACHE_TTL_S);
    return { ok: true, body };
  } catch (err) {
    console.error(`[stock/quote] fetch failed for ${sym}:`, err);
    return { ok: false, reason: "failed" };
  }
}

export async function GET(request: NextRequest) {
  const symbolsParam = request.nextUrl.searchParams.get("symbols");
  const symbolParam = request.nextUrl.searchParams.get("symbol");

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FINNHUB_API_KEY is not configured" }, { status: 500 });
  }

  // Batch path — one request for many symbols, replacing what would
  // otherwise be one HTTP round-trip (and one shot at Finnhub's shared
  // rate limit) per symbol.
  if (symbolsParam) {
    const rl = checkRateLimit("stock:quote:batch", clientIdFromRequest(request), 20, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
    }
    const symbols = [...new Set(symbolsParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean))].slice(0, MAX_BATCH_SYMBOLS);
    if (!symbols.length) return NextResponse.json({ error: "symbols is required" }, { status: 400 });

    const quotes: Record<string, QuoteBody> = {};
    const CHUNK = 5;
    for (let i = 0; i < symbols.length; i += CHUNK) {
      const chunk = symbols.slice(i, i + CHUNK);
      const results = await Promise.all(chunk.map((s) => fetchOneQuote(s, apiKey)));
      chunk.forEach((s, j) => { const r = results[j]; if (r.ok) quotes[s] = r.body; });
      if (i + CHUNK < symbols.length) await new Promise((r) => setTimeout(r, 150));
    }
    const missingSymbols = symbols.filter((s) => !(s in quotes));

    return NextResponse.json({ quotes, missingSymbols }, {
      headers: { "Cache-Control": "private, max-age=180, stale-while-revalidate=60" },
    });
  }

  // Single-symbol path — unchanged behavior/response shape for existing
  // callers (app/trade/page.tsx, index.html, and remaining single lookups).
  const rl = checkRateLimit("stock:quote", clientIdFromRequest(request), 40, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }
  if (!symbolParam) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }
  const sym = symbolParam.toUpperCase();
  const result = await fetchOneQuote(sym, apiKey);
  if (!result.ok) {
    return result.reason === "not_found"
      ? NextResponse.json({ error: `No price data found for symbol: ${sym}` }, { status: 404 })
      : NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 });
  }
  return NextResponse.json(result.body, {
    headers: { "Cache-Control": "private, max-age=180, stale-while-revalidate=60" },
  });
}
