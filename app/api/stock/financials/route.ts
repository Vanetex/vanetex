import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { getFinancialsRatios } from "@/lib/financialsRatios";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("stock:financials", clientIdFromRequest(request), 40, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const symbol = request.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FINNHUB_API_KEY is not configured" }, { status: 500 });
  }

  const sym = symbol.toUpperCase();
  const body = await getFinancialsRatios(sym, apiKey);
  if (!body) {
    return NextResponse.json({ error: "Failed to fetch financials" }, { status: 500 });
  }

  return NextResponse.json(body, {
    headers: { "Cache-Control": "private, max-age=3600, stale-while-revalidate=300" },
  });
}
