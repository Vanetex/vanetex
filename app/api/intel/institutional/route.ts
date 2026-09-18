import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 30;

const SEC_UA = "Vanetex Research admin@vanetex.com";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes, matches the Form 4 feed's own TTL
const FEED_COUNT = 40;
// Fewer than Form 4's 8 — each 13F-HR requires downloading and scanning a
// full holdings table (hundreds to thousands of positions for a large
// manager), a heavier fetch per filing than Form 4's single small
// transaction XML.
const MAX_FILINGS = 6;

type InstitutionalFiling = {
  time: string;
  institution: string;
  // 13F's information table reports each holding by company name + CUSIP,
  // never a ticker — there's no free CUSIP-to-ticker mapping, so this
  // shows the real issuer name as text, not a clickable symbol. Real data,
  // just not tied back into this app's per-ticker navigation.
  topHolding: string | null;
  topHoldingValue: string | null;
  holdingsCount: number;
  filingUrl: string;
};

let cache: { body: { filings: InstitutionalFiling[] }; ts: number } | null = null;

function relTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

// Issuer and institution names come straight out of XML/Atom source that
// properly escapes "&" et al. — confirmed live (a real filing's holding
// literally came back as "STATE STR SPDR S&amp;P 500 ETF T"), so this
// isn't optional cleanup.
function decodeXmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function fmtMoney(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

// Only pulls the single largest position by reported value — a full per-
// holding breakdown (which this file also has) isn't useful without a
// ticker to key it to, but "this manager's single biggest position is
// worth $X" is real signal on its own, and cheap to compute in one pass
// over the table (no history kept, so this stays fast regardless of how
// many hundreds of rows a large manager's table has).
async function fetchInfoTable(cik: string, accNo: string, accNoNoDashes: string, filedAt: string, institution: string): Promise<InstitutionalFiling | null> {
  try {
    const indexUrl = `https://www.sec.gov/Archives/edgar/data/${Number(cik)}/${accNoNoDashes}/${accNo}-index.htm`;
    const indexRes = await fetch(indexUrl, { headers: { "User-Agent": SEC_UA } });
    if (!indexRes.ok) return null;
    const indexHtml = await indexRes.text();

    // The cover page (primary_doc.xml) and the XSL viewer variants both
    // show up in the index too — the real holdings table is whichever
    // .xml link isn't one of those.
    const xmlLinks = indexHtml.match(/href="([^"]+\.xml)"/g) ?? [];
    const infoTableHref = xmlLinks
      .map((m) => m.match(/href="([^"]+)"/)![1])
      .find((href) => !href.includes("/xsl") && !href.toLowerCase().includes("primary_doc"));
    if (!infoTableHref) return null;

    const xmlUrl = infoTableHref.startsWith("http") ? infoTableHref : `https://www.sec.gov${infoTableHref}`;
    const res = await fetch(xmlUrl, { headers: { "User-Agent": SEC_UA } });
    if (!res.ok) return null;
    const xml = await res.text();

    const rows = xml.match(/<(?:\w+:)?infoTable>[\s\S]*?<\/(?:\w+:)?infoTable>/g) ?? [];
    if (!rows.length) return null;

    let top: { name: string; value: number } | null = null;
    for (const row of rows) {
      const nameM = row.match(/<(?:\w+:)?nameOfIssuer>([\s\S]*?)<\/(?:\w+:)?nameOfIssuer>/);
      // 13F's <value> is reported in thousands of dollars, per the SEC's
      // own form instructions — multiplied out below before formatting.
      const valM = row.match(/<(?:\w+:)?value>([\s\S]*?)<\/(?:\w+:)?value>/);
      if (!nameM || !valM) continue;
      const value = parseFloat(valM[1]) || 0;
      if (!top || value > top.value) top = { name: decodeXmlEntities(nameM[1].trim()), value };
    }

    return {
      time: relTime(filedAt),
      institution: decodeXmlEntities(institution),
      topHolding: top ? top.name : null,
      topHoldingValue: top ? fmtMoney(top.value * 1000) : null,
      holdingsCount: rows.length,
      filingUrl: indexUrl,
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("intel:institutional", clientIdFromRequest(request), 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    return NextResponse.json(cache.body, {
      headers: { "Cache-Control": "public, max-age=600, stale-while-revalidate=60" },
    });
  }

  try {
    const feedUrl = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=13F-HR&company=&dateb=&owner=include&count=${FEED_COUNT}&output=atom`;
    const feedRes = await fetch(feedUrl, { headers: { "User-Agent": SEC_UA } });
    if (!feedRes.ok) throw new Error(`SEC feed request failed: ${feedRes.status}`);
    const feed = await feedRes.text();

    const entries = feed.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];

    type FilerInfo = { cik: string; institution: string; accNo: string; updated: string };
    const filers: FilerInfo[] = [];
    const seen = new Set<string>();

    for (const entry of entries) {
      // 13F-HR's own feed title carries only one role, "(Filer)" — the
      // institution itself, unlike Form 4's Issuer/Reporting split (that
      // form is about a specific company's stock; this one is about the
      // filer's whole portfolio).
      const titleMatch = entry.match(/<title>13F-HR\s*-\s*(.+?)\s*\((\d+)\)\s*\(Filer\)<\/title>/);
      if (!titleMatch) continue;
      const [, institution, cik] = titleMatch;

      const idMatch = entry.match(/accession-number=([\d-]+)/);
      if (!idMatch) continue;
      const accNo = idMatch[1];
      if (seen.has(accNo)) continue;
      seen.add(accNo);

      const updatedMatch = entry.match(/<updated>(.*?)<\/updated>/);
      filers.push({ cik, institution, accNo, updated: updatedMatch ? updatedMatch[1] : new Date().toISOString() });

      if (filers.length >= MAX_FILINGS) break;
    }

    const results = await Promise.all(
      filers.map((f) => fetchInfoTable(f.cik, f.accNo, f.accNo.replace(/-/g, ""), f.updated, f.institution)),
    );

    const filings = results.filter((f): f is InstitutionalFiling => f !== null);

    const body = { filings };
    cache = { body, ts: Date.now() };

    return NextResponse.json(body, {
      headers: { "Cache-Control": "public, max-age=600, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.error("[intel/institutional] error:", err);
    if (cache) {
      return NextResponse.json(cache.body, {
        headers: { "Cache-Control": "public, max-age=600, stale-while-revalidate=60" },
      });
    }
    return NextResponse.json({ error: "Failed to fetch institutional filings" }, { status: 500 });
  }
}
