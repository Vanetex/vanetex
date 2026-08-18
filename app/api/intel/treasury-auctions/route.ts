import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const TREASURY_URL =
  "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/od/auctions_query" +
  "?sort=-auction_date&page%5Bsize%5D=25" +
  "&fields=security_type,security_term,cusip,auction_date,issue_date,announcemt_date,offering_amt,high_yield,bid_to_cover_ratio";
const CACHE_TTL_S = 6 * 60 * 60;

type Auction = {
  securityType: string;
  securityTerm: string;
  cusip: string;
  auctionDate: string;
  issueDate: string;
  announcementDate: string | null;
  offeringAmount: number | null;
  highYield: number | null;
  bidToCoverRatio: number | null;
};

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("intel:treasury-auctions", clientIdFromRequest(request), 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const cacheKey = "treasury-auctions";
  const cached = await kvGet<{ auctions: Auction[] }>(cacheKey);
  if (cached) return NextResponse.json(cached, { headers: { "Cache-Control": "public, max-age=21600" } });

  try {
    const res = await fetch(TREASURY_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`Treasury fiscaldata API returned ${res.status}`);
    const data = (await res.json()) as { data?: Array<Record<string, string>> };
    const num = (v: string | undefined) => (v == null || v === "null" || v === "" ? null : Number(v));

    const auctions: Auction[] = (data.data ?? [])
      .filter((r) => r.auction_date && r.auction_date !== "null")
      .map((r) => ({
        securityType: r.security_type,
        securityTerm: r.security_term,
        cusip: r.cusip,
        auctionDate: r.auction_date,
        issueDate: r.issue_date,
        announcementDate: r.announcemt_date && r.announcemt_date !== "null" ? r.announcemt_date : null,
        offeringAmount: num(r.offering_amt),
        highYield: num(r.high_yield),
        bidToCoverRatio: num(r.bid_to_cover_ratio),
      }))
      .sort((a, b) => (a.auctionDate < b.auctionDate ? -1 : 1));

    const body = { auctions };
    await kvSet(cacheKey, body, CACHE_TTL_S);
    return NextResponse.json(body, { headers: { "Cache-Control": "public, max-age=21600" } });
  } catch (err) {
    console.error("[intel/treasury-auctions] error:", err);
    return NextResponse.json({ error: "Failed to fetch Treasury auction data" }, { status: 502 });
  }
}
