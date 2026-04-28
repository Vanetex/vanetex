"use client";

import { useEffect, useState } from "react";
import type { Action, Evaluation, Scenario } from "@/lib/types";
import { verdictFor } from "@/lib/scoring";

interface Props {
  scenario: Scenario;
  action: Action;
  confidence: number;
  evaluation?: Evaluation;
  showIdeal?: boolean;
}

type ScenarioStats = {
  total: number;
  correctPct?: number;
  actionDistribution?: Record<string, number>;
};

type CategoryInfo = {
  label: string;
  description: string;
  color: string;
  bg: string;
};

function getScenarioCategory(scenario: Scenario): CategoryInfo {
  const { returnPct, idealAction } = scenario.outcome;
  const { peRatio, revenueGrowthPct, profitMarginPct } = scenario;

  if (peRatio <= 12 && returnPct <= -12 && idealAction === "PASS") {
    return { label: "Value Trap", description: "Looked cheap. It wasn't.", color: "#DC2626", bg: "rgba(220,38,38,0.07)" };
  }
  if (returnPct <= -30) {
    return { label: "Overconfidence Trap", description: "This one burned the bulls.", color: "#DC2626", bg: "rgba(220,38,38,0.07)" };
  }
  if (returnPct <= -20 && profitMarginPct >= 8) {
    return { label: "Market Fakeout", description: "Metrics looked fine. Then it fell apart.", color: "#D97706", bg: "rgba(217,119,6,0.07)" };
  }
  if (revenueGrowthPct >= 25 && returnPct <= -10) {
    return { label: "Contrarian Play", description: "Growth alone wasn't enough.", color: "#D97706", bg: "rgba(217,119,6,0.07)" };
  }
  if (revenueGrowthPct >= 30 && returnPct >= 15 && idealAction === "BUY") {
    return { label: "Momentum Play", description: "Strong growth rewarded conviction.", color: "#16A34A", bg: "rgba(22,163,74,0.07)" };
  }
  if (returnPct >= 20 && idealAction === "BUY") {
    return { label: "Easy Win", description: "The data made the call obvious.", color: "#16A34A", bg: "rgba(22,163,74,0.07)" };
  }
  if (Math.abs(returnPct) <= 8 && idealAction === "HOLD") {
    return { label: "Steady Compounder", description: "Patience was the edge.", color: "#6B7280", bg: "rgba(107,114,128,0.07)" };
  }
  if (returnPct >= 10) {
    return { label: "Solid Pick", description: "Patient investors were rewarded.", color: "#16A34A", bg: "rgba(22,163,74,0.07)" };
  }
  return { label: "Risk Signal", description: "The warning signs were there.", color: "#DC2626", bg: "rgba(220,38,38,0.07)" };
}

export default function OutcomePanel({
  scenario,
  action,
  confidence,
  evaluation,
  showIdeal,
}: Props) {
  const ret = scenario.outcome.returnPct;
  const verdict = verdictFor(action, ret);
  const category = getScenarioCategory(scenario);

  const verdictColor =
    verdict === "CORRECT"
      ? "bg-success/10 text-success"
      : verdict === "INCORRECT"
      ? "bg-danger/10 text-danger"
      : "bg-ink/5 text-muted";

  // Animated counter
  const [displayRet, setDisplayRet] = useState(0);
  useEffect(() => {
    const steps = 32;
    const stepMs = 22;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      // ease-out: fast at start, slow at end
      const t = i / steps;
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayRet(parseFloat((ret * eased).toFixed(1)));
      if (i >= steps) { clearInterval(timer); setDisplayRet(ret); }
    }, stepMs);
    return () => clearInterval(timer);
  }, [ret]);

  // Crowd stats
  const [stats, setStats] = useState<ScenarioStats | null>(null);
  useEffect(() => {
    fetch(`/api/scenario-stats?scenarioId=${scenario.id}`)
      .then((r) => r.json())
      .then((d: ScenarioStats) => setStats(d))
      .catch(() => {});
  }, [scenario.id]);

  const showStats = stats && stats.total >= 10;
  const incorrectPct = showStats ? 100 - (stats.correctPct ?? 0) : null;

  // "You beat X%" copy
  let crowdLine: string | null = null;
  if (showStats && stats.correctPct !== undefined) {
    if (verdict === "CORRECT") {
      crowdLine = `You beat ${incorrectPct}% of players — only ${stats.correctPct}% got this right`;
    } else if (verdict === "INCORRECT") {
      crowdLine = stats.correctPct <= 30
        ? `Only ${stats.correctPct}% got this right — don't feel bad`
        : `${stats.correctPct}% of players got this right`;
    } else {
      crowdLine = `${stats.correctPct}% of players got a clean verdict on this one`;
    }
  }

  const posColor = ret >= 0 ? "text-success" : "text-danger";

  return (
    <div className="surface-card fade-in mt-6 rounded-3xl p-6">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">📊 What happened next</h3>
        <div className="flex items-center gap-2">
          {/* Category badge */}
          <span
            style={{ color: category.color, background: category.bg, border: `1px solid ${category.color}30` }}
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
          >
            {category.label}
          </span>
          {/* Verdict badge */}
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${verdictColor}`}>
            {verdict}
          </span>
        </div>
      </div>

      {/* Category description */}
      <p className="mt-1 text-xs text-muted">{category.description}</p>

      {/* Animated return */}
      <div className="mt-4 flex items-end gap-3">
        <div className={`font-mono text-5xl font-bold tabular-nums ${posColor}`}
          style={{ letterSpacing: "-0.03em" }}>
          {displayRet >= 0 ? "+" : ""}{displayRet}%
        </div>
        <div className="pb-1.5 text-xs text-muted">forward return</div>
      </div>

      {/* Crowd stat line */}
      {crowdLine && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm font-medium text-ink/80">{crowdLine}</span>
        </div>
      )}

      {/* Action distribution */}
      {showStats && stats.actionDistribution && (
        <div className="mt-3 flex gap-3">
          {(["BUY", "HOLD", "PASS"] as const).map((a) => {
            const pct = stats.actionDistribution?.[a] ?? 0;
            if (pct === 0) return null;
            const isMe = a === action;
            return (
              <div key={a} className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold ${isMe ? "text-accent" : "text-muted"}`}>
                    {a}{isMe ? " ← you" : ""}
                  </span>
                  <span className="text-[10px] text-muted">{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-black/6 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: isMe ? "#1F6FEB" : "rgba(0,0,0,0.18)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-sm text-ink/80">{scenario.outcome.summary}</p>

      <InsightLine action={action} confidence={confidence} verdict={verdict} />

      {showIdeal && evaluation?.idealAnswer && (
        <div className="mt-5 rounded-2xl border border-accent/20 bg-accent/5 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">
            Compare vs ideal answer
          </div>
          <p className="mt-1 text-sm text-ink/80">{evaluation.idealAnswer}</p>
          <div className="mt-2 text-[11px] text-muted">
            Ideal action:{" "}
            <span className="font-semibold text-ink">{scenario.outcome.idealAction}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function InsightLine({
  action,
  confidence,
  verdict,
}: {
  action: Action;
  confidence: number;
  verdict: "CORRECT" | "INCORRECT" | "NEUTRAL";
}) {
  let msg: string | null = null;
  if (verdict === "CORRECT" && confidence <= 4) {
    msg = "Low confidence, but correct — was that skill or luck? Read your reasoning again.";
  } else if (verdict === "CORRECT" && confidence >= 8) {
    msg = "High confidence and correct. Notice what evidence you actually weighted.";
  } else if (verdict === "INCORRECT" && confidence >= 7) {
    msg = `You were confident (${confidence}/10) but wrong. Which data point did you dismiss?`;
  } else if (verdict === "INCORRECT" && confidence <= 4) {
    msg = "Low confidence AND wrong — your instincts were already hedging. Trust the signal next time.";
  }
  if (!msg) return null;
  return (
    <div className="surface-soft mt-4 rounded-xl px-3 py-2 text-sm text-ink/80">
      <span className="mr-1">🧭</span>
      {msg}
    </div>
  );
}
