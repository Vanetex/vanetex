"use client";

import { useState } from "react";
import type { Action } from "@/lib/types";

interface Props {
  onSubmit: (payload: {
    action: Action;
    confidence: number;
    reasoning: string;
  }) => void;
  submitting?: boolean;
}

const MAX_REASONING_CHARS = 1_500;
const ACTIONS: { value: Action; label: string; help: string }[] = [
  { value: "BUY", label: "Buy", help: "Take a position." },
  { value: "HOLD", label: "Hold", help: "Keep what you have; no new action." },
  { value: "PASS", label: "Pass", help: "Skip — unattractive or unclear." },
];

export default function DecisionInput({ onSubmit, submitting }: Props) {
  const [action, setAction] = useState<Action | null>(null);
  const [confidence, setConfidence] = useState(5);
  const [reasoning, setReasoning] = useState("");

  const disabled = !action || reasoning.trim().length < 10 || !!submitting;

  return (
    <div className="surface-card interactive-panel fade-in mt-6 rounded-3xl p-6">
      <h3 className="text-base font-semibold">Your decision</h3>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {ACTIONS.map((a) => {
          const active = action === a.value;
          return (
            <button
              key={a.value}
              type="button"
              onClick={() => setAction(a.value)}
              className={
                "rounded-2xl border px-3 py-3 text-left transition duration-200 " +
                (active
                  ? "border-ink bg-gradient-to-br from-ink to-ink/90 text-paper shadow-lg shadow-ink/20"
                  : "border-black/10 bg-white/90 hover:-translate-y-0.5 hover:border-black/30 hover:bg-white hover:shadow-sm")
              }
            >
              <div className="font-semibold">{a.label}</div>
              <div
                className={
                  "mt-0.5 text-xs " +
                  (active ? "text-paper/70" : "text-muted")
                }
              >
                {a.help}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Confidence</label>
          <span className="font-mono text-sm">{confidence}/10</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={confidence}
          onChange={(e) => setConfidence(parseInt(e.target.value, 10))}
          className="mt-2 w-full accent-ink"
        />
        <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-muted">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      <div className="mt-6">
        <label className="text-sm font-medium" htmlFor="reasoning">
          Explain your reasoning
        </label>
        <p className="mt-1 text-xs text-muted">
          2–4 sentences. Reference at least one metric. The AI will push back
          if you hand-wave.
        </p>
        <textarea
          id="reasoning"
          value={reasoning}
          onChange={(e) => setReasoning(e.target.value)}
          rows={5}
          maxLength={MAX_REASONING_CHARS}
          placeholder="e.g. Growth is 94% with margins expanding, and a competitor chip just slipped 12 months. P/E of 62 is steep but defensible given..."
          className="field-focus mt-2 w-full rounded-2xl border border-black/10 bg-white/95 px-3 py-2 text-sm outline-none"
        />
        <div className="mt-1 text-right text-[10px] text-muted">
          {reasoning.trim().length}/{MAX_REASONING_CHARS} chars
        </div>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onSubmit({ action: action!, confidence, reasoning })}
        className="cta-primary mt-4 inline-flex w-full items-center justify-center rounded-full px-6 py-3 font-medium text-paper disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? "Evaluating…" : "Submit for evaluation"}
      </button>
    </div>
  );
}
