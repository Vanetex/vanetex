import { NextRequest, NextResponse } from "next/server";
import { kvHashSetFields } from "@/lib/kvCache";
import { getSp500List } from "@/lib/sp500List";
import { getFinancialsRatios } from "@/lib/financialsRatios";

export const runtime = "nodejs";
export const maxDuration = 60;

export const SCREENER_HASH_KEY = "screener:fundamentals:v1";
// Outlasts several rotation cycles (see ROTATION_SIZE below) so a symbol
// refreshed early in a cycle is still on file by the time the next cycle
// reaches it again — fundamentals don't need to be fresher than this.
export const SCREENER_FIELD_TTL_S = 10 * 24 * 60 * 60;
// Hobby-tier crons run once a day, so — unlike the heatmap's live-request
// rotation — the whole ~503-symbol universe has to be covered by
// multiple daily firings, not multiple requests within one. ~130/day
// clears comfortably inside the 60s budget (see the pacing below) and
// cycles the full roster in about 4 days.
const ROTATION_SIZE = 130;

export type ScreenerFields = {
  marketCap: number | null;
  peTTM: number | null;
  forwardPE: number | null;
  revenueGrowthYoy: number | null;
  beta: number | null;
  dividendYield: number | null;
  priceReturn52W: number | null;
};

export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "No FINNHUB_API_KEY" }, { status: 500 });

  const list = await getSp500List();
  const symbols = list.map((c) => c.symbol);

  // Same date-bucketed rotation the heatmap uses for its live-request
  // batch, just keyed to a day instead of a 2-minute cycle.
  const dayIndex = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
  const offset = (dayIndex * ROTATION_SIZE) % symbols.length;
  const rotated = [...symbols.slice(offset), ...symbols.slice(0, offset)];
  const todaysBatch = rotated.slice(0, ROTATION_SIZE);

  const fields: Record<string, ScreenerFields> = {};
  const CHUNK = 8;
  const DELAY_MS = 450;
  for (let i = 0; i < todaysBatch.length; i += CHUNK) {
    const chunk = todaysBatch.slice(i, i + CHUNK);
    await Promise.all(chunk.map(async (sym) => {
      // getFinancialsRatios already caches per-symbol for an hour, shared
      // with the Financials panel and peer-percentile — this only pays
      // for a live Finnhub call when nothing else has warmed that symbol
      // recently either.
      const r = await getFinancialsRatios(sym, apiKey);
      if (!r) return;
      fields[sym] = {
        marketCap: r.marketCapitalization,
        peTTM: r.peTTM,
        forwardPE: r.forwardPE,
        revenueGrowthYoy: r.revenueGrowthYoy,
        beta: r.beta,
        dividendYield: r.dividendYield,
        priceReturn52W: r.priceReturn52W,
      };
    }));
    if (i + CHUNK < todaysBatch.length) await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  await kvHashSetFields(SCREENER_HASH_KEY, fields, SCREENER_FIELD_TTL_S);

  return NextResponse.json({ updated: Object.keys(fields).length, batchSize: todaysBatch.length, universeSize: symbols.length });
}
