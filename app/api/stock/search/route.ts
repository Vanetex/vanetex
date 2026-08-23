import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const FINNHUB_BASE = "https://finnhub.io/api/v1";
// Ticker/company search results don't change — caching this is what
// actually keeps popular queries (a stock everyone searches) from
// re-hitting Finnhub every time and tripping its own rate limit, which
// is what was happening: confirmed live while investigating a "ticker
// not showing up in search" report — Finnhub's /search itself was
// returning 429 "Too many requests" from this key's cumulative call
// volume, and this route had zero caching to absorb repeat lookups.
const CACHE_TTL_S = 24 * 60 * 60;

type FinnhubSearchResult = {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
};

type YahooSearchQuote = {
  symbol: string;
  shortname?: string;
  longname?: string;
  quoteType: string;
  exchDisp?: string;
};

// `exchange` is present only for the Yahoo/international results below —
// Finnhub's own US results leave it undefined, and the frontend falls back
// to "not tracked" for those, same label it always showed.
type SearchResult = { symbol: string; name: string; exchange?: string };

// Yahoo's own symbol convention marks every non-US-primary listing with a
// "." suffix (7203.T, 005930.KS, NESN.SW, ...) — confirmed live this is
// NOT how Yahoo represents US share classes (Berkshire is "BRK-B", a
// hyphen, not a dot), so filtering on "." reliably isolates genuinely
// foreign-exchange listings without also duplicating Finnhub's US ADR
// results (TSM, BABA, SONY, ... all come back symbol-bare, no dot, from
// this same endpoint, and are dropped here since Finnhub already covers
// them under stock/search's ADR handling).
async function fetchYahooIntlResults(q: string): Promise<SearchResult[]> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0`,
      { headers: { "User-Agent": "Mozilla/5.0" }, cache: "no-store" },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { quotes?: YahooSearchQuote[] };
    return (data.quotes ?? [])
      .filter((r) => r.quoteType === "EQUITY" && r.symbol.includes("."))
      .slice(0, 5)
      .map((r) => ({ symbol: r.symbol, name: r.longname ?? r.shortname ?? r.symbol, exchange: r.exchDisp }));
  } catch (err) {
    console.error("[stock/search] Yahoo intl fetch failed:", err);
    return [];
  }
}

async function fetchFinnhubResults(q: string, apiKey: string): Promise<SearchResult[]> {
  const res = await fetch(`${FINNHUB_BASE}/search?q=${encodeURIComponent(q)}&token=${apiKey}`);
  if (!res.ok) throw new Error(`Finnhub search failed: ${res.status} ${await res.text().catch(() => "")}`);

  const data = (await res.json()) as { result: FinnhubSearchResult[] };

  // Filter to US common stocks, ETFs, and ADRs, limit to 8 results.
  // ADR matters more than it looks — every large foreign company trading
  // on a US exchange (TSM, BABA, JD, SONY, NVO, SHEL, ...) is typed "ADR"
  // by Finnhub, not "Common Stock", and was silently excluded here —
  // confirmed live: TSM's own search result comes back with type "ADR".
  return (data.result ?? [])
    .filter(
      (r) =>
        (r.type === "Common Stock" || r.type === "ETP" || r.type === "ADR") &&
        !r.symbol.includes(".") && // exclude non-US exchanges
        r.displaySymbol.length <= 5,
    )
    .slice(0, 8)
    .map((r) => ({ symbol: r.displaySymbol, name: r.description }));
}

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("stock:search", clientIdFromRequest(request), 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.trim().length < 1) {
    return NextResponse.json({ results: [] });
  }

  // v3: adds Yahoo-backed foreign-exchange results alongside Finnhub's US
  // results — a query cached under v2 (US-only) would otherwise keep
  // serving that stale, incomplete result for up to 24h.
  const cacheKey = `stock-search:v3:${q.trim().toLowerCase()}`;
  const cached = await kvGet<SearchResult[]>(cacheKey);
  if (cached) {
    return NextResponse.json({ results: cached });
  }

  // Yahoo's search needs no key and runs regardless. Finnhub only runs
  // when configured — locally (no FINNHUB_API_KEY, same as every other
  // paid key this app uses) this still returns real international results
  // instead of hard-failing before either fetch even starts.
  const apiKey = process.env.FINNHUB_API_KEY;

  try {
    const [finnhubResults, intlResults] = await Promise.all([
      apiKey ? fetchFinnhubResults(q, apiKey) : Promise.resolve<SearchResult[]>([]),
      fetchYahooIntlResults(q),
    ]);

    const seen = new Set(finnhubResults.map((r) => r.symbol));
    const results = [...finnhubResults, ...intlResults.filter((r) => !seen.has(r.symbol))].slice(0, 13);

    // Don't cache an empty result — a transient hiccup or rate limit
    // shouldn't get frozen in as "no such ticker" for 24h.
    if (results.length) await kvSet(cacheKey, results, CACHE_TTL_S);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("[stock/search] error:", err);
    return NextResponse.json(
      { error: "Failed to search stocks" },
      { status: 500 },
    );
  }
}
