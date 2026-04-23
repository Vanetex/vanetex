import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /auth/callback
 *
 * Handles redirects from Supabase Auth.
 *
 * PKCE flow (email verify, password reset): arrives with ?code=<auth_code>.
 * We exchange it server-side and redirect to the app.
 *
 * OAuth implicit flow: tokens arrive as a hash fragment (#access_token=...).
 * Servers can't read hash fragments, so if there's no ?code we redirect to
 * /auth/confirm — a client-side page that lets the Supabase browser client
 * pick up the fragment and establish the session.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/challenge";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[/auth/callback] code exchange failed:", error.message);
  }

  // No code or code exchange failed — hand off to the client-side confirm page.
  // The hash fragment (if any) will carry through the redirect.
  return NextResponse.redirect(`${origin}/auth/confirm`);
}
