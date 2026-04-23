import type { Scenario } from "@/lib/types";

export default function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const s = scenario;
  return (
    <div className="surface-card interactive-panel fade-in rounded-3xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted">
            {s.sector}
          </div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            {s.company}{" "}
            <span className="text-muted">· {s.ticker}</span>
          </h2>
          <p className="mt-1 max-w-prose text-sm text-muted">
            {s.description}
          </p>
        </div>
        <div className="shrink-0 rounded-xl bg-gradient-to-br from-ink to-accent px-3 py-2 text-right font-mono text-sm text-paper shadow-lg shadow-ink/20">
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
            <li key={i} className="flex gap-2 rounded-lg bg-black/[0.015] px-2.5 py-1.5">
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
