import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateDisplayName } from "@/lib/profanity";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rl = checkRateLimit("profile:display-name", clientIdFromRequest(request), 5, 60 * 60_000);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { name } = await request.json() as { name?: string };
  const validation = validateDisplayName(name ?? "");
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });

  const trimmed = (name as string).trim();

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: trimmed })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: "Failed to update display name." }, { status: 500 });
  return NextResponse.json({ success: true, name: trimmed });
}
