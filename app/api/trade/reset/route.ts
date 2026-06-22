import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rl = checkRateLimit("trade:reset", clientIdFromRequest(request), 5, 24 * 60 * 60_000);
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

  // Clear user trade history first to avoid orphaning references.
  const { error: tradesError } = await supabase
    .from("paper_trades")
    .delete()
    .eq("user_id", user.id);
  if (tradesError) {
    return NextResponse.json(
      { error: "Could not clear trade history" },
      { status: 500 },
    );
  }

  const { error: positionsError } = await supabase
    .from("paper_positions")
    .delete()
    .eq("user_id", user.id);
  if (positionsError) {
    return NextResponse.json(
      { error: "Could not clear positions" },
      { status: 500 },
    );
  }

  // Restore paper cash to the default starter balance.
  const { error: portfolioError } = await supabase
    .from("paper_portfolios")
    .upsert(
      {
        user_id: user.id,
        cash: 10000,
        portfolio_value: 10000,
      },
      { onConflict: "user_id" },
    );
  if (portfolioError) {
    return NextResponse.json(
      { error: "Could not reset portfolio balance" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    cash: 10000,
  });
}
