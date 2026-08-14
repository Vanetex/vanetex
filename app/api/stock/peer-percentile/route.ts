import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";
import { getFinancialsRatios, type FinancialsRatios } from "@/lib/financialsRatios";

export const runtime = "nodejs";
export const maxDuration = 30;

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const RESULT_CACHE_TTL_S = 60 * 60; // 1 hour, matches the underlying ratio cache
const PROFILE_CACHE_TTL_S = 7 * 24 * 60 * 60; // industry classification is stable

// The same 93-ticker, 7-sector universe used (and disclosed) throughout the
// Financials-page-v2 proposal's Phase 2.5 validation — real, large-cap,
// still-listed companies, not a hand-picked or hindsight-selected set.
// Kept as-is here rather than the app's separate sector-heatmap taxonomy:
// this is its own disclosed peer set for this one feature, same as how
// CFRA or Seeking Alpha each define their own coverage universe.
const PEER_UNIVERSE: Record<string, string> = {
  AAPL:"Tech",MSFT:"Tech",ORCL:"Tech",IBM:"Tech",INTC:"Tech",CSCO:"Tech",QCOM:"Tech",TXN:"Tech",ADBE:"Tech",CRM:"Tech",
  AMAT:"Tech",LRCX:"Tech",KLAC:"Tech",ADI:"Tech",MU:"Tech",NTAP:"Tech",WDC:"Tech",GLW:"Tech",
  KO:"Consumer",PEP:"Consumer",MCD:"Consumer",SBUX:"Consumer",NKE:"Consumer",HD:"Consumer",LOW:"Consumer",TGT:"Consumer",WMT:"Consumer",PG:"Consumer",COST:"Consumer",
  CL:"Consumer",KMB:"Consumer",GIS:"Consumer",K:"Consumer",CLX:"Consumer",HSY:"Consumer",MO:"Consumer",DIS:"Consumer",CMCSA:"Consumer",VZ:"Consumer",
  JNJ:"Healthcare",PFE:"Healthcare",MRK:"Healthcare",ABT:"Healthcare",UNH:"Healthcare",CVS:"Healthcare",
  BMY:"Healthcare",LLY:"Healthcare",GILD:"Healthcare",AMGN:"Healthcare",MDT:"Healthcare",BDX:"Healthcare",SYK:"Healthcare",BSX:"Healthcare",
  JPM:"Financials",BAC:"Financials",WFC:"Financials",GS:"Financials",AXP:"Financials",
  MS:"Financials",C:"Financials",USB:"Financials",PNC:"Financials",COF:"Financials",BK:"Financials",MET:"Financials",
  BA:"Industrials",CAT:"Industrials",GE:"Industrials",HON:"Industrials",MMM:"Industrials",UPS:"Industrials",
  LMT:"Industrials",NOC:"Industrials",GD:"Industrials",DE:"Industrials",EMR:"Industrials",ITW:"Industrials",FDX:"Industrials",NSC:"Industrials",
  XOM:"Energy",CVX:"Energy",COP:"Energy",SLB:"Energy",OXY:"Energy",HAL:"Energy",
  DUK:"Utilities",SO:"Utilities",D:"Utilities",NEE:"Utilities",AEP:"Utilities",
  APD:"Materials",ECL:"Materials",NEM:"Materials",FCX:"Materials",DD:"Materials",
};

// Real Finnhub `finnhubIndustry` strings bucketed into the 7 sectors above,
// used only for tickers outside PEER_UNIVERSE — never guessed, and if
// nothing matches the ticker is reported as unclassified rather than
// forced into a bucket it doesn't belong in.
const SECTOR_RULES: [string, RegExp][] = [
  ["Tech", /software|semiconductor|hardware|technology|electronic|internet|computer/i],
  ["Healthcare", /health|pharma|biotech|medical|drug/i],
  ["Financials", /bank|insur|financ|capital markets|asset management|credit/i],
  ["Energy", /oil|gas|energy|petroleum|drilling/i],
  ["Utilities", /utilit|electric power|power generation|water utility/i],
  ["Materials", /material|mining|metal|chemical|steel|paper|packaging/i],
  ["Industrials", /industrial|aerospace|defense|machinery|transportation|airline|railroad|construction|engineering/i],
  ["Consumer", /retail|consumer|apparel|restaurant|beverage|auto|e-commerce|household|leisure|media|telecom/i],
];

function classifySector(industry: string | null): string | null {
  if (!industry) return null;
  for (const [key, re] of SECTOR_RULES) if (re.test(industry)) return key;
  return null;
}

async function fetchIndustry(sym: string, apiKey: string): Promise<string | null> {
  const cacheKey = `peer-percentile:profile:${sym}`;
  const cached = await kvGet<{ industry: string | null }>(cacheKey);
  if (cached) return cached.industry;
  try {
    const res = await fetch(`${FINNHUB_BASE}/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${apiKey}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { finnhubIndustry?: string };
    const industry = data.finnhubIndustry ?? null;
    await kvSet(cacheKey, { industry }, PROFILE_CACHE_TTL_S);
    return industry;
  } catch {
    return null;
  }
}

// Same percentile-rank convention used throughout the Phase 2.5 validation:
// sort worst-to-best, position in that order (0-100) is the percentile.
function percentileOf(target: number | null, all: (number | null)[], higherIsBetter: boolean): number | null {
  if (target == null) return null;
  const valid = all.filter((v): v is number => v != null);
  if (valid.length < 2) return null;
  const sorted = [...valid].sort((a, b) => (higherIsBetter ? a - b : b - a));
  // Average rank across ties, matching how a real tie should read (50th
  // percentile among a 3-way tie, not an arbitrary first/last match).
  let sum = 0, count = 0;
  sorted.forEach((v, i) => { if (v === target) { sum += i; count++; } });
  if (count === 0) return null;
  const avgIdx = sum / count;
  return (avgIdx / (sorted.length - 1)) * 100;
}

type Pillar = { percentile: number | null; rawValue: number | null; peerCount: number };

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("stock:peer-percentile", clientIdFromRequest(request), 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const symbol = request.nextUrl.searchParams.get("symbol");
  if (!symbol) return NextResponse.json({ error: "symbol is required" }, { status: 400 });

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "FINNHUB_API_KEY is not configured" }, { status: 500 });

  const sym = symbol.toUpperCase();
  const cacheKey = `peer-percentile:result:${sym}`;
  const cached = await kvGet<Record<string, unknown>>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { "Cache-Control": "private, max-age=3600, stale-while-revalidate=300" } });
  }

  try {
    let sector: string | null = PEER_UNIVERSE[sym] ?? null;
    if (!sector) {
      const industry = await fetchIndustry(sym, apiKey);
      sector = classifySector(industry);
    }
    if (!sector) {
      const body = { symbol: sym, sector: null, applicable: false, reason: "Couldn't classify this ticker into a sector with real data — no peer comparison available." };
      await kvSet(cacheKey, body, RESULT_CACHE_TTL_S);
      return NextResponse.json(body);
    }

    const peers = Object.keys(PEER_UNIVERSE).filter((t) => PEER_UNIVERSE[t] === sector && t !== sym);
    const allSymbols = [sym, ...peers];
    const allRatios = await Promise.all(allSymbols.map((s) => getFinancialsRatios(s, apiKey)));
    const bySym = new Map<string, FinancialsRatios>();
    allSymbols.forEach((s, i) => { const r = allRatios[i]; if (r) bySym.set(s, r); });

    const focus = bySym.get(sym) ?? null;
    if (!focus) {
      return NextResponse.json({ error: "Failed to fetch financials for this symbol" }, { status: 500 });
    }
    const peerRatios = peers.map((p) => bySym.get(p)).filter((r): r is FinancialsRatios => !!r);

    const buildPillar = (
      getValue: (r: FinancialsRatios) => number | null,
      higherIsBetter: boolean
    ): Pillar => {
      const focusVal = getValue(focus);
      const peerVals = peerRatios.map(getValue);
      const percentile = percentileOf(focusVal, [focusVal, ...peerVals], higherIsBetter);
      const peerCount = peerVals.filter((v) => v != null).length;
      return { percentile, rawValue: focusVal, peerCount };
    };

    const body = {
      symbol: sym,
      sector,
      applicable: true,
      peerCount: peerRatios.length,
      pillars: {
        // Lower P/E (trailing, falling back to forward for unprofitable
        // trailing-loss companies) reads as "cheaper" — higherIsBetter=false.
        value: buildPillar((r) => r.peTTM ?? r.forwardPE, false),
        quality: buildPillar((r) => r.roe, true),
        growth: buildPillar((r) => r.revenueGrowthYoy, true),
        finHealth: buildPillar((r) => r.debtToEquity, false),
        momentum: buildPillar((r) => r.priceReturn52W, true),
      },
    };

    await kvSet(cacheKey, body, RESULT_CACHE_TTL_S);
    return NextResponse.json(body, { headers: { "Cache-Control": "private, max-age=3600, stale-while-revalidate=300" } });
  } catch (err) {
    console.error("[stock/peer-percentile] error:", err);
    return NextResponse.json({ error: "Failed to compute peer percentile" }, { status: 500 });
  }
}
