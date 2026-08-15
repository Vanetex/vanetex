import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { getFinancialsRatios, type FinancialsRatios } from "@/lib/financialsRatios";

export const runtime = "nodejs";

const MAX_BATCH_SYMBOLS = 40;

export async function GET(request: NextRequest) {
  const symbolsParam = request.nextUrl.searchParams.get("symbols");
  const symbolParam = request.nextUrl.searchParams.get("symbol");

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FINNHUB_API_KEY is not configured" }, { status: 500 });
  }

  // Batch path — one request for many symbols instead of one per symbol
  // (intelligence.html fetches this for the whole watchlist on load).
  // getFinancialsRatios() is already cache-first per symbol, so this just
  // fans that out in small chunks rather than duplicating its logic.
  if (symbolsParam) {
    const rl = checkRateLimit("stock:financials:batch", clientIdFromRequest(request), 20, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
    }
    const symbols = [...new Set(symbolsParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean))].slice(0, MAX_BATCH_SYMBOLS);
    if (!symbols.length) return NextResponse.json({ error: "symbols is required" }, { status: 400 });

    const financials: Record<string, FinancialsRatios> = {};
    const CHUNK = 5;
    for (let i = 0; i < symbols.length; i += CHUNK) {
      const chunk = symbols.slice(i, i + CHUNK);
      const results = await Promise.all(chunk.map((s) => getFinancialsRatios(s, apiKey)));
      chunk.forEach((s, j) => { const r = results[j]; if (r) financials[s] = r; });
      if (i + CHUNK < symbols.length) await new Promise((r) => setTimeout(r, 150));
    }
    const missingSymbols = symbols.filter((s) => !(s in financials));

    return NextResponse.json({ financials, missingSymbols }, {
      headers: { "Cache-Control": "private, max-age=3600, stale-while-revalidate=300" },
    });
  }

  // Single-symbol path — unchanged behavior/response shape.
  const rl = checkRateLimit("stock:financials", clientIdFromRequest(request), 40, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }
  if (!symbolParam) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }
  const sym = symbolParam.toUpperCase();
  const body = await getFinancialsRatios(sym, apiKey);
  if (!body) {
    return NextResponse.json({ error: "Failed to fetch financials" }, { status: 500 });
  }
  return NextResponse.json(body, {
    headers: { "Cache-Control": "private, max-age=3600, stale-while-revalidate=300" },
  });
}
