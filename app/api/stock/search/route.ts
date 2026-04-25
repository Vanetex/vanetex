import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";

export const runtime = "nodejs";

const FINNHUB_BASE = "https://finnhub.io/api/v1";

type FinnhubSearchResult = {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
};

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("stock:search", clientIdFromRequest(request), 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.trim().length < 1) {
    return NextResponse.json({ results: [] });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "FINNHUB_API_KEY is not configured" },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(
      `${FINNHUB_BASE}/search?q=${encodeURIComponent(q)}&token=${apiKey}`,
    );

    if (!res.ok) throw new Error("Finnhub search failed");

    const data = await res.json() as { result: FinnhubSearchResult[] };

    // Filter to US common stocks only and limit to 8 results
    const results = (data.result ?? [])
      .filter(
        (r) =>
          r.type === "Common Stock" &&
          !r.symbol.includes(".") && // exclude non-US exchanges
          r.displaySymbol.length <= 5,
      )
      .slice(0, 8)
      .map((r) => ({
        symbol: r.displaySymbol,
        name: r.description,
      }));

    return NextResponse.json({ results });
  } catch (err) {
    console.error("[stock/search] error:", err);
    return NextResponse.json(
      { error: "Failed to search stocks" },
      { status: 500 },
    );
  }
}
