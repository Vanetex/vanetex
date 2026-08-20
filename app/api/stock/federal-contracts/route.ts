import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const USASPENDING_URL = "https://api.usaspending.gov/api/v2/search/spending_by_award/";
const CACHE_TTL_S = 24 * 60 * 60; // contract awards don't change intraday
const MAX_RESULTS = 10;
// Contracts only (A/B/C/D = BPA call, purchase order, delivery order, definitive
// contract) — not grants, loans, or direct payments, which use a different code
// set and aren't "who does this company sell to" in the Bloomberg-terminal sense
// this feature is going for.
const CONTRACT_AWARD_TYPE_CODES = ["A", "B", "C", "D"];

type UsaSpendingResult = {
  "Award ID": string;
  "Recipient Name": string;
  "Award Amount": number | null;
  "Start Date": string | null;
  "End Date": string | null;
  "Awarding Agency": string | null;
  "Awarding Sub Agency": string | null;
  Description: string | null;
  generated_internal_id?: string;
};

type Contract = {
  awardId: string;
  recipientName: string;
  amount: number | null;
  startDate: string | null;
  endDate: string | null;
  agency: string | null;
  subAgency: string | null;
  description: string | null;
};

type Body = { contracts: Contract[]; queriedName: string };

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("stock:federal-contracts", clientIdFromRequest(request), 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const name = request.nextUrl.searchParams.get("name")?.trim();
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const cacheKey = `federal-contracts:${name.toLowerCase()}`;
  const cached = await kvGet<Body>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { "Cache-Control": "public, max-age=86400" } });
  }

  try {
    const res = await fetch(USASPENDING_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filters: {
          recipient_search_text: [name],
          award_type_codes: CONTRACT_AWARD_TYPE_CODES,
          // USASpending's full history only goes back to 2000-10-01, and the
          // API itself caps custom time_period searches at 2007-10-01 — this
          // is deliberately wide (not "recent contracts only") since a single
          // large multi-year award is exactly the kind of real signal this
          // feature exists to surface.
          time_period: [{ start_date: "2007-10-01", end_date: "2026-12-31" }],
        },
        fields: [
          "Award ID", "Recipient Name", "Award Amount", "Start Date", "End Date",
          "Awarding Agency", "Awarding Sub Agency", "Description",
        ],
        sort: "Award Amount",
        order: "desc",
        limit: MAX_RESULTS,
        page: 1,
      }),
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`USASpending returned ${res.status}`);
    const data = (await res.json()) as { results?: UsaSpendingResult[] };

    // Some older (pre-~2010) awards carry a raw legacy FPDS record dump in
    // the Description field instead of an actual description — e.g.
    // "200204!008532!1700!AF600 !NAVAL AIR SYSTEMS COMMAND..." — a bare
    // pipe/bang-delimited internal encoding, not human-readable text. This
    // is a real USASpending data-quality artifact, not something worth
    // fabricating a real description to paper over; showing it as-is would
    // just look broken, so it's treated the same as no description at all.
    const looksLikeRawFpdsDump = (d: string) => (d.match(/!/g) || []).length > 5;

    const contracts: Contract[] = (data.results ?? [])
      .map((r) => ({
        awardId: r["Award ID"],
        recipientName: r["Recipient Name"],
        amount: r["Award Amount"],
        startDate: r["Start Date"],
        endDate: r["End Date"],
        agency: r["Awarding Agency"],
        subAgency: r["Awarding Sub Agency"],
        description: (r["Description"] && !looksLikeRawFpdsDump(r["Description"])) ? r["Description"] : null,
      }))
      // Re-sort client-side rather than trusting the API's own sort param —
      // seen it come back unsorted for some queries during testing, and
      // this is cheap insurance either way.
      .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));

    const body: Body = { contracts, queriedName: name };
    await kvSet(cacheKey, body, CACHE_TTL_S);
    return NextResponse.json(body, { headers: { "Cache-Control": "public, max-age=86400" } });
  } catch (err) {
    console.error("[stock/federal-contracts] error:", err);
    return NextResponse.json({ error: "Failed to fetch federal contract data" }, { status: 502 });
  }
}
