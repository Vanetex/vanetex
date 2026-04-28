"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { computeProgress } from "@/lib/scoring";
import { ALL_ACHIEVEMENTS } from "@/lib/achievements";
import { computeXP, getLevelInfo } from "@/lib/xp";
import { computePersona } from "@/lib/personas";
import { listDecisions } from "@/lib/supabase/decisions";
import { listAwardedAchievements } from "@/lib/supabase/achievements";
import { listLessonProgress } from "@/lib/supabase/lessonProgress";
import { readCache, writeCache } from "@/lib/pageCache";
import type { DecisionRecord, LessonProgress, ProgressSnapshot } from "@/lib/types";

const DECISIONS_KEY = "decisions";
const ACHIEVEMENTS_KEY = "achievements";
const LESSONS_KEY = "lessonProgress";

export default function ProfilePage() {
  const [records, setRecords] = useState<DecisionRecord[]>(
    () => readCache<DecisionRecord[]>(DECISIONS_KEY) ?? [],
  );
  const [awarded, setAwarded] = useState<{ id: string; awarded_at: string }[]>(
    () => readCache<{ id: string; awarded_at: string }[]>(ACHIEVEMENTS_KEY) ?? [],
  );
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>(
    () => readCache<LessonProgress[]>(LESSONS_KEY) ?? [],
  );
  const [loading, setLoading] = useState(
    () => !readCache<DecisionRecord[]>(DECISIONS_KEY),
  );

  useEffect(() => {
    if (readCache<DecisionRecord[]>(DECISIONS_KEY)) return;
    Promise.all([listDecisions(), listAwardedAchievements(), listLessonProgress()]).then(([recs, ach, lessons]) => {
      writeCache(DECISIONS_KEY, recs);
      writeCache(ACHIEVEMENTS_KEY, ach);
      writeCache(LESSONS_KEY, lessons);
      setRecords(recs);
      setAwarded(ach);
      setLessonProgress(lessons);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <section className="animate-pulse">
        <div className="mb-1 h-7 w-32 rounded-lg bg-black/8" />
        <div className="mb-6 mt-2 h-4 w-64 rounded bg-black/5" />
        <div className="mb-5 h-28 rounded-2xl bg-black/5" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-black/5" />)}
        </div>
        <div className="mt-8 h-48 rounded-2xl bg-black/5" />
        <div className="mt-8 h-64 rounded-2xl bg-black/5" />
      </section>
    );
  }

  const snap = computeProgress(records);
  const totalXP = computeXP(records, lessonProgress);
  const levelInfo = getLevelInfo(totalXP);
  const persona = computePersona(records);

  if (snap.totalDecisions === 0) {
    return (
      <section>
        <h1 className="mb-1 text-xl font-semibold tracking-tight">Profile</h1>
        <p className="mb-6 text-sm text-muted">
          Your skill score, accuracy, and calibration build up here over time.
        </p>
        <div className="rounded-3xl border border-dashed border-black/10 bg-white px-8 py-12 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/8">
            <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h3m0 0v3m0-3l-4 4-3-3-4 4" />
            </svg>
          </div>
          <p className="font-semibold">Nothing to track yet</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
            Complete a few challenges and your skill score, decision accuracy, and confidence calibration will appear here.
          </p>
          <Link
            href="/challenge"
            className="mt-5 inline-block rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper"
          >
            Take today&rsquo;s challenge →
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
      <h1 className="mb-1 text-xl font-semibold tracking-tight">Profile</h1>
      <p className="mb-6 text-sm text-muted">
        Rolling averages across your last few decisions.
      </p>

      {/* XP / Level card */}
      <XPCard levelInfo={levelInfo} className="mb-3" />

      {/* Investor persona */}
      {persona && <PersonaCard persona={persona} decisionCount={records.length} className="mb-5" />}

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

function PersonaCard({
  persona,
  decisionCount,
  className = "",
}: {
  persona: ReturnType<typeof computePersona>;
  decisionCount: number;
  className?: string;
}) {
  if (!persona) return null;
  return (
    <div className={`rounded-2xl border border-black/5 bg-white p-5 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/8 text-2xl">
            {persona.icon}
          </div>
          <div>
            <p className="font-semibold leading-tight">{persona.label}</p>
            <p className="text-xs text-muted">{persona.description}</p>
          </div>
        </div>
        <span className="text-[10px] font-medium text-muted">
          Based on {decisionCount} decisions
        </span>
      </div>
      <p className="mt-3 text-sm text-ink/75 leading-relaxed">{persona.insight}</p>
    </div>
  );
}

function XPCard({
  levelInfo,
  className = "",
}: {
  levelInfo: ReturnType<typeof getLevelInfo>;
  className?: string;
}) {
  const { current, next, xpIntoLevel, xpForNextLevel, progressPct, totalXP } = levelInfo;
  const isMax = !next;

  const levelColor =
    current.level >= 9 ? "#D97706"
    : current.level >= 6 ? "#8B5CF6"
    : current.level >= 3 ? "#1F6FEB"
    : "#6B7280";

  const barColor =
    current.level >= 9 ? "linear-gradient(90deg, #D97706, #F59E0B)"
    : current.level >= 6 ? "linear-gradient(90deg, #7C3AED, #8B5CF6)"
    : current.level >= 3 ? "linear-gradient(90deg, #1F6FEB, #60A5FA)"
    : "linear-gradient(90deg, #6B7280, #9CA3AF)";

  return (
    <div className={`rounded-2xl border border-black/5 bg-white p-5 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            style={{ background: levelColor, opacity: 0.12, borderRadius: 10 }}
            className="absolute h-10 w-10"
            aria-hidden
          />
          <div
            style={{ background: `${levelColor}18`, border: `1px solid ${levelColor}30`, borderRadius: 10 }}
            className="flex h-10 w-10 items-center justify-center"
          >
            <span className="font-mono text-sm font-bold" style={{ color: levelColor }}>
              L{current.level}
            </span>
          </div>
          <div>
            <p className="font-semibold leading-tight" style={{ color: levelColor }}>
              {current.title}
            </p>
            <p className="text-xs text-muted">
              {totalXP.toLocaleString()} XP total
            </p>
          </div>
        </div>
        {next && (
          <div className="text-right">
            <p className="text-xs text-muted">Next: <span className="font-medium text-ink">{next.title}</span></p>
            <p className="text-xs text-muted">{xpIntoLevel.toLocaleString()} / {xpForNextLevel!.toLocaleString()} XP</p>
          </div>
        )}
        {isMax && (
          <span className="rounded-full bg-warn/10 px-2.5 py-1 text-xs font-semibold text-warn">
            Max level 🏆
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/6">
        <div
          style={{
            width: `${progressPct}%`,
            background: barColor,
            height: "100%",
            borderRadius: 99,
            transition: "width 800ms cubic-bezier(0.22,1,0.36,1)",
            boxShadow: `0 0 8px ${levelColor}55`,
          }}
        />
      </div>

      {/* XP source breakdown */}
      <div className="mt-3 flex gap-4 text-[11px] text-muted">
        <span>⚡ Challenges</span>
        <span>📖 Lessons</span>
        <span>✍️ Reflections</span>
        <span>🎯 Correct calls</span>
      </div>
    </div>
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
