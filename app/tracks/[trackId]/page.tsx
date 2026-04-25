"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getTrackMeta } from "@/data/trackMeta";
import { listLessonProgress } from "@/lib/supabase/lessonProgress";
import { CAREER_FIELDS, type CareerField, type LessonProgress } from "@/lib/types";

type LessonDifficulty = "Easy" | "Medium" | "Hard";

export default function TrackDetailPage() {
  const { trackId } = useParams<{ trackId: string }>();
  const track = getTrackMeta(trackId);

  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [diffFilter, setDiffFilter] = useState<LessonDifficulty | null>(null);
  const [fieldFilter, setFieldFilter] = useState<CareerField | null>(null);

  useEffect(() => {
    listLessonProgress().then((p) => {
      setProgress(p);
      setLoading(false);
    });
  }, []);

  if (!track) {
    return (
      <section>
        <p className="text-muted">Track not found.</p>
        <Link href="/tracks" className="mt-4 inline-block text-sm text-accent hover:underline">
          ← Back to tracks
        </Link>
      </section>
    );
  }

  const completedIds = new Set(
    progress.filter((p) => p.completedAt).map((p) => p.lessonId),
  );

  const nextLesson = track.lessons.find((l) => !completedIds.has(l.id));
  const allDone = track.lessons.every((l) => completedIds.has(l.id));

  // Pre-compute state for every lesson using original indices (preserves lock logic)
  const lessonsWithState = track.lessons.map((lesson, index) => {
    const done = completedIds.has(lesson.id);
    const isNext = nextLesson?.id === lesson.id;
    const locked = !done && !isNext && index > 0 &&
      !completedIds.has(track.lessons[index - 1]?.id ?? "");
    return { lesson, originalIndex: index, done, isNext, locked };
  });

  // Filter for display — lock logic already baked in from original order
  const displayed = lessonsWithState.filter(({ lesson }) => {
    if (diffFilter && lesson.difficulty !== diffFilter) return false;
    if (fieldFilter && !lesson.fields?.includes(fieldFilter)) return false;
    return true;
  });

  // Collect fields that actually appear in this track (for filter pills)
  const trackFields = Array.from(
    new Set(track.lessons.flatMap((l) => l.fields ?? [])),
  ) as CareerField[];

  const hasFilters = diffFilter !== null || fieldFilter !== null;

  return (
    <section>
      <Link
        href="/tracks"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
      >
        ← All tracks
      </Link>

      <div className="mb-5">
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
        <h1 className="mt-2 text-xl font-semibold tracking-tight">{track.title}</h1>
        <p className="mt-1 text-sm text-muted">{track.description}</p>
      </div>

      {/* Filters */}
      {!loading && (
        <div className="mb-4 space-y-2.5">
          {/* Difficulty */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted w-14 shrink-0">
              Difficulty
            </span>
            <button
              onClick={() => setDiffFilter(null)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                diffFilter === null ? "bg-ink text-paper" : "border border-black/10 bg-white text-muted hover:text-ink"
              }`}
            >
              All
            </button>
            {(["Easy", "Medium", "Hard"] as LessonDifficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDiffFilter(diffFilter === d ? null : d)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                  diffFilter === d
                    ? d === "Easy"
                      ? "border-success/30 bg-success/10 text-success"
                      : d === "Medium"
                        ? "border-warn/30 bg-warn/10 text-warn"
                        : "border-danger/30 bg-danger/10 text-danger"
                    : "border-black/10 bg-white text-muted hover:text-ink"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Career field */}
          {trackFields.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted w-14 shrink-0">
                Field
              </span>
              <button
                onClick={() => setFieldFilter(null)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                  fieldFilter === null ? "bg-ink text-paper" : "border border-black/10 bg-white text-muted hover:text-ink"
                }`}
              >
                All
              </button>
              {trackFields.map((f) => {
                const meta = CAREER_FIELDS.find((cf) => cf.id === f);
                return (
                  <button
                    key={f}
                    onClick={() => setFieldFilter(fieldFilter === f ? null : f)}
                    title={meta?.description}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                      fieldFilter === f
                        ? "bg-accent text-paper"
                        : "border border-black/10 bg-white text-muted hover:border-accent/30 hover:text-accent"
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-3">
          {track.lessons.map((l) => (
            <div key={l.id} className="h-16 rounded-2xl bg-black/5" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white p-8 text-center">
          <p className="text-sm text-muted">No lessons match your filters.</p>
          <button
            onClick={() => { setDiffFilter(null); setFieldFilter(null); }}
            className="mt-3 text-sm font-medium text-accent hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(({ lesson, originalIndex, done, isNext, locked }) => {
            const lessonProgress = progress.find((p) => p.lessonId === lesson.id);
            return (
              <Link
                key={lesson.id}
                href={locked ? "#" : `/tracks/${track.id}/${lesson.id}`}
                className={`flex items-center gap-4 rounded-2xl border p-4 transition ${
                  locked
                    ? "cursor-not-allowed border-black/5 opacity-50"
                    : done
                      ? "border-success/20 bg-success/5 hover:border-success/30"
                      : isNext
                        ? "border-accent/20 bg-accent/5 hover:border-accent/30"
                        : "border-black/5 bg-white hover:border-black/10"
                }`}
                onClick={(e) => locked && e.preventDefault()}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    done ? "bg-success text-white" : isNext ? "bg-accent text-white" : "bg-black/8 text-muted"
                  }`}
                >
                  {done ? "✓" : originalIndex + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{lesson.title}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        lesson.difficulty === "Easy"
                          ? "bg-success/10 text-success"
                          : lesson.difficulty === "Medium"
                            ? "bg-warn/10 text-warn"
                            : "bg-danger/10 text-danger"
                      }`}
                    >
                      {lesson.difficulty}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">{lesson.concept}</p>
                  {lesson.fields && lesson.fields.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {lesson.fields.map((f) => (
                        <span
                          key={f}
                          className={`rounded-full border px-1.5 py-0.5 text-[10px] font-semibold transition ${
                            fieldFilter === f
                              ? "border-accent/40 bg-accent/10 text-accent"
                              : "border-accent/20 bg-accent/5 text-accent"
                          }`}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {done && lessonProgress && (
                  <span className="shrink-0 text-xs text-success font-medium">
                    {lessonProgress.practiceScore}/{lessonProgress.practiceTotal} correct
                  </span>
                )}
                {!done && isNext && (
                  <span className="shrink-0 text-xs font-medium text-accent">Start →</span>
                )}
                {locked && (
                  <span className="shrink-0 text-xs text-muted">🔒</span>
                )}
              </Link>
            );
          })}

          {hasFilters && displayed.length < track.lessons.length && (
            <p className="pt-1 text-center text-xs text-muted">
              Showing {displayed.length} of {track.lessons.length} lessons ·{" "}
              <button
                onClick={() => { setDiffFilter(null); setFieldFilter(null); }}
                className="text-accent hover:underline"
              >
                show all
              </button>
            </p>
          )}
        </div>
      )}

      {!loading && allDone && !hasFilters && (
        <div className="mt-6 rounded-2xl border border-success/20 bg-success/5 p-5 text-center">
          <p className="font-semibold text-success">Track complete 🎓</p>
          <p className="mt-1 text-sm text-muted">You&apos;ve finished every lesson in this track.</p>
          <Link
            href="/tracks"
            className="mt-3 inline-block rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper"
          >
            Explore more tracks
          </Link>
        </div>
      )}
    </section>
  );
}
