"use client";

import { useEffect, useState } from "react";
import { ALL_ACHIEVEMENTS } from "@/lib/achievements";

interface Props {
  newIds: string[];
}

export default function AchievementToast({ newIds }: Props) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => i + 1);
        setVisible(true);
      }, 300);
    }, 3500);
    return () => clearTimeout(t);
  }, [index, visible]);

  const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === newIds[index]);
  if (!achievement || index >= newIds.length) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 w-72 transition-opacity duration-300 ${
        visible ? "opacity-100 slide-up" : "opacity-0"
      }`}
    >
      <div className="surface-card rounded-2xl px-4 py-3.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-warn">
          Achievement unlocked
        </p>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-2xl">{achievement.icon}</span>
          <div>
            <p className="text-sm font-semibold">{achievement.title}</p>
            <p className="text-xs text-muted">{achievement.description}</p>
          </div>
        </div>
        {newIds.length > 1 && (
          <p className="mt-2 text-right text-[10px] text-muted">
            {index + 1} / {newIds.length}
          </p>
        )}
      </div>
    </div>
  );
}
