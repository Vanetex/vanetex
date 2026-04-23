"use client";

import { useState } from "react";
import Link from "next/link";
import type { Lesson, PracticeQuestion, ApplyProblem } from "@/lib/types";
import { saveLessonProgress, listLessonProgress } from "@/lib/supabase/lessonProgress";
import { listAwardedAchievements, awardAchievements } from "@/lib/supabase/achievements";
import { computeEligibleAchievements } from "@/lib/achievements";
import AchievementToast from "@/components/AchievementToast";

type Stage = "teaching" | "practice" | "apply" | "complete";

interface Props {
  lesson: Lesson;
  trackId: string;
  nextLessonId?: string;    // undefined if this is the last lesson
  alreadyCompleted?: boolean;
}

export default function LessonPlayer({
  lesson,
  trackId,
  nextLessonId,
  alreadyCompleted = false,
}: Props) {
  const [stage, setStage] = useState<Stage>(
    alreadyCompleted ? "complete" : "teaching",
  );

  // Practice state
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [practiceAnswers, setPracticeAnswers] = useState<boolean[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  // Apply state
  const [applySelected, setApplySelected] = useState<number | null>(null);
  const [applyRevealed, setApplyRevealed] = useState(false);

  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  const currentQuestion: PracticeQuestion = lesson.practice[practiceIndex];
  const practiceScore = practiceAnswers.filter(Boolean).length;

  function handlePracticeSelect(index: number) {
    if (showExplanation) return;
    setSelectedOption(index);
    setShowExplanation(true);
    setPracticeAnswers((prev) => [
      ...prev,
      index === currentQuestion.correctIndex,
    ]);
  }

  function handlePracticeNext() {
    setShowExplanation(false);
    setSelectedOption(null);
    if (practiceIndex + 1 < lesson.practice.length) {
      setPracticeIndex((i) => i + 1);
    } else {
      setStage("apply");
    }
  }

  function handleApplySelect(index: number) {
    if (applyRevealed) return;
    setApplySelected(index);
  }

  async function handleApplyReveal() {
    if (applySelected === null) return;
    setApplyRevealed(true);
    const applicationCorrect = applySelected === lesson.apply.correctIndex;
    const finalScore = practiceScore + (applicationCorrect ? 1 : 0);
    const finalTotal = lesson.practice.length + 1;

    await saveLessonProgress({
      trackId,
      lessonId: lesson.id,
      practiceScore: finalScore,
      practiceTotal: finalTotal,
      applicationCompleted: true,
      completed: true,
    });
  }

  async function handleFinish() {
    setStage("complete");
    const [progress, awarded] = await Promise.all([
      listLessonProgress(),
      listAwardedAchievements(),
    ]);
    const awardedSet = new Set(awarded.map((a) => a.id));
    const eligible = computeEligibleAchievements({ lessonProgress: progress });
    const toAward = eligible.filter((id) => !awardedSet.has(id));
    const newlyAwarded = await awardAchievements(toAward);
    if (newlyAwarded.length > 0) setNewAchievements(newlyAwarded);
  }

  function handleRedo() {
    setPracticeIndex(0);
    setSelectedOption(null);
    setPracticeAnswers([]);
    setShowExplanation(false);
    setApplySelected(null);
    setApplyRevealed(false);
    setStage("teaching");
  }

  return (
    <div className="space-y-6">
      {newAchievements.length > 0 && <AchievementToast newIds={newAchievements} />}
      {/* Progress indicator */}
      {stage !== "complete" && (
        <div className="flex items-center gap-2">
          {(["teaching", "practice", "apply"] as Stage[]).map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                stage === s
                  ? "bg-accent"
                  : ["practice", "apply"].includes(stage) && s === "teaching"
                    ? "bg-accent/30"
                    : stage === "apply" && s === "practice"
                      ? "bg-accent/30"
                      : "bg-black/10"
              }`}
            />
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TEACHING STAGE                                                       */}
      {/* ------------------------------------------------------------------ */}
      {stage === "teaching" && (
        <div className="fade-in space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-accent">
              {lesson.concept}
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              {lesson.title}
            </h2>
            <p className="mt-2 text-muted">{lesson.teaching.intro}</p>
          </div>

          {lesson.teaching.sections.map((section) => (
            <div
              key={section.heading}
              className="rounded-2xl border border-black/5 bg-white p-5"
            >
              <h3 className="font-semibold">{section.heading}</h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/80">
                {section.body}
              </p>
              {section.example && (
                <div className="mt-3 rounded-xl bg-accent/5 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-accent">
                    Example
                  </p>
                  <p className="mt-1 text-sm text-ink/80">{section.example}</p>
                </div>
              )}
            </div>
          ))}

          {/* Key takeaway */}
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
            <p className="text-xs font-medium uppercase tracking-widest text-accent">
              Key Takeaway
            </p>
            <p className="mt-1 font-medium">{lesson.teaching.keyTakeaway}</p>
          </div>

          <button
            onClick={() => setStage("practice")}
            className="w-full rounded-full bg-accent px-6 py-3 font-medium text-white transition hover:bg-accent/90"
          >
            I&apos;m ready — start practice →
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* PRACTICE STAGE                                                       */}
      {/* ------------------------------------------------------------------ */}
      {stage === "practice" && (
        <div className="fade-in space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Practice</h2>
            <span className="text-sm text-muted">
              {practiceIndex + 1} / {lesson.practice.length}
            </span>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-5">
            <p className="font-medium leading-snug">
              {currentQuestion.question}
            </p>

            <div className="mt-4 space-y-2">
              {currentQuestion.options.map((option, i) => {
                let className =
                  "w-full rounded-xl border px-4 py-3 text-left text-sm transition ";
                if (!showExplanation) {
                  className +=
                    selectedOption === i
                      ? "border-accent bg-accent/5 text-ink"
                      : "border-black/10 hover:border-accent/40";
                } else if (i === currentQuestion.correctIndex) {
                  className += "border-success bg-success/5 text-ink";
                } else if (i === selectedOption) {
                  className += "border-danger bg-danger/5 text-ink";
                } else {
                  className += "border-black/10 text-muted";
                }

                return (
                  <button
                    key={i}
                    className={className}
                    onClick={() => handlePracticeSelect(i)}
                  >
                    <span className="mr-2 font-medium text-muted">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="fade-in mt-4 rounded-xl bg-black/3 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  {selectedOption === currentQuestion.correctIndex
                    ? "✓ Correct"
                    : "✗ Not quite"}
                </p>
                <p className="mt-1 text-sm text-ink/80">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}
          </div>

          {showExplanation && (
            <button
              onClick={handlePracticeNext}
              className="w-full rounded-full bg-ink px-6 py-3 font-medium text-paper transition hover:bg-ink/80"
            >
              {practiceIndex + 1 < lesson.practice.length
                ? "Next question →"
                : "Move to application →"}
            </button>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* APPLY STAGE                                                          */}
      {/* ------------------------------------------------------------------ */}
      {stage === "apply" && (
        <div className="fade-in space-y-5">
          <div>
            <h2 className="font-semibold">Apply it</h2>
            <p className="mt-1 text-sm text-muted">
              Use what you just learned on a real scenario.
            </p>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-5">
            <p className="text-sm leading-relaxed text-ink/80">
              {lesson.apply.setup}
            </p>

            {/* Data table */}
            <div className="mt-4 divide-y divide-black/5 rounded-xl border border-black/5">
              {lesson.apply.data.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between px-4 py-2.5 text-sm"
                >
                  <span className="text-muted">{row.label}</span>
                  <span className="font-medium">{row.value}</span>
                </div>
              ))}
            </div>

            <p className="mt-5 font-medium">{lesson.apply.question}</p>

            <div className="mt-3 space-y-2">
              {lesson.apply.options.map((option, i) => {
                let className =
                  "w-full rounded-xl border px-4 py-3 text-left text-sm transition ";
                if (!applyRevealed) {
                  className +=
                    applySelected === i
                      ? "border-accent bg-accent/5 text-ink"
                      : "border-black/10 hover:border-accent/40";
                } else if (i === lesson.apply.correctIndex) {
                  className += "border-success bg-success/5 text-ink";
                } else if (i === applySelected) {
                  className += "border-danger bg-danger/5 text-ink";
                } else {
                  className += "border-black/10 text-muted";
                }

                return (
                  <button
                    key={i}
                    className={className}
                    onClick={() => handleApplySelect(i)}
                  >
                    <span className="mr-2 font-medium text-muted">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>

            {applyRevealed && (
              <div className="fade-in mt-4 rounded-xl bg-black/3 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  {applySelected === lesson.apply.correctIndex
                    ? "✓ Correct"
                    : "✗ Not quite"}
                </p>
                <p className="mt-1 text-sm text-ink/80">
                  {lesson.apply.explanation}
                </p>
              </div>
            )}
          </div>

          {!applyRevealed ? (
            <button
              onClick={handleApplyReveal}
              disabled={applySelected === null}
              className="w-full rounded-full bg-accent px-6 py-3 font-medium text-white transition hover:bg-accent/90 disabled:opacity-40"
            >
              Reveal answer
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="w-full rounded-full bg-ink px-6 py-3 font-medium text-paper transition hover:bg-ink/80"
            >
              Finish lesson →
            </button>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* COMPLETE STAGE                                                       */}
      {/* ------------------------------------------------------------------ */}
      {stage === "complete" && (
        <div className="fade-in space-y-5">
          <div className="rounded-2xl border border-black/5 bg-white p-6 text-center">
            {(() => {
              const total = lesson.practice.length + 1;
              const earned = alreadyCompleted
                ? total
                : practiceScore + (applySelected === lesson.apply.correctIndex ? 1 : 0);
              const isPerfect = earned === total;
              return (
                <>
                  <div className="text-3xl">{isPerfect ? "🏆" : "🎓"}</div>
                  <h2 className="mt-3 text-xl font-semibold">Lesson complete</h2>
                  <p className="mt-1 text-muted">{lesson.title}</p>
                  {!alreadyCompleted && (
                    <div
                      className={`mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 ${isPerfect ? "bg-success/10" : "bg-warn/10"}`}
                    >
                      <span className={`text-sm font-medium ${isPerfect ? "text-success" : "text-warn"}`}>
                        {earned} / {total} correct
                        {isPerfect ? " — perfect!" : ""}
                      </span>
                    </div>
                  )}
                  {!isPerfect && !alreadyCompleted && (
                    <p className="mt-3 text-sm text-muted">
                      Review the teaching material and try again to get a perfect score.
                    </p>
                  )}
                </>
              );
            })()}
          </div>

          <div className="flex flex-col gap-2">
            {(() => {
              const total = lesson.practice.length + 1;
              const earned = alreadyCompleted
                ? total
                : practiceScore + (applySelected === lesson.apply.correctIndex ? 1 : 0);
              const isPerfect = earned === total;
              return (
                <>
                  {!isPerfect && (
                    <button
                      onClick={handleRedo}
                      className="w-full rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-accent/90"
                    >
                      Try again →
                    </button>
                  )}
                  <div className="flex gap-3">
                    <Link
                      href={`/tracks/${trackId}`}
                      className="flex-1 rounded-full border border-black/10 px-5 py-3 text-center text-sm font-medium transition hover:border-black/30"
                    >
                      Back to track
                    </Link>
                    {nextLessonId ? (
                      <Link
                        href={`/tracks/${trackId}/${nextLessonId}`}
                        className="flex-1 rounded-full bg-ink px-5 py-3 text-center text-sm font-medium text-paper transition hover:bg-ink/80"
                      >
                        Next lesson →
                      </Link>
                    ) : (
                      <Link
                        href="/tracks"
                        className="flex-1 rounded-full bg-ink px-5 py-3 text-center text-sm font-medium text-paper transition hover:bg-ink/80"
                      >
                        All tracks →
                      </Link>
                    )}
                  </div>
                  {isPerfect && alreadyCompleted && (
                    <button
                      onClick={handleRedo}
                      className="w-full rounded-full border border-black/10 px-5 py-3 text-sm font-medium transition hover:border-black/30"
                    >
                      Redo lesson
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
