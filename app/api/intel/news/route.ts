import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const CACHE_TTL_S = 15 * 60; // news moves faster than earnings dates
const PER_SYMBOL_LIMIT = 3;
const MAX_RESULTS = 8;
const MAX_SYMBOLS = 8;
const GENERAL_CACHE_TTL_S = 10 * 60;
const MAX_GENERAL_RESULTS = 12;

type FinnhubNews = {
  category?: string;
  datetime: number; // unix seconds
  headline: string;
  source: string;
  url: string;
};

type NewsItem = {
  time: string;
  src: string;
  sym: string | null; // null for general market news — no single company it's "about"
  headline: string;
  url: string;
};

// Real headline keyword lists per non-stock instrument — used to filter
// Finnhub's category feeds (which aren't per-instrument) down to what's
// actually relevant, e.g. "gold" for GOLD, "bitcoin"/"BTC" for BTC.
// Every phrase is matched with word boundaries (see matchesKeywords) so
// e.g. "gold" never matches inside "Goldman" and "corn" never matches
// inside "Cornerstone".
const INSTRUMENT_NEWS_KEYWORDS: Record<string, string[]> = {
  SPX: ["S&P 500", "S&P500"],
  NDX: ["Nasdaq Composite", "Nasdaq index", "Nasdaq 100"],
  DOW: ["Dow Jones"],
  RUSSELL2000: ["Russell 2000"],
  VIX: ["VIX", "volatility index"],
  FTSE: ["FTSE 100", "FTSE"],
  NIKKEI: ["Nikkei"],
  HSI: ["Hang Seng"],
  ES: ["S&P 500", "S&P500"],
  NQ: ["Nasdaq"],
  YM: ["Dow Jones"],
  RTY: ["Russell 2000"],
  GOLD: ["gold"],
  SILVER: ["silver"],
  PLATINUM: ["platinum"],
  PALLADIUM: ["palladium"],
  COPPER: ["copper"],
  OIL: ["crude oil", "WTI", "OPEC", "oil price", "oil prices"],
  BRENT: ["Brent crude", "Brent oil"],
  NATGAS: ["natural gas"],
  HEATOIL: ["heating oil"],
  GASOLINE: ["gasoline", "RBOB"],
  CORN: ["corn"],
  WHEAT: ["wheat"],
  SOYBEANS: ["soybean", "soybeans"],
  COFFEE: ["coffee"],
  COTTON: ["cotton"],
  SUGAR: ["sugar"],
  UST3M: ["Treasury yield", "T-bill"],
  UST5Y: ["Treasury yield", "5-year Treasury"],
  UST10Y: ["Treasury yield", "10-year Treasury", "10-year note"],
  UST30Y: ["Treasury yield", "30-year Treasury", "long bond"],
  EURUSD: ["euro", "EUR/USD"],
  USDJPY: ["yen", "USD/JPY"],
  GBPUSD: ["pound sterling", "GBP/USD", "British pound"],
  BTC: ["bitcoin", "BTC"],
  ETH: ["ethereum", "ETH"],
  SOL: ["solana"],
  XRP: ["XRP", "ripple"],
  DOGE: ["dogecoin"],
};
const CRYPTO_INSTRUMENT_CODES = new Set(["BTC", "ETH", "SOL", "XRP", "DOGE"]);
const MIN_INSTRUMENT_MATCHES = 2;

function matchesKeywords(headline: string, keywords: string[]): boolean {
  return keywords.some((kw) => {
    const esc = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${esc}\\b`, "i").test(headline);
  });
}

async function getCategoryNews(category: "general" | "crypto", apiKey: string): Promise<NewsItem[]> {
  const cacheKey = `news:category:${category}`;
  const cached = await kvGet<NewsItem[]>(cacheKey);
  if (cached && cached.length) return cached;

  const res = await fetch(`${FINNHUB_BASE}/news?category=${category}&token=${apiKey}`);
  if (!res.ok) {
    console.error(`[intel/news] ${category} fetch failed: status=${res.status} body=${await res.text().catch(() => "")}`);
    return [];
  }

  const rows = (await res.json()) as FinnhubNews[];
  const items: NewsItem[] = (rows ?? [])
    .filter((r) => r.headline && r.datetime)
    .sort((a, b) => b.datetime - a.datetime)
    .slice(0, MAX_GENERAL_RESULTS)
    .map((r) => ({
      time: new Date(r.datetime * 1000).toISOString(),
      src: r.source || "Unknown",
      sym: null,
      headline: r.headline,
      url: r.url,
    }));

  // A real 200 with genuinely zero usable headlines is implausible for
  // a general news feed — far more likely a transient parse/shape
  // issue. Never cache that, or one bad response freezes the whole
  // panel empty for the full TTL (this is exactly what happened on
  // first deploy: an empty result got cached and every request within
  // the window kept serving it back).
  if (!rows || !Array.isArray(rows)) {
    console.error(`[intel/news] ${category} response not an array: ${JSON.stringify(rows).slice(0, 300)}`);
  }
  if (!items.length) return items;

  await kvSet(cacheKey, items, GENERAL_CACHE_TTL_S);
  return items;
}

async function getGeneralNews(apiKey: string): Promise<NewsItem[]> {
  return getCategoryNews("general", apiKey);
}

// Finnhub has no per-commodity/per-coin news endpoint, so instrument news
// is real category-feed headlines (crypto category for crypto codes,
// general for everything else) filtered down by keyword relevance. If
// too few real matches turn up (thin coverage that day, or an instrument
// whose keywords are just narrower), falls back to the full category
// pool rather than showing an artificially sparse or empty panel — same
// fallback discipline as the rest of this route.
async function getInstrumentNews(
  code: string,
  apiKey: string,
): Promise<{ items: NewsItem[]; matched: boolean; category: "general" | "crypto" }> {
  const keywords = INSTRUMENT_NEWS_KEYWORDS[code];
  const category: "general" | "crypto" = CRYPTO_INSTRUMENT_CODES.has(code) ? "crypto" : "general";
  const pool = await getCategoryNews(category, apiKey);
  if (!keywords) return { items: pool, matched: false, category };

  const filtered = pool.filter((item) => matchesKeywords(item.headline, keywords));
  if (filtered.length >= MIN_INSTRUMENT_MATCHES) {
    return { items: filtered.slice(0, MAX_GENERAL_RESULTS), matched: true, category };
  }
  return { items: pool, matched: false, category };
}

async function getSymbolNews(symbol: string, apiKey: string): Promise<NewsItem[]> {
  const cacheKey = `news:${symbol}`;
  const cached = await kvGet<NewsItem[]>(cacheKey);
  if (cached) return cached;

  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 5);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const res = await fetch(
    `${FINNHUB_BASE}/company-news?symbol=${encodeURIComponent(symbol)}&from=${fmt(from)}&to=${fmt(to)}&token=${apiKey}`,
  );
  if (!res.ok) return [];

  const rows = (await res.json()) as FinnhubNews[];
  const items: NewsItem[] = (rows ?? [])
    .filter((r) => r.headline && r.datetime)
    .sort((a, b) => b.datetime - a.datetime)
    .slice(0, PER_SYMBOL_LIMIT)
    .map((r) => ({
      time: new Date(r.datetime * 1000).toISOString(),
      src: r.source || "Unknown",
      sym: symbol,
      headline: r.headline,
      url: r.url,
    }));

  await kvSet(cacheKey, items, CACHE_TTL_S);
  return items;
}

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("intel:news", clientIdFromRequest(request), 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FINNHUB_API_KEY is not configured" }, { status: 500 });
  }

  const instrumentCode = request.nextUrl.searchParams.get("instrument")?.trim().toUpperCase();
  if (instrumentCode) {
    try {
      const { items, matched, category } = await getInstrumentNews(instrumentCode, apiKey);
      return NextResponse.json({ items, matched, category }, { headers: { "Cache-Control": "private, max-age=300" } });
    } catch (err) {
      console.error("[intel/news] instrument error:", err);
      return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
    }
  }

  const symbolsParam = request.nextUrl.searchParams.get("symbols") ?? "";
  const symbols = [...new Set(symbolsParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean))].slice(0, MAX_SYMBOLS);

  // No symbols requested — e.g. the Market Overview screen, or an
  // indicator view where there's no single company this news could be
  // "about" — falls back to real general market/business news instead
  // of an empty panel.
  if (symbols.length === 0) {
    try {
      const items = await getGeneralNews(apiKey);
      return NextResponse.json({ items }, { headers: { "Cache-Control": "private, max-age=300" } });
    } catch (err) {
      console.error("[intel/news] general error:", err);
      return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
    }
  }

  try {
    // Small chunks with a gap — per-symbol calls fan out fast otherwise
    // (same lesson as the sector heatmap: Finnhub's free-tier limit
    // gets tripped by bursting many calls at once).
    const CHUNK = 4;
    const allItems: NewsItem[] = [];
    for (let i = 0; i < symbols.length; i += CHUNK) {
      const chunk = symbols.slice(i, i + CHUNK);
      const results = await Promise.all(chunk.map((s) => getSymbolNews(s, apiKey).catch(() => [])));
      for (const r of results) allItems.push(...r);
      if (i + CHUNK < symbols.length) await new Promise((r) => setTimeout(r, 400));
    }

    allItems.sort((a, b) => b.time.localeCompare(a.time));
    return NextResponse.json({ items: allItems.slice(0, MAX_RESULTS) }, { headers: { "Cache-Control": "private, max-age=300" } });
  } catch (err) {
    console.error("[intel/news] error:", err);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
