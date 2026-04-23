import type { Action, Evaluation, Scenario } from "@/lib/types";
import { verdictFor } from "@/lib/scoring";

interface Props {
  scenario: Scenario;
  action: Action;
  confidence: number;
  evaluation?: Evaluation;
  showIdeal?: boolean;
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
  const posColor =
    ret >= 0 ? "text-success" : "text-danger";
  const verdictColor =
    verdict === "CORRECT"
      ? "bg-success/10 text-success"
      : verdict === "INCORRECT"
      ? "bg-danger/10 text-danger"
      : "bg-ink/5 text-muted";

  return (
    <div className="surface-card fade-in mt-6 rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">📊 What happened next</h3>
        <span
          className={
            "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider " +
            verdictColor
          }
        >
          {verdict}
        </span>
      </div>

      <div className="mt-4 flex items-end gap-3">
        <div className={`font-mono text-4xl font-semibold ${posColor}`}>
          {ret >= 0 ? "+" : ""}
          {ret}%
        </div>
        <div className="pb-1 text-xs text-muted">forward return</div>
      </div>

      <p className="mt-3 text-sm text-ink/80">{scenario.outcome.summary}</p>

      <InsightLine
        action={action}
        confidence={confidence}
        verdict={verdict}
      />

      {showIdeal && evaluation?.idealAnswer && (
        <div className="mt-5 rounded-2xl border border-accent/20 bg-accent/5 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">
            Compare vs ideal answer
          </div>
          <p className="mt-1 text-sm text-ink/80">{evaluation.idealAnswer}</p>
          <div className="mt-2 text-[11px] text-muted">
            Ideal action:{" "}
            <span className="font-semibold text-ink">
              {scenario.outcome.idealAction}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/** The "luck vs skill" prompt called out in the spec. */
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
