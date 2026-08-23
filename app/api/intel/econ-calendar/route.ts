import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const FRED_BASE = "https://api.stlouisfed.org/fred";
const FOMC_URL = "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm";
const CACHE_KEY = "intel:econ-calendar:v6"; // v6: GDP event renamed to "GDP (QoQ, SAAR)" to disambiguate from YoY
const CACHE_TTL_S = 24 * 60 * 60; // these dates are scheduled far in advance
const WINDOW_DAYS = 90;
const MAX_EVENTS = 40;
// Initial jobless claims report weekly — left uncapped it'd fill the list
// with ~13 dates in a 90-day window and crowd out everything else, so
// only the soonest few are kept.
const JOBLESS_CLAIMS_RELEASE_ID = 180;
const MAX_JOBLESS_CLAIMS_DATES = 4;

type EconEvent = {
  day: string;
  date: string; // "30" or, across a month boundary, "30 Jul" for clarity
  sym: string;
  event: string;
  time: string;
  imp: "HIGH";
  tone: string;
  toneBorder: string;
  relevance: 1 | 2 | 3; // 3 = core market-mover, 1 = supplementary — same scale as the Macro Dashboard's series tiers
};

// Internal-only shape carrying the full ISO date, so events can be
// sorted correctly across month boundaries before display formatting
// collapses them down to day-of-month (which alone can't distinguish
// e.g. July 30 from August 30 over a 90-day window).
type DatedEvent = EconEvent & { isoDate: string };

const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// FRED release IDs — every one confirmed live against fred.stlouisfed.org's
// own releases catalog (not guessed from memory) before adding here.
// Relevance mirrors the Macro Dashboard's 1-3 scale: 3 = core market-mover,
// 2 = regularly market-moving but a notch below, 1 = supplementary.
// ISM Manufacturing/Services PMI and Conference Board Consumer Confidence
// have no free release on FRED — confirmed absent from FRED's full
// 331-release catalog (ISM: FRED stopped redistributing it in 2016 over
// licensing terms) — so neither is included; no free keyless replacement
// carries the actual headline number for either.
const FRED_RELEASES: { id: number; name: string; time: string; relevance: 1 | 2 | 3 }[] = [
  { id: 10, name: "CPI Report", time: "08:30", relevance: 3 },
  { id: 50, name: "Jobs Report (NFP)", time: "08:30", relevance: 3 },
  { id: 54, name: "PCE Report", time: "08:30", relevance: 3 },
  // BEA's GDP release publishes several series on the same date — the
  // headline figure every outlet reports ("GDP grew at a 2.8% pace") is
  // specifically the quarter-over-quarter change at a seasonally adjusted
  // annual rate, confirmed against FRED's own release page (fred.stlouisfed.org/release?rid=53),
  // not the quarter-over-year-ago change also published alongside it.
  { id: 53, name: "GDP (QoQ, SAAR)", time: "08:30", relevance: 3 },
  { id: 46, name: "PPI Report", time: "08:30", relevance: 2 },
  { id: 9, name: "Retail Sales", time: "08:30", relevance: 2 },
  { id: 91, name: "Consumer Sentiment (UMich)", time: "10:00", relevance: 2 },
  { id: 13, name: "Industrial Production", time: "09:15", relevance: 2 },
  { id: 192, name: "JOLTS (Job Openings)", time: "10:00", relevance: 2 },
  { id: 27, name: "Housing Starts", time: "08:30", relevance: 1 },
  { id: 291, name: "Existing Home Sales", time: "10:00", relevance: 1 },
  { id: 95, name: "Durable Goods Orders", time: "08:30", relevance: 1 },
  { id: JOBLESS_CLAIMS_RELEASE_ID, name: "Jobless Claims", time: "08:30", relevance: 1 },
];

function toEconEvent(dateStr: string, name: string, time: string, relevance: 1 | 2 | 3): DatedEvent {
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
    relevance,
  };
}

async function fetchFredDates(releaseId: number, apiKey: string, from: string, to: string): Promise<string[]> {
  const url = `${FRED_BASE}/release/dates?release_id=${releaseId}&api_key=${apiKey}&file_type=json`
    + `&realtime_start=${from}&realtime_end=${to}&include_release_dates_with_no_data=true&sort_order=asc&limit=10`;
  const res = await fetch(url);
  // Throw rather than return [] — a genuine FRED failure (rate limit,
  // outage) must not look like "no releases scheduled," which would
  // otherwise get cached as the real calendar for a full 24h below.
  if (!res.ok) throw new Error(`FRED release ${releaseId} fetch failed: ${res.status}`);
  const data = (await res.json()) as { release_dates?: { date: string }[] };
  return (data.release_dates ?? []).map((r) => r.date);
}

// FOMC has no API — the Fed's own calendar page uses a stable, simple
// class structure (fomc-meeting__month / fomc-meeting__date) grouped
// under a "<year> FOMC Meetings" heading per year.
async function fetchFomcDates(from: Date, to: Date): Promise<string[]> {
  const res = await fetch(FOMC_URL, { headers: { "User-Agent": "Mozilla/5.0" }, cache: "no-store" });
  // Same reasoning as fetchFredDates above — a fetch failure must not be
  // indistinguishable from "the Fed genuinely scheduled no meetings."
  if (!res.ok) throw new Error(`FOMC calendar page fetch failed: ${res.status}`);
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

async function buildCalendar(fredApiKey: string): Promise<DatedEvent[]> {
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
    // Jobless Claims is weekly — capped to the soonest few dates so it
    // doesn't dominate a 90-day window the way a monthly/quarterly
    // release wouldn't.
    const dates = r.id === JOBLESS_CLAIMS_RELEASE_ID
      ? fredResults[i].slice(0, MAX_JOBLESS_CLAIMS_DATES)
      : fredResults[i];
    for (const date of dates) events.push(toEconEvent(date, r.name, r.time, r.relevance));
  });
  for (const date of fomcDates) {
    if (date >= fmt(from) && date <= fmt(to)) {
      events.push(toEconEvent(date, "FOMC Rate Decision", "14:00", 3));
    }
  }

  // Relevance first (3 = core down to 1 = supplementary), date as the
  // tie-breaker within a tier — the calendar still reads chronologically
  // inside each relevance band, but leads with what actually moves markets.
  events.sort((a, b) => (b.relevance - a.relevance) || a.isoDate.localeCompare(b.isoDate));
  // isoDate is kept in the response (not stripped) — the header's "next
  // event" countdown needs a real date to compute days-until from,
  // and reparsing the display-formatted "25 Aug" back into a date
  // client-side would be needless fragility (year inference, etc.)
  // for a field the backend already has correctly in hand.
  return events.slice(0, MAX_EVENTS);
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

  // The server-side KV cache below (24h) is what actually protects FRED/
  // FOMC from repeat hits — this HTTP-level Cache-Control just bounds how
  // long a stale response can linger in front of it (browser/CDN) after a
  // code change reshapes what this route returns. A 24h value here meant
  // shipping a real content change (like the relevance-sort/expanded-
  // release-set update this was set to) stayed invisible to every visitor,
  // new tabs included, for up to a full day — confirmed live: a brand
  // new browser tab still got the pre-deploy 14-event response until this
  // was shortened, even though the route itself was already computing the
  // correct 40-event one under cache:'no-store'.
  const HTTP_CACHE_HEADER = { "Cache-Control": "public, max-age=300" };

  const cached = await kvGet<{ events: DatedEvent[] }>(CACHE_KEY);
  if (cached) {
    return NextResponse.json(cached, { headers: HTTP_CACHE_HEADER });
  }

  try {
    const events = await buildCalendar(fredApiKey);
    const body = { events };
    await kvSet(CACHE_KEY, body, CACHE_TTL_S);
    return NextResponse.json(body, { headers: HTTP_CACHE_HEADER });
  } catch (err) {
    console.error("[intel/econ-calendar] error:", err);
    return NextResponse.json({ error: "Failed to fetch economic calendar" }, { status: 500 });
  }
}
