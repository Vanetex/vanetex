import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const CACHE_TTL_S = 6 * 60 * 60;
const LOOKBACK_DAYS = 365 * 3; // 3 years of history — enough for a real trend, not the whole company history

type FinnhubDividend = {
  symbol: string;
  date: string; // ex-dividend date
  amount: number | null;
  adjustedAmount: number | null;
  payDate: string | null;
  recordDate: string | null;
  declarationDate: string | null;
  currency: string | null;
};

type FinnhubSplit = {
  symbol: string;
  date: string;
  fromFactor: number | null;
  toFactor: number | null;
};

function fmtDate(d: Date) { return d.toISOString().slice(0, 10); }

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("stock:corporate-actions", clientIdFromRequest(request), 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const symbolParam = request.nextUrl.searchParams.get("symbol");
  if (!symbolParam) return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  const sym = symbolParam.toUpperCase();

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "FINNHUB_API_KEY is not configured" }, { status: 500 });

  const cacheKey = `corporate-actions:${sym}:debug1`;
  const cached = await kvGet<Record<string, unknown>>(cacheKey);
  if (cached) return NextResponse.json(cached, { headers: { "Cache-Control": "private, max-age=21600" } });

  const to = new Date();
  const from = new Date(to.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const fromStr = fmtDate(from), toStr = fmtDate(to);

  try {
    const [divRes, splitRes] = await Promise.all([
      fetch(`${FINNHUB_BASE}/stock/dividend?symbol=${encodeURIComponent(sym)}&from=${fromStr}&to=${toStr}&token=${apiKey}`),
      fetch(`${FINNHUB_BASE}/stock/split?symbol=${encodeURIComponent(sym)}&from=${fromStr}&to=${toStr}&token=${apiKey}`),
    ]);

    const divBodyText = divRes.ok ? await divRes.text() : await divRes.text().catch(() => "");
    const splitBodyText = splitRes.ok ? await splitRes.text() : await splitRes.text().catch(() => "");
    const dividends: FinnhubDividend[] = divRes.ok ? JSON.parse(divBodyText) : [];
    const splits: FinnhubSplit[] = splitRes.ok ? JSON.parse(splitBodyText) : [];
    // TEMP DEBUG — remove before finalizing
    const debug = {
      divStatus: divRes.status,
      splitStatus: splitRes.status,
      divBody: divRes.ok ? null : divBodyText,
      splitBody: splitRes.ok ? null : splitBodyText,
    };

    const body = {
      debug,
      dividends: (dividends ?? [])
        .filter((d) => d.date)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 12)
        .map((d) => ({
          exDate: d.date,
          amount: d.amount ?? null,
          payDate: d.payDate ?? null,
          declarationDate: d.declarationDate ?? null,
          currency: d.currency ?? null,
        })),
      splits: (splits ?? [])
        .filter((s) => s.date)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 8)
        .map((s) => ({
          date: s.date,
          fromFactor: s.fromFactor ?? null,
          toFactor: s.toFactor ?? null,
        })),
    };

    await kvSet(cacheKey, body, CACHE_TTL_S);
    return NextResponse.json(body, { headers: { "Cache-Control": "private, max-age=21600" } });
  } catch (err) {
    console.error("[stock/corporate-actions] error:", err);
    return NextResponse.json({ error: "Failed to fetch dividend/split history" }, { status: 502 });
  }
}
