import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const DETAIL_CACHE_TTL_S = 5 * 60; // supply/ATH move slowly; % changes are the freshest part
const FNG_CACHE_TTL_S = 60 * 60; // alternative.me only updates once a day anyway

// Same fixed coin list as market/crypto (the lightweight snapshot route) —
// this is the richer per-coin detail fetch, only called when a crypto
// Instrument View is actually open, not on the 60s snapshot poll.
const COIN_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  XRP: "ripple",
  DOGE: "dogecoin",
};

type Detail = {
  name: string | null;
  marketCap: number | null;
  circulatingSupply: number | null;
  totalSupply: number | null;
  maxSupply: number | null;
  athPrice: number | null;
  athDate: string | null;
  atlPrice: number | null;
  atlDate: string | null;
  changePct24h: number | null;
  changePct7d: number | null;
  changePct30d: number | null;
  changePct1y: number | null;
  fearGreedValue: number | null;
  fearGreedLabel: string | null;
};

async function fetchCoinDetail(coinId: string): Promise<Omit<Detail, "fearGreedValue" | "fearGreedLabel"> | null> {
  const cacheKey = `crypto-detail:${coinId}`;
  const cached = await kvGet<Omit<Detail, "fearGreedValue" | "fearGreedLabel">>(cacheKey);
  if (cached) return cached;

  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`,
    { cache: "no-store" },
  );
  if (!res.ok) return null;

  const data = (await res.json()) as {
    name?: string;
    market_data?: {
      market_cap?: { usd?: number };
      circulating_supply?: number;
      total_supply?: number;
      max_supply?: number;
      ath?: { usd?: number };
      ath_date?: { usd?: string };
      atl?: { usd?: number };
      atl_date?: { usd?: string };
      price_change_percentage_24h?: number;
      price_change_percentage_7d?: number;
      price_change_percentage_30d?: number;
      price_change_percentage_1y?: number;
    };
  };
  const md = data.market_data;
  if (!md) return null;

  const body = {
    name: data.name ?? null,
    marketCap: md.market_cap?.usd ?? null,
    circulatingSupply: md.circulating_supply ?? null,
    totalSupply: md.total_supply ?? null,
    maxSupply: md.max_supply ?? null,
    athPrice: md.ath?.usd ?? null,
    athDate: md.ath_date?.usd ? md.ath_date.usd.slice(0, 10) : null,
    atlPrice: md.atl?.usd ?? null,
    atlDate: md.atl_date?.usd ? md.atl_date.usd.slice(0, 10) : null,
    changePct24h: md.price_change_percentage_24h ?? null,
    changePct7d: md.price_change_percentage_7d ?? null,
    changePct30d: md.price_change_percentage_30d ?? null,
    changePct1y: md.price_change_percentage_1y ?? null,
  };
  await kvSet(cacheKey, body, DETAIL_CACHE_TTL_S);
  return body;
}

async function fetchFearGreed(): Promise<{ value: number | null; label: string | null }> {
  const cacheKey = "crypto-fear-greed";
  const cached = await kvGet<{ value: number | null; label: string | null }>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch("https://api.alternative.me/fng/?limit=1", { cache: "no-store" });
    if (!res.ok) return { value: null, label: null };
    const data = (await res.json()) as { data?: { value?: string; value_classification?: string }[] };
    const row = data.data?.[0];
    const body = {
      value: row?.value ? parseInt(row.value, 10) : null,
      label: row?.value_classification ?? null,
    };
    await kvSet(cacheKey, body, FNG_CACHE_TTL_S);
    return body;
  } catch {
    return { value: null, label: null };
  }
}

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("market:crypto-detail", clientIdFromRequest(request), 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const symbol = request.nextUrl.searchParams.get("symbol")?.toUpperCase();
  const coinId = symbol ? COIN_IDS[symbol] : null;
  if (!coinId) return NextResponse.json({ error: "Unsupported or missing symbol" }, { status: 400 });

  try {
    const [detail, fearGreed] = await Promise.all([fetchCoinDetail(coinId), fetchFearGreed()]);
    if (!detail) {
      return NextResponse.json({ error: "Failed to fetch coin detail" }, { status: 502 });
    }
    const body: Detail = { ...detail, fearGreedValue: fearGreed.value, fearGreedLabel: fearGreed.label };
    return NextResponse.json(body, { headers: { "Cache-Control": "private, max-age=300" } });
  } catch (err) {
    console.error("[market/crypto-detail] error:", err);
    return NextResponse.json({ error: "Failed to fetch crypto detail" }, { status: 502 });
  }
}
