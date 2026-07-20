import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Routes that require authentication.
 * The landing page (/) is public; everything else behind these prefixes
 * redirects to /auth/sign-in if no session exists.
 */
const PROTECTED_PREFIXES = ["/challenge", "/journal", "/progress", "/profile", "/history", "/tracks", "/trade", "/settings", "/onboarding", "/leaderboard"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: Do NOT add logic between createServerClient and getUser().
  // A simple mistake here can make it very hard to debug auth issues.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // If user is not signed in and trying to access a protected route, redirect.
  if (
    !user &&
    PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // If user is signed in but email is not confirmed, block access to the app
  // and send them to the verify screen.
  if (
    user &&
    !user.email_confirmed_at &&
    !pathname.startsWith("/auth/") &&
    pathname !== "/" &&
    pathname !== "/terms" &&
    pathname !== "/privacy"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/verify";
    return NextResponse.redirect(url);
  }

  // Email/password sign-up collects date_of_birth up front, but OAuth
  // (Google) sign-in skips it entirely — profiles.date_of_birth is left
  // null. Since the app enforces a 13+ minimum, gate every OAuth user
  // through a one-time DOB prompt before they can use the app, the same
  // way unconfirmed emails are gated above.
  if (
    user &&
    user.email_confirmed_at &&
    !pathname.startsWith("/auth/") &&
    pathname !== "/" &&
    pathname !== "/terms" &&
    pathname !== "/privacy"
  ) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("date_of_birth")
      .eq("id", user.id)
      .maybeSingle();

    if (profile && !(profile as { date_of_birth: string | null }).date_of_birth) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/complete-profile";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // If user IS signed in and on an auth page (except sign-out), redirect to app.
  if (
    user &&
    pathname.startsWith("/auth/") &&
    pathname !== "/auth/sign-out" &&
    pathname !== "/auth/callback" &&
    pathname !== "/auth/confirm" &&
    pathname !== "/auth/update-password" &&
    pathname !== "/auth/verify" &&
    pathname !== "/auth/complete-profile"
  ) {
    const url = request.nextUrl.clone();
    const next = request.nextUrl.searchParams.get("next");
    url.pathname = next && next.startsWith("/") && !next.startsWith("/auth/") ? next : "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
