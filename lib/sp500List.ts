import { kvGet, kvSet } from "@/lib/kvCache";

// Real, maintained S&P 500 constituents — Wikipedia's own "constituents"
// table (confirmed live: Symbol / Security / GICS Sector / GICS Sub-
// Industry / Headquarters / Date added / CIK / Founded columns, one row
// per company). Index composition changes only a handful of times a
// year, so a week-long cache is safe.
const WIKI_URL = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies";
const CACHE_KEY = "sp500:constituents:v1";
const CACHE_TTL_S = 7 * 24 * 60 * 60;

export type Sp500Company = { symbol: string; name: string; sector: string };

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, "").trim();
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export async function getSp500List(): Promise<Sp500Company[]> {
  const cached = await kvGet<Sp500Company[]>(CACHE_KEY);
  if (cached) return cached;

  const res = await fetch(WIKI_URL, { headers: { "User-Agent": "Vanetex Research admin@vanetex.com" } });
  if (!res.ok) throw new Error(`Wikipedia S&P 500 fetch failed: ${res.status}`);
  const html = await res.text();

  const tableMatch = html.match(/id="constituents"[\s\S]*?<\/table>/);
  if (!tableMatch) throw new Error("Could not find the constituents table");

  const rows = tableMatch[0].match(/<tr[^>]*>[\s\S]*?<\/tr>/g) ?? [];
  const companies: Sp500Company[] = [];

  for (const row of rows) {
    const cells = row.match(/<td[^>]*>[\s\S]*?<\/td>/g);
    if (!cells || cells.length < 3) continue; // header row has <th>, not <td>
    const symbol = decodeEntities(stripTags(cells[0])).toUpperCase();
    const name = decodeEntities(stripTags(cells[1]));
    const sector = decodeEntities(stripTags(cells[2]));
    // Wikipedia tickers occasionally use a dot for share classes
    // (BRK.B, BF.B) — Finnhub/Yahoo both use a dash for the same symbols,
    // confirmed live for BRK.B -> BRK-B elsewhere in this app already.
    if (!symbol || !name) continue;
    companies.push({ symbol: symbol.replace(/\./g, "-"), name, sector });
  }

  if (companies.length < 400) {
    // A real S&P 500 scrape is always ~500 rows — anything drastically
    // short means the page structure changed, not that the index shrank.
    throw new Error(`Only parsed ${companies.length} constituents — page structure may have changed`);
  }

  await kvSet(CACHE_KEY, companies, CACHE_TTL_S);
  return companies;
}
