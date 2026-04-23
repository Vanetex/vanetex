import { createClient } from "./client";
import type { LessonProgress } from "../types";

type LessonProgressRow = {
  id: string;
  user_id: string;
  track_id: string;
  lesson_id: string;
  practice_score: number;
  practice_total: number;
  application_completed: boolean;
  completed_at: string | null;
  created_at: string;
};

function rowToProgress(r: LessonProgressRow): LessonProgress {
  return {
    lessonId: r.lesson_id,
    trackId: r.track_id,
    practiceScore: r.practice_score,
    practiceTotal: r.practice_total,
    applicationCompleted: r.application_completed,
    completedAt: r.completed_at ? new Date(r.completed_at).getTime() : 0,
  };
}

/** Get all lesson progress records for the current user. */
export async function listLessonProgress(): Promise<LessonProgress[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[lessonProgress] listLessonProgress error:", error.message);
    return [];
  }

  return (data as LessonProgressRow[]).map(rowToProgress);
}

/** Get progress for a single lesson. */
export async function getLessonProgress(
  lessonId: string,
): Promise<LessonProgress | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (error || !data) return undefined;
  return rowToProgress(data as LessonProgressRow);
}

/** Upsert lesson progress — creates or updates the record for this lesson. */
export async function saveLessonProgress(params: {
  trackId: string;
  lessonId: string;
  practiceScore: number;
  practiceTotal: number;
  applicationCompleted: boolean;
  completed: boolean;
}): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      track_id: params.trackId,
      lesson_id: params.lessonId,
      practice_score: params.practiceScore,
      practice_total: params.practiceTotal,
      application_completed: params.applicationCompleted,
      completed_at: params.completed ? new Date().toISOString() : null,
    },
    { onConflict: "user_id,lesson_id" },
  );

  if (error) {
    console.error("[lessonProgress] saveLessonProgress error:", error.message);
  }
}
