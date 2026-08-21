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

type SearchResult = { symbol: string; name: string };

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("stock:search", clientIdFromRequest(request), 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.trim().length < 1) {
    return NextResponse.json({ results: [] });
  }

  const cacheKey = `stock-search:${q.trim().toLowerCase()}`;
  const cached = await kvGet<SearchResult[]>(cacheKey);
  if (cached) {
    return NextResponse.json({ results: cached });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "FINNHUB_API_KEY is not configured" },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(
      `${FINNHUB_BASE}/search?q=${encodeURIComponent(q)}&token=${apiKey}`,
    );

    if (!res.ok) throw new Error(`Finnhub search failed: ${res.status} ${await res.text().catch(() => "")}`);

    const data = await res.json() as { result: FinnhubSearchResult[] };

    // Filter to US common stocks, ETFs, and ADRs, limit to 8 results.
    // ADR matters more than it looks — every large foreign company
    // trading on a US exchange (TSM, BABA, JD, SONY, NVO, SHEL, ...) is
    // typed "ADR" by Finnhub, not "Common Stock", and was silently
    // excluded here — confirmed live: TSM's own search result comes
    // back with type "ADR".
    const results: SearchResult[] = (data.result ?? [])
      .filter(
        (r) =>
          (r.type === "Common Stock" || r.type === "ETP" || r.type === "ADR") &&
          !r.symbol.includes(".") && // exclude non-US exchanges
          r.displaySymbol.length <= 5,
      )
      .slice(0, 8)
      .map((r) => ({
        symbol: r.displaySymbol,
        name: r.description,
      }));

    // Don't cache an empty result — a transient Finnhub hiccup or rate
    // limit shouldn't get frozen in as "no such ticker" for 24h.
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
