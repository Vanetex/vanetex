import type { Scenario } from "@/lib/types";

type Difficulty = "Easy" | "Medium" | "Hard";

function getDifficulty(scenario: Scenario): Difficulty {
  const { returnPct, idealAction } = scenario.outcome;
  const { peRatio, revenueGrowthPct, profitMarginPct } = scenario;

  // Value trap — looks cheap but collapses
  if (peRatio > 0 && peRatio <= 12 && returnPct <= -15 && idealAction === "PASS") return "Hard";
  // Growth trap — strong revenue growth, bad outcome (counterintuitive)
  if (revenueGrowthPct >= 25 && returnPct <= -10) return "Hard";
  // Fakeout — profitable company still fell hard
  if (profitMarginPct >= 15 && returnPct <= -20) return "Hard";
  // Catastrophic outcome regardless of metrics
  if (returnPct <= -40) return "Hard";

  // Clear momentum buy — all green lights, pays off
  if (revenueGrowthPct >= 20 && profitMarginPct >= 10 && returnPct >= 12 && idealAction === "BUY") return "Easy";
  // Obvious avoid — slow growth, thin margins, bad outcome
  if (revenueGrowthPct <= 3 && profitMarginPct <= 5 && returnPct <= -15 && idealAction === "PASS") return "Easy";
  // Strong momentum with big return
  if (revenueGrowthPct >= 30 && returnPct >= 20 && idealAction === "BUY") return "Easy";

  return "Medium";
}

const DIFFICULTY_STYLES: Record<Difficulty, { label: string; className: string }> = {
  Easy:   { label: "Easy",   className: "bg-success/10 text-success border-success/20" },
  Medium: { label: "Medium", className: "bg-warn/10 text-warn border-warn/20" },
  Hard:   { label: "Hard",   className: "bg-danger/10 text-danger border-danger/20" },
};

export default function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const s = scenario;
  const difficulty = getDifficulty(scenario);
  const diffStyle = DIFFICULTY_STYLES[difficulty];
  return (
    <div className="surface-card interactive-panel fade-in rounded-3xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted">
              {s.sector}
            </div>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${diffStyle.className}`}>
              {diffStyle.label}
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            {s.company}{" "}
            <span className="text-muted">· {s.ticker}</span>
          </h2>
          <p className="mt-1 max-w-prose text-sm text-muted">
            {s.description}
          </p>
        </div>
        <div
          className="shrink-0 rounded-xl px-3 py-2 text-right font-mono text-sm text-paper"
          style={{
            background: "linear-gradient(135deg, rgba(var(--color-accent-rgb),0.25), rgba(var(--color-accent-rgb),0.12))",
            border: "1px solid rgba(var(--color-accent-rgb),0.3)",
            boxShadow: "0 4px 16px rgba(var(--color-accent-rgb),0.2)",
          }}
        >
          <div className="text-[10px] opacity-70">PRICE</div>
          <div>${s.price.toFixed(2)}</div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Rev growth" value={`${s.revenueGrowthPct}%`} />
        <Metric
          label="P/E"
          value={s.peRatio === 0 ? "N/M" : s.peRatio.toString()}
        />
        <Metric label="Profit margin" value={`${s.profitMarginPct}%`} />
        <Metric label="Price" value={`$${s.price.toFixed(2)}`} />
      </div>

      <div className="mt-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted">
          News
        </div>
        <ul className="mt-2 space-y-1.5 text-sm">
          {s.headlines.map((h, i) => (
            <li key={i} className="flex gap-2 rounded-lg px-2.5 py-1.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-muted">•</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>

      {s.signal && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-warn/25 bg-warn/10 px-3 py-1 text-xs font-medium text-warn">
          <span>Signal</span>
          <span className="h-1 w-1 rounded-full bg-warn/60" />
          <span>{s.signal}</span>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-soft rounded-xl px-3 py-2 transition hover:-translate-y-0.5 hover:shadow-sm">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-base">{value}</div>
    </div>
  );
}
