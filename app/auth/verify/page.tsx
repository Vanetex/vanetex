"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="pt-16" />}>
      <VerifyContent />
    </Suspense>
  );
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleResend() {
    if (!email) return;
    setResendStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });
    setResendStatus(error ? "error" : "sent");
  }

  return (
    <div className="flex flex-col items-center pt-16 text-center">
      <div className="rounded-full bg-accent/10 p-4">
        <svg
          className="h-8 w-8 text-accent"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
      </div>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Check your email</h1>
      <p className="mt-2 max-w-xs text-sm text-muted">
        We sent a verification link to{" "}
        {email ? (
          <span className="font-medium text-ink">{email}</span>
        ) : (
          "your email address"
        )}
        . Click the link to activate your account.
      </p>

      {email && (
        <div className="mt-6">
          {resendStatus === "sent" ? (
            <p className="text-sm text-success">New link sent — check your inbox.</p>
          ) : resendStatus === "error" ? (
            <p className="text-sm text-danger">
              Could not resend.{" "}
              <button onClick={handleResend} className="underline hover:no-underline">
                Try again
              </button>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resendStatus === "sending"}
              className="text-sm text-muted transition hover:text-ink disabled:opacity-50"
            >
              {resendStatus === "sending" ? "Sending…" : "Didn't receive it? Resend email"}
            </button>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-col items-center gap-2">
        <Link href="/auth/sign-in" className="text-sm font-medium text-accent hover:underline">
          Back to sign in
        </Link>
        <Link href="/auth/sign-up" className="text-xs text-muted hover:text-ink">
          Wrong email? Sign up again
        </Link>
      </div>
    </div>
  );
}
