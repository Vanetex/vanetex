"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import HomeNav from "@/components/homepage/HomeNav";
import Hero, { StatsBar } from "@/components/homepage/Hero";
import Demo from "@/components/homepage/Demo";
import HomepageSections from "@/components/homepage/HomepageSections";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      if (u) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", u.id)
          .maybeSingle();
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
