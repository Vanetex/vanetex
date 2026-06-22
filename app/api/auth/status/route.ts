import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ signedIn: false });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json({
    signedIn: true,
    displayName: profile?.display_name ?? user.email ?? "",
    initial: (profile?.display_name ?? user.email ?? "?")[0].toUpperCase(),
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}
