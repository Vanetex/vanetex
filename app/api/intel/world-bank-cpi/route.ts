import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

// World Bank's REST API has no CORS headers for browser fetches (confirmed
// live — a direct client-side fetch fails), so this proxies it server-side,
// same pattern as every other external data source in this app.
const WB_BASE = "https://api.worldbank.org/v2";
const CACHE_KEY = "intel:world-bank-cpi";
// Annual data, and the World Bank only finalizes a year's figure well
// into the following year — a real update here is a rare event, so this
// can sit far longer than the 6h TTL most other econ routes use.
const CACHE_TTL_S = 24 * 60 * 60;
// Every one of these was verified live against the real API before being
// hardcoded — see the note on YC_INFLATION_COUNTRIES in intelligence.html
// for why this exists (the OECD-sourced monthly series it replaces for
// the headline figure stopped updating for most countries in 2025).
const COUNTRIES = [
  "US", "CA", "MX", "CL", "DE", "GB", "FR", "IT", "ES", "PT", "GR", "NL",
  "BE", "CH", "SE", "NO", "DK", "IE", "AT", "HU", "FI", "PL", "RU", "JP",
  "AU", "NZ", "KR", "IN", "IL", "ZA",
];

type WBObservation = { country: { id: string; value: string }; date: string; value: number | null };
type YearValue = { year: string; value: number };
type CountryResult = { latest: YearValue | null; prior: YearValue | null };
type Body = { countries: Record<string, CountryResult> };

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("intel:world-bank-cpi", clientIdFromRequest(request), 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const cached = await kvGet<Body>(CACHE_KEY);
  if (cached) {
    return NextResponse.json(cached, { headers: { "Cache-Control": "public, max-age=86400" } });
  }

  try {
    // mrv=3 (most recent 3 values) rather than mrnev=1 — need both the
    // latest real year AND the one before it, to show whether inflation
    // is accelerating or decelerating year over year, same as the rest of
    // this app's "change vs prior period" convention.
    const url = `${WB_BASE}/country/${COUNTRIES.join(";")}/indicator/FP.CPI.TOTL.ZG?format=json&per_page=100&mrv=3`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`World Bank API failed: ${res.status}`);

    const data = (await res.json()) as [unknown, WBObservation[] | null];
    const rows = data[1] ?? [];

    const byCountry: Record<string, YearValue[]> = {};
    for (const row of rows) {
      if (row.value == null) continue; // World Bank's own marker for no data that year
      const code = row.country.id;
      (byCountry[code] ??= []).push({ year: row.date, value: row.value });
    }

    const countries: Record<string, CountryResult> = {};
    for (const code of COUNTRIES) {
      const years = (byCountry[code] ?? []).sort((a, b) => Number(b.year) - Number(a.year));
      countries[code] = { latest: years[0] ?? null, prior: years[1] ?? null };
    }

    const body: Body = { countries };
    await kvSet(CACHE_KEY, body, CACHE_TTL_S);
    return NextResponse.json(body, { headers: { "Cache-Control": "public, max-age=86400" } });
  } catch (err) {
    console.error("[intel/world-bank-cpi] error:", err);
    return NextResponse.json({ error: "Failed to fetch World Bank CPI data" }, { status: 502 });
  }
}
