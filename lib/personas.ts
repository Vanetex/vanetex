import type { DecisionRecord } from "@/lib/types";

export interface Persona {
  id: string;
  label: string;
  icon: string;
  description: string;
  insight: string;
}

export function computePersona(decisions: DecisionRecord[]): Persona | null {
  const withEval = decisions.filter((d) => d.evaluation);
  if (withEval.length < 5) return null;

  const total = withEval.length;
  const buyRate   = withEval.filter((d) => d.action === "BUY").length  / total;
  const passRate  = withEval.filter((d) => d.action === "PASS").length / total;
  const holdRate  = withEval.filter((d) => d.action === "HOLD").length / total;
  const avgConf   = withEval.reduce((s, d) => s + d.confidence, 0) / total;
  const avgScore  = withEval.reduce((s, d) => s + (d.evaluation!.reasoningScore), 0) / total;

  const withOutcome = withEval.filter(
    (d) => d.outcomeVerdict && d.outcomeVerdict !== "NEUTRAL",
  );
  const correctRate =
    withOutcome.length > 0
      ? withOutcome.filter((d) => d.outcomeVerdict === "CORRECT").length / withOutcome.length
      : 0;

  // Contrarian: high pass rate + above-average accuracy (knows when NOT to buy)
  if (passRate >= 0.45 && correctRate >= 0.55) {
    return {
      id: "contrarian",
      label: "Contrarian",
      icon: "🎯",
      description: "You see through the hype.",
      insight: `You pass on ${pct(passRate)} of setups and you're right more often than not. Most players chase — you don't.`,
    };
  }

  // High conviction + aggressive buyer
  if (buyRate >= 0.65 && avgConf >= 7) {
    return {
      id: "risk-taker",
      label: "Risk Taker",
      icon: "⚡",
      description: "High conviction, high stakes.",
      insight: `You BUY ${pct(buyRate)} of scenarios with avg confidence ${avgConf.toFixed(1)}/10. You swing big — the key is knowing when to pull back.`,
    };
  }

  // Strong reasoner — high scores regardless of action
  if (avgScore >= 72) {
    return {
      id: "deep-analyst",
      label: "Deep Analyst",
      icon: "🧠",
      description: "You do the work before you act.",
      insight: `Your average reasoning score is ${Math.round(avgScore)}/100. You think before you trade — that's rare.`,
    };
  }

  // Momentum rider — high buy rate, moderate confidence
  if (buyRate >= 0.60 && avgConf >= 6) {
    return {
      id: "momentum-rider",
      label: "Momentum Rider",
      icon: "🚀",
      description: "You ride trends hard.",
      insight: `You BUY ${pct(buyRate)} of scenarios. You lean long — watch for value traps when growth slows.`,
    };
  }

  // Cautious — high pass + hold rate, low confidence
  if ((passRate + holdRate) >= 0.55 && avgConf <= 5.5) {
    return {
      id: "cautious-analyst",
      label: "Cautious Analyst",
      icon: "🛡️",
      description: "You preserve capital first.",
      insight: `You avoid ${pct(passRate + holdRate)} of trades. Patience is a skill — now work on pulling the trigger when the signal is clear.`,
    };
  }

  // Value Hunter — high pass rate but not necessarily high accuracy (selective)
  if (passRate >= 0.4 && avgConf >= 5) {
    return {
      id: "value-hunter",
      label: "Value Hunter",
      icon: "🔍",
      description: "You wait for the right price.",
      insight: `You pass on ${pct(passRate)} of setups — you're selective. The question is whether you act when the right deal appears.`,
    };
  }

  // Balanced default
  return {
    id: "balanced-trader",
    label: "Balanced Trader",
    icon: "⚖️",
    description: "Disciplined across market conditions.",
    insight: `Your buy/pass split is close to even and your confidence tracks your scores well. Build on that consistency.`,
  };
}

function pct(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
