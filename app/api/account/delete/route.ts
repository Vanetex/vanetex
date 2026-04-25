import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rl = checkRateLimit("account:delete", clientIdFromRequest(request), 3, 60 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const admin = createAdminClient();

  // Delete user data explicitly before removing the auth record.
  // Order matters: child rows first, then profile, then auth user.
  await admin.from("paper_trades").delete().eq("user_id", user.id);
  await admin.from("paper_positions").delete().eq("user_id", user.id);
  await admin.from("paper_portfolios").delete().eq("user_id", user.id);
  await admin.from("lesson_progress").delete().eq("user_id", user.id);
  await admin.from("awarded_achievements").delete().eq("user_id", user.id);
  await admin.from("decisions").delete().eq("user_id", user.id);
  await admin.from("profiles").delete().eq("id", user.id);

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("[/api/account/delete]", error.message);
    return NextResponse.json({ error: "Failed to delete account." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
