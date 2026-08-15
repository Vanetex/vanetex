// Shared type definitions used across the app.

export type Action = "BUY" | "HOLD" | "PASS";

/** A single hardcoded training scenario. */
export interface Scenario {
  id: string;
  ticker: string;
  company: string;
  sector: string;
  // --- Snapshot metrics the user sees when making their decision ---
  price: number;               // current share price (USD)
  revenueGrowthPct: number;    // YoY revenue growth (%)
  peRatio: number;             // price / earnings
  profitMarginPct: number;     // net margin (%)
  // Short news headlines shown alongside metrics
  headlines: string[];
  // A subtle cue — e.g. "Margins declining", "Insider buying"
  signal?: string;
  // One-line business description (keeps beginners grounded)
  description: string;
  // --- Predefined outcome (revealed AFTER evaluation) ---
  outcome: {
    // Forward return % over the scenario horizon (e.g. +12 means +12%)
    returnPct: number;
    // Human-readable summary of "what happened next"
    summary: string;
    // The "ideal" action given the data + outcome (for Compare vs Ideal)
    idealAction: Action;
    // Why the ideal action was correct — used in Compare vs Ideal
    idealRationale: string;
  };
}

/** A decision the user made on a scenario, plus the AI evaluation + outcome. */
export interface DecisionRecord {
  id: string;                 // uuid
  scenarioId: string;
  ticker: string;
  company: string;
  action: Action;
  confidence: number;         // 1..10
  reasoning: string;
  timestamp: number;          // ms epoch
  // --- Filled in after AI evaluation ---
  evaluation?: Evaluation;
  // --- Filled in after outcome reveal ---
  outcomeReturnPct?: number;
  outcomeVerdict?: "CORRECT" | "INCORRECT" | "NEUTRAL";
  // --- Filled in after reflection ---
  reflection?: Reflection;
}

export interface Evaluation {
  reasoningScore: number;     // 0..100 — quality of the WRITE-UP
  decisionScore: number;      // 0..100 — quality of the CHOICE given the data
  didWell: string[];          // 1–2 bullets
  missed: string[];           // 1–2 bullets
  improvement: string;        // 1 actionable tip
  tags: string[];             // e.g. "Ignored valuation"
  // Bonus: "ideal answer" text for Compare vs Ideal
  idealAnswer?: string;
  // True when the real AI grader was unreachable (no API key, provider
  // error, or a response that failed to parse) and this is the crude
  // deterministic rubric instead — must stay visible to the user, not a
  // silent substitution for real AI feedback.
  isFallback?: boolean;
}

export interface Reflection {
  missed: string;             // "What did you miss?"
  differently: string;        // "What would you do differently?"
  keySignal: string;          // "What signal mattered most?"
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Learning Tracks
// ---------------------------------------------------------------------------

export interface Track {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  lessons: Lesson[];
}

export type CareerField = "IB" | "PE" | "HF" | "VC" | "AM";

export const CAREER_FIELDS: { id: CareerField; label: string; description: string }[] = [
  { id: "IB", label: "Investment Banking", description: "M&A, capital markets, deal execution" },
  { id: "PE", label: "Private Equity", description: "Buyouts, portfolio ops, value creation" },
  { id: "HF", label: "Hedge Fund", description: "Long/short equity, market analysis" },
  { id: "VC", label: "Venture Capital", description: "Early-stage investing, growth metrics" },
  { id: "AM", label: "Asset Management", description: "Portfolio construction, public markets" },
];

export interface Lesson {
  id: string;
  trackId: string;
  order: number;
  title: string;
  concept: string;        // e.g. "P/E Ratio"
  difficulty: "Easy" | "Medium" | "Hard";
  fields: CareerField[];  // career paths this lesson is most relevant for
  teaching: {
    intro: string;        // 1–2 sentence hook
    sections: {
      heading: string;
      body: string;
      example?: string;   // concrete worked example
    }[];
    keyTakeaway: string;  // single-sentence summary
  };
  practice: PracticeQuestion[];
  apply: ApplyProblem;
}

export interface PracticeQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;    // shown after answering
}

export interface ApplyProblem {
  setup: string;          // 2–3 sentence scenario context
  data: { label: string; value: string }[];  // metrics to analyse
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/** Persisted progress for a single lesson per user */
export interface LessonProgress {
  lessonId: string;
  trackId: string;
  practiceScore: number;   // correct answers
  practiceTotal: number;
  applicationCompleted: boolean;
  completedAt: number;     // ms epoch
}

// ---------------------------------------------------------------------------

/** Overall progression snapshot derived from DecisionRecord[] */
export interface ProgressSnapshot {
  totalDecisions: number;
  skillScore: number;            // rolling avg of last 5 decisionScore values
  decisionAccuracyPct: number;   // % CORRECT (ignoring NEUTRAL)
  calibration: number;           // 0..100 — high-conf picks that were correct
  level: "Beginner" | "Intermediate" | "Advanced";
  trend: "improving" | "declining" | "steady";
}
