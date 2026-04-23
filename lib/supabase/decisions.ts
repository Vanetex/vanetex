import { createClient } from "./client";
import type { Action, DecisionRecord, Evaluation, Reflection } from "../types";

/**
 * Server-backed CRUD for the decisions table.
 * Mirrors the old lib/storage.ts API so pages can swap with minimal changes.
 * All operations go through the browser Supabase client (RLS enforced).
 */

type DecisionRow = {
  id: string;
  user_id: string;
  scenario_id: string;
  ticker: string;
  company: string;
  action: string;
  confidence: number;
  reasoning: string;
  reasoning_score: number | null;
  decision_score: number | null;
  did_well: string[] | null;
  missed: string[] | null;
  improvement: string | null;
  tags: string[] | null;
  ideal_answer: string | null;
  outcome_return_pct: number | null;
  outcome_verdict: string | null;
  reflection_missed: string | null;
  reflection_differently: string | null;
  reflection_key_signal: string | null;
  reflection_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Convert a DB row to the app's DecisionRecord shape. */
function rowToRecord(r: DecisionRow): DecisionRecord {
  const record: DecisionRecord = {
    id: r.id,
    scenarioId: r.scenario_id,
    ticker: r.ticker,
    company: r.company,
    action: r.action as Action,
    confidence: r.confidence,
    reasoning: r.reasoning,
    timestamp: new Date(r.created_at).getTime(),
  };

  if (r.reasoning_score !== null && r.decision_score !== null) {
    record.evaluation = {
      reasoningScore: r.reasoning_score,
      decisionScore: r.decision_score,
      didWell: r.did_well ?? [],
      missed: r.missed ?? [],
      improvement: r.improvement ?? "",
      tags: r.tags ?? [],
      idealAnswer: r.ideal_answer ?? undefined,
    };
  }

  if (r.outcome_return_pct !== null) {
    record.outcomeReturnPct = Number(r.outcome_return_pct);
  }
  if (r.outcome_verdict) {
    record.outcomeVerdict = r.outcome_verdict as DecisionRecord["outcomeVerdict"];
  }

  if (r.reflection_missed || r.reflection_differently || r.reflection_key_signal) {
    record.reflection = {
      missed: r.reflection_missed ?? "",
      differently: r.reflection_differently ?? "",
      keySignal: r.reflection_key_signal ?? "",
      timestamp: r.reflection_at ? new Date(r.reflection_at).getTime() : Date.now(),
    };
  }

  return record;
}

/** Get the decision for a specific scenario for the current user, if it exists. */
export async function getDecisionForScenario(
  scenarioId: string,
): Promise<DecisionRecord | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("decisions")
    .select("*")
    .eq("scenario_id", scenarioId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return undefined;
  return rowToRecord(data as DecisionRow);
}

/** List all decisions for the current user, newest first. */
export async function listDecisions(): Promise<DecisionRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("decisions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[decisions] listDecisions error:", error.message);
    return [];
  }

  return (data as DecisionRow[]).map(rowToRecord);
}

/** Get a single decision by ID. */
export async function getDecision(id: string): Promise<DecisionRecord | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("decisions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return undefined;
  return rowToRecord(data as DecisionRow);
}

/** Create a new decision record. Returns the DB-generated UUID. */
export async function saveDecision(params: {
  scenarioId: string;
  ticker: string;
  company: string;
  action: Action;
  confidence: number;
  reasoning: string;
}): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("decisions")
    .insert({
      user_id: user.id,
      scenario_id: params.scenarioId,
      ticker: params.ticker,
      company: params.company,
      action: params.action,
      confidence: params.confidence,
      reasoning: params.reasoning,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[decisions] saveDecision error:", error.message);
    return null;
  }

  return data?.id ?? null;
}

/** Attach AI evaluation scores to a decision. */
export async function attachEvaluation(id: string, evaluation: Evaluation): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("decisions")
    .update({
      reasoning_score: evaluation.reasoningScore,
      decision_score: evaluation.decisionScore,
      did_well: evaluation.didWell,
      missed: evaluation.missed,
      improvement: evaluation.improvement,
      tags: evaluation.tags,
      ideal_answer: evaluation.idealAnswer ?? null,
    })
    .eq("id", id);

  if (error) {
    console.error("[decisions] attachEvaluation error:", error.message);
  }
}

/** Attach outcome data after the reveal. */
export async function attachOutcome(
  id: string,
  outcomeReturnPct: number,
  verdict: "CORRECT" | "INCORRECT" | "NEUTRAL",
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("decisions")
    .update({
      outcome_return_pct: outcomeReturnPct,
      outcome_verdict: verdict,
    })
    .eq("id", id);

  if (error) {
    console.error("[decisions] attachOutcome error:", error.message);
  }
}

/** Attach reflection after the user journals. */
export async function attachReflection(id: string, reflection: Reflection): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("decisions")
    .update({
      reflection_missed: reflection.missed,
      reflection_differently: reflection.differently,
      reflection_key_signal: reflection.keySignal,
      reflection_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("[decisions] attachReflection error:", error.message);
  }
}
