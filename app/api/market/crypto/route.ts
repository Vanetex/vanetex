import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const CACHE_TTL_S = 60;
const CACHE_KEY = "market:crypto:v1";

// Fixed major-coin list — CoinGecko IDs mapped to display symbols.
const COINS: Record<string, string> = {
  bitcoin: "BTC",
  ethereum: "ETH",
  solana: "SOL",
  ripple: "XRP",
  dogecoin: "DOGE",
};

type CoinBody = { symbol: string; price: number; changePct: number };

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("market:crypto", clientIdFromRequest(request), 40, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const cached = await kvGet<CoinBody[]>(CACHE_KEY);
  if (cached) {
    return NextResponse.json({ coins: cached }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=30" } });
  }

  try {
    const ids = Object.keys(COINS).join(",");
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      { cache: "no-store" },
    );
    if (!res.ok) throw new Error(`CoinGecko returned ${res.status}`);

    const data = (await res.json()) as Record<string, { usd?: number; usd_24h_change?: number }>;
    const coins: CoinBody[] = [];
    for (const [id, symbol] of Object.entries(COINS)) {
      const d = data[id];
      if (d?.usd == null) continue;
      coins.push({ symbol, price: d.usd, changePct: d.usd_24h_change ?? 0 });
    }
    if (!coins.length) {
      return NextResponse.json({ error: "No price data" }, { status: 502 });
    }

    await kvSet(CACHE_KEY, coins, CACHE_TTL_S);
    return NextResponse.json({ coins }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=30" } });
  } catch (err) {
    console.error("[market/crypto] error:", err);
    return NextResponse.json({ error: "Failed to fetch crypto prices" }, { status: 500 });
  }
}
