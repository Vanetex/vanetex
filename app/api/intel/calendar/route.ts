import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";
import { SECTOR_SEEDS } from "@/lib/heatmapSeeds";

export const runtime = "nodejs";

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const CACHE_KEY = "intel:calendar:v2";
const CACHE_TTL_S = 60 * 60; // earnings dates don't change intraday
const MAX_RESULTS = 8;

// Same curated ~80-company list the sector heatmap uses — reused here
// as a real-world "prominence" proxy so the fallback (when nothing on
// the user's own watchlist reports soon) prefers recognizable large
// caps over whichever obscure ticker happens to report earliest.
const PROMINENT_SYMBOLS = new Set(Object.values(SECTOR_SEEDS).flat().map((s) => s.sym));

type FinnhubEarning = {
  symbol: string;
  date: string; // YYYY-MM-DD
  hour?: string; // "bmo" | "amc" | "dmh"
};

type CalendarEvent = {
  day: string;
  date: string;
  sym: string;
  event: string;
  time: string;
  imp: "EARN";
  tone: string;
  toneBorder: string;
};

const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const HOUR_LABEL: Record<string, string> = {
  bmo: "Before Open",
  amc: "After Close",
  dmh: "During Market Hours",
};

function toEvent(r: FinnhubEarning): CalendarEvent {
  const d = new Date(`${r.date}T00:00:00Z`);
  return {
    day: DAY_NAMES[d.getUTCDay()],
    date: String(d.getUTCDate()),
    sym: r.symbol,
    event: `Earnings — ${HOUR_LABEL[r.hour ?? ""] ?? "Time TBD"}`,
    time: r.hour === "bmo" ? "07:00" : r.hour === "amc" ? "16:05" : "—",
    imp: "EARN",
    tone: "var(--acc2)",
    toneBorder: "rgba(52,211,255,.4)",
  };
}

// The full 2-week earnings pool is cached once, shared across every
// user regardless of their watchlist — filtering to `symbols` happens
// per-request against that cached pool, not via a fresh Finnhub call.
async function getEarningsPool(apiKey: string): Promise<FinnhubEarning[]> {
  const cached = await kvGet<FinnhubEarning[]>(CACHE_KEY);
  if (cached) return cached;

  const from = new Date();
  const to = new Date();
  to.setDate(to.getDate() + 14);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const res = await fetch(`${FINNHUB_BASE}/calendar/earnings?from=${fmt(from)}&to=${fmt(to)}&token=${apiKey}`);
  if (!res.ok) throw new Error(`Finnhub calendar/earnings returned ${res.status}`);

  const data = (await res.json()) as { earningsCalendar?: FinnhubEarning[] };
  const pool = (data.earningsCalendar ?? [])
    .filter((r) => r.symbol && r.date)
    .sort((a, b) => a.date.localeCompare(b.date));

  await kvSet(CACHE_KEY, pool, CACHE_TTL_S);
  return pool;
}

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("intel:calendar", clientIdFromRequest(request), 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FINNHUB_API_KEY is not configured" }, { status: 500 });
  }

  const symbolsParam = request.nextUrl.searchParams.get("symbols");
  const watchlist = symbolsParam
    ? new Set(symbolsParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean))
    : null;

  try {
    const pool = await getEarningsPool(apiKey);

    let rows = watchlist ? pool.filter((r) => watchlist.has(r.symbol.toUpperCase())) : [];
    // Not enough (or no) watchlist matches reporting soon — fall back,
    // preferring recognizable large caps (PROMINENT_SYMBOLS) over
    // whichever obscure ticker happens to report earliest by date.
    if (rows.length < 4) {
      const seen = new Set(rows.map((r) => r.symbol));
      const prominent = pool.filter((r) => PROMINENT_SYMBOLS.has(r.symbol) && !seen.has(r.symbol));
      const rest = pool.filter((r) => !PROMINENT_SYMBOLS.has(r.symbol) && !seen.has(r.symbol));
      for (const r of [...prominent, ...rest]) {
        if (rows.length >= MAX_RESULTS) break;
        if (!seen.has(r.symbol)) { rows.push(r); seen.add(r.symbol); }
      }
      rows.sort((a, b) => a.date.localeCompare(b.date));
    }
    rows = rows.slice(0, MAX_RESULTS);

    const body = { events: rows.map(toEvent) };
    return NextResponse.json(body, { headers: { "Cache-Control": "private, max-age=300" } });
  } catch (err) {
    console.error("[intel/calendar] error:", err);
    return NextResponse.json({ error: "Failed to fetch calendar" }, { status: 500 });
  }
}
