"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { computeXP, getLevelInfo } from "@/lib/xp";
import { computeProgress } from "@/lib/scoring";
import { listDecisions } from "@/lib/supabase/decisions";
import { listAwardedAchievements } from "@/lib/supabase/achievements";
import { listLessonProgress } from "@/lib/supabase/lessonProgress";

const glass = {
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(20px) saturate(160%)",
  WebkitBackdropFilter: "blur(20px) saturate(160%)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 16px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
} as const;

export default function MePage() {
  const [displayName, setDisplayName] = useState("");
  const [initial, setInitial] = useState("?");
  const [levelInfo, setLevelInfo] = useState<ReturnType<typeof getLevelInfo> | null>(null);
  const [snap, setSnap] = useState<ReturnType<typeof computeProgress> | null>(null);
  const [achievementCount, setAchievementCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { window.location.href = "/auth/sign-in"; return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();

      const name = profile?.display_name ?? user.email ?? "Investor";
      setDisplayName(name);
      setInitial(name[0].toUpperCase());

      const [decisions, awarded, lessons] = await Promise.all([
        listDecisions(),
        listAwardedAchievements(),
        listLessonProgress(),
      ]);

      setLevelInfo(getLevelInfo(computeXP(decisions, lessons)));
      setSnap(computeProgress(decisions));
      setAchievementCount(awarded.length);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 pt-4">
        <div style={glass} className="rounded-2xl p-6 h-28" />
        <div className="grid grid-cols-2 gap-3">
          {[0,1,2,3].map(i => <div key={i} style={glass} className="rounded-2xl h-20" />)}
        </div>
      </div>
    );
  }

  const levelColor = levelInfo
    ? levelInfo.current.level >= 9 ? "#D97706"
      : levelInfo.current.level >= 6 ? "#8B5CF6"
      : levelInfo.current.level >= 3 ? "#3b82f6"
      : "#6B7280"
    : "#3b82f6";

  return (
    <div className="space-y-4 pt-4">
      {/* Avatar + name card */}
      <div style={glass} className="rounded-2xl p-6 flex items-center gap-5">
        <div
          style={{ background: "linear-gradient(135deg,#3b82f6,#22d3ee)", boxShadow: "0 0 20px rgba(59,130,246,.4)" }}
          className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white"
        >
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-lg font-semibold text-[#e8edf8] truncate">{displayName}</p>
          {levelInfo && (
            <p className="text-sm mt-0.5" style={{ color: levelColor }}>
              Level {levelInfo.current.level} · {levelInfo.current.title}
            </p>
          )}
          <p className="text-xs mt-1 text-[rgba(180,200,230,0.45)]">{achievementCount} achievements</p>
        </div>
      </div>

      {/* XP bar */}
      {levelInfo && (
        <div style={glass} className="rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[rgba(180,200,230,0.5)]">Experience</span>
            <span className="text-xs text-[rgba(180,200,230,0.5)]">{levelInfo.totalXP.toLocaleString()} XP</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div
              style={{
                width: `${levelInfo.progressPct}%`,
                background: `linear-gradient(90deg, ${levelColor}, ${levelColor}cc)`,
                height: "100%",
                borderRadius: 99,
                boxShadow: `0 0 8px ${levelColor}66`,
                transition: "width 800ms cubic-bezier(0.22,1,0.36,1)",
              }}
            />
          </div>
          {levelInfo.next && (
            <p className="mt-2 text-xs text-[rgba(180,200,230,0.4)]">
              {levelInfo.xpIntoLevel.toLocaleString()} / {levelInfo.xpForNextLevel!.toLocaleString()} XP to {levelInfo.next.title}
            </p>
          )}
        </div>
      )}

      {/* Stats grid */}
      {snap && snap.totalDecisions > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Skill score", value: snap.skillScore, suffix: "" },
            { label: "Accuracy", value: snap.decisionAccuracyPct, suffix: "%" },
            { label: "Decisions", value: snap.totalDecisions, suffix: "" },
            { label: "Calibration", value: snap.calibration, suffix: "%" },
          ].map(({ label, value, suffix }) => (
            <div key={label} style={glass} className="rounded-2xl p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[rgba(180,200,230,0.45)]">{label}</p>
              <p className="mt-1 font-mono text-2xl font-bold text-[#e8edf8]">
                {value}<span className="text-sm text-[rgba(180,200,230,0.4)]">{suffix}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={glass} className="rounded-2xl p-4 flex flex-col gap-2">
        <Link
          href="/challenge"
          className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-[#e8edf8] no-underline transition hover:bg-white/5"
        >
          <span>Daily challenge</span>
          <span className="text-[rgba(180,200,230,0.4)]">→</span>
        </Link>
        <Link
          href="/profile"
          className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-[#e8edf8] no-underline transition hover:bg-white/5"
        >
          <span>Full profile & achievements</span>
          <span className="text-[rgba(180,200,230,0.4)]">→</span>
        </Link>
        <Link
          href="/auth/sign-out"
          className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-[rgba(220,80,80,0.7)] no-underline transition hover:bg-red-500/5"
        >
          <span>Sign out</span>
          <span className="opacity-40">→</span>
        </Link>
      </div>
    </div>
  );
}
