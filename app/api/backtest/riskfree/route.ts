import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const FRED_BASE = "https://api.stlouisfed.org/fred";
const SERIES_ID = "DGS3MO"; // 3-Month Treasury Constant Maturity Rate, daily, percent
const CACHE_KEY = "backtest:riskfree:v1";
const CACHE_TTL_S = 24 * 60 * 60;

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("backtest:riskfree", clientIdFromRequest(request), 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const cached = await kvGet<{ rate: number }>(CACHE_KEY);
  if (cached) return NextResponse.json(cached, { headers: { "Cache-Control": "public, max-age=86400" } });

  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FRED_API_KEY is not configured" }, { status: 500 });
  }

  try {
    // limit=5 + sort_order=desc so a "." (no data yet for today) doesn't
    // block on the single most recent row — take the first real value.
    const url = `${FRED_BASE}/series/observations?series_id=${SERIES_ID}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=5`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`FRED returned ${res.status}`);

    const data = (await res.json()) as { observations?: { date: string; value: string }[] };
    const obs = (data.observations ?? []).find((o) => o.value !== ".");
    if (!obs) throw new Error("No recent observation available");

    const rate = parseFloat(obs.value) / 100; // FRED reports this as a percent, e.g. "5.23"
    const body = { rate, asOf: obs.date };
    await kvSet(CACHE_KEY, body, CACHE_TTL_S);
    return NextResponse.json(body, { headers: { "Cache-Control": "public, max-age=86400" } });
  } catch (err) {
    console.error("[backtest/riskfree] error:", err);
    return NextResponse.json({ error: "Failed to fetch risk-free rate" }, { status: 500 });
  }
}
