"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { readCache, writeCache } from "@/lib/pageCache";

// ─── Types ────────────────────────────────────────────────────────────────────

type ChallengeRow = {
  rank: number; display_name: string; avg_score: number;
  total_decisions: number; accuracy_pct: number | null; is_current_user: boolean;
};
type TradingRow = {
  rank: number; display_name: string; portfolio_value: number;
  return_pct: number; is_current_user: boolean;
};
type FriendEntry = { id: string; userId: string; displayName: string; createdAt: string };
type FriendData = { accepted: FriendEntry[]; incoming: FriendEntry[]; outgoing: FriendEntry[] };
type SearchResult = { id: string; displayName: string; friendship: { id: string; status: string; isRequester: boolean } | null };

const C_KEY = "leaderboard:challenge";
const T_KEY = "leaderboard:trading";
const TTL = 30_000;

// ─── Data fetchers ────────────────────────────────────────────────────────────

async function fetchLeaderboard() {
  const supabase = createClient();
  const [{ data: c }, { data: t }] = await Promise.all([
    supabase.rpc("get_challenge_leaderboard"),
    supabase.rpc("get_trading_leaderboard"),
  ]);
  return { challenge: (c ?? []) as ChallengeRow[], trading: (t ?? []) as TradingRow[] };
}

async function fetchFriends(): Promise<FriendData> {
  const res = await fetch("/api/friends");
  if (!res.ok) return { accepted: [], incoming: [], outgoing: [] };
  return res.json();
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const [tab, setTab] = useState<"global" | "friends">("global");
  const [challenge, setChallenge] = useState<ChallengeRow[]>(() => readCache<ChallengeRow[]>(C_KEY, TTL) ?? []);
  const [trading, setTradingRows] = useState<TradingRow[]>(() => readCache<TradingRow[]>(T_KEY, TTL) ?? []);
  const [loadingGlobal, setLoadingGlobal] = useState(() => !readCache<ChallengeRow[]>(C_KEY, TTL));
  const [friends, setFriends] = useState<FriendData>({ accepted: [], incoming: [], outgoing: [] });
  const [loadingFriends, setLoadingFriends] = useState(true);

  useEffect(() => {
    if (!readCache<ChallengeRow[]>(C_KEY, TTL)) {
      fetchLeaderboard().then(({ challenge: c, trading: t }) => {
        writeCache(C_KEY, c); writeCache(T_KEY, t);
        setChallenge(c); setTradingRows(t); setLoadingGlobal(false);
      });
    }
    fetchFriends().then((f) => { setFriends(f); setLoadingFriends(false); });
  }, []);

  return (
    <section>
      <h1 className="mb-1 text-xl font-semibold tracking-tight">Leaderboard</h1>
      <p className="mb-5 text-sm text-muted">
        Rankings update each time a user completes a challenge or views their portfolio.
      </p>

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 rounded-xl bg-black/5 p-1">
        {(["global", "friends"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-1.5 text-sm font-medium capitalize transition ${tab === t ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
            {t === "global" ? "Global" : `Friends${friends.incoming.length > 0 ? ` · ${friends.incoming.length}` : ""}`}
          </button>
        ))}
      </div>

      {tab === "global" && (
        loadingGlobal ? <GlobalSkeleton /> : (
          <div className="space-y-10">
            <Board title="Challenge Rankings" subtitle="Ranked by average reasoning score">
              {challenge.length === 0 ? <Empty text="No challenge rankings yet." /> : (
                <ul className="divide-y divide-black/5">
                  {challenge.map((row) => (
                    <li key={row.rank} className={`flex items-center gap-3 px-4 py-3 ${row.is_current_user ? "bg-accent/5" : ""}`}>
                      <RankBadge rank={row.rank} />
                      <div className="min-w-0 flex-1">
                        <span className={`text-sm font-medium ${row.is_current_user ? "text-accent" : "text-ink"}`}>
                          {row.display_name}
                          {row.is_current_user && <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-accent/70">you</span>}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-4 text-right text-xs">
                        <Metric label="Avg score" value={`${row.avg_score}`} highlight />
                        <Metric label="Decisions" value={`${row.total_decisions}`} />
                        <Metric label="Accuracy" value={row.accuracy_pct !== null ? `${row.accuracy_pct}%` : "—"} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Board>

            <Board title="Trading Rankings" subtitle="Ranked by current paper portfolio value">
              {trading.length === 0 ? <Empty text="No trading rankings yet." /> : (
                <ul className="divide-y divide-black/5">
                  {trading.map((row) => (
                    <li key={row.rank} className={`flex items-center gap-3 px-4 py-3 ${row.is_current_user ? "bg-accent/5" : ""}`}>
                      <RankBadge rank={row.rank} />
                      <div className="min-w-0 flex-1">
                        <span className={`text-sm font-medium ${row.is_current_user ? "text-accent" : "text-ink"}`}>
                          {row.display_name}
                          {row.is_current_user && <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-accent/70">you</span>}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-4 text-right text-xs">
                        <Metric label="Value" value={`$${row.portfolio_value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} highlight />
                        <Metric label="Return" value={`${row.return_pct >= 0 ? "+" : ""}${row.return_pct}%`} positive={row.return_pct > 0} negative={row.return_pct < 0} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Board>
          </div>
        )
      )}

      {tab === "friends" && (
        <FriendsTab friends={friends} loading={loadingFriends} onUpdate={() => fetchFriends().then(setFriends)} />
      )}
    </section>
  );
}

// ─── Friends tab ──────────────────────────────────────────────────────────────

function FriendsTab({ friends, loading, onUpdate }: { friends: FriendData; loading: boolean; onUpdate: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeout.current) clearTimeout(timeout.current);
    if (query.trim().length < 2) { setResults([]); return; }
    timeout.current = setTimeout(async () => {
      setSearching(true);
      const res = await fetch(`/api/friends/search?q=${encodeURIComponent(query)}`);
      const data = await res.json() as { results: SearchResult[] };
      setResults(data.results ?? []);
      setSearching(false);
    }, 300);
  }, [query]);

  async function sendRequest(addresseeId: string) {
    setActionId(addresseeId);
    await fetch("/api/friends", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ addresseeId }) });
    setActionId(null);
    setQuery("");
    setResults([]);
    onUpdate();
  }

  async function accept(id: string) {
    setActionId(id);
    await fetch(`/api/friends/${id}`, { method: "PATCH" });
    setActionId(null);
    onUpdate();
  }

  async function remove(id: string) {
    setActionId(id);
    await fetch(`/api/friends/${id}`, { method: "DELETE" });
    setActionId(null);
    onUpdate();
  }

  if (loading) return (
    <div className="animate-pulse space-y-3">
      <div className="h-10 rounded-xl bg-black/5" />
      {[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-2xl bg-black/5" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username…"
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {(results.length > 0 || searching) && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl">
            {searching ? (
              <p className="px-4 py-3 text-sm text-muted">Searching…</p>
            ) : results.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3 hover:bg-black/[0.02]">
                <div>
                  <p className="text-sm font-medium">{r.displayName}</p>
                  {r.friendship && (
                    <p className="text-xs text-muted">
                      {r.friendship.status === "accepted" ? "Already friends" : r.friendship.isRequester ? "Request sent" : "Wants to be friends"}
                    </p>
                  )}
                </div>
                {!r.friendship && (
                  <button onClick={() => sendRequest(r.id)} disabled={actionId === r.id}
                    className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-white transition hover:bg-accent/90 disabled:opacity-50">
                    {actionId === r.id ? "…" : "Add"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incoming requests */}
      {friends.incoming.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Requests ({friends.incoming.length})</p>
          <ul className="space-y-2">
            {friends.incoming.map((f) => (
              <li key={f.id} className="flex items-center justify-between rounded-2xl border border-accent/15 bg-accent/5 px-4 py-3">
                <p className="text-sm font-medium">{f.displayName}</p>
                <div className="flex gap-2">
                  <button onClick={() => accept(f.id)} disabled={actionId === f.id}
                    className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-white transition hover:bg-accent/90 disabled:opacity-50">
                    {actionId === f.id ? "…" : "Accept"}
                  </button>
                  <button onClick={() => remove(f.id)} disabled={actionId === f.id}
                    className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-muted transition hover:text-ink disabled:opacity-50">
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Friends list */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
          Friends {friends.accepted.length > 0 ? `(${friends.accepted.length})` : ""}
        </p>
        {friends.accepted.length === 0 && friends.outgoing.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 bg-white p-8 text-center">
            <p className="text-sm font-medium">No friends yet</p>
            <p className="mt-1 text-xs text-muted">Search for someone by username above.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {friends.accepted.map((f) => (
              <li key={f.id} className="flex items-center justify-between rounded-2xl border border-black/5 bg-white px-4 py-3">
                <p className="text-sm font-medium">{f.displayName}</p>
                <button onClick={() => remove(f.id)} disabled={actionId === f.id}
                  className="text-xs text-muted transition hover:text-danger disabled:opacity-50">
                  Remove
                </button>
              </li>
            ))}
            {friends.outgoing.map((f) => (
              <li key={f.id} className="flex items-center justify-between rounded-2xl border border-black/5 bg-white px-4 py-3 opacity-60">
                <div>
                  <p className="text-sm font-medium">{f.displayName}</p>
                  <p className="text-xs text-muted">Request pending</p>
                </div>
                <button onClick={() => remove(f.id)} disabled={actionId === f.id}
                  className="text-xs text-muted transition hover:text-danger disabled:opacity-50">
                  Cancel
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Board({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
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
  return (
    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${rank === 1 ? "bg-warn/15 text-warn" : rank === 2 ? "bg-ink/8 text-ink" : rank === 3 ? "bg-warn/8 text-warn/70" : "text-muted"}`}>
      {rank <= 3 ? rank : <span className="text-[11px] text-muted">{rank}</span>}
    </div>
  );
}

function Metric({ label, value, highlight, positive, negative }: { label: string; value: string; highlight?: boolean; positive?: boolean; negative?: boolean }) {
  return (
    <div className="hidden sm:block">
      <div className="text-[10px] text-muted">{label}</div>
      <div className={`mt-0.5 font-mono font-medium ${highlight ? "text-ink" : positive ? "text-success" : negative ? "text-danger" : "text-ink/70"}`}>
        {value}
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="px-4 py-8 text-center text-sm text-muted">{text}</p>;
}

function GlobalSkeleton() {
  return (
    <div className="animate-pulse space-y-10">
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
                <div className="flex gap-4">{[...Array(2)].map((_, j) => <div key={j} className="hidden sm:block"><div className="h-2.5 w-12 rounded bg-black/5" /><div className="mt-1 h-4 w-10 rounded bg-black/8" /></div>)}</div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
