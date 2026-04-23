"use client";

import type { DecisionRecord, Reflection, Evaluation } from "./types";

/**
 * localStorage wrapper. All decisions/reflections live in ONE key as an array.
 * Simplicity > indexing — a learner will rarely have more than a few hundred entries.
 */
const KEY = "ait.decisions.v1";

function safeRead(): DecisionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite(records: DecisionRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(records));
}

export function listDecisions(): DecisionRecord[] {
  // Newest first for UI convenience.
  return safeRead().sort((a, b) => b.timestamp - a.timestamp);
}

export function getDecision(id: string): DecisionRecord | undefined {
  return safeRead().find((r) => r.id === id);
}

export function saveDecision(record: DecisionRecord) {
  const all = safeRead();
  const idx = all.findIndex((r) => r.id === record.id);
  if (idx >= 0) all[idx] = record;
  else all.push(record);
  safeWrite(all);
}

export function attachEvaluation(id: string, evaluation: Evaluation) {
  const r = getDecision(id);
  if (!r) return;
  saveDecision({ ...r, evaluation });
}

export function attachOutcome(
  id: string,
  outcomeReturnPct: number,
  verdict: "CORRECT" | "INCORRECT" | "NEUTRAL",
) {
  const r = getDecision(id);
  if (!r) return;
  saveDecision({ ...r, outcomeReturnPct, outcomeVerdict: verdict });
}

export function attachReflection(id: string, reflection: Reflection) {
  const r = getDecision(id);
  if (!r) return;
  saveDecision({ ...r, reflection });
}

export function clearAll() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

/** Small uuid — enough for a localStorage-only app. */
export function uid() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 10)
  );
}
