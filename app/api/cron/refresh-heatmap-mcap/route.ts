import { NextRequest, NextResponse } from "next/server";
import { kvSet } from "@/lib/kvCache";
import { SECTOR_SEEDS, MCAP_CACHE_KEY } from "@/lib/heatmapSeeds";

export const runtime = "nodejs";
export const maxDuration = 60;

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const MCAP_CACHE_TTL_S = 26 * 60 * 60; // just over a day, so it survives until the next run

// Runs once daily, well outside any user request, so it can afford to
// be slow and gentle — real market cap doesn't need to be fresher
// than a day, and this is the only place that ever calls profile2
// for the heatmap roster.
export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "No FINNHUB_API_KEY" }, { status: 500 });

  const symbols = Object.values(SECTOR_SEEDS).flat().map((s) => s.sym);
  const mcaps: Record<string, number> = {};

  const CHUNK = 5;
  const DELAY_MS = 700;
  for (let i = 0; i < symbols.length; i += CHUNK) {
    const chunk = symbols.slice(i, i + CHUNK);
    await Promise.all(chunk.map(async (sym) => {
      try {
        const r = await fetch(`${FINNHUB_BASE}/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${apiKey}`);
        if (!r.ok) return;
        const p = (await r.json()) as { marketCapitalization?: number };
        if (p.marketCapitalization) mcaps[sym] = p.marketCapitalization;
      } catch { /* skip this symbol */ }
    }));
    if (i + CHUNK < symbols.length) await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  await kvSet(MCAP_CACHE_KEY, mcaps, MCAP_CACHE_TTL_S);
  return NextResponse.json({ updated: Object.keys(mcaps).length, total: symbols.length });
}
