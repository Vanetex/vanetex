import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const CACHE_TTL_S = 6 * 60 * 60;
const LOOKAHEAD_DAYS = 45;
const LOOKBACK_DAYS = 14; // include very recent IPOs too, not just future ones

type FinnhubIpo = {
  date: string;
  exchange: string | null;
  name: string;
  numberOfShares: number | null;
  price: string | null;
  status: string; // expected, priced, withdrawn, filed
  symbol: string | null;
  totalSharesValue: number | null;
};

function fmtDate(d: Date) { return d.toISOString().slice(0, 10); }

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("intel:ipo-calendar", clientIdFromRequest(request), 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "FINNHUB_API_KEY is not configured" }, { status: 500 });

  const cacheKey = "ipo-calendar";
  const cached = await kvGet<{ ipos: unknown[] }>(cacheKey);
  if (cached) return NextResponse.json(cached, { headers: { "Cache-Control": "public, max-age=21600" } });

  const from = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const to = new Date(Date.now() + LOOKAHEAD_DAYS * 24 * 60 * 60 * 1000);

  try {
    const res = await fetch(`${FINNHUB_BASE}/calendar/ipo?from=${fmtDate(from)}&to=${fmtDate(to)}&token=${apiKey}`);
    if (!res.ok) throw new Error(`Finnhub IPO calendar returned ${res.status}`);
    const data = (await res.json()) as { ipoCalendar?: FinnhubIpo[] };

    const ipos = (data.ipoCalendar ?? [])
      .filter((r) => r.date && r.name)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((r) => ({
        date: r.date,
        name: r.name,
        symbol: r.symbol || null,
        exchange: r.exchange || null,
        priceRange: r.price || null,
        numberOfShares: r.numberOfShares ?? null,
        totalSharesValue: r.totalSharesValue ?? null,
        status: r.status,
      }));

    const body = { ipos };
    await kvSet(cacheKey, body, CACHE_TTL_S);
    return NextResponse.json(body, { headers: { "Cache-Control": "public, max-age=21600" } });
  } catch (err) {
    console.error("[intel/ipo-calendar] error:", err);
    return NextResponse.json({ error: "Failed to fetch IPO calendar" }, { status: 502 });
  }
}
