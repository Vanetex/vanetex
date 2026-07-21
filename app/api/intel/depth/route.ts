import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const FINRA_URL = "https://api.finra.org/data/group/otcMarket/name/regShoDaily";
const YAHOO_CHART = "https://query1.finance.yahoo.com/v8/finance/chart";
const CACHE_TTL_S = 15 * 60;
const LOOKBACK_DAYS = 10;
const PROFILE_BUCKETS = 9;

type ShortVol = {
  date: string; // YYYY-MM-DD, most recent FINRA-reported trade date
  shortPct: number; // short volume as % of FINRA off-exchange (TRF) volume
  prevShortPct: number | null;
  totalVolume: number;
};

type ProfileBucket = {
  price: number;
  volume: number;
};

type DepthBody = { shortVol: ShortVol | null; profile: ProfileBucket[] };

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const splitLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === "," && !inQuotes) {
        out.push(cur);
        cur = "";
      } else {
        cur += c;
      }
    }
    out.push(cur);
    return out;
  };

  const header = splitLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = splitLine(line);
    const row: Record<string, string> = {};
    header.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
}

// FINRA's Reg SHO daily file reports one row per symbol per venue
// (NYSE TRF / Nasdaq TRF Carteret / Nasdaq TRF Chicago / ADF) — this is
// off-exchange (TRF-reported) volume only, not full consolidated tape
// volume, so the ratio below is "short % of off-exchange volume," not
// "short % of all volume." Rows across venues for the same date are
// summed before computing the ratio.
async function fetchShortVolume(symbol: string): Promise<ShortVol | null> {
  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const res = await fetch(FINRA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      limit: 200,
      compareFilters: [
        { compareType: "EQUAL", fieldName: "securitiesInformationProcessorSymbolIdentifier", fieldValue: symbol },
        { compareType: "GREATER", fieldName: "tradeReportDate", fieldValue: since },
      ],
    }),
  });
  if (!res.ok) return null;

  const rows = parseCsv(await res.text());
  if (!rows.length) return null;

  const byDate = new Map<string, { short: number; total: number }>();
  for (const r of rows) {
    const d = r.tradeReportDate;
    const cur = byDate.get(d) || { short: 0, total: 0 };
    cur.short += parseFloat(r.shortParQuantity) || 0;
    cur.total += parseFloat(r.totalParQuantity) || 0;
    byDate.set(d, cur);
  }

  const dates = [...byDate.keys()].sort();
  if (!dates.length) return null;

  const latest = dates[dates.length - 1];
  const prevDate = dates.length > 1 ? dates[dates.length - 2] : null;
  const latestRow = byDate.get(latest)!;
  const prevRow = prevDate ? byDate.get(prevDate) : null;

  return {
    date: latest,
    shortPct: latestRow.total ? (latestRow.short / latestRow.total) * 100 : 0,
    prevShortPct: prevRow && prevRow.total ? (prevRow.short / prevRow.total) * 100 : null,
    totalVolume: latestRow.total,
  };
}

// Real volume-at-price for today's session, built from Yahoo's 5-minute
// intraday bars (same source the main chart already uses) — bucket each
// bar's close price into one of PROFILE_BUCKETS bins spanning the day's
// traded range and sum its volume into that bin.
async function fetchVolumeProfile(symbol: string): Promise<ProfileBucket[]> {
  const res = await fetch(`${YAHOO_CHART}/${encodeURIComponent(symbol)}?interval=5m&range=1d`, {
    headers: { "User-Agent": "Mozilla/5.0" },
    cache: "no-store",
  });
  if (!res.ok) return [];

  const data = (await res.json()) as {
    chart: { result?: Array<{ indicators: { quote: Array<{ close: number[]; volume: number[] }> } }> };
  };
  const q = data.chart.result?.[0]?.indicators.quote[0];
  if (!q) return [];

  const points: { price: number; vol: number }[] = [];
  for (let i = 0; i < q.close.length; i++) {
    const price = q.close[i];
    const vol = q.volume[i];
    if (price == null || vol == null) continue;
    points.push({ price, vol });
  }
  if (!points.length) return [];

  const prices = points.map((p) => p.price);
  const lo = Math.min(...prices);
  const hi = Math.max(...prices);
  if (hi <= lo) {
    return [{ price: lo, volume: Math.round(points.reduce((s, p) => s + p.vol, 0)) }];
  }

  const bucketSize = (hi - lo) / PROFILE_BUCKETS;
  const buckets = new Array(PROFILE_BUCKETS).fill(0) as number[];
  for (const p of points) {
    let idx = Math.floor((p.price - lo) / bucketSize);
    if (idx >= PROFILE_BUCKETS) idx = PROFILE_BUCKETS - 1;
    if (idx < 0) idx = 0;
    buckets[idx] += p.vol;
  }

  return buckets.map((volume, i) => ({ price: lo + bucketSize * (i + 0.5), volume: Math.round(volume) }));
}

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("intel:depth", clientIdFromRequest(request), 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const symbolParam = request.nextUrl.searchParams.get("symbol");
  if (!symbolParam) return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  const symbol = symbolParam.trim().toUpperCase();

  const cacheKey = `intel:depth:${symbol}`;
  const cached = await kvGet<DepthBody>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { "Cache-Control": "private, max-age=300" } });
  }

  try {
    const [shortVol, profile] = await Promise.all([
      fetchShortVolume(symbol).catch(() => null),
      fetchVolumeProfile(symbol).catch(() => []),
    ]);
    const body: DepthBody = { shortVol, profile };
    await kvSet(cacheKey, body, CACHE_TTL_S);
    return NextResponse.json(body, { headers: { "Cache-Control": "private, max-age=300" } });
  } catch (err) {
    console.error("[intel/depth] error:", err);
    return NextResponse.json({ error: "Failed to fetch depth data" }, { status: 500 });
  }
}
