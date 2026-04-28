import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";

export const runtime = "nodejs";

const SEVEN_DAYS_ISO = () =>
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

// GET — fetch current shield status
export async function GET(request: NextRequest) {
  const rl = checkRateLimit("shield:get", clientIdFromRequest(request), 30, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { data } = await supabase
    .from("profiles")
    .select("streak_shield, shield_last_earned_at")
    .eq("id", user.id)
    .single();

  const shield = data?.streak_shield ?? 0;
  const lastEarned = data?.shield_last_earned_at
    ? new Date(data.shield_last_earned_at).getTime()
    : null;
  const canEarnThisWeek = !lastEarned || Date.now() - lastEarned > 7 * 24 * 60 * 60 * 1000;

  return NextResponse.json({ shield, canEarnThisWeek });
}

// POST — award a shield atomically.
// Uses a single UPDATE with WHERE conditions so the read + eligibility check
// + write happen in one atomic statement — eliminates the TOCTOU race.
export async function POST(request: NextRequest) {
  const rl = checkRateLimit("shield:award", clientIdFromRequest(request), 5, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  // Single atomic UPDATE: only succeeds when both conditions are met.
  // If 0 rows are returned the user is already holding a shield or hit the weekly cap.
  const { data } = await supabase
    .from("profiles")
    .update({ streak_shield: 1, shield_last_earned_at: new Date().toISOString() })
    .eq("id", user.id)
    .eq("streak_shield", 0)
    .or(`shield_last_earned_at.is.null,shield_last_earned_at.lt.${SEVEN_DAYS_ISO()}`)
    .select("id");

  return NextResponse.json({ awarded: !!(data && data.length > 0) });
}

// DELETE — consume the shield when it bridges a missed day.
export async function DELETE(request: NextRequest) {
  const rl = checkRateLimit("shield:consume", clientIdFromRequest(request), 10, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  await supabase
    .from("profiles")
    .update({ streak_shield: 0 })
    .eq("id", user.id);

  return NextResponse.json({ consumed: true });
}
