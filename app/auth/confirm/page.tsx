"use client";

import { Suspense, useEffect, useState } from "react";
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
      <p className="mt-4 text-sm text-muted">Signing you in...</p>
    </div>
  );
}

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status] = useState("Signing you in...");

  useEffect(() => {
    const supabase = createClient();

    async function handleAuth() {
      // Strategy 1: PKCE code exchange
      const code = searchParams.get("code");
      if (code) {
        console.log("[auth/confirm] Found code param, exchanging...");
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("[auth/confirm] Code exchange failed:", error.message);
        } else if (data.session) {
          console.log("[auth/confirm] Code exchange succeeded, redirecting...");
          router.push("/");
          router.refresh();
          return;
        }
      }

      // Strategy 2: Check hash fragment (implicit flow)
      const hash = window.location.hash;
      if (hash && hash.includes("access_token")) {
        console.log("[auth/confirm] Found hash fragment, letting client process...");
        // The Supabase client auto-detects hash fragments.
        // Give it a moment then check session.
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Strategy 3: Check if session already exists
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (session) {
        console.log("[auth/confirm] Session found, redirecting...");
        router.push("/");
        router.refresh();
        return;
      }

      if (sessionError) {
        console.error("[auth/confirm] getSession error:", sessionError.message);
      }

      // Last resort: listen for auth state change for a few seconds
      console.log("[auth/confirm] No session yet, listening for auth state change...");
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" && session) {
          console.log("[auth/confirm] SIGNED_IN event received");
          router.push("/");
          router.refresh();
        }
      });

      // Timeout fallback — redirect to sign-in silently
      setTimeout(() => {
        subscription.unsubscribe();
        router.push("/auth/sign-in");
      }, 6000);
    }

    handleAuth();
  }, [router, searchParams]);

  return <Spinner />;
}
