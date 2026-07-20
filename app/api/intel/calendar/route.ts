import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const CACHE_KEY = "intel:calendar:v1";
const CACHE_TTL_S = 60 * 60; // earnings dates don't change intraday

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

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("intel:calendar", clientIdFromRequest(request), 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FINNHUB_API_KEY is not configured" }, { status: 500 });
  }

  const cached = await kvGet<{ events: CalendarEvent[] }>(CACHE_KEY);
  if (cached) {
    return NextResponse.json(cached, { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=600" } });
  }

  try {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 7);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    const res = await fetch(`${FINNHUB_BASE}/calendar/earnings?from=${fmt(from)}&to=${fmt(to)}&token=${apiKey}`);
    if (!res.ok) throw new Error(`Finnhub calendar/earnings returned ${res.status}`);

    const data = (await res.json()) as { earningsCalendar?: FinnhubEarning[] };
    const rows = (data.earningsCalendar ?? [])
      .filter((r) => r.symbol && r.date)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 8);

    const events: CalendarEvent[] = rows.map((r) => {
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
    });

    const body = { events };
    await kvSet(CACHE_KEY, body, CACHE_TTL_S);
    return NextResponse.json(body, { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=600" } });
  } catch (err) {
    console.error("[intel/calendar] error:", err);
    return NextResponse.json({ error: "Failed to fetch calendar" }, { status: 500 });
  }
}
