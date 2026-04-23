import type { Action, DecisionRecord, ProgressSnapshot } from "./types";

/**
 * Count the current daily streak: consecutive calendar days (ending today or
 * yesterday) where the user completed the full challenge loop (reflection saved).
 */
export function computeStreak(records: DecisionRecord[]): number {
  const completedDays = new Set(
    records
      .filter((r) => r.reflection)
      .map((r) => {
        const d = new Date(r.timestamp);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      }),
  );

  const today = new Date();
  let streak = 0;
  const cursor = new Date(today);

  const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  // If today isn't done yet, the active streak is measured from yesterday
  if (!completedDays.has(key(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (completedDays.has(key(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

/**
 * Map an outcome return % against the user's action to a verdict.
 *
 * Heuristic:
 *   BUY  + return >= +3%  => CORRECT
 *   BUY  + return <= -3%  => INCORRECT
 *   PASS + return <= -3%  => CORRECT  (they avoided a loss)
 *   PASS + return >= +5%  => INCORRECT (they missed an opportunity)
 *   HOLD — we only consider it CORRECT on flattish moves, else NEUTRAL
 *   anything else         => NEUTRAL
 *
 * These are deliberately loose — the goal is learning, not exam grading.
 */
export function verdictFor(
  action: Action,
  returnPct: number,
): "CORRECT" | "INCORRECT" | "NEUTRAL" {
  if (action === "BUY") {
    if (returnPct >= 3) return "CORRECT";
    if (returnPct <= -3) return "INCORRECT";
    return "NEUTRAL";
  }
  if (action === "PASS") {
    if (returnPct <= -3) return "CORRECT";
    if (returnPct >= 5) return "INCORRECT";
    return "NEUTRAL";
  }
  // HOLD
  if (Math.abs(returnPct) <= 4) return "CORRECT";
  if (returnPct <= -10 || returnPct >= 10) return "INCORRECT";
  return "NEUTRAL";
}

/** Level bands match the spec (Beginner / Intermediate / Advanced). */
export function levelFor(score: number): ProgressSnapshot["level"] {
  if (score <= 40) return "Beginner";
  if (score <= 70) return "Intermediate";
  return "Advanced";
}

export function computeProgress(records: DecisionRecord[]): ProgressSnapshot {
  const sorted = [...records].sort((a, b) => b.timestamp - a.timestamp);
  const evaluated = sorted.filter((r) => r.evaluation);
  const lastFive = evaluated.slice(0, 5); // newest-first after defensive sort
  const skillScore =
    lastFive.length === 0
      ? 0
      : Math.round(
          lastFive.reduce((s, r) => s + (r.evaluation?.decisionScore ?? 0), 0) /
            lastFive.length,
        );

  // Accuracy ignores NEUTRAL verdicts — they're neither wins nor losses.
  const judged = sorted.filter(
    (r) => r.outcomeVerdict && r.outcomeVerdict !== "NEUTRAL",
  );
  const correct = judged.filter((r) => r.outcomeVerdict === "CORRECT").length;
  const decisionAccuracyPct = judged.length
    ? Math.round((correct / judged.length) * 100)
    : 0;

  // Confidence calibration: of high-confidence (>=7) decisions, how many were correct?
  const highConf = sorted.filter(
    (r) => r.confidence >= 7 && r.outcomeVerdict && r.outcomeVerdict !== "NEUTRAL",
  );
  const highConfCorrect = highConf.filter(
    (r) => r.outcomeVerdict === "CORRECT",
  ).length;
  const calibration = highConf.length
    ? Math.round((highConfCorrect / highConf.length) * 100)
    : 0;

  // Trend: compare skillScore of last 3 vs the 3 before that.
  const recent = evaluated.slice(0, 3);
  const prior = evaluated.slice(3, 6);
  const avg = (xs: DecisionRecord[]) =>
    xs.length
      ? xs.reduce((s, r) => s + (r.evaluation?.decisionScore ?? 0), 0) / xs.length
      : 0;
  const diff = avg(recent) - avg(prior);
  let trend: ProgressSnapshot["trend"] = "steady";
  if (prior.length >= 2) {
    if (diff >= 5) trend = "improving";
    else if (diff <= -5) trend = "declining";
  }

  return {
    totalDecisions: sorted.length,
    skillScore,
    decisionAccuracyPct,
    calibration,
    level: levelFor(skillScore),
    trend,
  };
}
