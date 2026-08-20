import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const CACHE_TTL_S = 6 * 60 * 60; // forward curves shift slowly intraday
const STALE_THRESHOLD_S = 3 * 24 * 60 * 60; // guard against a delisted/expired contract Yahoo hasn't purged yet

// Root symbol + Yahoo exchange suffix for each commodity's dated futures
// contracts — confirmed live against Yahoo's chart endpoint by hand (e.g.
// GCZ26.CMX, CLZ26.NYM, ZCH26.CBT, KCZ26.NYB). Separate from
// INSTRUMENTS[].yahooSymbol on the frontend, which is the continuous
// front-month root (GC=F) and carries no specific expiry.
const CONTRACT_ROOTS: Record<string, { root: string; exch: string }> = {
  GOLD: { root: "GC", exch: "CMX" },
  SILVER: { root: "SI", exch: "CMX" },
  COPPER: { root: "HG", exch: "CMX" },
  PLATINUM: { root: "PL", exch: "NYM" },
  PALLADIUM: { root: "PA", exch: "NYM" },
  OIL: { root: "CL", exch: "NYM" },
  BRENT: { root: "BZ", exch: "NYM" },
  NATGAS: { root: "NG", exch: "NYM" },
  HEATOIL: { root: "HO", exch: "NYM" },
  GASOLINE: { root: "RB", exch: "NYM" },
  CORN: { root: "ZC", exch: "CBT" },
  WHEAT: { root: "ZW", exch: "CBT" },
  SOYBEANS: { root: "ZS", exch: "CBT" },
  COFFEE: { root: "KC", exch: "NYB" },
  COTTON: { root: "CT", exch: "NYB" },
  SUGAR: { root: "SB", exch: "NYB" },
};

const MONTH_CODES = ["F", "G", "H", "J", "K", "M", "N", "Q", "U", "V", "X", "Z"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CANDIDATE_MONTHS = 10;

type CurvePoint = { symbol: string; label: string; monthsOut: number; price: number };

async function fetchContract(symbol: string): Promise<{ price: number; time: number } | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`,
      { headers: { "User-Agent": "Mozilla/5.0" }, cache: "no-store" },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      chart: { result?: Array<{ meta?: { regularMarketPrice?: number; regularMarketTime?: number } }>; error?: unknown };
    };
    if (data.chart.error || !data.chart.result?.[0]) return null;
    const meta = data.chart.result[0].meta;
    const price = meta?.regularMarketPrice;
    const time = meta?.regularMarketTime;
    if (typeof price !== "number" || typeof time !== "number") return null;
    return { price, time };
  } catch {
    return null;
  }
}

async function buildCurve(code: string): Promise<CurvePoint[]> {
  const cacheKey = `futures-curve:${code}:v1`;
  const cached = await kvGet<CurvePoint[]>(cacheKey);
  if (cached && cached.length) return cached;

  const info = CONTRACT_ROOTS[code];
  if (!info) return [];

  const now = new Date();
  const nowS = Date.now() / 1000;
  // Not every candidate month has an actual listed contract (e.g. Sugar
  // skips December) — rather than hardcode each commodity's real-world
  // active-month cycle from memory, probe the next several calendar
  // months against Yahoo directly and keep only what it confirms exists,
  // dropping anything whose last quote is stale (a delisted/expired
  // contract Yahoo hasn't purged from its symbol directory yet).
  const candidates: { symbol: string; label: string; monthsOut: number }[] = [];
  for (let i = 0; i < CANDIDATE_MONTHS; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + i, 1));
    const yy = String(d.getUTCFullYear()).slice(-2);
    const monthCode = MONTH_CODES[d.getUTCMonth()];
    candidates.push({
      symbol: `${info.root}${monthCode}${yy}.${info.exch}`,
      label: `${MONTH_LABELS[d.getUTCMonth()]} '${yy}`,
      monthsOut: i,
    });
  }

  const results = await Promise.all(candidates.map((c) => fetchContract(c.symbol)));
  const points: CurvePoint[] = candidates
    .map((c, i) => ({ ...c, result: results[i] }))
    .filter((c) => c.result && nowS - c.result.time < STALE_THRESHOLD_S)
    .map((c) => ({ symbol: c.symbol, label: c.label, monthsOut: c.monthsOut, price: c.result!.price }));

  if (points.length) await kvSet(cacheKey, points, CACHE_TTL_S);
  return points;
}

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("market:futures-curve", clientIdFromRequest(request), 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const code = request.nextUrl.searchParams.get("code")?.toUpperCase();
  if (!code || !CONTRACT_ROOTS[code]) {
    return NextResponse.json({ error: "Unsupported or missing code" }, { status: 400 });
  }

  try {
    const points = await buildCurve(code);
    if (points.length < 2) return NextResponse.json({ available: false });
    const first = points[0].price;
    const last = points[points.length - 1].price;
    const pctChange = ((last - first) / first) * 100;
    const shape = pctChange > 1 ? "contango" : pctChange < -1 ? "backwardation" : "flat";
    return NextResponse.json(
      { available: true, points, shape, pctChange },
      { headers: { "Cache-Control": "public, max-age=21600" } },
    );
  } catch (err) {
    console.error("[market/futures-curve] error:", err);
    return NextResponse.json({ error: "Failed to fetch futures curve" }, { status: 502 });
  }
}
