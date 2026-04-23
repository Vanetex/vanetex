"use client";

import { useState } from "react";
import type { Reflection } from "@/lib/types";

interface Props {
  onSave: (r: Reflection) => void;
  initial?: Reflection;
  saved?: boolean;
}

export default function ReflectionPrompt({ onSave, initial, saved }: Props) {
  const [missed, setMissed] = useState(initial?.missed ?? "");
  const [differently, setDifferently] = useState(initial?.differently ?? "");
  const [keySignal, setKeySignal] = useState(initial?.keySignal ?? "");

  const disabled =
    !missed.trim() || !differently.trim() || !keySignal.trim();

  return (
    <div className="surface-card fade-in mt-6 rounded-3xl p-6">
      <h3 className="text-base font-semibold">📝 Reflect</h3>
      <p className="mt-1 text-xs text-muted">
        The most valuable part of the loop. One or two lines each is enough.
      </p>

      <Field label="What did you miss?" value={missed} onChange={setMissed} />
      <Field
        label="What would you do differently?"
        value={differently}
        onChange={setDifferently}
      />
      <Field
        label="What signal mattered most?"
        value={keySignal}
        onChange={setKeySignal}
      />

      <button
        type="button"
        disabled={disabled || saved}
        onClick={() =>
          onSave({
            missed: missed.trim(),
            differently: differently.trim(),
            keySignal: keySignal.trim(),
            timestamp: Date.now(),
          })
        }
        className="cta-primary mt-4 inline-flex w-full items-center justify-center rounded-full px-6 py-3 font-medium text-paper disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saved ? "Saved to journal" : "Save reflection"}
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mt-4">
      <label className="text-sm font-medium">{label}</label>
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field-focus mt-1 w-full rounded-xl border border-black/10 bg-white/95 px-3 py-2 text-sm outline-none"
      />
    </div>
  );
}
