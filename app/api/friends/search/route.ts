import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("friends:search", clientIdFromRequest(request), 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const admin = createAdminClient();

  // Search profiles by display_name (admin bypasses RLS)
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, display_name")
    .ilike("display_name", `%${q}%`)
    .neq("id", user.id)
    .limit(8);

  if (!profiles?.length) return NextResponse.json({ results: [] });

  // Get existing friendship statuses with these users
  const { data: existing } = await supabase
    .from("friendships")
    .select("id, requester_id, addressee_id, status")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

  const friendMap = new Map<string, { id: string; status: string; isRequester: boolean }>();
  for (const f of existing ?? []) {
    const otherId = f.requester_id === user.id ? f.addressee_id : f.requester_id;
    friendMap.set(otherId, { id: f.id, status: f.status, isRequester: f.requester_id === user.id });
  }

  const results = profiles.map((p) => ({
    id: p.id,
    displayName: p.display_name,
    friendship: friendMap.get(p.id) ?? null,
  }));

  return NextResponse.json({ results });
}
