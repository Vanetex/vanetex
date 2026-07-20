import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const CACHE_TTL_S = 7 * 24 * 60 * 60; // population/GDP are annual figures

// ISO 3166-1 numeric -> alpha-3, generated from the same world-atlas
// dataset the globe visualization uses (countries-110m.json) crossed
// against the standard ISO-3166 reference table — every numeric id the
// globe can actually click maps to a real country here.
const NUMERIC_TO_ISO3: Record<number, string> = {
  4: "AFG", 8: "ALB", 10: "ATA", 12: "DZA", 24: "AGO", 31: "AZE", 32: "ARG", 36: "AUS", 40: "AUT", 44: "BHS", 50: "BGD", 51: "ARM", 56: "BEL", 64: "BTN", 68: "BOL", 70: "BIH", 72: "BWA", 76: "BRA", 84: "BLZ", 90: "SLB", 96: "BRN", 100: "BGR", 104: "MMR", 108: "BDI", 112: "BLR", 116: "KHM", 120: "CMR", 124: "CAN", 140: "CAF", 144: "LKA", 148: "TCD", 152: "CHL", 156: "CHN", 158: "TWN", 170: "COL", 178: "COG", 180: "COD", 188: "CRI", 191: "HRV", 192: "CUB", 196: "CYP", 203: "CZE", 204: "BEN", 208: "DNK", 214: "DOM", 218: "ECU", 222: "SLV", 226: "GNQ", 231: "ETH", 232: "ERI", 233: "EST", 238: "FLK", 242: "FJI", 246: "FIN", 250: "FRA", 260: "ATF", 262: "DJI", 266: "GAB", 268: "GEO", 270: "GMB", 275: "PSE", 276: "DEU", 288: "GHA", 300: "GRC", 304: "GRL", 320: "GTM", 324: "GIN", 328: "GUY", 332: "HTI", 340: "HND", 348: "HUN", 352: "ISL", 356: "IND", 360: "IDN", 364: "IRN", 368: "IRQ", 372: "IRL", 376: "ISR", 380: "ITA", 384: "CIV", 388: "JAM", 392: "JPN", 398: "KAZ", 400: "JOR", 404: "KEN", 408: "PRK", 410: "KOR", 414: "KWT", 417: "KGZ", 418: "LAO", 422: "LBN", 426: "LSO", 428: "LVA", 430: "LBR", 434: "LBY", 440: "LTU", 442: "LUX", 450: "MDG", 454: "MWI", 458: "MYS", 466: "MLI", 478: "MRT", 484: "MEX", 496: "MNG", 498: "MDA", 499: "MNE", 504: "MAR", 508: "MOZ", 512: "OMN", 516: "NAM", 524: "NPL", 528: "NLD", 540: "NCL", 548: "VUT", 554: "NZL", 558: "NIC", 562: "NER", 566: "NGA", 578: "NOR", 586: "PAK", 591: "PAN", 598: "PNG", 600: "PRY", 604: "PER", 608: "PHL", 616: "POL", 620: "PRT", 624: "GNB", 626: "TLS", 630: "PRI", 634: "QAT", 642: "ROU", 643: "RUS", 646: "RWA", 682: "SAU", 686: "SEN", 688: "SRB", 694: "SLE", 703: "SVK", 704: "VNM", 705: "SVN", 706: "SOM", 710: "ZAF", 716: "ZWE", 724: "ESP", 728: "SSD", 729: "SDN", 732: "ESH", 740: "SUR", 748: "SWZ", 752: "SWE", 756: "CHE", 760: "SYR", 762: "TJK", 764: "THA", 768: "TGO", 780: "TTO", 784: "ARE", 788: "TUN", 792: "TUR", 795: "TKM", 800: "UGA", 804: "UKR", 807: "MKD", 818: "EGY", 826: "GBR", 834: "TZA", 840: "USA", 854: "BFA", 858: "URY", 860: "UZB", 862: "VEN", 887: "YEM", 894: "ZMB",
};

type WBObservation = { date: string; value: number | null };

async function fetchIndicator(iso3: string, indicator: string): Promise<{ value: number; year: string } | null> {
  const res = await fetch(
    `https://api.worldbank.org/v2/country/${iso3}/indicator/${indicator}?format=json&per_page=6`,
  );
  if (!res.ok) return null;
  const text = await res.text();
  // World Bank prefixes responses with a UTF-8 BOM.
  const data = JSON.parse(text.replace(/^﻿/, "")) as [unknown, WBObservation[] | null];
  const rows = data[1];
  if (!rows) return null;
  const latest = rows.find((r) => r.value !== null);
  return latest ? { value: latest.value as number, year: latest.date } : null;
}

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("geo:country-snapshot", clientIdFromRequest(request), 40, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const idParam = request.nextUrl.searchParams.get("id");
  const id = idParam ? parseInt(idParam, 10) : NaN;
  const iso3 = NUMERIC_TO_ISO3[id];
  if (!iso3) {
    return NextResponse.json({ error: "Unknown or unmapped country id" }, { status: 400 });
  }

  const cacheKey = `geo:snapshot:${iso3}`;
  const cached = await kvGet<Record<string, unknown>>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { "Cache-Control": "public, max-age=604800" } });
  }

  try {
    const [pop, gdp, gdpPerCapita] = await Promise.all([
      fetchIndicator(iso3, "SP.POP.TOTL"),
      fetchIndicator(iso3, "NY.GDP.MKTP.CD"),
      fetchIndicator(iso3, "NY.GDP.PCAP.CD"),
    ]);

    const body = {
      iso3,
      population: pop?.value ?? null,
      populationYear: pop?.year ?? null,
      gdp: gdp?.value ?? null,
      gdpYear: gdp?.year ?? null,
      gdpPerCapita: gdpPerCapita?.value ?? null,
      hasData: !!(pop || gdp || gdpPerCapita),
    };

    await kvSet(cacheKey, body, CACHE_TTL_S);
    return NextResponse.json(body, { headers: { "Cache-Control": "public, max-age=604800" } });
  } catch (err) {
    console.error("[geo/country-snapshot] error:", err);
    return NextResponse.json({ error: "Failed to fetch country data" }, { status: 500 });
  }
}
