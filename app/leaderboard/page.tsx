"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { readCache, writeCache } from "@/lib/pageCache";

type ChallengeRow = {
  rank: number;
  display_name: string;
  avg_score: number;
  total_decisions: number;
  accuracy_pct: number | null;
  is_current_user: boolean;
};

type TradingRow = {
  rank: number;
  display_name: string;
  portfolio_value: number;
  return_pct: number;
  is_current_user: boolean;
};

const C_KEY = "leaderboard:challenge";
const T_KEY = "leaderboard:trading";
const TTL = 30_000;

async function fetchBoth(): Promise<{ challenge: ChallengeRow[]; trading: TradingRow[] }> {
  const supabase = createClient();
  const [{ data: c }, { data: t }] = await Promise.all([
    supabase.rpc("get_challenge_leaderboard"),
    supabase.rpc("get_trading_leaderboard"),
  ]);
  return {
    challenge: (c ?? []) as ChallengeRow[],
    trading: (t ?? []) as TradingRow[],
  };
}

export default function LeaderboardPage() {
  const [challenge, setChallenge] = useState<ChallengeRow[]>(
    () => readCache<ChallengeRow[]>(C_KEY, TTL) ?? [],
  );
  const [trading, setTrading] = useState<TradingRow[]>(
    () => readCache<TradingRow[]>(T_KEY, TTL) ?? [],
  );
  const [loading, setLoading] = useState(
    () => !readCache<ChallengeRow[]>(C_KEY, TTL),
  );

  useEffect(() => {
    if (readCache<ChallengeRow[]>(C_KEY, TTL)) return;
    fetchBoth().then(({ challenge: c, trading: t }) => {
      writeCache(C_KEY, c);
      writeCache(T_KEY, t);
      setChallenge(c);
      setTrading(t);
      setLoading(false);
    });
  }, []);

  if (loading) return <Skeleton />;

  return (
    <section>
      <h1 className="mb-1 text-xl font-semibold tracking-tight">Leaderboard</h1>
      <p className="mb-8 text-sm text-muted">
        Rankings update each time a user completes a challenge or views their portfolio.
      </p>

      <div className="space-y-10">
        <Board title="Challenge Rankings" subtitle="Ranked by average reasoning score">
          {challenge.length === 0 ? (
            <Empty text="No challenge rankings yet — complete a challenge to appear here." />
          ) : (
            <ul className="divide-y divide-black/5">
              {challenge.map((row) => (
                <li
                  key={row.rank}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    row.is_current_user ? "bg-accent/5" : ""
                  }`}
                >
                  <RankBadge rank={row.rank} />
                  <div className="min-w-0 flex-1">
                    <span className={`text-sm font-medium ${row.is_current_user ? "text-accent" : "text-ink"}`}>
                      {row.display_name}
                      {row.is_current_user && (
                        <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-accent/70">
                          you
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-4 text-right text-xs">
                    <Metric
                      label="Avg score"
                      value={`${row.avg_score}`}
                      highlight
                    />
                    <Metric
                      label="Decisions"
                      value={`${row.total_decisions}`}
                    />
                    <Metric
                      label="Accuracy"
                      value={row.accuracy_pct !== null ? `${row.accuracy_pct}%` : "—"}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Board>

        <Board title="Trading Rankings" subtitle="Ranked by current paper portfolio value">
          {trading.length === 0 ? (
            <Empty text="No trading rankings yet — visit the Trade tab to appear here." />
          ) : (
            <ul className="divide-y divide-black/5">
              {trading.map((row) => (
                <li
                  key={row.rank}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    row.is_current_user ? "bg-accent/5" : ""
                  }`}
                >
                  <RankBadge rank={row.rank} />
                  <div className="min-w-0 flex-1">
                    <span className={`text-sm font-medium ${row.is_current_user ? "text-accent" : "text-ink"}`}>
                      {row.display_name}
                      {row.is_current_user && (
                        <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-accent/70">
                          you
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-4 text-right text-xs">
                    <Metric
                      label="Value"
                      value={`$${row.portfolio_value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                      highlight
                    />
                    <Metric
                      label="Return"
                      value={`${row.return_pct >= 0 ? "+" : ""}${row.return_pct}%`}
                      positive={row.return_pct > 0}
                      negative={row.return_pct < 0}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Board>
      </div>
    </section>
  );
}

function Board({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
      <div className="border-b border-black/5 px-4 py-4">
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const top = rank <= 3;
  return (
    <div
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
        rank === 1
          ? "bg-warn/15 text-warn"
          : rank === 2
            ? "bg-ink/8 text-ink"
            : rank === 3
              ? "bg-warn/8 text-warn/70"
              : "text-muted"
      }`}
    >
      {top ? rank : <span className="text-[11px] text-muted">{rank}</span>}
    </div>
  );
}

function Metric({
  label,
  value,
  highlight,
  positive,
  negative,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="hidden sm:block">
      <div className="text-[10px] text-muted">{label}</div>
      <div
        className={`mt-0.5 font-mono font-medium ${
          highlight
            ? "text-ink"
            : positive
              ? "text-success"
              : negative
                ? "text-danger"
                : "text-ink/70"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="px-4 py-8 text-center text-sm text-muted">{text}</p>
  );
}

function Skeleton() {
  return (
    <section className="animate-pulse">
      <div className="mb-1 h-7 w-36 rounded-lg bg-black/8" />
      <div className="mb-8 mt-2 h-4 w-80 rounded bg-black/5" />
      <div className="space-y-10">
        {[...Array(2)].map((_, s) => (
          <div key={s} className="overflow-hidden rounded-2xl border border-black/5 bg-white">
            <div className="border-b border-black/5 px-4 py-4">
              <div className="h-5 w-40 rounded bg-black/8" />
              <div className="mt-1 h-3 w-56 rounded bg-black/5" />
            </div>
            <ul>
              {[...Array(5)].map((_, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="h-7 w-7 rounded-full bg-black/5" />
                  <div className="h-4 flex-1 rounded bg-black/5" />
                  <div className="flex gap-4">
                    {[...Array(2)].map((_, j) => (
                      <div key={j} className="hidden sm:block">
                        <div className="h-2.5 w-12 rounded bg-black/5" />
                        <div className="mt-1 h-4 w-10 rounded bg-black/8" />
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
