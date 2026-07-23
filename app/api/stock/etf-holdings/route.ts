import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

const CACHE_TTL_S = 12 * 60 * 60; // holdings files update once per business day
const MAX_HOLDINGS = 15;

type Holding = { name: string; ticker: string; weight: number; sector: string | null };
type Body = { available: boolean; asOf?: string | null; holdings?: Holding[]; totalHoldings?: number };

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("stock:etf-holdings", clientIdFromRequest(request), 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const symbol = request.nextUrl.searchParams.get("symbol");
  if (!symbol) return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  const sym = symbol.toUpperCase();

  const cacheKey = `etf-holdings:${sym}`;
  const cached = await kvGet<Body>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { "Cache-Control": "public, max-age=43200" } });
  }

  try {
    // State Street/SPDR is the one issuer whose daily holdings file is
    // fetchable with a plain request — no login, no session cookie, no JS
    // click-through gate. iShares, Vanguard, Invesco, and VanEck were all
    // checked and gate theirs behind exactly that, which a server-side
    // fetch can't get past reliably. So this only ever resolves real data
    // for SPDR-family ETFs (SPY, the sector SPDRs, etc.) — anything else
    // (a non-SPDR fund, or a non-fund ticker entirely) correctly reports
    // unavailable rather than guessing or silently failing.
    const url = `https://www.ssga.com/us/en/intermediary/etfs/library-content/products/fund-data/etfs/us/holdings-daily-us-en-${sym.toLowerCase()}.xlsx`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const contentType = res.headers.get("content-type") || "";

    if (!res.ok || !contentType.includes("spreadsheet")) {
      const body: Body = { available: false };
      await kvSet(cacheKey, body, CACHE_TTL_S);
      return NextResponse.json(body);
    }

    const buffer = await res.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "buffer" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

    // Locate the header row by content, not a fixed row number — SPDR's
    // preamble (fund name / ticker / "as of" date) isn't the same number
    // of rows across every fund's file.
    let asOf: string | null = null;
    let headerIdx = -1;
    let nameCol = -1, tickerCol = -1, weightCol = -1, sectorCol = -1;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row || !row.length) continue;
      const first = String(row[0] ?? "");
      if (first.startsWith("As of")) asOf = first.replace("As of", "").trim();
      const hasName = row.some((c) => String(c ?? "").trim() === "Name");
      const hasWeight = row.some((c) => String(c ?? "").trim() === "Weight");
      if (hasName && hasWeight) {
        headerIdx = i;
        row.forEach((c, ci) => {
          const label = String(c ?? "").trim();
          if (label === "Name") nameCol = ci;
          else if (label === "Ticker") tickerCol = ci;
          else if (label === "Weight") weightCol = ci;
          else if (label === "Sector") sectorCol = ci;
        });
        break;
      }
    }

    if (headerIdx === -1 || nameCol === -1 || weightCol === -1) {
      const body: Body = { available: false };
      await kvSet(cacheKey, body, CACHE_TTL_S);
      return NextResponse.json(body);
    }

    const holdings: Holding[] = [];
    for (let i = headerIdx + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || !row.length) continue;
      const name = String(row[nameCol] ?? "").trim();
      const rawWeight = row[weightCol];
      const weight = typeof rawWeight === "number" ? rawWeight : parseFloat(String(rawWeight ?? ""));
      if (!name || Number.isNaN(weight)) continue;
      holdings.push({
        name,
        ticker: tickerCol >= 0 ? String(row[tickerCol] ?? "").trim() : "",
        weight,
        sector: sectorCol >= 0 ? String(row[sectorCol] ?? "").trim() || null : null,
      });
    }

    holdings.sort((a, b) => b.weight - a.weight);
    const body: Body = { available: true, asOf, holdings: holdings.slice(0, MAX_HOLDINGS), totalHoldings: holdings.length };
    await kvSet(cacheKey, body, CACHE_TTL_S);
    return NextResponse.json(body, { headers: { "Cache-Control": "public, max-age=43200" } });
  } catch (err) {
    console.error("[stock/etf-holdings] error:", err);
    return NextResponse.json({ available: false });
  }
}
