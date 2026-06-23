import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";

export const runtime = "nodejs";

const FINNHUB_BASE = "https://finnhub.io/api/v1";

// Tickers: 1–5 uppercase letters only. Enforced server-side.
const TICKER_RE = /^[A-Z]{1,5}$/;
const MAX_SHARES = 1_000_000;

// ─── Price cache ──────────────────────────────────────────────────────────────
// Module-level: shared across sequential requests in the same process/lambda
// instance. Cuts Finnhub usage from "once per trade" to "once per 10 s per
// symbol", which keeps the free tier (60 req/min) well within limits.

type CacheEntry = { price: number; name: string; ts: number };
const priceCache = new Map<string, CacheEntry>();
const PRICE_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

async function getCachedQuote(
  ticker: string,
  apiKey: string,
): Promise<{ price: number; name: string } | null> {
  const hit = priceCache.get(ticker);
  if (hit && Date.now() - hit.ts < PRICE_CACHE_TTL_MS) {
    return { price: hit.price, name: hit.name };
  }

  try {
    const [qRes, pRes] = await Promise.all([
      fetch(`${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(ticker)}&token=${apiKey}`),
      fetch(`${FINNHUB_BASE}/stock/profile2?symbol=${encodeURIComponent(ticker)}&token=${apiKey}`),
    ]);

    if (!qRes.ok || !pRes.ok) return null;

    const { c: price } = (await qRes.json()) as { c: number };
    const { name } = (await pRes.json()) as { name?: string };

    if (!price || price <= 0) return null;

    const entry: CacheEntry = { price, name: name ?? ticker, ts: Date.now() };
    priceCache.set(ticker, entry);
    return { price, name: entry.name };
  } catch {
    return null;
  }
}

// ─── Request body ─────────────────────────────────────────────────────────────

type ExecuteBody = {
  ticker: string;
  tradeType: "BUY" | "SELL";
  shares: number;
  // Client-generated UUID per trade click. Stored with the record so a network
  // retry carrying the same key is detected and treated as a no-op.
  idempotencyKey?: string;
};

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const rl = checkRateLimit("trade:execute", clientIdFromRequest(request), 60, 60 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // ── Parse ────────────────────────────────────────────────────────────────────
  let body: ExecuteBody;
  try {
    body = (await request.json()) as ExecuteBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { ticker: rawTicker, tradeType, shares, idempotencyKey } = body;

  // ── Validate inputs ───────────────────────────────────────────────────────────
  const ticker = String(rawTicker ?? "")
    .trim()
    .toUpperCase();

  if (!TICKER_RE.test(ticker)) {
    return NextResponse.json(
      { error: "Invalid ticker symbol. Must be 1–5 letters (e.g. AAPL, MSFT)." },
      { status: 400 },
    );
  }

  if (tradeType !== "BUY" && tradeType !== "SELL") {
    return NextResponse.json({ error: "tradeType must be BUY or SELL" }, { status: 400 });
  }

  // Reject NaN, Infinity, non-numbers, negatives, extreme values, >4 decimals
  if (
    typeof shares !== "number" ||
    !Number.isFinite(shares) ||
    shares <= 0 ||
    shares > MAX_SHARES ||
    parseFloat(shares.toFixed(4)) !== shares
  ) {
    return NextResponse.json(
      { error: "shares must be a positive finite number with at most 4 decimal places" },
      { status: 400 },
    );
  }

  // ── Idempotency check ─────────────────────────────────────────────────────────
  if (idempotencyKey) {
    const { data: dup } = await supabase
      .from("paper_trades")
      .select("id")
      .eq("idempotency_key", idempotencyKey)
      .eq("user_id", user.id)
      .maybeSingle();

    if (dup) {
      // Already executed — return success so the client doesn't show an error
      return NextResponse.json({ success: true, duplicate: true });
    }
  }

  // ── Fetch authoritative price (never from client) ────────────────────────────
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Market data is not configured" }, { status: 500 });
  }

  const quote = await getCachedQuote(ticker, apiKey);
  if (!quote) {
    return NextResponse.json(
      { error: `No price data for ${ticker}. Verify the symbol and try again.` },
      { status: 400 },
    );
  }

  const { price: currentPrice, name: companyName } = quote;
  const totalValue = Number((currentPrice * shares).toFixed(2));

  // ── BUY ──────────────────────────────────────────────────────────────────────
  if (tradeType === "BUY") {
    // Check portfolio exists
    const { data: portfolio } = await supabase
      .from("paper_portfolios")
      .select("cash")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found. Visit /trade to initialise it." },
        { status: 404 },
      );
    }

    const currentCash = Number(portfolio.cash);

    // Early client-friendly check (the RPC below is the authoritative gate)
    if (totalValue > currentCash) {
      return NextResponse.json(
        {
          error: `Insufficient funds. This trade costs $${totalValue.toFixed(2)} but you have $${currentCash.toFixed(2)}.`,
        },
        { status: 400 },
      );
    }

    // Upsert position first — if this fails nothing else has changed
    const { data: existingPos } = await supabase
      .from("paper_positions")
      .select("shares, avg_cost")
      .eq("user_id", user.id)
      .eq("ticker", ticker)
      .maybeSingle();

    const existingShares = Number(existingPos?.shares ?? 0);
    const existingAvgCost = Number(existingPos?.avg_cost ?? 0);
    const newTotalShares = Number((existingShares + shares).toFixed(4));
    const newAvgCost =
      newTotalShares > 0
        ? (existingShares * existingAvgCost + shares * currentPrice) / newTotalShares
        : currentPrice;

    const { error: posErr } = await supabase.from("paper_positions").upsert(
      {
        user_id: user.id,
        ticker,
        company_name: companyName,
        shares: newTotalShares,
        avg_cost: Number(newAvgCost.toFixed(4)),
      },
      { onConflict: "user_id,ticker" },
    );

    if (posErr) {
      console.error(`[trade/execute] position upsert failed: ${posErr.message}`);
      return NextResponse.json({ error: "Failed to update position" }, { status: 500 });
    }

    // Atomic cash deduction via Postgres RPC.
    // The function runs: UPDATE ... SET cash = cash - p_amount WHERE cash >= p_amount
    // Returns false if cash was insufficient — handles concurrent requests safely.
    const { data: deducted, error: cashErr } = await supabase.rpc("deduct_paper_cash", {
      p_user_id: user.id,
      p_amount: totalValue,
    });

    if (cashErr || !deducted) {
      // Cash insufficient (race) or DB error — roll back position (best-effort)
      if (existingPos) {
        await supabase
          .from("paper_positions")
          .update({ shares: existingShares, avg_cost: existingAvgCost })
          .eq("user_id", user.id)
          .eq("ticker", ticker);
      } else {
        await supabase
          .from("paper_positions")
          .delete()
          .eq("user_id", user.id)
          .eq("ticker", ticker);
      }

      if (cashErr) {
        console.error(`[trade/execute] deduct_paper_cash error: ${cashErr.message}`);
        return NextResponse.json({ error: "Failed to update cash balance" }, { status: 500 });
      }
      return NextResponse.json(
        {
          error: `Insufficient funds. This trade costs $${totalValue.toFixed(2)}.`,
        },
        { status: 400 },
      );
    }

    // Trade record last — its presence is proof the full BUY completed
    const { error: tradeErr } = await supabase.from("paper_trades").insert({
      user_id: user.id,
      ticker,
      company_name: companyName,
      trade_type: "BUY",
      shares,
      price_per_share: Number(currentPrice.toFixed(4)),
      total_value: totalValue,
      ...(idempotencyKey ? { idempotency_key: idempotencyKey } : {}),
    });

    if (tradeErr) {
      console.error(`[trade/execute] trade record insert failed: ${tradeErr.message}`);
      // Portfolio is financially correct — trade record missing is recoverable
    }
  }

  // ── SELL ─────────────────────────────────────────────────────────────────────
  if (tradeType === "SELL") {
    const { data: existingPos } = await supabase
      .from("paper_positions")
      .select("shares")
      .eq("user_id", user.id)
      .eq("ticker", ticker)
      .maybeSingle();

    const ownedShares = Number(existingPos?.shares ?? 0);

    if (shares > ownedShares) {
      return NextResponse.json(
        {
          error: `You only own ${ownedShares} share${ownedShares !== 1 ? "s" : ""} of ${ticker}.`,
        },
        { status: 400 },
      );
    }

    const remainingShares = Number((ownedShares - shares).toFixed(4));

    // Reduce/delete position atomically.
    // The .gte("shares", shares) condition means this UPDATE/DELETE only
    // succeeds if nobody else sold shares between our SELECT and now.
    if (remainingShares <= 0.0001) {
      const { data: deleted, error: delErr } = await supabase
        .from("paper_positions")
        .delete()
        .eq("user_id", user.id)
        .eq("ticker", ticker)
        .gte("shares", shares)
        .select("id");

      if (delErr || !deleted?.length) {
        return NextResponse.json(
          { error: "Insufficient shares. Another sell may have completed concurrently." },
          { status: 409 },
        );
      }
    } else {
      const { data: updatedPos, error: posErr } = await supabase
        .from("paper_positions")
        .update({ shares: remainingShares })
        .eq("user_id", user.id)
        .eq("ticker", ticker)
        .gte("shares", shares)
        .select("shares");

      if (posErr || !updatedPos?.length) {
        return NextResponse.json(
          { error: "Insufficient shares. Another sell may have completed concurrently." },
          { status: 409 },
        );
      }
    }

    // Atomic cash credit — relative update prevents concurrent-sell race
    const { error: cashErr } = await supabase.rpc("add_paper_cash", {
      p_user_id: user.id,
      p_amount: totalValue,
    });

    if (cashErr) {
      // Shares already reduced — log for manual reconciliation
      console.error(
        `[trade/execute] CRITICAL: SELL cash credit failed for user ${user.id}. ` +
          `${shares} shares of ${ticker} @ $${currentPrice} deducted but cash not credited. ` +
          `Error: ${cashErr.message}`,
      );
      return NextResponse.json({ error: "Failed to credit sale proceeds" }, { status: 500 });
    }

    const { error: tradeErr } = await supabase.from("paper_trades").insert({
      user_id: user.id,
      ticker,
      company_name: companyName,
      trade_type: "SELL",
      shares,
      price_per_share: Number(currentPrice.toFixed(4)),
      total_value: totalValue,
      ...(idempotencyKey ? { idempotency_key: idempotencyKey } : {}),
    });

    if (tradeErr) {
      console.error(`[trade/execute] trade record insert failed: ${tradeErr.message}`);
    }
  }

  // Sync portfolio_value for the leaderboard using live market prices.
  const [{ data: updatedPortfolio }, { data: updatedPositions }] = await Promise.all([
    supabase.from("paper_portfolios").select("cash").eq("user_id", user.id).maybeSingle(),
    supabase.from("paper_positions").select("ticker, shares").eq("user_id", user.id),
  ]);

  if (updatedPortfolio && updatedPositions) {
    // Fetch current prices for all positions (excluding the ticker we just priced)
    const otherTickers = [...new Set(
      updatedPositions.map((p) => p.ticker as string).filter((t) => t !== ticker)
    )];
    const otherPrices = await Promise.all(
      otherTickers.map((t) =>
        fetch(`${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(t)}&token=${apiKey}`)
          .then((r) => r.ok ? r.json() : null)
          .then((d) => ({ ticker: t, price: d?.c ?? 0 }))
          .catch(() => ({ ticker: t, price: 0 }))
      )
    );
    const priceMap: Record<string, number> = { [ticker]: currentPrice };
    otherPrices.forEach(({ ticker: t, price: p }) => { if (p > 0) priceMap[t] = p; });

    const positionValue = updatedPositions.reduce((sum, p) => {
      const price = priceMap[p.ticker as string] ?? 0;
      return sum + Number(p.shares) * price;
    }, 0);
    const liveValue = parseFloat((Number(updatedPortfolio.cash) + positionValue).toFixed(2));
    await supabase
      .from("paper_portfolios")
      .update({ portfolio_value: liveValue, value_updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
  }

  return NextResponse.json({
    success: true,
    tradeType,
    ticker,
    companyName,
    shares,
    pricePerShare: currentPrice,
    totalValue,
  });
}
