import { NextRequest, NextResponse } from "next/server";
import zlib from "node:zlib";
// pdf-parse's own index.js (not imported here) does a debug self-test at
// require time — `if (!module.parent) fs.readFileSync('./test/data/...')`
// — which throws ENOENT the moment it's bundled anywhere its "am I the
// entry module" check comes out true (confirmed live: it crashed this
// route on every request, before GET() even ran, since Turbopack's
// module wrapping trips that same check). Importing the inner lib file
// skips that wrapper entirely and is the standard workaround.
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet, kvHashGetAll, kvHashSetFields } from "@/lib/kvCache";

export const runtime = "nodejs";
export const maxDuration = 60;

// Real, free, official congressional stock-trading disclosures — the House
// Clerk's Periodic Transaction Reports (PTRs), required by the STOCK Act.
// There's no JSON API: the Clerk publishes one ZIP per year containing a
// filing-level XML index (name/type/date/DocID, confirmed live — no trade
// detail) plus, per DocID, a real text-layer PDF of the actual filing
// (confirmed live against a real filing: tickers are printed in parens
// right next to each asset name, so unlike Form 4/13F there's no
// CUSIP-to-ticker gap to work around here). ZIP extraction uses Node's
// built-in zlib (DEFLATE, DEFLATE64 not needed — the Clerk's archives use
// plain method-8 deflate) rather than a new dependency; PDF text
// extraction genuinely needs one (pdf-parse@1.1.1 — the last version
// before it grew a native-canvas dependency it doesn't need for text-only
// extraction).
//
// It is a federal offense (5 U.S.C. app. § 105(c)) to use these reports
// for a commercial purpose, with a carve-out for "news and communications
// media for dissemination to the general public" — confirmed on the
// Clerk's own search page. Vanetex is free and non-commercial.
const HOUSE_BASE = "https://disclosures-clerk.house.gov/public_disc";
const INDEX_CACHE_TTL_S = 6 * 60 * 60; // new PTRs post continuously through the year
const PDF_CACHE_TTL_S = 30 * 24 * 60 * 60; // a filed PTR's content never changes
const PDF_HASH_KEY = "congress:ptr-pdfs:v1";
const MAX_FILINGS = 15;

type IndexEntry = { last: string; first: string; filingType: string; stateDst: string; filingDate: string; docId: string };

type Transaction = { asset: string; ticker: string; assetKind: "ST" | "OT"; txType: string; date: string; amountLow: number; amountHigh: number };

type Filing = { member: string; stateDst: string; filingDate: string; docId: string; pdfUrl: string; transactions: Transaction[] };

function findEOCD(buf: Buffer): number {
  const sig = 0x06054b50;
  const start = Math.max(0, buf.length - 22 - 65536);
  for (let i = buf.length - 22; i >= start; i--) {
    if (buf.readUInt32LE(i) === sig) return i;
  }
  throw new Error("ZIP EOCD record not found");
}

function readCentralDirectory(buf: Buffer, cdOffset: number, count: number) {
  const entries: { name: string; method: number; compSize: number; localHeaderOffset: number }[] = [];
  let p = cdOffset;
  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error(`Bad ZIP central-directory signature at offset ${p}`);
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localHeaderOffset = buf.readUInt32LE(p + 42);
    const name = buf.toString("utf8", p + 46, p + 46 + nameLen);
    entries.push({ name, method, compSize, localHeaderOffset });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

function extractZipEntry(buf: Buffer, entry: { method: number; compSize: number; localHeaderOffset: number }): Buffer {
  const p = entry.localHeaderOffset;
  if (buf.readUInt32LE(p) !== 0x04034b50) throw new Error("Bad ZIP local-file-header signature");
  const nameLen = buf.readUInt16LE(p + 26);
  const extraLen = buf.readUInt16LE(p + 28);
  const dataStart = p + 30 + nameLen + extraLen;
  const compressed = buf.subarray(dataStart, dataStart + entry.compSize);
  if (entry.method === 0) return Buffer.from(compressed);
  if (entry.method === 8) return zlib.inflateRawSync(compressed);
  throw new Error(`Unsupported ZIP compression method ${entry.method}`);
}

function parseIndexXml(xml: string): IndexEntry[] {
  const out: IndexEntry[] = [];
  const memberRe = /<Member>([\s\S]*?)<\/Member>/g;
  const field = (block: string, tag: string) => {
    const m = block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
    return m ? m[1].trim() : "";
  };
  let m: RegExpExecArray | null;
  while ((m = memberRe.exec(xml))) {
    const block = m[1];
    const filingType = field(block, "FilingType");
    if (filingType !== "P") continue; // "P" = Periodic Transaction Report; skip annual/candidate/other filing types
    out.push({
      last: field(block, "Last"),
      first: field(block, "First"),
      filingType,
      stateDst: field(block, "StateDst"),
      filingDate: field(block, "FilingDate"),
      docId: field(block, "DocID"),
    });
  }
  return out;
}

async function getPtrIndex(year: number): Promise<IndexEntry[]> {
  const cacheKey = `congress:index:v1:${year}`;
  const cached = await kvGet<IndexEntry[]>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${HOUSE_BASE}/financial-pdfs/${year}FD.zip`, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`House Clerk ${year}FD.zip returned ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());

  const eocd = findEOCD(buf);
  const entryCount = buf.readUInt16LE(eocd + 10);
  const cdOffset = buf.readUInt32LE(eocd + 16);
  const zipEntries = readCentralDirectory(buf, cdOffset, entryCount);
  const xmlEntry = zipEntries.find((e) => e.name.endsWith(".xml"));
  if (!xmlEntry) throw new Error("No XML index found inside the House Clerk ZIP");
  const xml = extractZipEntry(buf, xmlEntry).toString("utf8");

  const index = parseIndexXml(xml);
  await kvSet(cacheKey, index, INDEX_CACHE_TTL_S);
  return index;
}

// Real transaction rows follow "<Asset name> (<TICKER>) [ST|OT] <P|S|S
// (partial)|E> <MM/DD/YYYY> <MM/DD/YYYY> $<low> - $<high>" once the PDF's
// text layer is whitespace-normalized — confirmed against real filings.
// Some filers list a fund by a name that already IS its ticker with no
// parens at all (e.g. "Invesco QQQ [OT]") — those rows are skipped rather
// than guessed at, same as any other field this app can't confidently
// parse. The lookbehind window strips bleed-through from the previous
// row's free-text Description paragraph (which repeats boilerplate like
// "37.426 shares sold @ $27.645/share" and would otherwise get glued onto
// the next asset's name).
const TXN_RE = /([A-Za-z0-9&.,/\- ']{1,120}?)\s*\(([A-Z]{1,6}(?:[./][A-Z])?)\)\s*\[(ST|OT)\]\s*(P|S \(partial\)|S|E)\s*(\d{2}\/\d{2}\/\d{4})\s*\d{2}\/\d{2}\/\d{4}\s*\$([\d,]+)\s*-\s*\$([\d,]+)/g;
const DESCRIPTION_MARKERS = ["/share", "shares sold", "shares bought", "shares exchanged"];

// The Owner column ("SP" = spouse, "JT" = joint, "DC" = dependent child;
// blank means self) sits immediately to the left of Asset in the real
// table, glued on with zero separator once the PDF's text layer is
// flattened (confirmed live, no whitespace at all: "DCBrown & Brown,
// Inc."). Stripped only when followed by a lowercase-second-letter word,
// since that's the one shape that can't also be a real company name
// starting the same way — and there are real ones: SPDR funds, JP Morgan,
// BWX Technologies, C.H. Robinson, ITT Inc., STERIS all start with a
// bare multi-capital abbreviation indistinguishable from an owner code by
// text shape alone. Known, accepted trade-off: a handful of spouse/joint/
// dependent-child holdings keep their leading code rather than risk
// mangling a real name — no way to tell the two apart from the text.
const OWNER_CODE_RE = /^(SP|JT|DC)(?=[A-Z][a-z])/;

function parseTransactions(rawText: string): Transaction[] {
  // Every metadata line this app doesn't use (Filing Status, Sub Holding
  // Of, Location, Description) renders with a corrupted small-caps label —
  // pdf-parse's font decoding drops most glyphs to NUL, leaving something
  // like "F\0\0\0\0\0 S\0\0\0\0\0: New" for "FILING STATUS: New" — before
  // its own value. That corruption is actually a reliable anchor: any line
  // matching "<cap><NULs> (<cap><NULs>)*: <text>" is one of these fields,
  // regardless of which one or what filer, so it's stripped whole here
  // rather than chased field-by-field. Skipping this step would otherwise
  // splice a prior row's Sub-Holding-Of value onto the next row's asset
  // name (confirmed live — "Fidelity Roth IRA" bleeding into a ticker
  // match) — a real accuracy bug, not cosmetic.
  const withoutMetadata = rawText.replace(/[A-Z] +(?:\s[A-Z] +)*\s*:[^\n]*\n?/g, "");
  const text = withoutMetadata.replace(/\s+/g, " ");
  const out: Transaction[] = [];
  let m: RegExpExecArray | null;
  TXN_RE.lastIndex = 0;
  while ((m = TXN_RE.exec(text))) {
    let asset = m[1].trim();
    let cut = -1;
    for (const marker of DESCRIPTION_MARKERS) {
      const i = asset.lastIndexOf(marker);
      if (i >= 0) cut = Math.max(cut, i + marker.length);
    }
    if (cut >= 0) asset = asset.slice(cut).trim();
    // A real asset name never starts with a bare number — this catches the
    // high end of a leftover "$1,001 - $15,000" amount (the "$" itself
    // isn't in the capture's character class, but the digits after it are)
    // from a row this parser intentionally skipped, e.g. a bond fund's
    // "[CS]" asset-kind code it doesn't recognize. That skipped row's own
    // amount has no DESCRIPTION_MARKERS text around it to cut on above, so
    // it otherwise bleeds into the next valid row's captured name.
    asset = asset.replace(/^[\d,]+\s+/, "");
    asset = asset.replace(OWNER_CODE_RE, "").trim();
    if (!asset) continue;
    out.push({
      asset,
      ticker: m[2],
      assetKind: m[3] as "ST" | "OT",
      txType: m[4],
      date: m[5],
      amountLow: Number(m[6].replace(/,/g, "")),
      amountHigh: Number(m[7].replace(/,/g, "")),
    });
  }
  return out;
}

async function getFilingTransactions(year: number, docId: string): Promise<Transaction[]> {
  const cached = await kvHashGetAll<Transaction[]>(PDF_HASH_KEY);
  if (cached[docId]) return cached[docId];

  const res = await fetch(`${HOUSE_BASE}/ptr-pdfs/${year}/${docId}.pdf`, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) return [];
  const buf = Buffer.from(await res.arrayBuffer());
  const { text } = await pdfParse(buf);
  const transactions = parseTransactions(text);
  await kvHashSetFields(PDF_HASH_KEY, { [docId]: transactions }, PDF_CACHE_TTL_S);
  return transactions;
}

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("intel:congress-trades", clientIdFromRequest(request), 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  try {
    const year = new Date().getFullYear();
    const index = await getPtrIndex(year);
    const sorted = [...index].sort((a, b) => new Date(b.filingDate).getTime() - new Date(a.filingDate).getTime());
    const recent = sorted.slice(0, MAX_FILINGS);

    const filings: Filing[] = await Promise.all(
      recent.map(async (e) => ({
        member: [e.first, e.last].filter(Boolean).join(" "),
        stateDst: e.stateDst,
        filingDate: e.filingDate,
        docId: e.docId,
        pdfUrl: `${HOUSE_BASE}/ptr-pdfs/${year}/${e.docId}.pdf`,
        transactions: await getFilingTransactions(year, e.docId),
      }))
    );

    return NextResponse.json(
      { filings, source: "House Clerk PTRs (STOCK Act), parsed from the real filed PDFs" },
      { headers: { "Cache-Control": "public, max-age=1800, stale-while-revalidate=900" } }
    );
  } catch (err) {
    console.error("[intel/congress-trades] error:", err);
    return NextResponse.json({ error: "Failed to fetch congressional trading data" }, { status: 500 });
  }
}
