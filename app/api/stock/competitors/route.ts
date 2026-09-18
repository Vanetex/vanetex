import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const FINNHUB_BASE = "https://finnhub.io/api/v1";
// Peer sets change rarely (M&A, spinoffs) — same long-lived TTL as this
// app's other stable-classification caches (peer-percentile's industry tag).
const CACHE_TTL_S = 7 * 24 * 60 * 60;
const MAX_PEERS = 10;

type Body = { symbol: string; peers: string[] };

// Finnhub's free-tier /stock/peers — confirmed live against their own docs
// (finnhub.io/docs/api/company-peers) as unlabeled/free, unlike the
// adjacent "Supply Chain" and "Revenue Breakdown" endpoints, both
// explicitly marked Premium. Same-country, same-GICS-sub-industry peers —
// the narrowest, most relevant grouping (no &grouping=industry param),
// picked over the broader industry-level grouping so this reads as real
// competitors, not a whole sector dump.
export async function GET(request: NextRequest) {
  const rl = checkRateLimit("stock:competitors", clientIdFromRequest(request), 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const symbol = request.nextUrl.searchParams.get("symbol");
  if (!symbol) return NextResponse.json({ error: "symbol is required" }, { status: 400 });

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "FINNHUB_API_KEY is not configured" }, { status: 500 });

  const sym = symbol.toUpperCase();
  const cacheKey = `competitors:${sym}`;
  const cached = await kvGet<Body>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { "Cache-Control": "public, max-age=604800" } });
  }

  try {
    const res = await fetch(`${FINNHUB_BASE}/stock/peers?symbol=${encodeURIComponent(sym)}&token=${apiKey}`);
    if (!res.ok) throw new Error(`Finnhub peers fetch failed: ${res.status}`);
    const data = (await res.json()) as unknown;
    // Finnhub's own response includes the queried symbol itself in the
    // list — filtered out here since "AAPL is a peer of AAPL" isn't real.
    const peers = (Array.isArray(data) ? (data as string[]) : [])
      .filter((p): p is string => typeof p === "string" && p.toUpperCase() !== sym)
      .slice(0, MAX_PEERS);

    const body: Body = { symbol: sym, peers };
    await kvSet(cacheKey, body, CACHE_TTL_S);
    return NextResponse.json(body, { headers: { "Cache-Control": "public, max-age=604800" } });
  } catch (err) {
    console.error("[stock/competitors] error:", err);
    return NextResponse.json({ error: "Failed to fetch competitors" }, { status: 502 });
  }
}
