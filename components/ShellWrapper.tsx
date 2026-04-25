"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";
import { readCache, writeCache } from "@/lib/pageCache";
import { listDecisions } from "@/lib/supabase/decisions";
import { listAwardedAchievements } from "@/lib/supabase/achievements";
import { listLessonProgress } from "@/lib/supabase/lessonProgress";
import { createClient } from "@/lib/supabase/client";

function PrefetchAll() {
  useEffect(() => {
    const supabase = createClient();

    // decisions — shared by Journal + Progress
    if (!readCache("decisions")) {
      listDecisions().then((d) => writeCache("decisions", d)).catch(() => {});
    }

    // achievements — used by Progress
    if (!readCache("achievements")) {
      listAwardedAchievements().then((a) => writeCache("achievements", a)).catch(() => {});
    }

    // lesson_progress — used by Tracks listing
    if (!readCache("lesson_progress")) {
      listLessonProgress().then((p) => writeCache("lesson_progress", p)).catch(() => {});
    }

    // leaderboard — 30s TTL handled by the page; only prefetch if cold
    if (!readCache("leaderboard:challenge", 30_000)) {
      Promise.all([
        supabase.rpc("get_challenge_leaderboard"),
        supabase.rpc("get_trading_leaderboard"),
      ]).then(([{ data: c }, { data: t }]) => {
        writeCache("leaderboard:challenge", c ?? []);
        writeCache("leaderboard:trading", t ?? []);
      }).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export default function ShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/terms" || pathname === "/privacy") {
    return <>{children}</>;
  }

  return (
    <>
      <PrefetchAll />
      <Nav />
      <div className="md:pl-72">
        <main className="px-4 pb-10 pt-4 sm:px-6 md:px-8 md:pt-8">
          <div className="app-shell mx-auto max-w-5xl rounded-[28px] p-3 sm:p-4">
            <div className="surface-card min-h-[calc(100vh-7rem)] rounded-3xl px-5 pt-6 sm:px-6" style={{ paddingBottom: "calc(6rem + env(safe-area-inset-bottom, 0px))" }}>
              <div className="mx-auto max-w-2xl">{children}</div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
