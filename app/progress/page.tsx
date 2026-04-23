"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { computeProgress } from "@/lib/scoring";
import { ALL_ACHIEVEMENTS } from "@/lib/achievements";
import { listDecisions } from "@/lib/supabase/decisions";
import { listAwardedAchievements } from "@/lib/supabase/achievements";
import { readCache, writeCache } from "@/lib/pageCache";
import type { DecisionRecord, ProgressSnapshot } from "@/lib/types";

const DECISIONS_KEY = "decisions";
const ACHIEVEMENTS_KEY = "achievements";

export default function ProgressPage() {
  const [records, setRecords] = useState<DecisionRecord[]>(
    () => readCache<DecisionRecord[]>(DECISIONS_KEY) ?? [],
  );
  const [awarded, setAwarded] = useState<{ id: string; awarded_at: string }[]>(
    () => readCache<{ id: string; awarded_at: string }[]>(ACHIEVEMENTS_KEY) ?? [],
  );
  const [loading, setLoading] = useState(
    () => !readCache<DecisionRecord[]>(DECISIONS_KEY),
  );

  useEffect(() => {
    if (readCache<DecisionRecord[]>(DECISIONS_KEY)) return;
    Promise.all([listDecisions(), listAwardedAchievements()]).then(([recs, ach]) => {
      writeCache(DECISIONS_KEY, recs);
      writeCache(ACHIEVEMENTS_KEY, ach);
      setRecords(recs);
      setAwarded(ach);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <section className="animate-pulse">
        <div className="mb-1 h-7 w-32 rounded-lg bg-black/8" />
        <div className="mb-6 mt-2 h-4 w-64 rounded bg-black/5" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-black/5" />)}
        </div>
        <div className="mt-8 h-48 rounded-2xl bg-black/5" />
        <div className="mt-8 h-64 rounded-2xl bg-black/5" />
      </section>
    );
  }

  const snap = computeProgress(records);

  if (snap.totalDecisions === 0) {
    return (
      <section>
        <h1 className="mb-1 text-xl font-semibold tracking-tight">Progress</h1>
        <p className="mb-6 text-sm text-muted">
          Your skill score and accuracy show up here after a few challenges.
        </p>
        <div className="rounded-2xl border border-dashed border-black/10 bg-white p-8 text-center">
          <p className="text-sm text-muted">No decisions yet.</p>
          <Link
            href="/challenge"
            className="mt-4 inline-block rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper"
          >
            Start today&rsquo;s challenge
          </Link>
        </div>
      </section>
    );
  }

  const awardedMap = new Map(awarded.map((a) => [a.id, a.awarded_at]));
  const categories = ["decisions", "streaks", "learning", "trading"] as const;
  const CATEGORY_LABELS: Record<string, string> = {
    decisions: "Decisions", streaks: "Streaks", learning: "Learning", trading: "Trading",
  };

  return (
    <section>
      <h1 className="mb-1 text-xl font-semibold tracking-tight">Progress</h1>
      <p className="mb-6 text-sm text-muted">
        Rolling averages across your last few decisions.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <BigStat label="Skill score" value={snap.skillScore} suffix="" level={snap.level} trend={snap.trend} />
        <BigStat label="Decision accuracy" value={snap.decisionAccuracyPct} suffix="%" />
        <BigStat
          label="Confidence calibration"
          value={snap.calibration}
          suffix="%"
          hint="% of high-confidence (7+) calls that were correct"
        />
        <BigStat label="Total decisions" value={snap.totalDecisions} suffix="" hint="All-time reps" />
      </div>

      <div className="mt-8 rounded-2xl border border-black/5 bg-white p-5">
        <h3 className="text-sm font-semibold">Recent performance</h3>
        <ul className="mt-3 space-y-2">
          {records.slice(0, 8).map((r) => (
            <li key={r.id} className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium">{r.ticker}</span>{" "}
                <span className="text-muted">· {new Date(r.timestamp).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="rounded bg-ink/[0.04] px-1.5 py-0.5">{r.action}</span>
                {r.evaluation && <span className="text-ink/70">D {r.evaluation.decisionScore}</span>}
                {typeof r.outcomeReturnPct === "number" && (
                  <span className={r.outcomeReturnPct >= 0 ? "text-success" : "text-danger"}>
                    {r.outcomeReturnPct >= 0 ? "+" : ""}{r.outcomeReturnPct}%
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="mb-4 text-sm font-semibold">Achievements</h3>
        <div className="space-y-6">
          {categories.map((cat) => {
            const items = ALL_ACHIEVEMENTS.filter((a) => a.category === cat);
            const unlockedCount = items.filter((a) => awardedMap.has(a.id)).length;
            return (
              <div key={cat}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {CATEGORY_LABELS[cat]}
                  </p>
                  <p className="text-xs text-muted">{unlockedCount} / {items.length}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {items.map((ach) => {
                    const awardedAt = awardedMap.get(ach.id);
                    const unlocked = !!awardedAt;
                    return (
                      <div
                        key={ach.id}
                        className={`rounded-2xl border p-3.5 ${
                          unlocked
                            ? "border-warn/20 bg-warn/5"
                            : "border-black/5 bg-white opacity-45 grayscale"
                        }`}
                      >
                        <div className="text-2xl">{ach.icon}</div>
                        <p className="mt-2 text-xs font-semibold">{ach.title}</p>
                        <p className="mt-0.5 text-[11px] leading-snug text-muted">{ach.description}</p>
                        {unlocked && awardedAt && (
                          <p className="mt-2 text-[10px] text-warn">
                            {new Date(awardedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BigStat({
  label, value, suffix, level, trend, hint,
}: {
  label: string; value: number; suffix: string;
  level?: ProgressSnapshot["level"]; trend?: ProgressSnapshot["trend"]; hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="font-mono text-4xl">
          {value}<span className="text-lg text-muted">{suffix}</span>
        </div>
        {trend && (
          <span
            className={
              "text-xs " +
              (trend === "improving"
                ? "text-success"
                : trend === "declining"
                  ? "text-danger"
                  : "text-muted")
            }
          >
            {trend === "improving" ? "↗ improving" : trend === "declining" ? "↘ declining" : "→ steady"}
          </span>
        )}
      </div>
      {level && (
        <div className="mt-1 text-xs text-muted">
          Level: <span className="font-semibold text-ink">{level}</span>
        </div>
      )}
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  );
}
