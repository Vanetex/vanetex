import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const FRED_BASE = "https://api.stlouisfed.org/fred";
const FOMC_URL = "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm";
const CACHE_KEY = "intel:econ-calendar:v1";
const CACHE_TTL_S = 24 * 60 * 60; // these dates are scheduled far in advance
const WINDOW_DAYS = 90;

type EconEvent = {
  day: string;
  date: string; // "30" or, across a month boundary, "30 Jul" for clarity
  sym: string;
  event: string;
  time: string;
  imp: "HIGH";
  tone: string;
  toneBorder: string;
};

// Internal-only shape carrying the full ISO date, so events can be
// sorted correctly across month boundaries before display formatting
// collapses them down to day-of-month (which alone can't distinguish
// e.g. July 30 from August 30 over a 90-day window).
type DatedEvent = EconEvent & { isoDate: string };

const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// FRED release IDs: 10 = Consumer Price Index, 50 = Employment Situation
// (contains Nonfarm Payrolls), 54 = Personal Income and Outlays (PCE).
const FRED_RELEASES: { id: number; name: string; time: string }[] = [
  { id: 10, name: "CPI Report", time: "08:30" },
  { id: 50, name: "Jobs Report (NFP)", time: "08:30" },
  { id: 54, name: "PCE Report", time: "08:30" },
];

function toEconEvent(dateStr: string, name: string, time: string): DatedEvent {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return {
    day: DAY_NAMES[d.getUTCDay()],
    date: `${d.getUTCDate()} ${MONTH_ABBR[d.getUTCMonth()]}`,
    sym: "MACRO",
    event: name,
    time,
    imp: "HIGH",
    tone: "var(--warn)",
    toneBorder: "rgba(245,165,36,.4)",
    isoDate: dateStr,
  };
}

async function fetchFredDates(releaseId: number, apiKey: string, from: string, to: string): Promise<string[]> {
  const url = `${FRED_BASE}/release/dates?release_id=${releaseId}&api_key=${apiKey}&file_type=json`
    + `&realtime_start=${from}&realtime_end=${to}&include_release_dates_with_no_data=true&sort_order=asc&limit=10`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = (await res.json()) as { release_dates?: { date: string }[] };
  return (data.release_dates ?? []).map((r) => r.date);
}

// FOMC has no API — the Fed's own calendar page uses a stable, simple
// class structure (fomc-meeting__month / fomc-meeting__date) grouped
// under a "<year> FOMC Meetings" heading per year.
async function fetchFomcDates(from: Date, to: Date): Promise<string[]> {
  const res = await fetch(FOMC_URL, { headers: { "User-Agent": "Mozilla/5.0" }, cache: "no-store" });
  if (!res.ok) return [];
  const html = await res.text();

  const years = new Set([from.getUTCFullYear(), to.getUTCFullYear()]);
  const dates: string[] = [];

  for (const year of years) {
    const startIdx = html.indexOf(`${year} FOMC Meetings`);
    if (startIdx === -1) continue;
    const nextIdx = html.indexOf("FOMC Meetings</a>", startIdx + 10);
    const section = html.slice(startIdx, nextIdx === -1 ? html.length : nextIdx);

    const months = [...section.matchAll(/fomc-meeting__month[^>]*><strong>(\w+)<\/strong>/g)].map((m) => m[1]);
    const dateRanges = [...section.matchAll(/fomc-meeting__date[^>]*>([^<]+)</g)].map((m) => m[1]);

    for (let i = 0; i < Math.min(months.length, dateRanges.length); i++) {
      const lastDay = dateRanges[i].replace("*", "").split("-").pop();
      if (!lastDay) continue;
      const parsed = new Date(`${months[i]} ${lastDay}, ${year} UTC`);
      if (!isNaN(parsed.getTime())) dates.push(parsed.toISOString().slice(0, 10));
    }
  }
  return dates;
}

async function buildCalendar(fredApiKey: string): Promise<EconEvent[]> {
  const from = new Date();
  const to = new Date();
  to.setDate(to.getDate() + WINDOW_DAYS);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const [fredResults, fomcDates] = await Promise.all([
    Promise.all(FRED_RELEASES.map((r) => fetchFredDates(r.id, fredApiKey, fmt(from), fmt(to)))),
    fetchFomcDates(from, to),
  ]);

  const events: DatedEvent[] = [];
  FRED_RELEASES.forEach((r, i) => {
    for (const date of fredResults[i]) events.push(toEconEvent(date, r.name, r.time));
  });
  for (const date of fomcDates) {
    if (date >= fmt(from) && date <= fmt(to)) {
      events.push(toEconEvent(date, "FOMC Rate Decision", "14:00"));
    }
  }

  events.sort((a, b) => a.isoDate.localeCompare(b.isoDate));
  return events.slice(0, 10).map(({ isoDate, ...rest }) => rest);
}

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("intel:econ-calendar", clientIdFromRequest(request), 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const fredApiKey = process.env.FRED_API_KEY;
  if (!fredApiKey) {
    return NextResponse.json({ error: "FRED_API_KEY is not configured" }, { status: 500 });
  }

  const cached = await kvGet<{ events: EconEvent[] }>(CACHE_KEY);
  if (cached) {
    return NextResponse.json(cached, { headers: { "Cache-Control": "public, max-age=86400" } });
  }

  try {
    const events = await buildCalendar(fredApiKey);
    const body = { events };
    await kvSet(CACHE_KEY, body, CACHE_TTL_S);
    return NextResponse.json(body, { headers: { "Cache-Control": "public, max-age=86400" } });
  } catch (err) {
    console.error("[intel/econ-calendar] error:", err);
    return NextResponse.json({ error: "Failed to fetch economic calendar" }, { status: 500 });
  }
}
