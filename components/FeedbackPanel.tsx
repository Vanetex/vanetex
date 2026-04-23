import type { ReactNode } from "react";
import type { Evaluation } from "@/lib/types";

export default function FeedbackPanel({ evaluation }: { evaluation: Evaluation }) {
  return (
    <div className="surface-card fade-in mt-6 rounded-3xl p-6">
      <h3 className="text-base font-semibold">AI analyst feedback</h3>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <ScoreTile
          label="Reasoning"
          value={evaluation.reasoningScore}
          hint="Quality of your written thesis"
        />
        <ScoreTile
          label="Decision"
          value={evaluation.decisionScore}
          hint="Quality of the choice given the data"
        />
      </div>

      <Section title="What you did well" emoji="✅">
        <ul className="space-y-1">
          {evaluation.didWell.map((t, i) => (
            <li key={i} className="rounded-lg bg-black/[0.02] px-2.5 py-1.5 text-sm">{t}</li>
          ))}
        </ul>
      </Section>

      <Section title="What you missed" emoji="⚠️">
        <ul className="space-y-1">
          {evaluation.missed.map((t, i) => (
            <li key={i} className="rounded-lg bg-black/[0.02] px-2.5 py-1.5 text-sm">{t}</li>
          ))}
        </ul>
      </Section>

      <Section title="How to improve" emoji="📈">
        <p className="text-sm">{evaluation.improvement}</p>
      </Section>

      {evaluation.tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {evaluation.tags.map((t, i) => (
            <span
              key={i}
              className="rounded-full border border-black/10 bg-ink/[0.04] px-2.5 py-1 text-[11px] font-medium text-ink/80"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  const color =
    value >= 75 ? "text-success" : value >= 50 ? "text-warn" : "text-danger";
  return (
    <div className="surface-soft rounded-2xl px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className={`mt-1 font-mono text-3xl ${color}`}>{value}</div>
      <div className="text-[10px] text-muted">{hint}</div>
    </div>
  );
}

function Section({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted">
        <span className="mr-1">{emoji}</span>
        {title}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
