import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";

export const runtime = "nodejs";

// GET — list all friendships (accepted, incoming pending, outgoing pending)
export async function GET(request: NextRequest) {
  const rl = checkRateLimit("friends:list", clientIdFromRequest(request), 30, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { data: rows } = await supabase
    .from("friendships")
    .select("id, requester_id, addressee_id, status, created_at")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (!rows?.length) return NextResponse.json({ accepted: [], incoming: [], outgoing: [] });

  // Collect unique other-user IDs to fetch their display names
  const otherIds = [...new Set(rows.map((r) =>
    r.requester_id === user.id ? r.addressee_id : r.requester_id,
  ))];

  const admin = createAdminClient();
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, display_name")
    .in("id", otherIds);

  const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  const toEntry = (r: typeof rows[0]) => {
    const otherId = r.requester_id === user.id ? r.addressee_id : r.requester_id;
    return { id: r.id, userId: otherId, displayName: nameMap.get(otherId) ?? "Unknown", createdAt: r.created_at };
  };

  return NextResponse.json({
    accepted: rows.filter((r) => r.status === "accepted").map(toEntry),
    incoming: rows.filter((r) => r.status === "pending" && r.addressee_id === user.id).map(toEntry),
    outgoing: rows.filter((r) => r.status === "pending" && r.requester_id === user.id).map(toEntry),
  });
}

// POST — send a friend request
export async function POST(request: NextRequest) {
  const rl = checkRateLimit("friends:request", clientIdFromRequest(request), 20, 60 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await request.json() as { addresseeId?: string };
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!body.addresseeId || !UUID_RE.test(body.addresseeId) || body.addresseeId === user.id) {
    return NextResponse.json({ error: "Invalid addressee." }, { status: 400 });
  }

  const { error } = await supabase
    .from("friendships")
    .insert({ requester_id: user.id, addressee_id: body.addresseeId, status: "pending" });

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Request already exists." }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
