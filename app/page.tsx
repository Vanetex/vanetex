"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import HomeNav from "@/components/homepage/HomeNav";
import Hero, { StatsBar } from "@/components/homepage/Hero";
import Demo from "@/components/homepage/Demo";
import HomepageSections from "@/components/homepage/HomepageSections";

export default function HomePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#07080b" }} />}>
      <HomePageContent />
    </Suspense>
  );
}

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  // Capture referral code from URL and store for post-signup redemption
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) sessionStorage.setItem("pending_ref", ref.toUpperCase());
  }, [searchParams]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      if (u) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed, referred_by")
          .eq("id", u.id)
          .maybeSingle();

        // Redeem pending referral code if not already referred
        const pendingRef = sessionStorage.getItem("pending_ref");
        if (pendingRef && !(profile as { referred_by?: string | null } | null)?.referred_by) {
          sessionStorage.removeItem("pending_ref");
          fetch("/api/referral/redeem", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ code: pendingRef }),
          }).catch(() => {});
        }

        if (
          (profile as { onboarding_completed?: boolean | null } | null)
            ?.onboarding_completed === false
        ) {
          router.replace("/onboarding");
          return;
        }
      }
      setUser(u);
      setChecked(true);
    });
  }, [router]);

  if (!checked) {
    return <div style={{ minHeight: "100vh", background: "#07080b" }} />;
  }

  return (
    <div style={{ background: "#07080b", minHeight: "100vh" }}>
      <HomeNav user={user} />
      <Hero user={user} />
      <StatsBar />
      {!user && (
        <>
          <Demo />
          <HomepageSections />
        </>
      )}
      {user && <HomepageSections />}
    </div>
  );
}
