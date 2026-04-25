"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ALL_TRACK_META } from "@/data/trackMeta";
import { listLessonProgress } from "@/lib/supabase/lessonProgress";
import { createClient } from "@/lib/supabase/client";
import { readCache, writeCache } from "@/lib/pageCache";
import { CAREER_FIELDS, type CareerField, type LessonProgress } from "@/lib/types";

const PROGRESS_KEY = "lesson_progress";
const CAREER_KEY = "career_field";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";
type SortBy = "default" | "progress" | "az";

async function fetchCareerField(): Promise<CareerField | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("career_field")
    .eq("id", user.id)
    .maybeSingle();
  return ((data as { career_field?: string | null } | null)?.career_field ?? null) as CareerField | null;
}

const DIFFICULTIES: Difficulty[] = ["Beginner", "Intermediate", "Advanced"];

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Beginner: "bg-success/10 text-success border-success/20",
  Intermediate: "bg-warn/10 text-warn border-warn/20",
  Advanced: "bg-danger/10 text-danger border-danger/20",
};

export default function TracksClient() {
  const [progress, setProgress] = useState<LessonProgress[]>(
    () => readCache<LessonProgress[]>(PROGRESS_KEY) ?? [],
  );
  const [activeField, setActiveField] = useState<CareerField | null>(
    () => readCache<CareerField | null>(CAREER_KEY) ?? null,
  );
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("default");
  const [loading, setLoading] = useState(
    () => !readCache<LessonProgress[]>(PROGRESS_KEY),
  );

  useEffect(() => {
    if (readCache<LessonProgress[]>(PROGRESS_KEY)) return;
    Promise.all([listLessonProgress(), fetchCareerField()]).then(([prog, field]) => {
      writeCache(PROGRESS_KEY, prog);
      writeCache(CAREER_KEY, field);
      setProgress(prog);
      setActiveField(field);
      setLoading(false);
    });
  }, []);

  // Build displayed tracks: filter → sort
  let displayedTracks = [...ALL_TRACK_META];

  // Filter by difficulty
  if (activeDifficulty) {
    displayedTracks = displayedTracks.filter((t) => t.difficulty === activeDifficulty);
  }

  // Sort
  if (sortBy === "default" && activeField) {
    displayedTracks.sort((a, b) => {
      const aMatch = a.lessons.filter((l) => l.fields?.includes(activeField)).length;
      const bMatch = b.lessons.filter((l) => l.fields?.includes(activeField)).length;
      return bMatch - aMatch;
    });
  } else if (sortBy === "progress") {
    displayedTracks.sort((a, b) => {
      const pct = (track: typeof a) => {
        const done = track.lessons.filter((l) =>
          progress.some((p) => p.lessonId === l.id && p.completedAt),
        ).length;
        return done / track.lessons.length;
      };
      // In-progress first (> 0 and < 1), then not started, then complete
      const ap = pct(a);
      const bp = pct(b);
      const rank = (p: number) => (p === 1 ? 2 : p === 0 ? 1 : 0);
      return rank(ap) - rank(bp) || bp - ap;
    });
  } else if (sortBy === "az") {
    displayedTracks.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "default" && !activeField) {
    // Default order — preserve ALL_TRACK_META order (already set)
  }

  if (loading) {
    return (
      <>
        <div className="mb-3 flex animate-pulse gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-7 w-16 rounded-full bg-black/5" />
          ))}
        </div>
        <div className="mb-5 flex animate-pulse gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-7 w-20 rounded-full bg-black/5" />
          ))}
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-black/5" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      {/* Row 1 — Career field */}
      <div className="mb-3">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">Career field</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveField(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              activeField === null
                ? "bg-ink text-paper"
                : "border border-black/10 bg-white text-muted hover:text-ink"
            }`}
          >
            All
          </button>
          {CAREER_FIELDS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveField(activeField === f.id ? null : f.id)}
              title={f.description}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                activeField === f.id
                  ? "bg-accent text-paper"
                  : "border border-black/10 bg-white text-muted hover:border-accent/30 hover:text-accent"
              }`}
            >
              {f.id}
            </button>
          ))}
        </div>
      </div>

      {/* Row 2 — Difficulty + Sort */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">Difficulty</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveDifficulty(null)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                activeDifficulty === null
                  ? "bg-ink text-paper"
                  : "border border-black/10 bg-white text-muted hover:text-ink"
              }`}
            >
              All
            </button>
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setActiveDifficulty(activeDifficulty === d ? null : d)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  activeDifficulty === d
                    ? DIFFICULTY_COLORS[d]
                    : "border-black/10 bg-white text-muted hover:text-ink"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">Sort by</p>
          <div className="flex gap-1.5">
            {(["default", "progress", "az"] as SortBy[]).map((s) => {
              const label = s === "default" ? "Default" : s === "progress" ? "Progress" : "A–Z";
              return (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    sortBy === s
                      ? "bg-ink text-paper"
                      : "border border-black/10 bg-white text-muted hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {displayedTracks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white p-8 text-center">
          <p className="text-sm text-muted">No tracks match your filters.</p>
          <button
            onClick={() => { setActiveDifficulty(null); setActiveField(null); }}
            className="mt-3 text-sm font-medium text-accent hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedTracks.map((track) => {
            const completedCount = track.lessons.filter((l) =>
              progress.some((p) => p.lessonId === l.id && p.completedAt),
            ).length;
            const total = track.lessons.length;
            const pct = Math.round((completedCount / total) * 100);
            const started = completedCount > 0;
            const matchCount = activeField
              ? track.lessons.filter((l) => l.fields?.includes(activeField)).length
              : null;

            return (
              <Link
                key={track.id}
                href={`/tracks/${track.id}`}
                className="block rounded-2xl border border-black/5 bg-white p-5 transition hover:border-accent/30 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          track.difficulty === "Beginner"
                            ? "bg-success/10 text-success"
                            : track.difficulty === "Intermediate"
                              ? "bg-warn/10 text-warn"
                              : "bg-danger/10 text-danger"
                        }`}
                      >
                        {track.difficulty}
                      </span>
                      <span className="text-xs text-muted">
                        {total} lesson{total !== 1 ? "s" : ""}
                      </span>
                      {matchCount !== null && (
                        <span className={`text-xs font-medium ${matchCount > 0 ? "text-accent" : "text-muted"}`}>
                          {matchCount} of {total} match
                        </span>
                      )}
                    </div>
                    <h2 className="mt-2 font-semibold">{track.title}</h2>
                    <p className="mt-1 text-sm leading-snug text-muted">{track.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {started ? (
                      <span className="text-sm font-medium text-accent">{pct}%</span>
                    ) : (
                      <span className="text-sm text-muted">Start →</span>
                    )}
                  </div>
                </div>

                {started && (
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/5">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
