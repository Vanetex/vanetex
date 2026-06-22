import { createClient } from "./client";

export type Portfolio = {
  id: string;
  cash: number;
};

export type Position = {
  id: string;
  ticker: string;
  companyName: string;
  shares: number;
  avgCost: number;
};

export type Trade = {
  id: string;
  ticker: string;
  companyName: string;
  tradeType: "BUY" | "SELL";
  shares: number;
  pricePerShare: number;
  totalValue: number;
  createdAt: number; // ms epoch
};

// ---------------------------------------------------------------------------
// Portfolio
// ---------------------------------------------------------------------------

/**
 * Get or create the user's paper portfolio. Returns null if not authenticated.
 */
export async function getOrCreatePortfolio(): Promise<Portfolio | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Upsert with ignoreDuplicates: concurrent first-visits from multiple tabs
  // both attempt this safely — the second is a no-op, then both read the row.
  const { error: upsertErr } = await supabase
    .from("paper_portfolios")
    .upsert({ user_id: user.id, cash: 10000, portfolio_value: 10000 }, { onConflict: "user_id", ignoreDuplicates: true });

  if (upsertErr) {
    console.error("[paperTrading] getOrCreatePortfolio upsert error:", upsertErr.message);
  }

  const { data, error } = await supabase
    .from("paper_portfolios")
    .select("id, cash")
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    console.error("[paperTrading] getOrCreatePortfolio read error:", error?.message);
    return null;
  }

  return { id: data.id, cash: Number(data.cash) };
}

// ---------------------------------------------------------------------------
// Positions
// ---------------------------------------------------------------------------

export async function listPositions(): Promise<Position[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("paper_positions")
    .select("id, ticker, company_name, shares, avg_cost")
    .gt("shares", 0)
    .order("ticker");

  if (error) {
    console.error("[paperTrading] listPositions error:", error.message);
    return [];
  }

  return (data ?? []).map((r) => ({
    id: r.id,
    ticker: r.ticker,
    companyName: r.company_name,
    shares: Number(r.shares),
    avgCost: Number(r.avg_cost),
  }));
}

// ---------------------------------------------------------------------------
// Trade history
// ---------------------------------------------------------------------------

export async function listTrades(limit = 50): Promise<Trade[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("paper_trades")
    .select("id, ticker, company_name, trade_type, shares, price_per_share, total_value, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[paperTrading] listTrades error:", error.message);
    return [];
  }

  return (data ?? []).map((r) => ({
    id: r.id,
    ticker: r.ticker,
    companyName: r.company_name,
    tradeType: r.trade_type as "BUY" | "SELL",
    shares: Number(r.shares),
    pricePerShare: Number(r.price_per_share),
    totalValue: Number(r.total_value),
    createdAt: new Date(r.created_at).getTime(),
  }));
}
