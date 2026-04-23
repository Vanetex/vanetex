"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getLessonById } from "@/data/tracks";
import { getTrackMeta } from "@/data/trackMeta";
import { getLessonProgress } from "@/lib/supabase/lessonProgress";
import LessonPlayer from "@/components/LessonPlayer";
import type { LessonProgress } from "@/lib/types";

export default function LessonPage() {
  const { trackId, lessonId } = useParams<{
    trackId: string;
    lessonId: string;
  }>();

  const result = getLessonById(trackId, lessonId);
  const track = getTrackMeta(trackId);

  const [existingProgress, setExistingProgress] = useState<
    LessonProgress | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLessonProgress(lessonId).then((p) => {
      setExistingProgress(p);
      setLoading(false);
    });
  }, [lessonId]);

  if (!result || !track) {
    return (
      <section>
        <p className="text-muted">Lesson not found.</p>
        <Link
          href="/tracks"
          className="mt-4 inline-block text-sm text-accent hover:underline"
        >
          ← Back to tracks
        </Link>
      </section>
    );
  }

  const { lesson } = result;

  // Find the next lesson in the track
  const lessonIndex = track.lessons.findIndex((l) => l.id === lessonId);
  const nextLesson = track.lessons[lessonIndex + 1];

  return (
    <section>
      <Link
        href={`/tracks/${trackId}`}
        className="mb-5 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
      >
        ← {track.title}
      </Link>

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-8 w-48 rounded-lg bg-black/5" />
          <div className="h-40 rounded-2xl bg-black/5" />
          <div className="h-40 rounded-2xl bg-black/5" />
        </div>
      ) : (
        <LessonPlayer
          lesson={lesson}
          trackId={trackId}
          nextLessonId={nextLesson?.id}
          alreadyCompleted={
            existingProgress !== undefined && existingProgress.completedAt > 0
          }
        />
      )}
    </section>
  );
}
