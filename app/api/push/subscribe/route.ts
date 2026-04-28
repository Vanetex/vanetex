import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";

export const runtime = "nodejs";

type PushSubscriptionBody = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function POST(request: NextRequest) {
  const rl = checkRateLimit("push:subscribe", clientIdFromRequest(request), 10, 60 * 60_000);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: PushSubscriptionBody;
  try {
    body = await request.json() as PushSubscriptionBody;
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const { endpoint, keys } = body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "Missing subscription fields." }, { status: 400 });
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    { user_id: user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
    { onConflict: "user_id,endpoint" },
  );

  if (error) {
    console.error("[push/subscribe]", error.message);
    return NextResponse.json({ error: "Failed to save subscription." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { endpoint } = await request.json() as { endpoint?: string };
  if (!endpoint) return NextResponse.json({ error: "Missing endpoint." }, { status: 400 });

  await supabase.from("push_subscriptions").delete()
    .eq("user_id", user.id).eq("endpoint", endpoint);

  return NextResponse.json({ success: true });
}
