import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";

export const runtime = "nodejs";

const SEC_UA = "Vanetex Research admin@vanetex.com";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const FEED_COUNT = 40;
const MAX_FILINGS = 8;

type Filing = {
  time: string;
  sym: string;
  who: string;
  role: string;
  act: "BUY" | "SELL" | "OTHER";
  shares: string;
  value: string;
};

let cache: { body: { filings: Filing[] }; ts: number } | null = null;

function relTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function abbrevName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name;
  const last = parts[parts.length - 1];
  return `${parts[0][0]}. ${last}`;
}

function fmtShares(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function fmtMoney(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function tagValue(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return m ? m[1].trim() : "";
}

function nestedValue(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}>[\\s\\S]*?<value>([\\s\\S]*?)<\\/value>[\\s\\S]*?<\\/${tag}>`));
  return m ? m[1].trim() : "";
}

async function fetchForm4(issuerCik: string, accNo: string, accNoNoDashes: string, filedAt: string): Promise<Filing | null> {
  try {
    const indexUrl = `https://www.sec.gov/Archives/edgar/data/${Number(issuerCik)}/${accNoNoDashes}/${accNo}-index.htm`;
    const indexRes = await fetch(indexUrl, { headers: { "User-Agent": SEC_UA } });
    if (!indexRes.ok) return null;
    const indexHtml = await indexRes.text();

    const xmlLinks = indexHtml.match(/href="([^"]+\.xml)"/g) ?? [];
    const directXml = xmlLinks
      .map((m) => m.match(/href="([^"]+)"/)![1])
      .find((href) => !href.includes("/xsl"));
    if (!directXml) return null;

    const xmlUrl = directXml.startsWith("http") ? directXml : `https://www.sec.gov${directXml}`;
    const res = await fetch(xmlUrl, { headers: { "User-Agent": SEC_UA } });
    if (!res.ok) return null;
    const xml = await res.text();

    const sym = tagValue(xml, "issuerTradingSymbol").toUpperCase();
    if (!sym) return null;

    const owner = tagValue(xml, "rptOwnerName");

    const relBlock = xml.match(/<reportingOwnerRelationship>[\s\S]*?<\/reportingOwnerRelationship>/);
    let role = "Insider";
    if (relBlock) {
      const officerTitle = tagValue(relBlock[0], "officerTitle");
      if (officerTitle) role = officerTitle;
      else if (/<isDirector>\s*(1|true)/.test(relBlock[0])) role = "Director";
      else if (/<isTenPercentOwner>\s*(1|true)/.test(relBlock[0])) role = "10% Owner";
      else if (/<isOfficer>\s*(1|true)/.test(relBlock[0])) role = "Officer";
    }

    const txBlock = xml.match(/<nonDerivativeTransaction>[\s\S]*?<\/nonDerivativeTransaction>/);
    if (!txBlock) return null;

    const code = tagValue(txBlock[0], "transactionCode");
    const acqDisp = nestedValue(txBlock[0], "transactionAcquiredDisposedCode");
    const sharesStr = nestedValue(txBlock[0], "transactionShares");
    const priceStr = nestedValue(txBlock[0], "transactionPricePerShare");

    const shares = parseFloat(sharesStr) || 0;
    const price = parseFloat(priceStr) || 0;
    if (!shares) return null;

    let act: Filing["act"] = "OTHER";
    if (code === "P") act = "BUY";
    else if (code === "S") act = "SELL";
    else if (acqDisp === "A") act = "BUY";
    else if (acqDisp === "D") act = "SELL";

    const time = filedAt ? relTime(filedAt) : "";

    return {
      time,
      sym,
      who: owner ? abbrevName(owner) : "Unknown",
      role,
      act,
      shares: fmtShares(shares),
      value: fmtMoney(shares * price),
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("intel:filings", clientIdFromRequest(request), 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    return NextResponse.json(cache.body, {
      headers: { "Cache-Control": "public, max-age=600, stale-while-revalidate=60" },
    });
  }

  try {
    const feedUrl = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=4&company=&dateb=&owner=include&count=${FEED_COUNT}&output=atom`;
    const feedRes = await fetch(feedUrl, { headers: { "User-Agent": SEC_UA } });
    if (!feedRes.ok) throw new Error(`SEC feed request failed: ${feedRes.status}`);
    const feed = await feedRes.text();

    const entries = feed.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];

    type IssuerInfo = { cik: string; accNo: string; updated: string };
    const issuers: IssuerInfo[] = [];
    const seen = new Set<string>();

    for (const entry of entries) {
      const titleMatch = entry.match(/<title>4 - (.+?) \((\d+)\) \((Issuer|Reporting)\)<\/title>/);
      if (!titleMatch) continue;
      const [, , cik, kind] = titleMatch;
      if (kind !== "Issuer") continue;

      const idMatch = entry.match(/accession-number=([\d-]+)/);
      if (!idMatch) continue;
      const accNo = idMatch[1];
      if (seen.has(accNo)) continue;
      seen.add(accNo);

      const updatedMatch = entry.match(/<updated>(.*?)<\/updated>/);
      issuers.push({ cik, accNo, updated: updatedMatch ? updatedMatch[1] : new Date().toISOString() });

      if (issuers.length >= MAX_FILINGS) break;
    }

    const results = await Promise.all(
      issuers.map((i) => fetchForm4(i.cik, i.accNo, i.accNo.replace(/-/g, ""), i.updated)),
    );

    const filings = results.filter((f): f is Filing => f !== null);

    const body = { filings };
    cache = { body, ts: Date.now() };

    return NextResponse.json(body, {
      headers: { "Cache-Control": "public, max-age=600, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.error("[intel/filings] error:", err);
    if (cache) {
      return NextResponse.json(cache.body, {
        headers: { "Cache-Control": "public, max-age=600, stale-while-revalidate=60" },
      });
    }
    return NextResponse.json({ error: "Failed to fetch filings" }, { status: 500 });
  }
}
