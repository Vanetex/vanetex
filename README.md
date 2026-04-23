# AI Investing Trainer — Beta

A daily training tool that helps beginner investors build real decision-making intuition through reps, AI feedback, and structured reflection. Not a course, not a simulator — a **training + feedback system**.

> Train like an investor in 10 minutes.

---

## The core loop

1. **Decide.** Read a real-world stock scenario (metrics + headlines + signal). Choose Buy / Hold / Pass, set your confidence, and write 2–4 sentences of reasoning.
2. **Get graded.** A senior buy-side analyst persona (powered by Claude or GPT) scores your *reasoning* and your *decision* on 0–100, flags what you did well, what you missed, and gives one concrete tip.
3. **See the outcome.** A predefined forward return reveals whether the call was right, wrong, or ambiguous — plus a "luck vs skill" callout when confidence and outcome diverge.
4. **Reflect.** Three structured prompts go into your journal, linked back to the decision and its outcome.
5. **Track progress.** Rolling skill score, decision accuracy, and confidence calibration tell you whether your judgment is actually improving.

---

## File structure

```
Investing App/
├─ app/
│  ├─ layout.tsx              # Global shell + nav
│  ├─ page.tsx                # Landing
│  ├─ globals.css             # Tailwind + transitions + progress bar
│  ├─ challenge/page.tsx      # The full daily flow (state machine)
│  ├─ journal/page.tsx        # Past reflections
│  ├─ progress/page.tsx       # Skill score, accuracy, calibration, trend
│  ├─ history/page.tsx        # [BONUS] Review past decisions, expandable
│  └─ api/evaluate/route.ts   # AI evaluation endpoint (Anthropic or OpenAI)
├─ components/
│  ├─ Nav.tsx
│  ├─ ScenarioCard.tsx
│  ├─ DecisionInput.tsx       # Buy/Hold/Pass + confidence slider + reasoning
│  ├─ FeedbackPanel.tsx       # Scores + did-well / missed / tip / tags
│  ├─ OutcomePanel.tsx        # Outcome %, verdict, insight line, ideal answer
│  └─ ReflectionPrompt.tsx    # 3-field structured journal entry
├─ data/
│  └─ scenarios.ts            # 8 hardcoded scenarios (growth vs value, good vs bad)
├─ lib/
│  ├─ types.ts                # Shared TS types
│  ├─ storage.ts              # localStorage wrapper (single-key array)
│  ├─ scoring.ts              # Verdict + progression math
│  └─ evaluationPrompt.ts     # THE CORE PROMPT (see below)
├─ .env.local.example
├─ package.json
├─ tsconfig.json
├─ tailwind.config.ts
├─ postcss.config.js
└─ next.config.js
```

---

## Setup

### 1. Install

```bash
cd "Investing App"
npm install
```

### 2. Configure the AI provider

Copy `.env.local.example` to `.env.local` and fill in ONE provider:

```bash
cp .env.local.example .env.local
```

**Anthropic (default):**

```
ANTHROPIC_API_KEY=sk-ant-...
AI_PROVIDER=anthropic
AI_MODEL=claude-sonnet-4-5
```

**OpenAI:**

```
OPENAI_API_KEY=sk-...
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
```

> **No API key?** The app still works — `/api/evaluate` falls back to a deterministic local rubric so the full flow remains usable offline. Feedback quality is worse; that's the point of using a real model.

### 3. Run

```bash
npm run dev
# http://localhost:3000
```

### 4. Build for production

```bash
npm run build
npm start
```

---

## Environment variables

| Variable            | Required | Description                                                             |
| ------------------- | -------- | ----------------------------------------------------------------------- |
| `AI_PROVIDER`       | No       | `anthropic` (default) or `openai`.                                      |
| `AI_MODEL`          | No       | Model name. Defaults: `claude-sonnet-4-5` / `gpt-4o-mini`.              |
| `ANTHROPIC_API_KEY` | If anthropic | Anthropic API key.                                                  |
| `OPENAI_API_KEY`    | If openai | OpenAI API key.                                                        |

Nothing is ever sent to any third party besides the chosen AI provider. API keys stay server-side in `app/api/evaluate/route.ts`; do not expose them as `NEXT_PUBLIC_*` variables. All decisions, reflections, and progress live in the browser's `localStorage` under the key `ait.decisions.v1`. `localStorage` is readable by any script running on this origin, so XSS prevention remains critical and this data should not be treated as secret storage.

---

## The AI evaluation prompt

The prompt (in `lib/evaluationPrompt.ts`) is the most load-bearing part of the product. It:

- Frames the model as a **senior buy-side equity analyst** mentoring a junior — direct, slightly critical, not a cheerleader.
- Grades along four explicit axes: **use of valuation**, **growth vs profitability**, **risk awareness**, **logical reasoning**.
- Explicitly **penalizes** vague answers, ignored metrics, and unjustified overconfidence.
- Forces a strict JSON output shape so the client can reliably render scores, bullets, tags, and an ideal-answer comparison.
- Requires every piece of feedback to reference something **concrete from the scenario** (a number, a headline, the signal).

If you want to tune the product's feel, tune this file.

---

## Design principles honoured

- **No auth, no real money, no DB.** Pure client-side storage + one API route.
- **Flow over features.** The user sees exactly one thing at a time: scenario → decision → feedback → outcome → reflection.
- **Feedback is specific.** Generic praise is explicitly discouraged in the system prompt.
- **Progression is earned.** Skill score is a rolling average of decision-quality scores; accuracy ignores neutral outcomes; calibration measures whether confidence is backed by evidence.

## Non-goals (deliberately out of scope)

- Real brokerage integration or live prices.
- Portfolio accounting, P&L, or Sharpe-ratio theatre.
- Free-text rich-editor journaling.
- Educational courseware.

Keep it focused. Reps + feedback is the product.
