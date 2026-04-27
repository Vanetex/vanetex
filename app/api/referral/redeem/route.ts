import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await request.json() as { code?: string };
  const code = body.code?.trim().toUpperCase();
  if (!code) return NextResponse.json({ error: "No code provided." }, { status: 400 });

  const admin = createAdminClient();

  // Check if this user already has a referrer
  const { data: self } = await admin
    .from("profiles")
    .select("referred_by, referral_code")
    .eq("id", user.id)
    .single();

  if (self?.referred_by) {
    return NextResponse.json({ error: "Already redeemed a referral." }, { status: 409 });
  }

  // Prevent self-referral
  if (self?.referral_code === code) {
    return NextResponse.json({ error: "Cannot use your own referral code." }, { status: 400 });
  }

  // Find the referrer by code
  const { data: referrer } = await admin
    .from("profiles")
    .select("id")
    .eq("referral_code", code)
    .single();

  if (!referrer) {
    return NextResponse.json({ error: "Invalid referral code." }, { status: 404 });
  }

  // Link referral and increment referrer's count
  await Promise.all([
    admin.from("profiles").update({ referred_by: referrer.id }).eq("id", user.id),
    admin.from("profiles").update({ referral_count: (self as { referral_count?: number } | null)?.referral_count ?? 0 + 1 }).eq("id", referrer.id),
  ]);

  return NextResponse.json({ success: true });
}
