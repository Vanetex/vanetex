import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

// Same World Bank proxy pattern as intel/world-bank-cpi — no CORS support
// for browser fetches, so this runs server-side. Unlike the CPI fix, every
// indicator here was verified live to return the same 2025 figure for all
// 30 countries, so there's no staggered-year problem to design around.
const WB_BASE = "https://api.worldbank.org/v2";
const CACHE_KEY = "intel:world-bank-gdp";
const CACHE_TTL_S = 24 * 60 * 60;
const COUNTRIES = [
  "US", "CA", "MX", "CL", "DE", "GB", "FR", "IT", "ES", "PT", "GR", "NL",
  "BE", "CH", "SE", "NO", "DK", "IE", "AT", "HU", "FI", "PL", "RU", "JP",
  "AU", "NZ", "KR", "IN", "IL", "ZA",
];

const INDICATORS = {
  nominal: "NY.GDP.MKTP.CD",
  perCapita: "NY.GDP.PCAP.CD",
  ppp: "NY.GDP.MKTP.PP.CD",
  pppPerCapita: "NY.GDP.PCAP.PP.CD",
  population: "SP.POP.TOTL",
  growth: "NY.GDP.MKTP.KD.ZG",
} as const;

type WBObservation = { country: { id: string; value: string }; date: string; value: number | null };
type YearValue = { year: string; value: number };
type CountryResult = {
  nominal: YearValue | null;
  perCapita: YearValue | null;
  ppp: YearValue | null;
  pppPerCapita: YearValue | null;
  population: YearValue | null;
  growthLatest: YearValue | null;
  growthPrior: YearValue | null;
  growthSeries: YearValue[];
};
type Body = { countries: Record<string, CountryResult> };

async function fetchIndicator(code: string, mrv: number): Promise<Record<string, YearValue[]>> {
  const url = `${WB_BASE}/country/${COUNTRIES.join(";")}/indicator/${code}?format=json&per_page=100&mrv=${mrv}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`World Bank API failed for ${code}: ${res.status}`);
  const data = (await res.json()) as [unknown, WBObservation[] | null];
  const rows = data[1] ?? [];
  const byCountry: Record<string, YearValue[]> = {};
  for (const row of rows) {
    if (row.value == null) continue;
    (byCountry[row.country.id] ??= []).push({ year: row.date, value: row.value });
  }
  for (const code2 of Object.keys(byCountry)) {
    byCountry[code2].sort((a, b) => Number(b.year) - Number(a.year));
  }
  return byCountry;
}

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("intel:world-bank-gdp", clientIdFromRequest(request), 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const cached = await kvGet<Body>(CACHE_KEY);
  if (cached) {
    return NextResponse.json(cached, { headers: { "Cache-Control": "public, max-age=86400" } });
  }

  try {
    // Six indicators, each one request covering all 30 countries — World
    // Bank has no multi-indicator batch endpoint, so this is the minimum
    // number of upstream calls. Growth uses mrv=25 to power the trend
    // chart; the rest are point-in-time levels, mrv=1 is enough.
    const [nominal, perCapita, ppp, pppPerCapita, population, growth] = await Promise.all([
      fetchIndicator(INDICATORS.nominal, 1),
      fetchIndicator(INDICATORS.perCapita, 1),
      fetchIndicator(INDICATORS.ppp, 1),
      fetchIndicator(INDICATORS.pppPerCapita, 1),
      fetchIndicator(INDICATORS.population, 1),
      fetchIndicator(INDICATORS.growth, 25),
    ]);

    const countries: Record<string, CountryResult> = {};
    for (const code of COUNTRIES) {
      const growthYears = (growth[code] ?? []).slice().sort((a, b) => Number(b.year) - Number(a.year));
      countries[code] = {
        nominal: nominal[code]?.[0] ?? null,
        perCapita: perCapita[code]?.[0] ?? null,
        ppp: ppp[code]?.[0] ?? null,
        pppPerCapita: pppPerCapita[code]?.[0] ?? null,
        population: population[code]?.[0] ?? null,
        growthLatest: growthYears[0] ?? null,
        growthPrior: growthYears[1] ?? null,
        growthSeries: growthYears.slice().sort((a, b) => Number(a.year) - Number(b.year)),
      };
    }

    const body: Body = { countries };
    await kvSet(CACHE_KEY, body, CACHE_TTL_S);
    return NextResponse.json(body, { headers: { "Cache-Control": "public, max-age=86400" } });
  } catch (err) {
    console.error("[intel/world-bank-gdp] error:", err);
    return NextResponse.json({ error: "Failed to fetch World Bank GDP data" }, { status: 502 });
  }
}
