import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const SYMBOLS = ["AAPL", "MSFT", "NVDA", "TSLA", "META", "AMZN", "GOOGL", "AMD", "JPM", "V"];

type TickerItem = { symbol: string; price: number; changePct: number };

let cache: { data: TickerItem[]; ts: number } | null = null;
const CACHE_MS = 5 * 60 * 1000;

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_MS) {
    return NextResponse.json(cache.data);
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return NextResponse.json([]);

  try {
    const results = await Promise.allSettled(
      SYMBOLS.map((s) =>
        fetch(`${FINNHUB_BASE}/quote?symbol=${s}&token=${apiKey}`, { cache: "no-store" })
          .then((r) => r.json())
          .then((q: { c: number; dp: number }) => ({ symbol: s, price: q.c, changePct: q.dp }))
      )
    );

    const data: TickerItem[] = results
      .filter((r): r is PromiseFulfilledResult<TickerItem> => r.status === "fulfilled" && r.value.price > 0)
      .map((r) => r.value);

    cache = { data, ts: Date.now() };
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}
