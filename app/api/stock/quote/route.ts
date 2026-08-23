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
  // ISO 4217 code the price is actually denominated in. Always "USD" for
  // the Finnhub path below (every symbol reachable there is US-exchange-
  // listed, per stock/search's own foreign-exchange filter) — real for
  // the Yahoo fallback, which covers foreign-exchange-only symbols priced
  // in their local currency (JPY, KRW, CHF, ...), never assumed as USD.
  currency: string;
};

type QuoteResult =
  | { ok: true; body: QuoteBody }
  | { ok: false; reason: "not_found" | "failed" };

// Finnhub's free tier has no coverage for foreign-exchange-only symbols
// (confirmed live: /quote returns c:0 for 7203.T, 005930.KS, etc.) — this
// is the fallback for exactly that case, using the same Yahoo chart meta
// endpoint already relied on elsewhere in this app (index-quote, candles).
// Every field mapped below was checked against a live response first; there
// is no regularMarketOpen in Yahoo's meta, so "open" honestly falls back to
// the prior close rather than inventing a number, same convention the
// frontend itself already applies when open is otherwise unavailable.
async function fetchYahooFallbackQuote(sym: string): Promise<QuoteBody | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=5d`,
      { headers: { "User-Agent": "Mozilla/5.0" }, cache: "no-store" },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      chart: {
        result?: Array<{
          meta: {
            regularMarketPrice?: number; chartPreviousClose?: number;
            shortName?: string; longName?: string;
            fullExchangeName?: string; exchangeName?: string;
            currency?: string; instrumentType?: string;
            regularMarketDayHigh?: number; regularMarketDayLow?: number;
          };
          indicators?: { quote?: Array<{ close?: Array<number | null> }> };
        }>;
      };
    };
    const result = data.chart.result?.[0];
    const meta = result?.meta;
    if (!meta?.regularMarketPrice) return null;

    const price = meta.regularMarketPrice;
    const closes = (result?.indicators?.quote?.[0]?.close ?? []).filter((c): c is number => c != null);
    const prevClose = closes.length >= 2 ? closes[closes.length - 2] : (meta.chartPreviousClose ?? price);
    const change = price - prevClose;
    const changePct = prevClose ? (change / prevClose) * 100 : 0;

    return {
      symbol: sym,
      name: meta.longName ?? meta.shortName ?? sym,
      exchange: meta.fullExchangeName ?? meta.exchangeName ?? "",
      industry: "",
      logo: null,
      ipo: null,
      website: null,
      isFund: !!meta.instrumentType && meta.instrumentType !== "EQUITY",
      price,
      change,
      changePct,
      // `?? price` alone isn't enough — confirmed live that Yahoo's meta for
      // some exchanges (Korea Exchange, at least) returns a literal 0 here
      // rather than omitting the field, which `??` doesn't catch. A day
      // high/low of exactly 0 is never real for an equity, so it's treated
      // the same as missing.
      dayHigh: meta.regularMarketDayHigh || price,
      dayLow: meta.regularMarketDayLow || price,
      open: prevClose,
      prevClose,
      currency: meta.currency ?? "USD",
    };
  } catch (err) {
    console.error(`[stock/quote] Yahoo fallback failed for ${sym}:`, err);
    return null;
  }
}

// Cache-first fetch of one symbol's quote — shared by the single-symbol
// and batch paths below so a symbol warmed by one is warm for the other,
// and neither path duplicates a Finnhub call the other already made.
async function fetchOneQuote(sym: string, apiKey: string | null): Promise<QuoteResult> {
  const cacheKey = `quote:${sym}`;
  const cached = await kvGet<QuoteBody>(cacheKey);
  if (cached) return { ok: true, body: cached };

  // No Finnhub key configured (local dev, which has none of this app's paid
  // keys) — go straight to the keyless Yahoo fallback rather than failing
  // outright. In production the key is always present, so this branch never
  // runs there and existing behavior is unchanged.
  if (!apiKey) {
    const fallback = await fetchYahooFallbackQuote(sym);
    if (fallback) { await kvSet(cacheKey, fallback, CACHE_TTL_S); return { ok: true, body: fallback }; }
    return { ok: false, reason: "not_found" };
  }

  try {
    const [quoteRes, profileRes] = await Promise.all([
      fetch(`${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(sym)}&token=${apiKey}`),
      fetch(`${FINNHUB_BASE}/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${apiKey}`),
    ]);
    // A foreign-exchange-suffixed symbol (7203.T, 005930.KS, ...) doesn't
    // fail the way an unknown-but-plausible US symbol does (200 with c:0,
    // handled below) — Finnhub's free tier hard-403s the whole request for
    // these, confirmed live. Try the Yahoo fallback here too, not just past
    // the c:0 check below, or every one of these symbols dead-ends as a
    // generic "failed" before ever reaching that branch.
    if (!quoteRes.ok || !profileRes.ok) {
      const fallback = await fetchYahooFallbackQuote(sym);
      if (fallback) { await kvSet(cacheKey, fallback, CACHE_TTL_S); return { ok: true, body: fallback }; }
      return { ok: false, reason: "failed" };
    }

    const quote = (await quoteRes.json()) as {
      c: number; d: number; dp: number; h: number; l: number; o: number; pc: number;
    };
    const profile = (await profileRes.json()) as {
      name?: string; exchange?: string; finnhubIndustry?: string;
      logo?: string; ipo?: string; weburl?: string;
    };
    // Finnhub's free tier has no coverage for foreign-exchange-only symbols
    // (e.g. 7203.T, 005930.KS) — c:0 here is what that looks like, verified
    // live. Try the Yahoo fallback before giving up rather than reporting
    // "not found" for a symbol that genuinely trades, just not on Finnhub.
    if (!quote.c) {
      const fallback = await fetchYahooFallbackQuote(sym);
      if (fallback) { await kvSet(cacheKey, fallback, CACHE_TTL_S); return { ok: true, body: fallback }; }
      return { ok: false, reason: "not_found" };
    }

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
      currency: "USD",
    };
    await kvSet(cacheKey, body, CACHE_TTL_S);
    return { ok: true, body };
  } catch (err) {
    console.error(`[stock/quote] fetch failed for ${sym}:`, err);
    const fallback = await fetchYahooFallbackQuote(sym);
    if (fallback) { await kvSet(cacheKey, fallback, CACHE_TTL_S); return { ok: true, body: fallback }; }
    return { ok: false, reason: "failed" };
  }
}

export async function GET(request: NextRequest) {
  const symbolsParam = request.nextUrl.searchParams.get("symbols");
  const symbolParam = request.nextUrl.searchParams.get("symbol");

  // Missing key no longer hard-fails the whole route — fetchOneQuote falls
  // back to the keyless Yahoo path per-symbol when apiKey is null, which
  // still covers foreign-exchange-only symbols even without Finnhub
  // configured (local dev). Production always has this key.
  const apiKey = process.env.FINNHUB_API_KEY ?? null;

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
