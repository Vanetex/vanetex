import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const CACHE_KEY = "heatmap:v1";
const CACHE_TTL_S = 300; // 5 minutes — shared across all users

// Curated prominent companies per sector. `tier` drives tile size
// (1 = largest/most prominent, 3 = smallest) as a manual stand-in
// for market-cap ranking, so the heatmap doesn't need a second
// Finnhub call per symbol just to size tiles.
type SeedCompany = { sym: string; name: string; tier: 1 | 2 | 3 };
const SECTOR_SEEDS: Record<string, SeedCompany[]> = {
  Technology: [
    { sym: "NVDA", name: "NVIDIA", tier: 1 },
    { sym: "AAPL", name: "Apple", tier: 1 },
    { sym: "MSFT", name: "Microsoft", tier: 2 },
    { sym: "AVGO", name: "Broadcom", tier: 2 },
    { sym: "ORCL", name: "Oracle", tier: 3 },
    { sym: "CRM", name: "Salesforce", tier: 3 },
    { sym: "AMD", name: "AMD", tier: 3 },
    { sym: "ADBE", name: "Adobe", tier: 3 },
  ],
  Communication: [
    { sym: "GOOGL", name: "Alphabet", tier: 1 },
    { sym: "META", name: "Meta Platforms", tier: 1 },
    { sym: "NFLX", name: "Netflix", tier: 2 },
    { sym: "DIS", name: "Disney", tier: 3 },
    { sym: "TMUS", name: "T-Mobile", tier: 3 },
    { sym: "VZ", name: "Verizon", tier: 3 },
  ],
  Consumer: [
    { sym: "AMZN", name: "Amazon", tier: 1 },
    { sym: "TSLA", name: "Tesla", tier: 1 },
    { sym: "HD", name: "Home Depot", tier: 2 },
    { sym: "MCD", name: "McDonald's", tier: 2 },
    { sym: "NKE", name: "Nike", tier: 3 },
    { sym: "SBUX", name: "Starbucks", tier: 3 },
    { sym: "TGT", name: "Target", tier: 3 },
  ],
  Financials: [
    { sym: "BRK.B", name: "Berkshire Hathaway", tier: 1 },
    { sym: "JPM", name: "JPMorgan Chase", tier: 1 },
    { sym: "V", name: "Visa", tier: 2 },
    { sym: "MA", name: "Mastercard", tier: 2 },
    { sym: "BAC", name: "Bank of America", tier: 3 },
    { sym: "WFC", name: "Wells Fargo", tier: 3 },
    { sym: "GS", name: "Goldman Sachs", tier: 3 },
  ],
  Healthcare: [
    { sym: "LLY", name: "Eli Lilly", tier: 1 },
    { sym: "UNH", name: "UnitedHealth", tier: 1 },
    { sym: "JNJ", name: "Johnson & Johnson", tier: 2 },
    { sym: "ABBV", name: "AbbVie", tier: 2 },
    { sym: "MRK", name: "Merck", tier: 3 },
    { sym: "PFE", name: "Pfizer", tier: 3 },
    { sym: "TMO", name: "Thermo Fisher", tier: 3 },
  ],
  Energy: [
    { sym: "XOM", name: "ExxonMobil", tier: 1 },
    { sym: "CVX", name: "Chevron", tier: 1 },
    { sym: "COP", name: "ConocoPhillips", tier: 2 },
    { sym: "SLB", name: "Schlumberger", tier: 3 },
    { sym: "EOG", name: "EOG Resources", tier: 3 },
  ],
  Industrials: [
    { sym: "CAT", name: "Caterpillar", tier: 1 },
    { sym: "HON", name: "Honeywell", tier: 1 },
    { sym: "BA", name: "Boeing", tier: 2 },
    { sym: "UPS", name: "UPS", tier: 2 },
    { sym: "GE", name: "GE Aerospace", tier: 3 },
    { sym: "LMT", name: "Lockheed Martin", tier: 3 },
    { sym: "RTX", name: "RTX Corp", tier: 3 },
  ],
};

type HeatmapCompany = SeedCompany & { price: number; changePct: number };
type HeatmapPayload = Record<string, HeatmapCompany[]>;

let inFlight: Promise<HeatmapPayload> | null = null;

async function fetchQuote(apiKey: string, symbol: string) {
  const r = await fetch(`${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`);
  if (!r.ok) return null;
  const q = (await r.json()) as { c: number; dp: number };
  if (!q.c) return null;
  return { price: q.c, changePct: q.dp };
}

async function buildHeatmap(apiKey: string): Promise<HeatmapPayload> {
  const entries = Object.entries(SECTOR_SEEDS);
  const payload: HeatmapPayload = {};

  // Fetch in small chunks (rather than all ~45 symbols at once) to stay
  // well under Finnhub's free-tier per-minute call limit.
  const allSeeds = entries.flatMap(([sector, seeds]) => seeds.map((s) => ({ sector, ...s })));
  const CHUNK = 10;
  const results: Array<{ sector: string; seed: SeedCompany; quote: { price: number; changePct: number } | null }> = [];
  for (let i = 0; i < allSeeds.length; i += CHUNK) {
    const chunk = allSeeds.slice(i, i + CHUNK);
    const chunkResults = await Promise.all(
      chunk.map(async ({ sector, ...seed }) => ({ sector, seed, quote: await fetchQuote(apiKey, seed.sym).catch(() => null) })),
    );
    results.push(...chunkResults);
    if (i + CHUNK < allSeeds.length) await new Promise((r) => setTimeout(r, 250));
  }

  for (const { sector, seed, quote } of results) {
    if (!quote) continue;
    (payload[sector] ??= []).push({ ...seed, ...quote });
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
    if (!inFlight) {
      inFlight = buildHeatmap(apiKey).finally(() => { inFlight = null; });
    }
    const payload = await inFlight;
    await kvSet(CACHE_KEY, payload, CACHE_TTL_S);
    return NextResponse.json(payload, { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=60" } });
  } catch (err) {
    console.error("[stock/heatmap] error:", err);
    return NextResponse.json({ error: "Failed to build heatmap" }, { status: 500 });
  }
}
