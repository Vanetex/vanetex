import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

const FINNHUB_BASE = "https://finnhub.io/api/v1";

// Fetch current price from Finnhub. Returns null (not 0) on any failure —
// a fetch failure must stay distinguishable from a real price, otherwise a
// rate limit or upstream outage would silently zero out real users'
// leaderboard-facing portfolio_value below.
async function fetchPrice(ticker: string, apiKey: string): Promise<number | null> {
  try {
    const res = await fetch(
      `${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(ticker)}&token=${apiKey}`,
    );
    if (!res.ok) return null;
    const d = await res.json() as { c?: number };
    return d.c || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  // Vercel cron passes this header; reject any other caller
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "No FINNHUB_API_KEY" }, { status: 500 });

  const admin = createAdminClient();

  // Load all portfolios + their open positions
  const { data: portfolios, error: pErr } = await admin
    .from("paper_portfolios")
    .select("user_id, cash");
  if (pErr || !portfolios?.length) {
    return NextResponse.json({ updated: 0 });
  }

  const { data: positions } = await admin
    .from("paper_positions")
    .select("user_id, ticker, shares")
    .gt("shares", 0);

  // Group positions by user
  const byUser: Record<string, Array<{ ticker: string; shares: number }>> = {};
  for (const p of positions ?? []) {
    const uid = p.user_id as string;
    if (!byUser[uid]) byUser[uid] = [];
    byUser[uid].push({ ticker: p.ticker as string, shares: Number(p.shares) });
  }

  // Collect unique tickers across all users and fetch prices once each
  const allTickers = [...new Set(Object.values(byUser).flat().map((p) => p.ticker))];

  // Fetch in batches of 10 to avoid rate limits
  const priceMap: Record<string, number | null> = {};
  for (let i = 0; i < allTickers.length; i += 10) {
    const batch = allTickers.slice(i, i + 10);
    const prices = await Promise.all(batch.map((t) => fetchPrice(t, apiKey)));
    batch.forEach((t, j) => { priceMap[t] = prices[j]; });
    if (i + 10 < allTickers.length) await new Promise((r) => setTimeout(r, 200));
  }

  // Compute and update portfolio values — but a user whose held tickers hit
  // a failed price fetch gets skipped entirely rather than written with a
  // $0-priced position. A stale-but-correct portfolio_value (refreshed next
  // run) beats a corrupted one on the leaderboard.
  let updated = 0;
  let skipped = 0;
  const updates = portfolios.map((portfolio) => {
    const uid = portfolio.user_id as string;
    const cash = Number(portfolio.cash);
    const userPositions = byUser[uid] ?? [];
    const failedTickers = userPositions.filter((p) => priceMap[p.ticker] == null).map((p) => p.ticker);
    if (failedTickers.length) {
      console.error(`[cron/refresh-portfolios] Skipping value update for user ${uid} — price fetch failed for ${failedTickers.join(", ")}.`);
      return null;
    }
    const posValue = userPositions.reduce((sum, p) => sum + p.shares * (priceMap[p.ticker] as number), 0);
    const value = parseFloat((cash + posValue).toFixed(2));
    return admin
      .from("paper_portfolios")
      .update({ portfolio_value: value, value_updated_at: new Date().toISOString() })
      .eq("user_id", uid);
  });

  const results = await Promise.all(updates);
  updated = results.filter((r) => r && !r.error).length;
  skipped = results.filter((r) => r === null).length;

  return NextResponse.json({ updated, skipped, tickers: allTickers.length });
}
