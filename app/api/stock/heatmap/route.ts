import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet, kvHashGetAll, kvHashSetFields } from "@/lib/kvCache";
import { SECTOR_SEEDS, MCAP_CACHE_KEY, type HeatmapSeed } from "@/lib/heatmapSeeds";

export const runtime = "nodejs";
export const maxDuration = 30;

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const CACHE_KEY = "heatmap:v2";
const CACHE_TTL_S = 120; // 2 minutes — short enough that the rotation below cycles fast
// Last-known-good quotes never expire on their own (only overwritten by
// a fresher successful fetch), so a symbol not in this cycle's batch
// (or one that fails) shows slightly-stale data instead of vanishing.
const LASTGOOD_QUOTES_KEY = "heatmap:quotes:lastgood:v1";
const LASTGOOD_TTL_S = 6 * 60 * 60;
// Only refresh a slice of the roster per request — fetching all ~80
// symbols in one invocation flirted with both Finnhub's burst rate
// limit and the function's own time budget, and a single dropped
// batch meant whichever sector landed last in the list came up empty
// every single cycle. A small rotating batch clears comfortably
// within both limits, and cycles through the full roster over a few
// requests instead of gambling on all-or-nothing.
const BATCH_SIZE = 24;

type Quote = { price: number; changePct: number };
type HeatmapCompany = HeatmapSeed & { price: number; changePct: number; marketCap: number; tier: 1 | 2 | 3 };
type HeatmapPayload = Record<string, HeatmapCompany[]>;

let quoteInFlight: Promise<Record<string, Quote>> | null = null;

async function fetchInChunks<T>(symbols: string[], fn: (sym: string) => Promise<T | null>, chunkSize = 6, delayMs = 600) {
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
  if (quoteInFlight) return quoteInFlight;

  quoteInFlight = (async () => {
    // Rotate which BATCH_SIZE-sized slice gets refreshed this cycle,
    // so every symbol gets a fresh fetch roughly every ceil(80/24) ≈ 4
    // cycles (~8 min at a 2-min TTL), and no sector is ever singled
    // out as "the one that always misses."
    const cycle = Math.floor(Date.now() / (CACHE_TTL_S * 1000));
    const offset = (cycle * BATCH_SIZE) % symbols.length;
    const rotated = [...symbols.slice(offset), ...symbols.slice(0, offset)];
    const batch = rotated.slice(0, BATCH_SIZE);

    const fresh = await fetchInChunks(batch, async (sym) => {
      const r = await fetch(`${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(sym)}&token=${apiKey}`);
      if (!r.ok) return null;
      const q = (await r.json()) as { c: number; dp: number };
      if (!q.c) return null;
      return { price: q.c, changePct: q.dp } as Quote;
    });

    // Per-symbol hash fields, not a JSON-blob get-merge-set: under real
    // traffic, multiple serverless instances can hit a cache miss and
    // refresh different batches concurrently. A blob merge means
    // whichever instance's write lands last wins and silently drops
    // every symbol the other instance just fetched — which is exactly
    // what caused Financials to stay empty across cycles despite the
    // rotation being correct. Hash fields only touch the symbols this
    // call fetched, so concurrent writers can never clobber each other.
    if (Object.keys(fresh).length > 0) {
      await kvHashSetFields(LASTGOOD_QUOTES_KEY, fresh, LASTGOOD_TTL_S);
    }
    const lastGood = await kvHashGetAll<Quote>(LASTGOOD_QUOTES_KEY);
    return { ...lastGood, ...fresh };
  })().finally(() => { quoteInFlight = null; });

  return quoteInFlight;
}

// Market cap is never fetched live in this request path — it's
// populated by the /api/cron/refresh-heatmap-mcap cron (once daily)
// and read from cache only here. If the cache is cold (first deploy,
// before the cron has run once), fall back to each sector's curated
// listing order as a rough prominence proxy so companies still show.
async function buildHeatmap(apiKey: string): Promise<HeatmapPayload> {
  const allSymbols = Object.values(SECTOR_SEEDS).flat().map((s) => s.sym);
  const [quotes, mcaps] = await Promise.all([
    getQuotes(apiKey, allSymbols),
    kvGet<Record<string, number>>(MCAP_CACHE_KEY),
  ]);
  const mcapMap = mcaps ?? {};

  const payload: HeatmapPayload = {};
  for (const [sector, seeds] of Object.entries(SECTOR_SEEDS)) {
    const withData = seeds
      .map((seed) => {
        const q = quotes[seed.sym];
        if (!q) return null;
        return { ...seed, price: q.price, changePct: q.changePct, marketCap: mcapMap[seed.sym] ?? 0 };
      })
      .filter((c): c is Omit<HeatmapCompany, "tier"> => c !== null);

    const hasRealCaps = withData.some((c) => c.marketCap > 0);
    if (hasRealCaps) withData.sort((a, b) => b.marketCap - a.marketCap);
    // else: keep curated seed order as the prominence proxy

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
    return NextResponse.json(cached, { headers: { "Cache-Control": "public, max-age=120, stale-while-revalidate=30" } });
  }

  try {
    const payload = await buildHeatmap(apiKey);
    await kvSet(CACHE_KEY, payload, CACHE_TTL_S);
    return NextResponse.json(payload, { headers: { "Cache-Control": "public, max-age=120, stale-while-revalidate=30" } });
  } catch (err) {
    console.error("[stock/heatmap] error:", err);
    return NextResponse.json({ error: "Failed to build heatmap" }, { status: 500 });
  }
}
