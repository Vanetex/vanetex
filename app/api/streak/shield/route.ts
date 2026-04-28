import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// GET — fetch current shield status
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { data } = await supabase
    .from("profiles")
    .select("streak_shield, shield_last_earned_at")
    .eq("id", user.id)
    .single();

  const shield = data?.streak_shield ?? 0;
  const lastEarned = data?.shield_last_earned_at ? new Date(data.shield_last_earned_at).getTime() : null;
  const canEarnThisWeek = !lastEarned || Date.now() - lastEarned > SEVEN_DAYS_MS;

  return NextResponse.json({ shield, canEarnThisWeek });
}

// POST — award a shield (called after qualifying decision)
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_shield, shield_last_earned_at")
    .eq("id", user.id)
    .single();

  // Already holding a shield
  if ((profile?.streak_shield ?? 0) >= 1) {
    return NextResponse.json({ awarded: false, reason: "already_holding" });
  }

  // Earned one within the last 7 days
  const lastEarned = profile?.shield_last_earned_at
    ? new Date(profile.shield_last_earned_at).getTime()
    : null;
  if (lastEarned && Date.now() - lastEarned < SEVEN_DAYS_MS) {
    return NextResponse.json({ awarded: false, reason: "weekly_limit" });
  }

  await supabase
    .from("profiles")
    .update({ streak_shield: 1, shield_last_earned_at: new Date().toISOString() })
    .eq("id", user.id);

  return NextResponse.json({ awarded: true });
}

// DELETE — consume the shield (called when it bridges a missed day)
export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  await supabase
    .from("profiles")
    .update({ streak_shield: 0 })
    .eq("id", user.id);

  return NextResponse.json({ consumed: true });
}
