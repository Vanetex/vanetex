"use client";

import { Suspense, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

const MIN_AGE = 13;

function isOldEnough(dob: string): boolean {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= MIN_AGE;
}

export default function CompleteProfilePage() {
  return (
    <Suspense>
      <CompleteProfileContent />
    </Suspense>
  );
}

function CompleteProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [dob, setDob] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const maxDob = new Date();
  maxDob.setFullYear(maxDob.getFullYear() - MIN_AGE);
  const maxDobStr = maxDob.toISOString().split("T")[0];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!dob) {
      setError("Date of birth is required.");
      return;
    }
    if (!isOldEnough(dob)) {
      setError(`You must be at least ${MIN_AGE} years old to use Vanetex.`);
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      router.push("/auth/sign-in");
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ date_of_birth: dob })
      .eq("id", user.id);

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    const next = searchParams.get("next") ?? "/";
    router.push(next);
    router.refresh();
  }

  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-semibold tracking-tight text-[#e8edf8]">One more thing</h1>
      <p className="mt-2 text-sm text-[rgba(180,200,230,0.6)]">
        We need your date of birth to confirm you meet our minimum age requirement.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 w-full space-y-4">
        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-[#c8d8f0]">
            Date of birth
          </label>
          <input
            id="dob"
            type="date"
            required
            max={maxDobStr}
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#e8edf8] placeholder-[rgba(180,200,230,0.35)] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <p className="mt-1 text-xs text-[rgba(180,200,230,0.5)]">You must be at least {MIN_AGE} to use Vanetex.</p>
        </div>

        {error && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-accent/90 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
