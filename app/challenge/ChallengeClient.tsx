"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ScenarioCard from "@/components/ScenarioCard";
import DecisionInput from "@/components/DecisionInput";
import FeedbackPanel from "@/components/FeedbackPanel";
import OutcomePanel from "@/components/OutcomePanel";
import ReflectionPrompt from "@/components/ReflectionPrompt";
import { verdictFor, computeStreak } from "@/lib/scoring";
import { listDecisions,
  saveDecision,
  attachEvaluation,
  attachOutcome,
  attachReflection,
  getDecisionForScenario,
} from "@/lib/supabase/decisions";
import { listAwardedAchievements, awardAchievements } from "@/lib/supabase/achievements";
import { computeEligibleAchievements } from "@/lib/achievements";
import AchievementToast from "@/components/AchievementToast";
import type {
  Action,
  Evaluation,
  Reflection,
  Scenario,
} from "@/lib/types";

type Stage = "loading" | "deciding" | "evaluating" | "feedback" | "outcome" | "done";

export default function ChallengeClient({ scenario }: { scenario: Scenario }) {
  const [stage, setStage] = useState<Stage>("loading");
  const [decisionId, setDecisionId] = useState<string | null>(null);
  const [action, setAction] = useState<Action | null>(null);
  const [confidence, setConfidence] = useState<number>(5);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function checkExisting() {
      const existing = await getDecisionForScenario(scenario.id);
      if (cancelled) return;

      if (!existing) {
        setStage("deciding");
        return;
      }

      setDecisionId(existing.id);
      setAction(existing.action);
      setConfidence(existing.confidence);

      if (existing.evaluation) setEvaluation(existing.evaluation);

      if (existing.reflection) {
        setReflectionSaved(true);
        setStage("done");
      } else if (existing.outcomeVerdict) {
        setStage("outcome");
      } else if (existing.evaluation) {
        setStage("feedback");
      } else {
        setStage("deciding");
      }
    }

    checkExisting();
    return () => { cancelled = true; };
  }, [scenario.id]);

  useEffect(() => {
    if (stage !== "done") return;
    listDecisions().then(async (all) => {
      const s = computeStreak(all);
      setStreak(s);
      const eligible = computeEligibleAchievements({ decisions: all, streak: s });
      const awarded = await listAwardedAchievements();
      const awardedSet = new Set(awarded.map((a) => a.id));
      const toAward = eligible.filter((id) => !awardedSet.has(id));
      const newlyAwarded = await awardAchievements(toAward);
      if (newlyAwarded.length > 0) setNewAchievements(newlyAwarded);
    });
  }, [stage]);

  async function handleSubmit({
    action,
    confidence,
    reasoning,
  }: {
    action: Action;
    confidence: number;
    reasoning: string;
  }) {
    setError(null);
    setAction(action);
    setConfidence(confidence);

    const id = await saveDecision({
      scenarioId: scenario.id,
      ticker: scenario.ticker,
      company: scenario.company,
      action,
      confidence,
      reasoning,
    });

    if (!id) {
      setError("Failed to save decision. Are you signed in?");
      return;
    }

    setDecisionId(id);
    setStage("evaluating");

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scenarioId: scenario.id, action, confidence, reasoning }),
      });
      if (!res.ok) throw new Error(await readErrorMessage(res));
      const ev: Evaluation = await res.json();
      await attachEvaluation(id, ev);
      setEvaluation(ev);
      setStage("feedback");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Evaluation failed.");
      setStage("deciding");
    }
  }

  async function revealOutcome() {
    if (!decisionId || !action) return;
    const ret = scenario.outcome.returnPct;
    const v = verdictFor(action, ret);
    await attachOutcome(decisionId, ret, v);
    setStage("outcome");
  }

  async function saveReflectionHandler(r: Reflection) {
    if (!decisionId) return;
    await attachReflection(decisionId, r);
    setReflectionSaved(true);
    setStage("done");
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">
          Today&rsquo;s challenge
        </h1>
        <Link href="/journal" className="text-xs text-muted hover:text-ink">
          Journal →
        </Link>
      </div>

      {stage === "loading" && (
        <div className="animate-pulse space-y-3">
          <div className="h-40 rounded-3xl bg-black/5" />
          <div className="h-24 rounded-3xl bg-black/5" />
        </div>
      )}

      {stage !== "loading" && <ScenarioCard scenario={scenario} />}

      {error && (
        <div className="mt-4 rounded-xl border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      {stage === "deciding" && (
        <DecisionInput onSubmit={handleSubmit} submitting={false} />
      )}

      {stage === "evaluating" && (
        <div className="surface-card fade-in mt-6 rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">
              🧠 Analyst is reviewing your call…
            </div>
            <div className="text-xs text-muted">This usually takes 5–10s</div>
          </div>
          <div className="progress-bar mt-3 h-1.5" />
          <p className="mt-3 text-xs text-muted">
            Looking at valuation, growth vs margins, risk framing, and whether
            your confidence matches the evidence.
          </p>
        </div>
      )}

      {(stage === "feedback" || stage === "outcome" || stage === "done") &&
        evaluation && <FeedbackPanel evaluation={evaluation} />}

      {stage === "feedback" && (
        <div className="mt-4 text-center">
          <button
            onClick={revealOutcome}
            className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 font-medium text-paper shadow-sm transition hover:bg-accent/90"
          >
            Reveal what happened next →
          </button>
        </div>
      )}

      {(stage === "outcome" || stage === "done") && action && (
        <OutcomePanel
          scenario={scenario}
          action={action}
          confidence={confidence}
          evaluation={evaluation ?? undefined}
          showIdeal
        />
      )}

      {stage === "outcome" && (
        <ReflectionPrompt onSave={saveReflectionHandler} saved={reflectionSaved} />
      )}

      {newAchievements.length > 0 && <AchievementToast newIds={newAchievements} />}

      {stage === "done" && (
        <div className="surface-card fade-in mt-6 flex flex-col items-center gap-3 rounded-3xl p-6 text-center">
          <div className="text-lg font-semibold">Nice work. 🎯</div>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 rounded-full border border-warn/30 bg-warn/10 px-3 py-1 text-sm font-medium text-warn">
              <span>🔥</span>
              <span>{streak} day streak</span>
            </div>
          )}
          <p className="max-w-md text-sm text-muted">
            Come back tomorrow for a new scenario. Judgment compounds with reps.
          </p>
          <div className="mt-2 flex gap-3">
            <Link
              href="/progress"
              className="cta-primary rounded-full px-5 py-2 text-sm font-medium text-paper"
            >
              See progress
            </Link>
            <Link
              href="/journal"
              className="rounded-full border border-black/10 px-5 py-2 text-sm font-medium hover:border-black/30"
            >
              Read journal
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data: unknown = await res.json();
    if (data && typeof data === "object") {
      const error = (data as { error?: unknown }).error;
      if (typeof error === "string" && error.trim()) return error;
    }
  } catch {
    // ignore
  }
  return `Evaluator returned ${res.status}`;
}
