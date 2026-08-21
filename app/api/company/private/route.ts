import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

// SEC requires a real identifying User-Agent (name + contact) on every
// request or it will start blocking traffic as an anonymous bot.
const SEC_USER_AGENT = "Vanetex Investing Platform vanetexinvestingapp@gmail.com";
const EFTS_URL = "https://efts.sec.gov/LATEST/search-index";
const CACHE_TTL_S = 24 * 60 * 60; // Form D history for a company doesn't change intraday
const MAX_FILINGS = 8;
const MAX_ENRICHED = 3; // how many of the top filings get a follow-up fetch for real dollar amounts

type EftsHit = {
  _id: string; // "{accession-with-dashes}:primary_doc.xml"
  _source: {
    ciks: string[];
    display_names: string[];
    file_date: string;
    biz_locations?: string[];
    adsh: string; // accession number, dashed
    form: string;
  };
};

type Filing = {
  filerName: string;
  cik: string;
  fileDate: string;
  location: string | null;
  secUrl: string;
  // True only when the filer's own name closely matches the company
  // searched for — a Form D full-text search surfaces a lot of noise
  // from unrelated SPVs/feeder funds that merely mention the company by
  // name in their own filing (real example found while building this:
  // searching "Anduril Industries" surfaces "Anduril Industries Jun 2022
  // a Series of CGF2021 LLC", a $272K feeder fund — not Anduril's own
  // multi-hundred-million-dollar round). Never label a non-primary
  // filer's numbers as the searched company's own.
  isLikelyPrimaryIssuer: boolean;
  // Only populated for the first MAX_ENRICHED filings (one extra fetch
  // each) — real structured numbers from the filing's own primary_doc.xml.
  totalAmountSold: number | null;
  dateOfFirstSale: string | null;
  industryGroup: string | null;
};

function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.,]/g, "")
    .replace(/\b(inc|incorporated|corp|corporation|llc|ltd|limited|co)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Feeder funds/SPVs administer themselves under names like "X, a Series
// of Y LLC" or "X Fund I" — these patterns catch the common ones so they
// don't get mislabeled as the company's own filing even when the name
// otherwise looks close.
const SPV_PATTERNS = /\b(a series of|spv|fund [iv]+\b|feeder|syndicate|special purpose)\b/i;

async function fetchFormDSearch(name: string): Promise<EftsHit[]> {
  const url = `${EFTS_URL}?q=${encodeURIComponent(`"${name}"`)}&forms=D`;
  const res = await fetch(url, { headers: { "User-Agent": SEC_USER_AGENT }, cache: "no-store" });
  if (!res.ok) throw new Error(`SEC EDGAR full-text search failed: ${res.status}`);
  const data = (await res.json()) as { hits?: { hits?: EftsHit[] } };
  return data.hits?.hits ?? [];
}

async function fetchOfferingDetail(
  cik: string,
  adsh: string,
): Promise<{ totalAmountSold: number | null; dateOfFirstSale: string | null; industryGroup: string | null }> {
  const cikNum = cik.replace(/^0+/, "");
  const adshNoDash = adsh.replace(/-/g, "");
  const url = `https://www.sec.gov/Archives/edgar/data/${cikNum}/${adshNoDash}/primary_doc.xml`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": SEC_USER_AGENT }, cache: "no-store" });
    if (!res.ok) return { totalAmountSold: null, dateOfFirstSale: null, industryGroup: null };
    const xml = await res.text();
    const amountMatch = xml.match(/<totalAmountSold>([\d.]+)<\/totalAmountSold>/);
    const dateMatch = xml.match(/<dateOfFirstSale>\s*<value>([\d-]+)<\/value>/);
    const industryMatch = xml.match(/<industryGroupType>([^<]+)<\/industryGroupType>/);
    return {
      totalAmountSold: amountMatch ? parseFloat(amountMatch[1]) : null,
      dateOfFirstSale: dateMatch ? dateMatch[1] : null,
      industryGroup: industryMatch ? industryMatch[1] : null,
    };
  } catch {
    return { totalAmountSold: null, dateOfFirstSale: null, industryGroup: null };
  }
}

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("company:private", clientIdFromRequest(request), 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const name = request.nextUrl.searchParams.get("name")?.trim();
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const cacheKey = `company-private:${name.toLowerCase()}`;
  const cached = await kvGet<{ filings: Filing[] }>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { "Cache-Control": "public, max-age=86400" } });
  }

  try {
    const hits = await fetchFormDSearch(name);
    const normalizedQuery = normalizeForMatch(name);

    const base = hits.slice(0, MAX_FILINGS).map((h) => {
      const filerName = h._source.display_names?.[0] ?? "Unknown filer";
      const cik = h._source.ciks?.[0] ?? "";
      const adsh = h._source.adsh;
      const cikNum = cik.replace(/^0+/, "");
      const adshNoDash = adsh.replace(/-/g, "");
      const normalizedFiler = normalizeForMatch(filerName);
      const isLikelyPrimaryIssuer =
        !SPV_PATTERNS.test(filerName) &&
        (normalizedFiler === normalizedQuery || normalizedFiler.startsWith(normalizedQuery + " ") || normalizedQuery.startsWith(normalizedFiler));
      return {
        filerName,
        cik,
        fileDate: h._source.file_date,
        location: h._source.biz_locations?.[0] ?? null,
        secUrl: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cikNum}&type=D&dateb=&owner=include&count=40`,
        isLikelyPrimaryIssuer,
        totalAmountSold: null as number | null,
        dateOfFirstSale: null as string | null,
        industryGroup: null as string | null,
        _cikNum: cikNum,
        _adshNoDash: adshNoDash,
      };
    });

    // Enrich the top few with real numbers from their own filing — capped
    // since each one is a separate fetch to SEC's Archives host.
    const toEnrich = base.slice(0, MAX_ENRICHED);
    const enriched = await Promise.all(toEnrich.map((f) => fetchOfferingDetail(f.cik, f._adshNoDash)));
    toEnrich.forEach((f, i) => {
      f.totalAmountSold = enriched[i].totalAmountSold;
      f.dateOfFirstSale = enriched[i].dateOfFirstSale;
      f.industryGroup = enriched[i].industryGroup;
    });

    const filings: Filing[] = base.map(({ _cikNum, _adshNoDash, ...rest }) => rest);
    const body = { filings };
    if (filings.length) await kvSet(cacheKey, body, CACHE_TTL_S);
    return NextResponse.json(body, { headers: { "Cache-Control": "public, max-age=86400" } });
  } catch (err) {
    console.error("[company/private] error:", err);
    return NextResponse.json({ error: "Failed to fetch SEC Form D filings" }, { status: 502 });
  }
}
