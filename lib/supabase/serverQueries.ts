/**
 * Server-side data fetching functions.
 * Only usable in Server Components and Route Handlers — never in "use client" files.
 *
 * Caching strategy:
 *   - unstable_cache wrappers are defined at module level (stable references — required for cache to hit)
 *   - Token is passed through a module-level Map so it never becomes part of the cache key
 *     (avoids cache misses on hourly token refreshes)
 *   - TTL: 60 s. First navigation fetches; repeat visits within 60 s are instant.
 *   - In `next dev` the Data Cache is disabled — caching only activates in `next start`.
 */

import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Action, DecisionRecord, Evaluation, LessonProgress } from "@/lib/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Stores the latest access token per userId so cached functions can use it
// without the token appearing in the cache key.
const tokenStore = new Map<string, string>();

async function restGet(path: string, userId: string): Promise<unknown[]> {
  const token = tokenStore.get(userId) ?? "";
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return res.ok ? res.json() : [];
}

// ---------------------------------------------------------------------------
// Module-level cached functions (stable references — MUST be at module scope)
// ---------------------------------------------------------------------------

const _cachedDecisions = unstable_cache(
  (uid: string) => restGet("decisions?order=created_at.desc&select=*", uid),
  ["decisions"],
  { revalidate: 60 },
);

const _cachedLessonProgress = unstable_cache(
  (uid: string) => restGet("lesson_progress?order=created_at.asc&select=*", uid),
  ["lesson_progress"],
  { revalidate: 60 },
);

const _cachedAchievements = unstable_cache(
  (uid: string) => restGet("achievements?order=awarded_at.desc&select=id,awarded_at", uid),
  ["achievements"],
  { revalidate: 60 },
);

const _cachedCareerField = unstable_cache(
  (uid: string) => restGet(`profiles?id=eq.${uid}&select=career_field&limit=1`, uid),
  ["career_field"],
  { revalidate: 60 },
);

// ---------------------------------------------------------------------------
// Internal row types
// ---------------------------------------------------------------------------

type DecisionRow = {
  id: string; scenario_id: string; ticker: string; company: string;
  action: string; confidence: number; reasoning: string;
  reasoning_score: number | null; decision_score: number | null;
  did_well: string[] | null; missed: string[] | null;
  improvement: string | null; tags: string[] | null;
  ideal_answer: string | null; outcome_return_pct: number | null;
  outcome_verdict: string | null; reflection_missed: string | null;
  reflection_differently: string | null; reflection_key_signal: string | null;
  reflection_at: string | null; created_at: string;
};

function rowToRecord(r: DecisionRow): DecisionRecord {
  const record: DecisionRecord = {
    id: r.id, scenarioId: r.scenario_id, ticker: r.ticker, company: r.company,
    action: r.action as Action, confidence: r.confidence, reasoning: r.reasoning,
    timestamp: new Date(r.created_at).getTime(),
  };
  if (r.reasoning_score !== null && r.decision_score !== null) {
    record.evaluation = {
      reasoningScore: r.reasoning_score, decisionScore: r.decision_score,
      didWell: r.did_well ?? [], missed: r.missed ?? [],
      improvement: r.improvement ?? "", tags: r.tags ?? [],
      idealAnswer: r.ideal_answer ?? undefined,
    } satisfies Evaluation;
  }
  if (r.outcome_return_pct !== null) record.outcomeReturnPct = Number(r.outcome_return_pct);
  if (r.outcome_verdict) record.outcomeVerdict = r.outcome_verdict as DecisionRecord["outcomeVerdict"];
  if (r.reflection_missed || r.reflection_differently || r.reflection_key_signal) {
    record.reflection = {
      missed: r.reflection_missed ?? "", differently: r.reflection_differently ?? "",
      keySignal: r.reflection_key_signal ?? "",
      timestamp: r.reflection_at ? new Date(r.reflection_at).getTime() : Date.now(),
    };
  }
  return record;
}

type LessonProgressRow = {
  track_id: string; lesson_id: string; practice_score: number;
  practice_total: number; application_completed: boolean; completed_at: string | null;
};

function rowToProgress(r: LessonProgressRow): LessonProgress {
  return {
    lessonId: r.lesson_id, trackId: r.track_id,
    practiceScore: r.practice_score, practiceTotal: r.practice_total,
    applicationCompleted: r.application_completed,
    completedAt: r.completed_at ? new Date(r.completed_at).getTime() : 0,
  };
}

// ---------------------------------------------------------------------------
// Session helper
// ---------------------------------------------------------------------------

async function getSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ---------------------------------------------------------------------------
// Public fetchers — set token store, then call module-level cache
// ---------------------------------------------------------------------------

export async function serverListDecisions(): Promise<DecisionRecord[]> {
  const session = await getSession();
  if (!session) return [];
  tokenStore.set(session.user.id, session.access_token);
  const rows = await _cachedDecisions(session.user.id);
  return (rows as DecisionRow[]).map(rowToRecord);
}

export async function serverListLessonProgress(): Promise<LessonProgress[]> {
  const session = await getSession();
  if (!session) return [];
  tokenStore.set(session.user.id, session.access_token);
  const rows = await _cachedLessonProgress(session.user.id);
  return (rows as LessonProgressRow[]).map(rowToProgress);
}

export async function serverListAwardedAchievements(): Promise<{ id: string; awarded_at: string }[]> {
  const session = await getSession();
  if (!session) return [];
  tokenStore.set(session.user.id, session.access_token);
  return _cachedAchievements(session.user.id) as Promise<{ id: string; awarded_at: string }[]>;
}

export async function serverGetCareerField(): Promise<string | null> {
  const session = await getSession();
  if (!session) return null;
  tokenStore.set(session.user.id, session.access_token);
  const rows = await _cachedCareerField(session.user.id) as { career_field?: string | null }[];
  return rows[0]?.career_field ?? null;
}
