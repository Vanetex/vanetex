import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const CACHE_KEY = "heatmap:v2";
const CACHE_TTL_S = 300; // 5 minutes — shared across all users
const MCAP_CACHE_KEY = "heatmap:mcap:v2";
const MCAP_CACHE_TTL_S = 24 * 60 * 60; // market cap barely moves day to day

// Curated companies per sector. Market cap (for sector ordering and
// tile sizing) is fetched live and cached separately for a day, since
// it doesn't need the same 5-min freshness as price/change.
type Seed = { sym: string; name: string };
const SECTOR_SEEDS: Record<string, Seed[]> = {
  Technology: [
    { sym: "NVDA", name: "NVIDIA" }, { sym: "AAPL", name: "Apple" },
    { sym: "MSFT", name: "Microsoft" }, { sym: "AVGO", name: "Broadcom" },
    { sym: "ORCL", name: "Oracle" }, { sym: "CRM", name: "Salesforce" },
    { sym: "AMD", name: "AMD" }, { sym: "ADBE", name: "Adobe" },
    { sym: "CSCO", name: "Cisco" }, { sym: "ACN", name: "Accenture" },
    { sym: "IBM", name: "IBM" }, { sym: "TXN", name: "Texas Instruments" },
    { sym: "QCOM", name: "Qualcomm" }, { sym: "INTC", name: "Intel" },
  ],
  Communication: [
    { sym: "GOOGL", name: "Alphabet" }, { sym: "META", name: "Meta Platforms" },
    { sym: "NFLX", name: "Netflix" }, { sym: "DIS", name: "Disney" },
    { sym: "TMUS", name: "T-Mobile" }, { sym: "VZ", name: "Verizon" },
    { sym: "CMCSA", name: "Comcast" }, { sym: "T", name: "AT&T" },
    { sym: "CHTR", name: "Charter Comm" }, { sym: "WBD", name: "Warner Bros Discovery" },
  ],
  Consumer: [
    { sym: "AMZN", name: "Amazon" }, { sym: "TSLA", name: "Tesla" },
    { sym: "HD", name: "Home Depot" }, { sym: "MCD", name: "McDonald's" },
    { sym: "NKE", name: "Nike" }, { sym: "SBUX", name: "Starbucks" },
    { sym: "TGT", name: "Target" }, { sym: "LOW", name: "Lowe's" },
    { sym: "BKNG", name: "Booking Holdings" }, { sym: "CMG", name: "Chipotle" },
    { sym: "ABNB", name: "Airbnb" }, { sym: "YUM", name: "Yum! Brands" },
  ],
  Financials: [
    { sym: "BRK.B", name: "Berkshire Hathaway" }, { sym: "JPM", name: "JPMorgan Chase" },
    { sym: "V", name: "Visa" }, { sym: "MA", name: "Mastercard" },
    { sym: "BAC", name: "Bank of America" }, { sym: "WFC", name: "Wells Fargo" },
    { sym: "GS", name: "Goldman Sachs" }, { sym: "MS", name: "Morgan Stanley" },
    { sym: "AXP", name: "American Express" }, { sym: "SCHW", name: "Charles Schwab" },
    { sym: "BLK", name: "BlackRock" }, { sym: "C", name: "Citigroup" },
  ],
  Healthcare: [
    { sym: "LLY", name: "Eli Lilly" }, { sym: "UNH", name: "UnitedHealth" },
    { sym: "JNJ", name: "Johnson & Johnson" }, { sym: "ABBV", name: "AbbVie" },
    { sym: "MRK", name: "Merck" }, { sym: "PFE", name: "Pfizer" },
    { sym: "TMO", name: "Thermo Fisher" }, { sym: "ABT", name: "Abbott" },
    { sym: "DHR", name: "Danaher" }, { sym: "AMGN", name: "Amgen" },
    { sym: "ISRG", name: "Intuitive Surgical" }, { sym: "BMY", name: "Bristol Myers Squibb" },
  ],
  Energy: [
    { sym: "XOM", name: "ExxonMobil" }, { sym: "CVX", name: "Chevron" },
    { sym: "COP", name: "ConocoPhillips" }, { sym: "SLB", name: "Schlumberger" },
    { sym: "EOG", name: "EOG Resources" }, { sym: "MPC", name: "Marathon Petroleum" },
    { sym: "PSX", name: "Phillips 66" }, { sym: "OXY", name: "Occidental Petroleum" },
  ],
  Industrials: [
    { sym: "CAT", name: "Caterpillar" }, { sym: "HON", name: "Honeywell" },
    { sym: "BA", name: "Boeing" }, { sym: "UPS", name: "UPS" },
    { sym: "GE", name: "GE Aerospace" }, { sym: "LMT", name: "Lockheed Martin" },
    { sym: "RTX", name: "RTX Corp" }, { sym: "DE", name: "Deere & Co" },
    { sym: "UNP", name: "Union Pacific" }, { sym: "ETN", name: "Eaton Corp" },
    { sym: "ADP", name: "ADP" }, { sym: "MMM", name: "3M" },
  ],
};

type HeatmapCompany = Seed & { price: number; changePct: number; marketCap: number; tier: 1 | 2 | 3 };
type HeatmapPayload = Record<string, HeatmapCompany[]>;

let quoteInFlight: Promise<Record<string, { price: number; changePct: number }>> | null = null;
let mcapInFlight: Promise<Record<string, number>> | null = null;

async function fetchInChunks<T>(symbols: string[], fn: (sym: string) => Promise<T | null>, chunkSize = 10, delayMs = 250) {
  const out: Record<string, T> = {};
  for (let i = 0; i < symbols.length; i += chunkSize) {
    const chunk = symbols.slice(i, i + chunkSize);
    const results = await Promise.all(chunk.map(async (sym) => ({ sym, val: await fn(sym).catch(() => null) })));
    for (const { sym, val } of results) if (val !== null) out[sym] = val;
    if (i + chunkSize < symbols.length) await new Promise((r) => setTimeout(r, delayMs));
  }
  return out;
}

async function getQuotes(apiKey: string, symbols: string[]) {
  if (!quoteInFlight) {
    quoteInFlight = fetchInChunks(symbols, async (sym) => {
      const r = await fetch(`${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(sym)}&token=${apiKey}`);
      if (!r.ok) return null;
      const q = (await r.json()) as { c: number; dp: number };
      if (!q.c) return null;
      return { price: q.c, changePct: q.dp };
    }).finally(() => { quoteInFlight = null; });
  }
  return quoteInFlight;
}

async function getMarketCaps(apiKey: string, symbols: string[]) {
  const cached = await kvGet<Record<string, number>>(MCAP_CACHE_KEY);
  if (cached) return cached;
  if (!mcapInFlight) {
    mcapInFlight = fetchInChunks(symbols, async (sym) => {
      const r = await fetch(`${FINNHUB_BASE}/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${apiKey}`);
      if (!r.ok) return null;
      const p = (await r.json()) as { marketCapitalization?: number };
      if (!p.marketCapitalization) return null;
      return p.marketCapitalization; // already in millions USD
    }).finally(() => { mcapInFlight = null; });
    const result = await mcapInFlight;
    await kvSet(MCAP_CACHE_KEY, result, MCAP_CACHE_TTL_S);
    return result;
  }
  return mcapInFlight;
}

async function buildHeatmap(apiKey: string): Promise<HeatmapPayload> {
  const allSymbols = Object.values(SECTOR_SEEDS).flat().map((s) => s.sym);
  const [quotes, mcaps] = await Promise.all([getQuotes(apiKey, allSymbols), getMarketCaps(apiKey, allSymbols)]);

  const payload: HeatmapPayload = {};
  for (const [sector, seeds] of Object.entries(SECTOR_SEEDS)) {
    const withData = seeds
      .map((seed) => {
        const q = quotes[seed.sym];
        const mc = mcaps[seed.sym];
        if (!q || !mc) return null;
        return { ...seed, price: q.price, changePct: q.changePct, marketCap: mc };
      })
      .filter((c): c is Omit<HeatmapCompany, "tier"> => c !== null)
      .sort((a, b) => b.marketCap - a.marketCap);

    payload[sector] = withData.map((c, i) => ({
      ...c,
      tier: i < 2 ? 1 : i < 5 ? 2 : 3,
    }));
  }
  return payload;
}

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("stock:heatmap", clientIdFromRequest(request), 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FINNHUB_API_KEY is not configured" }, { status: 500 });
  }

  const cached = await kvGet<HeatmapPayload>(CACHE_KEY);
  if (cached) {
    return NextResponse.json(cached, { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=60" } });
  }

  try {
    const payload = await buildHeatmap(apiKey);
    await kvSet(CACHE_KEY, payload, CACHE_TTL_S);
    return NextResponse.json(payload, { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=60" } });
  } catch (err) {
    console.error("[stock/heatmap] error:", err);
    return NextResponse.json({ error: "Failed to build heatmap" }, { status: 500 });
  }
}
