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
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Only gate the default post-signup destination — password reset
      // and other explicit `next` targets (e.g. /auth/update-password)
      // should never be redirected into onboarding.
      if (next === "/" && data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", data.user.id)
          .maybeSingle();
        if (profile && !(profile as { onboarding_completed: boolean | null }).onboarding_completed) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[/auth/callback] code exchange failed:", error.message);
    return NextResponse.redirect(
      `${origin}/auth/sign-in?error=${encodeURIComponent("Verification link expired or already used. Please sign in or request a new link.")}`,
    );
  }

  // No code — OAuth hash fragment flow, hand off to client-side confirm page.
  return NextResponse.redirect(`${origin}/auth/confirm`);
}
