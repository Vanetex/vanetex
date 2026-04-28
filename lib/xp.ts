import type { DecisionRecord, LessonProgress } from "@/lib/types";

// ---------------------------------------------------------------------------
// Level definitions
// ---------------------------------------------------------------------------

export const LEVELS = [
  { level: 1,  title: "Intern",             xpRequired: 0       },
  { level: 2,  title: "Analyst",            xpRequired: 200     },
  { level: 3,  title: "Associate",          xpRequired: 500     },
  { level: 4,  title: "VP",                 xpRequired: 2_000   },
  { level: 5,  title: "Director",           xpRequired: 5_000   },
  { level: 6,  title: "Managing Director",  xpRequired: 10_000  },
  { level: 7,  title: "Partner",            xpRequired: 25_000  },
  { level: 8,  title: "Fund Manager",       xpRequired: 50_000  },
  { level: 9,  title: "Portfolio Manager",  xpRequired: 100_000 },
  { level: 10, title: "CEO",                xpRequired: 250_000 },
] as const;

export type LevelInfo = {
  level: number;
  title: string;
  xpRequired: number;
};

// ---------------------------------------------------------------------------
// XP rules
// ---------------------------------------------------------------------------

export const XP_RULES = {
  challengeBase:    50,   // completing any challenge
  reasoningBonus:   0.5,  // multiplier on reasoningScore (max +50 at 100)
  correctCall:      25,
  reflection:       30,
  streakDayBonus:   3,    // per day of streak (capped at 90 = 30-day streak)
  lessonComplete:   40,
  perfectQuiz:      20,
} as const;

// ---------------------------------------------------------------------------
// Compute total lifetime XP from stored records
// ---------------------------------------------------------------------------

export function computeXP(
  decisions: DecisionRecord[],
  lessonProgress: LessonProgress[],
): number {
  let xp = 0;

  for (const d of decisions) {
    if (!d.evaluation) continue;
    xp += XP_RULES.challengeBase;
    xp += Math.round(d.evaluation.reasoningScore * XP_RULES.reasoningBonus);
    if (d.outcomeVerdict === "CORRECT") xp += XP_RULES.correctCall;
    if (d.reflection) xp += XP_RULES.reflection;
  }

  for (const p of lessonProgress) {
    if (p.completedAt) xp += XP_RULES.lessonComplete;
    if (p.practiceScore === p.practiceTotal && p.practiceTotal > 0) {
      xp += XP_RULES.perfectQuiz;
    }
  }

  return xp;
}

// ---------------------------------------------------------------------------
// Level lookup from total XP
// ---------------------------------------------------------------------------

export function getLevelInfo(totalXP: number): {
  current: LevelInfo;
  next: LevelInfo | null;
  xpIntoLevel: number;
  xpForNextLevel: number | null;
  progressPct: number;
  totalXP: number;
} {
  let currentIdx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].xpRequired) { currentIdx = i; break; }
  }

  const current = LEVELS[currentIdx];
  const next = currentIdx < LEVELS.length - 1 ? LEVELS[currentIdx + 1] : null;
  const xpIntoLevel = totalXP - current.xpRequired;
  const xpForNextLevel = next ? next.xpRequired - current.xpRequired : null;
  const progressPct = xpForNextLevel ? Math.min((xpIntoLevel / xpForNextLevel) * 100, 100) : 100;

  return { current, next, xpIntoLevel, xpForNextLevel, progressPct, totalXP };
}

// ---------------------------------------------------------------------------
// Per-session XP breakdown (shown after challenge completion)
// ---------------------------------------------------------------------------

export type XPBreakdownItem = { label: string; xp: number };

export function computeSessionXP(
  decision: DecisionRecord,
  streak: number,
): { total: number; breakdown: XPBreakdownItem[] } {
  const breakdown: XPBreakdownItem[] = [];

  breakdown.push({ label: "Challenge completed", xp: XP_RULES.challengeBase });

  if (decision.evaluation) {
    const bonus = Math.round(decision.evaluation.reasoningScore * XP_RULES.reasoningBonus);
    if (bonus > 0) {
      breakdown.push({ label: `Reasoning score (${decision.evaluation.reasoningScore}/100)`, xp: bonus });
    }
  }

  if (decision.outcomeVerdict === "CORRECT") {
    breakdown.push({ label: "Correct call", xp: XP_RULES.correctCall });
  }

  if (decision.reflection) {
    breakdown.push({ label: "Reflection written", xp: XP_RULES.reflection });
  }

  const streakBonus = Math.min(streak * XP_RULES.streakDayBonus, 90);
  if (streakBonus > 0) {
    breakdown.push({ label: `${streak}-day streak bonus`, xp: streakBonus });
  }

  const total = breakdown.reduce((s, b) => s + b.xp, 0);
  return { total, breakdown };
}
