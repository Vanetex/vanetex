"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CAREER_FIELDS, type CareerField } from "@/lib/types";

type Step = 1 | 2 | 3;
type TutAction = "BUY" | "HOLD" | "PASS";

const TUTORIAL = {
  company: "DemoTech Inc.",
  sector: "Cloud Software",
  price: 45,
  revenueGrowthPct: 28,
  peRatio: 22,
  profitMarginPct: 14,
  description:
    "A mid-size cloud software company that sells project management tools to small businesses.",
  headlines: [
    "Q3 revenue hits record high — company raises full-year guidance",
    "Customer count surpasses 50,000 for first time",
  ],
  signal: "CEO bought $200,000 of shares on the open market last week",
};

const MOCK_EVAL = {
  score: 78,
  didWell: [
    "Correctly identified strong revenue growth as the lead signal",
    "Noted the insider buying as corroborating evidence",
  ],
  missed: [
    "P/E of 22 is reasonable for a growing SaaS company — not a red flag",
  ],
  tip: "Check whether valuation is stretched relative to the growth rate, not just in absolute terms.",
};

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>(1);
  const [careerField, setCareerField] = useState<CareerField | null>(null);
  const [tutAction, setTutAction] = useState<TutAction | null>(null);
  const [tutEvalShown, setTutEvalShown] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useState(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle()
        .then(({ data }) => setDisplayName((data as { display_name?: string | null } | null)?.display_name ?? null));
    });
  });

  async function complete() {
    setCompleting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const update: Record<string, unknown> = { onboarding_completed: true };
      if (careerField) update.career_field = careerField;
      await supabase.from("profiles").update(update).eq("id", user.id);
    }
    router.push("/challenge");
  }

  return (
    <div className="mx-auto max-w-lg py-10">
      {/* Progress bar */}
      <div className="mb-8 flex justify-center gap-2">
        {([1, 2, 3] as Step[]).map((s) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              s === step
                ? "w-10 bg-accent"
                : s < step
                  ? "w-4 bg-accent/35"
                  : "w-4 bg-black/10"
            }`}
          />
        ))}
      </div>

      {step === 1 && <StepWelcome displayName={displayName} onNext={() => setStep(2)} />}

      {step === 2 && (
        <StepCareer
          selected={careerField}
          onSelect={setCareerField}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <StepTutorial
          action={tutAction}
          evalShown={tutEvalShown}
          onAction={(a) => setTutAction(a)}
          onShowEval={() => setTutEvalShown(true)}
          onComplete={complete}
          completing={completing}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1 — Welcome
// ---------------------------------------------------------------------------

function StepWelcome({ displayName, onNext }: { displayName: string | null; onNext: () => void }) {
  const firstName = displayName?.split(" ")[0] ?? null;

  return (
    <div className="fade-in">
      {/* Logo mark */}
      <div className="mb-6 flex justify-center">
        <div style={{
          width: 56, height: 56, borderRadius: 16, flexShrink: 0,
          background: "linear-gradient(135deg, #1F6FEB, #0d3ba8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 24px rgba(31,111,235,0.4)",
        }}>
          <svg width="28" height="28" viewBox="0 0 22 22" fill="none">
            <path d="M 2 2 L 10 20 L 13 20 L 13 14 L 16 14 L 16 8 L 19 8 L 19 2"
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
      </div>

      {/* Headline */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {firstName ? `Welcome, ${firstName}.` : "Welcome to Vanetex."}
        </h1>
        <p className="mt-2 text-sm font-medium text-accent">Build Your Edge</p>
        <p className="mx-auto mt-3 max-w-xs text-sm text-muted">
          One scenario a day. Make your call. See what the AI says. See what actually happened.
        </p>
      </div>

      {/* Three short feature lines */}
      <div className="mb-8 space-y-3">
        {[
          { icon: "📊", text: "Read real company metrics and headlines" },
          { icon: "⚡", text: "AI grades your reasoning 0–100 with specific feedback" },
          { icon: "🎯", text: "Reveal the outcome — were you right?" },
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-3 rounded-2xl border border-black/6 bg-white px-4 py-3">
            <span className="shrink-0 text-lg">{item.icon}</span>
            <p className="text-sm text-ink/80">{item.text}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        className="cta-primary w-full rounded-full py-3.5 text-sm font-medium text-paper"
      >
        Let&apos;s go →
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — Career field
// ---------------------------------------------------------------------------

function StepCareer({
  selected,
  onSelect,
  onNext,
}: {
  selected: CareerField | null;
  onSelect: (f: CareerField) => void;
  onNext: () => void;
}) {
  return (
    <div className="fade-in">
      <h2 className="text-xl font-semibold tracking-tight">
        What&apos;s your goal?
      </h2>
      <p className="mt-2 text-sm text-muted">
        We&apos;ll highlight the lessons most relevant to your path. You can
        change this anytime in settings.
      </p>

      <div className="mt-6 space-y-2">
        {CAREER_FIELDS.map((f) => {
          const active = selected === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onSelect(f.id)}
              className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-accent/40 bg-accent/5"
                  : "border-black/8 bg-white hover:border-accent/20"
              }`}
            >
              <div>
                <p
                  className={`text-sm font-medium ${active ? "text-accent" : ""}`}
                >
                  {f.label}
                </p>
                <p className="text-xs text-muted">{f.description}</p>
              </div>
              {active && (
                <span className="ml-4 shrink-0 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-paper">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        className="cta-primary mt-6 w-full rounded-full py-3.5 text-sm font-medium text-paper"
      >
        {selected ? "Next →" : "Skip for now →"}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — Tutorial round
// ---------------------------------------------------------------------------

function StepTutorial({
  action,
  evalShown,
  onAction,
  onShowEval,
  onComplete,
  completing,
}: {
  action: TutAction | null;
  evalShown: boolean;
  onAction: (a: TutAction) => void;
  onShowEval: () => void;
  onComplete: () => void;
  completing: boolean;
}) {
  return (
    <div className="fade-in">
      <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent">
        Tutorial round
      </div>
      <h2 className="text-xl font-semibold tracking-tight">
        Try a practice decision
      </h2>
      <p className="mt-1 text-sm text-muted">
        No pressure — this is just to show you how it works.
      </p>

      {/* Scenario card */}
      <div className="surface-card mt-5 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              {TUTORIAL.sector}
            </p>
            <p className="mt-1 font-semibold">{TUTORIAL.company}</p>
          </div>
          <span className="shrink-0 text-lg font-bold">${TUTORIAL.price}</span>
        </div>

        <p className="mt-2 text-xs text-muted">{TUTORIAL.description}</p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Metric
            label="Revenue growth"
            value={`+${TUTORIAL.revenueGrowthPct}%`}
            color="success"
          />
          <Metric label="P/E ratio" value={`${TUTORIAL.peRatio}x`} />
          <Metric
            label="Net margin"
            value={`${TUTORIAL.profitMarginPct}%`}
          />
        </div>

        <div className="mt-3 space-y-1">
          {TUTORIAL.headlines.map((h) => (
            <p key={h} className="text-xs text-muted">
              · {h}
            </p>
          ))}
        </div>

        <div className="mt-3 rounded-xl bg-warn/8 px-3 py-2 text-xs font-medium text-warn">
          Signal: {TUTORIAL.signal}
        </div>
      </div>

      {/* Decision buttons */}
      {!evalShown && (
        <div className="mt-5">
          <p className="mb-3 text-sm font-medium">What&apos;s your call?</p>
          <div className="grid grid-cols-3 gap-2">
            {(["BUY", "HOLD", "PASS"] as const).map((a) => (
              <button
                key={a}
                onClick={() => onAction(a)}
                className={`rounded-xl border py-3 text-sm font-bold transition ${
                  action === a
                    ? a === "BUY"
                      ? "border-success bg-success/10 text-success"
                      : a === "HOLD"
                        ? "border-warn bg-warn/10 text-warn"
                        : "border-danger bg-danger/10 text-danger"
                    : "border-black/10 bg-white text-ink hover:border-black/20"
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          {action && (
            <button
              onClick={onShowEval}
              className="cta-primary mt-4 w-full rounded-full py-3 text-sm font-medium text-paper"
            >
              See how it&apos;s evaluated →
            </button>
          )}
        </div>
      )}

      {/* Sample evaluation */}
      {evalShown && (
        <div className="mt-5 space-y-3 fade-in">
          <div className="surface-card rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              Sample evaluation
            </p>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-4xl font-bold text-accent">
                {MOCK_EVAL.score}
              </span>
              <span className="text-sm text-muted">/ 100 reasoning score</span>
            </div>

            <div className="mt-4 space-y-2">
              {MOCK_EVAL.didWell.map((d) => (
                <p key={d} className="flex gap-2 text-xs">
                  <span className="shrink-0 font-bold text-success">✓</span>
                  {d}
                </p>
              ))}
              {MOCK_EVAL.missed.map((m) => (
                <p key={m} className="flex gap-2 text-xs">
                  <span className="shrink-0 font-bold text-danger">✗</span>
                  {m}
                </p>
              ))}
            </div>

            <div className="mt-4 rounded-xl bg-accent/5 px-3 py-2.5 text-xs text-accent">
              <span className="font-semibold">Tip: </span>
              {MOCK_EVAL.tip}
            </div>
          </div>

          <p className="text-center text-xs text-muted">
            In real challenges you&apos;ll also reveal the stock&apos;s actual
            outcome after reflecting.
          </p>

          <button
            onClick={onComplete}
            disabled={completing}
            className="cta-primary w-full rounded-full py-3.5 text-sm font-medium text-paper disabled:opacity-50"
          >
            {completing ? "Setting up your account…" : "I'm ready — start training →"}
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: "success" | "danger";
}) {
  return (
    <div className="surface-soft rounded-xl px-2 py-2.5 text-center">
      <p className="text-[10px] text-muted">{label}</p>
      <p
        className={`mt-0.5 text-sm font-semibold ${
          color === "success"
            ? "text-success"
            : color === "danger"
              ? "text-danger"
              : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
