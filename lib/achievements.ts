import type { DecisionRecord, LessonProgress } from "@/lib/types";
import { ALL_TRACKS } from "@/data/tracks";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "decisions" | "streaks" | "learning" | "trading";
}

export const ALL_ACHIEVEMENTS: Achievement[] = [
  // Decisions
  { id: "first-call",       title: "First Call",       description: "Make your first investment decision",       icon: "🎯", category: "decisions" },
  { id: "ten-decisions",    title: "Ten Reps",          description: "Complete 10 decisions",                     icon: "📋", category: "decisions" },
  { id: "fifty-decisions",  title: "Fifty Reps",        description: "Complete 50 decisions",                     icon: "📚", category: "decisions" },
  { id: "sharp-thinker",   title: "Sharp Thinker",     description: "Score 80+ on a reasoning evaluation",       icon: "🧠", category: "decisions" },
  { id: "top-analyst",     title: "Top Analyst",       description: "Score 95+ on a reasoning evaluation",       icon: "⭐", category: "decisions" },
  // Outcomes
  { id: "proven-right",    title: "Proven Right",      description: "Get your first CORRECT outcome",            icon: "✅", category: "decisions" },
  { id: "hot-streak",      title: "Hot Streak",        description: "5 consecutive CORRECT outcomes",            icon: "🎯", category: "decisions" },
  // Streaks
  { id: "streak-3",        title: "On a Roll",         description: "3-day training streak",                     icon: "🔥", category: "streaks" },
  { id: "streak-7",        title: "Week Warrior",      description: "7-day training streak",                     icon: "🔥", category: "streaks" },
  { id: "streak-30",       title: "Monthly Grind",     description: "30-day training streak",                    icon: "🔥", category: "streaks" },
  // Learning
  { id: "first-lesson",    title: "First Lesson",      description: "Complete your first lesson",                icon: "📖", category: "learning" },
  { id: "perfectionist",   title: "Perfectionist",     description: "Score 100% on a lesson practice quiz",      icon: "🏆", category: "learning" },
  { id: "track-graduate",  title: "Track Graduate",    description: "Complete all lessons in a track",           icon: "🎓", category: "learning" },
  { id: "scholar",         title: "Scholar",           description: "Complete all three learning tracks",        icon: "🎓", category: "learning" },
  // Trading
  { id: "first-trade",     title: "First Trade",       description: "Make your first paper trade",               icon: "📈", category: "trading" },
  { id: "in-the-black",    title: "In the Black",      description: "Grow your paper portfolio by 5%+",          icon: "💰", category: "trading" },
  { id: "market-beater",   title: "Market Beater",     description: "Outperform SPY with your portfolio",        icon: "🚀", category: "trading" },
];

export interface AchievementContext {
  decisions?: DecisionRecord[];
  lessonProgress?: LessonProgress[];
  streak?: number;
  hasTrades?: boolean;
  portfolioReturnPct?: number;
  spyReturnPct?: number;
}

export function computeEligibleAchievements(ctx: AchievementContext): string[] {
  const {
    decisions = [],
    lessonProgress = [],
    streak,
    hasTrades,
    portfolioReturnPct,
    spyReturnPct,
  } = ctx;

  const eligible: string[] = [];
  const withEval = decisions.filter((d) => d.evaluation);

  // Decision milestones
  if (withEval.length >= 1)  eligible.push("first-call");
  if (withEval.length >= 10) eligible.push("ten-decisions");
  if (withEval.length >= 50) eligible.push("fifty-decisions");

  const scores = withEval.map((d) => d.evaluation!.reasoningScore);
  if (scores.some((s) => s >= 80)) eligible.push("sharp-thinker");
  if (scores.some((s) => s >= 95)) eligible.push("top-analyst");

  // Outcome milestones
  const withOutcome = decisions
    .filter((d) => d.outcomeVerdict && d.outcomeVerdict !== "NEUTRAL")
    .sort((a, b) => b.timestamp - a.timestamp);
  if (withOutcome.some((d) => d.outcomeVerdict === "CORRECT")) eligible.push("proven-right");
  if (
    withOutcome.length >= 5 &&
    withOutcome.slice(0, 5).every((d) => d.outcomeVerdict === "CORRECT")
  ) {
    eligible.push("hot-streak");
  }

  // Streak milestones
  if (streak !== undefined) {
    if (streak >= 3)  eligible.push("streak-3");
    if (streak >= 7)  eligible.push("streak-7");
    if (streak >= 30) eligible.push("streak-30");
  }

  // Learning milestones
  const completedLessons = lessonProgress.filter((p) => p.completedAt);
  if (completedLessons.length >= 1) eligible.push("first-lesson");
  if (completedLessons.some((p) => p.practiceScore === p.practiceTotal && p.practiceTotal > 0)) {
    eligible.push("perfectionist");
  }
  const trackGraduated = ALL_TRACKS.some((track) =>
    track.lessons.every((l) => completedLessons.some((p) => p.lessonId === l.id)),
  );
  if (trackGraduated) eligible.push("track-graduate");
  const allTracksDone = ALL_TRACKS.every((track) =>
    track.lessons.every((l) => completedLessons.some((p) => p.lessonId === l.id)),
  );
  if (allTracksDone) eligible.push("scholar");

  // Trading milestones
  if (hasTrades) eligible.push("first-trade");
  if (portfolioReturnPct !== undefined && portfolioReturnPct >= 5) eligible.push("in-the-black");
  if (
    portfolioReturnPct !== undefined &&
    spyReturnPct !== undefined &&
    portfolioReturnPct > spyReturnPct
  ) {
    eligible.push("market-beater");
  }

  return eligible;
}
