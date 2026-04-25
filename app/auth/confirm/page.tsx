"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ConfirmPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ConfirmContent />
    </Suspense>
  );
}

function Spinner() {
  return (
    <div className="flex flex-col items-center pt-16 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      <p className="mt-4 text-sm text-muted">Signing you in…</p>
    </div>
  );
}

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();

    async function handleAuth() {
      // PKCE code exchange (email confirmation link)
      const code = searchParams.get("code");
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data.session) {
          router.push("/");
          router.refresh();
          return;
        }
      }

      // OAuth hash fragment — wait briefly for Supabase client to process it
      const hash = window.location.hash;
      if (hash && hash.includes("access_token")) {
        await new Promise((r) => setTimeout(r, 800));
      }

      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // If the email is not confirmed this session came from a signUp that
        // bypassed confirmation (Supabase PKCE auto-redirect). Sign out and
        // send the user to the verify screen so they must confirm first.
        if (!session.user.email_confirmed_at) {
          const email = session.user.email ?? "";
          await supabase.auth.signOut();
          window.location.href = `/auth/verify${email ? `?email=${encodeURIComponent(email)}` : ""}`;
          return;
        }

        router.push("/");
        router.refresh();
        return;
      }

      // Listen for auth state change (OAuth sign-in)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" && session) {
          if (!session.user.email_confirmed_at) {
            const email = session.user.email ?? "";
            supabase.auth.signOut().then(() => {
              window.location.href = `/auth/verify${email ? `?email=${encodeURIComponent(email)}` : ""}`;
            });
            return;
          }
          router.push("/");
          router.refresh();
        }
      });

      const timeout = setTimeout(() => {
        subscription.unsubscribe();
        router.push("/auth/sign-in");
      }, 5000);

      return () => {
        clearTimeout(timeout);
        subscription.unsubscribe();
      };
    }

    handleAuth();
  }, [router, searchParams]);

  return <Spinner />;
}
