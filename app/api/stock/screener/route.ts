import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvHashGetAll } from "@/lib/kvCache";
import { getSp500List } from "@/lib/sp500List";
import { SCREENER_HASH_KEY, type ScreenerFields } from "@/lib/screenerShared";

export const runtime = "nodejs";

type ScreenerRow = { symbol: string; name: string; sector: string } & ScreenerFields;

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("stock:screener", clientIdFromRequest(request), 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  try {
    // One round trip for every cached symbol's fundamentals (populated by
    // the daily cron, which rotates through the full roster over a few
    // days — see app/api/cron/refresh-screener), merged with the real
    // Wikipedia S&P 500 list for name/sector. A symbol the cron hasn't
    // reached yet (cold start, or mid-rotation) still appears with null
    // fundamentals rather than being dropped, so the roster count is
    // always the real ~503, even before every field is warm.
    const [list, fundamentals] = await Promise.all([
      getSp500List(),
      kvHashGetAll<ScreenerFields>(SCREENER_HASH_KEY),
    ]);

    const rows: ScreenerRow[] = list.map((c) => {
      const f = fundamentals[c.symbol];
      return {
        symbol: c.symbol,
        name: c.name,
        sector: c.sector,
        marketCap: f?.marketCap ?? null,
        peTTM: f?.peTTM ?? null,
        forwardPE: f?.forwardPE ?? null,
        revenueGrowthYoy: f?.revenueGrowthYoy ?? null,
        beta: f?.beta ?? null,
        dividendYield: f?.dividendYield ?? null,
        priceReturn52W: f?.priceReturn52W ?? null,
      };
    });

    const warmCount = rows.filter((r) => r.marketCap != null).length;
    return NextResponse.json({ rows, universeSize: rows.length, warmCount }, {
      headers: { "Cache-Control": "public, max-age=1800, stale-while-revalidate=300" },
    });
  } catch (err) {
    console.error("[stock/screener] error:", err);
    return NextResponse.json({ error: "Failed to load screener data" }, { status: 500 });
  }
}
