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
      const [existing, allDecisions] = await Promise.all([
        getDecisionForScenario(scenario.id),
        listDecisions(),
      ]);
      if (cancelled) return;

      setStreak(computeStreak(allDecisions));

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

      {streak > 0 && stage !== "loading" && <StreakBanner streak={streak} />}

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

      {stage === "done" && action && (
        <ShareCard
          scenario={scenario}
          action={action}
          evaluation={evaluation}
          streak={streak}
        />
      )}
    </section>
  );
}

function StreakBanner({ streak }: { streak: number }) {
  const milestones = [3, 7, 30];
  const nextMilestone = milestones.find((m) => m > streak) ?? null;
  const prevMilestone = [...milestones].reverse().find((m) => m <= streak) ?? 0;
  const progress = nextMilestone
    ? ((streak - prevMilestone) / (nextMilestone - prevMilestone)) * 100
    : 100;
  const milestoneNames: Record<number, string> = { 3: "On a Roll", 7: "Week Warrior", 30: "Monthly Grind" };

  return (
    <div
      className="fade-in mb-5 overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(135deg, #78350f 0%, #92400e 40%, #b45309 100%)",
        border: "1px solid rgba(251,191,36,0.22)",
        boxShadow: "0 8px 28px rgba(180,83,9,0.4), 0 0 0 1px rgba(251,191,36,0.08)",
        position: "relative",
      }}
    >
      <div aria-hidden style={{
        position: "absolute", top: -30, left: -20,
        width: 140, height: 140, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(251,191,36,0.15), transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="streak-fire" style={{ fontSize: 30, lineHeight: 1 }}>🔥</span>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 30, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.03em" }}>
                  {streak}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>
                  day streak
                </span>
              </div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                {nextMilestone
                  ? `${nextMilestone - streak} more day${nextMilestone - streak !== 1 ? "s" : ""} to ${milestoneNames[nextMilestone]}`
                  : "Legend — 30-day streak achieved 🏆"}
              </p>
            </div>
          </div>
          <div style={{
            background: "rgba(0,0,0,0.2)",
            borderRadius: 10, padding: "6px 12px", textAlign: "center",
          }}>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {nextMilestone ? "next" : "max"}
            </p>
            <p style={{ fontSize: 15, fontWeight: 800, color: nextMilestone ? "#fbbf24" : "#fff" }}>
              {nextMilestone ?? "∞"}
            </p>
          </div>
        </div>

        {nextMilestone && (
          <div style={{ marginTop: 14 }}>
            <div style={{ height: 5, borderRadius: 99, background: "rgba(0,0,0,0.3)", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 99,
                width: `${progress}%`,
                background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
                boxShadow: "0 0 10px rgba(251,191,36,0.55)",
                transition: "width 700ms cubic-bezier(0.22,1,0.36,1)",
              }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ShareCard({
  scenario,
  action,
  evaluation,
  streak,
}: {
  scenario: Scenario;
  action: Action;
  evaluation: Evaluation | null;
  streak: number;
}) {
  const [copied, setCopied] = useState(false);

  const score = evaluation?.decisionScore ?? null;
  const verdict = verdictFor(action, scenario.outcome.returnPct);
  const correct = verdict === "CORRECT";
  const neutral = verdict === "NEUTRAL";

  const scoreLabel =
    score === null ? null
    : score >= 70 ? "Sharp"
    : score >= 45 ? "Solid"
    : "Keep practicing";

  const actionColor =
    action === "BUY" ? "#16A34A"
    : action === "PASS" ? "#DC2626"
    : "#D97706";

  const verdictEmoji = correct ? "✅" : neutral ? "➡️" : "❌";

  const shareText = [
    `🎯 Vanetex Daily Challenge`,
    ``,
    `${scenario.company} · $${scenario.ticker}`,
    `My call: ${action} ${verdictEmoji}`,
    score !== null ? `Score: ${score}/100${scoreLabel ? ` — ${scoreLabel}` : ""}` : "",
    streak > 0 ? `🔥 ${streak}-day streak` : "",
    ``,
    `vanetex.vercel.app`,
  ].filter(Boolean).join("\n");

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text: shareText });
        return;
      } catch {
        // user cancelled or not supported — fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fade-in mt-6 space-y-3">
      {/* Share card — designed to look good as a screenshot */}
      <div
        style={{
          background: "linear-gradient(145deg, #0d0f18 0%, #07080b 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 24,
          padding: "28px 28px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow */}
        <div aria-hidden style={{
          position: "absolute", top: -40, right: -40,
          width: 160, height: 160, borderRadius: "50%",
          background: `radial-gradient(circle, ${actionColor}22, transparent 70%)`,
          pointerEvents: "none",
        }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 8,
              background: "linear-gradient(135deg, #1F6FEB, #0d3ba8)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
                <path d="M 2 2 L 10 20 L 13 20 L 13 14 L 16 14 L 16 8 L 19 8 L 19 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <span style={{ color: "rgba(250,250,247,0.5)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Vanetex</span>
          </div>
          {streak > 0 && (
            <span style={{ fontSize: 12, fontWeight: 600, color: "#D97706" }}>🔥 {streak}-day streak</span>
          )}
        </div>

        {/* Company + ticker */}
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: "#FAFAF7", letterSpacing: "-0.02em", marginBottom: 2 }}>
            {scenario.company}
          </p>
          <p style={{ fontSize: 13, color: "rgba(250,250,247,0.4)", fontFamily: "monospace" }}>${scenario.ticker}</p>
        </div>

        {/* Call + outcome */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: score !== null ? 18 : 0 }}>
          <div style={{
            background: `${actionColor}18`,
            border: `1px solid ${actionColor}40`,
            borderRadius: 10, padding: "8px 16px",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: actionColor, letterSpacing: "0.04em" }}>{action}</span>
          </div>
          <span style={{ fontSize: 18 }}>{verdictEmoji}</span>
          <span style={{ fontSize: 13, color: correct ? "#16A34A" : neutral ? "rgba(250,250,247,0.4)" : "#DC2626", fontWeight: 600 }}>
            {correct ? "Correct call" : neutral ? "Neutral" : "Incorrect call"}
          </span>
        </div>

        {/* Score bar */}
        {score !== null && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "rgba(250,250,247,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Score</span>
              <span style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 800, color: score >= 70 ? "#16A34A" : score >= 45 ? "#D97706" : "#DC2626" }}>
                {score}<span style={{ fontSize: 12, color: "rgba(250,250,247,0.3)" }}>/100</span>
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 99, width: `${score}%`,
                background: score >= 70 ? "#16A34A" : score >= 45 ? "#D97706" : "#DC2626",
                transition: "width 600ms ease",
              }} />
            </div>
            {scoreLabel && (
              <p style={{ fontSize: 12, color: "rgba(250,250,247,0.35)", marginTop: 6, textAlign: "right" }}>{scoreLabel}</p>
            )}
          </div>
        )}
      </div>

      {/* Share button */}
      <button
        onClick={handleShare}
        className="w-full rounded-2xl border border-black/10 bg-white py-3 text-sm font-semibold transition hover:border-black/20 hover:bg-black/[0.02]"
      >
        {copied ? "Copied to clipboard ✓" : "Share result"}
      </button>

      {/* Nav links */}
      <div className="flex gap-3">
        <Link href="/profile" className="cta-primary flex-1 rounded-full py-2.5 text-center text-sm font-medium text-paper">
          See progress
        </Link>
        <Link href="/journal" className="flex-1 rounded-full border border-black/10 py-2.5 text-center text-sm font-medium hover:border-black/30">
          Journal
        </Link>
      </div>
    </div>
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
