"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { listDecisions } from "@/lib/supabase/decisions";
import { readCache, writeCache } from "@/lib/pageCache";
import type { DecisionRecord } from "@/lib/types";

const KEY = "decisions";

type Filter = "all" | "reflections";

export default function JournalPage() {
  const [records, setRecords] = useState<DecisionRecord[]>(
    () => readCache<DecisionRecord[]>(KEY) ?? [],
  );
  const [loading, setLoading] = useState(() => !readCache<DecisionRecord[]>(KEY));
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (readCache<DecisionRecord[]>(KEY)) return;
    listDecisions().then((all) => {
      writeCache(KEY, all);
      setRecords(all);
      setLoading(false);
    });
  }, []);

  const displayed = filter === "reflections" ? records.filter((r) => r.reflection) : records;

  if (loading) {
    return (
      <section className="animate-pulse">
        <div className="mb-1 h-7 w-24 rounded-lg bg-black/8" />
        <div className="mb-6 mt-2 h-4 w-72 rounded bg-black/5" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 rounded-2xl bg-black/5" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Journal</h1>
          <p className="mt-1 text-sm text-muted">Every decision with AI feedback, outcomes, and your reflections.</p>
        </div>
        <div className="flex rounded-xl border border-black/10 bg-white p-1 text-xs font-medium">
          <button
            onClick={() => setFilter("all")}
            className={
              "rounded-lg px-3 py-1.5 transition " +
              (filter === "all" ? "bg-ink text-paper shadow-sm" : "text-muted hover:text-ink")
            }
          >
            All
          </button>
          <button
            onClick={() => setFilter("reflections")}
            className={
              "rounded-lg px-3 py-1.5 transition " +
              (filter === "reflections" ? "bg-ink text-paper shadow-sm" : "text-muted hover:text-ink")
            }
          >
            Reflections
          </button>
        </div>
      </div>

      {displayed.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-black/10 bg-white px-8 py-12 text-center">
          {filter === "reflections" ? (
            <>
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/8">
                <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-5m-6-1l6-6m0 0l2 2m-2-2v4" />
                </svg>
              </div>
              <p className="font-semibold">No reflections yet</p>
              <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
                After revealing an outcome, you&rsquo;ll be prompted to reflect on what you missed and what you&rsquo;d do differently.
              </p>
              <Link href="/challenge" className="mt-5 inline-block rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper">
                Take today&rsquo;s challenge →
              </Link>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-black/[0.04]">
                <svg className="h-5 w-5 text-muted" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="font-semibold">Your journal starts here</p>
              <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
                Every challenge you complete adds an entry — your decision, the AI&rsquo;s grade, the outcome, and your reflection.
              </p>
              <Link href="/challenge" className="mt-5 inline-block rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper">
                Take today&rsquo;s challenge →
              </Link>
            </>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {displayed.map((r) => {
            const open = openId === r.id;
            return (
              <li key={r.id} className="rounded-2xl border border-black/5 bg-white">
                <button
                  onClick={() => setOpenId(open ? null : r.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <div>
                    <div className="font-medium">
                      {r.company} <span className="text-muted">· {r.ticker}</span>
                    </div>
                    <div className="text-[11px] text-muted">
                      {new Date(r.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="rounded bg-ink/[0.04] px-1.5 py-0.5 font-mono">{r.action}</span>
                    {r.evaluation && (
                      <span className="font-mono text-ink/70">D {r.evaluation.decisionScore}</span>
                    )}
                    {typeof r.outcomeReturnPct === "number" && (
                      <span className={"font-mono " + (r.outcomeReturnPct >= 0 ? "text-success" : "text-danger")}>
                        {r.outcomeReturnPct >= 0 ? "+" : ""}{r.outcomeReturnPct}%
                      </span>
                    )}
                    {r.reflection && (
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                        reflection
                      </span>
                    )}
                    <svg
                      className={"h-4 w-4 text-muted transition-transform " + (open ? "rotate-180" : "")}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {open && (
                  <div className="border-t border-black/5 px-5 py-4 text-sm">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Block title="Your reasoning">{r.reasoning}</Block>
                      <Block title="Confidence">{`${r.confidence}/10`}</Block>
                    </div>

                    {r.evaluation && (
                      <div className="mt-4 space-y-3">
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">What you did well</div>
                          <ul className="mt-1 list-inside list-disc">
                            {r.evaluation.didWell.map((t, i) => <li key={i}>{t}</li>)}
                          </ul>
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">What you missed</div>
                          <ul className="mt-1 list-inside list-disc">
                            {r.evaluation.missed.map((t, i) => <li key={i}>{t}</li>)}
                          </ul>
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">Improvement</div>
                          <p className="mt-1">{r.evaluation.improvement}</p>
                        </div>
                        {r.evaluation.idealAnswer && (
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-accent">Ideal answer</div>
                            <p className="mt-1">{r.evaluation.idealAnswer}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {r.reflection && (
                      <div className="mt-4 rounded-xl bg-ink/[0.03] p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Your reflection</div>
                        <p><span className="font-semibold">Missed:</span> {r.reflection.missed}</p>
                        <p><span className="font-semibold">Differently:</span> {r.reflection.differently}</p>
                        <p><span className="font-semibold">Key signal:</span> {r.reflection.keySignal}</p>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">{title}</div>
      <div className="mt-1 text-ink/80">{children}</div>
    </div>
  );
}
