# Cursor Handoff — Vanetex Investing (AI Investing Trainer)

**Last updated: 2026-04-17**

This document is the single source of truth for handing context to Cursor. Read it fully before making any changes. The app is heading to **worldwide production launch** — treat it accordingly.

---

## 1. What the app is

A daily training tool for beginner investors (target: high school + early college, 13+). One scenario/day → user makes a Buy/Hold/Pass call with confidence + written reasoning → AI analyst (Claude or GPT) grades the reasoning 0–100 → outcome is revealed → user journals a reflection. All user data is persisted in **Supabase** (not localStorage — see section 4).

---

## 2. Tech stack

- **Next.js 14.2.35** (App Router, `app/` directory)
- **React 18.3.1**, TypeScript 5.5.3, strict mode
- **Tailwind 3.4.6** (custom colour palette: `ink`, `paper`, `accent`, `success`, `warn`, `danger`, `muted`)
- **Supabase** (`@supabase/ssr ^0.10.2`, `@supabase/supabase-js ^2.103.3`) — auth + database
- **Node runtime** on API routes (`export const runtime = "nodejs"`)
- No state library. No ORM. No other runtime deps.

Package manager: npm. Node ≥ 18.17.

---

## 3. Full file map

```
app/
  layout.tsx                  Global shell — imports globals.css, renders <Nav/>, max-w-2xl main
  page.tsx                    Landing page — public, auth-aware CTA (shows Sign In / Start based on session)
  globals.css                 Tailwind directives + .fade-in keyframes + .progress-bar sweep

  challenge/page.tsx          STATE MACHINE: loading → deciding → evaluating → feedback → outcome → done
                              On mount: calls getDecisionForScenario() to restore state if user already did today's challenge
  journal/page.tsx            Lists DecisionRecords that have a reflection attached
  progress/page.tsx           Skill score, accuracy, calibration, trend (from lib/scoring.ts)
  history/page.tsx            Expandable list of all DecisionRecords + "Reset all" button

  api/evaluate/route.ts       POST — calls Anthropic or OpenAI, parses JSON, falls back to local rubric

  auth/
    callback/route.ts         Server route — exchanges auth code for session (PKCE), redirects home
    confirm/page.tsx          Client page — handles OAuth hash fragment → sets session → redirects home
                              (hash fragments are lost in server redirects, so OAuth lands here client-side)
    sign-in/page.tsx          Email+password sign-in + Google/Apple OAuth buttons
    sign-up/page.tsx          Email+password sign-up (display_name, DOB with 13+ check) + Google/Apple OAuth
    sign-out/route.ts         Server route — calls supabase.auth.signOut(), redirects to /
    verify/page.tsx           "Check your email" holding page after email sign-up
    reset-password/page.tsx   Password reset request form (sends magic link)
    update-password/page.tsx  New password form (reached from reset magic link)

components/
  Nav.tsx                     Sticky top nav — usePathname for active state, auth-aware links
  ScenarioCard.tsx            Renders a Scenario (metrics grid, headlines, signal pill)
  DecisionInput.tsx           Buy/Hold/Pass buttons, 1-10 confidence slider, reasoning textarea
  FeedbackPanel.tsx           Two score tiles + didWell / missed / improvement / tags
  OutcomePanel.tsx            Return %, verdict pill, insight line, "Compare vs Ideal"
  ReflectionPrompt.tsx        Three textareas + save button

data/
  scenarios.ts                8 hardcoded Scenario objects + getTodayScenario() + getScenarioById()

lib/
  types.ts                    Action, Scenario, DecisionRecord, Evaluation, Reflection, ProgressSnapshot
  storage.ts                  LEGACY localStorage wrapper — still present but UNUSED. Do not call it.
  scoring.ts                  verdictFor(), levelFor(), computeProgress()
  evaluationPrompt.ts         SYSTEM_PROMPT + buildUserMessage() — the AI grading prompt
  supabase/
    client.ts                 createBrowserClient() — used in all client components
    server.ts                 createServerClient() — used in server components / route handlers
    middleware.ts             updateSession() — refreshes the Supabase session cookie on every request
    decisions.ts              Full CRUD for the `decisions` table — mirrors old storage.ts API shape

middleware.ts                 Thin wrapper: calls updateSession(), protects /challenge /journal /progress /history
```

---

## 4. Auth architecture (important — read carefully)

**Email+password flow:**
1. User signs up at `/auth/sign-up` → `supabase.auth.signUp()` with `display_name` + `date_of_birth` in `options.data`
2. Supabase sends a verification email. User is redirected to `/auth/verify` (static holding page).
3. User clicks email link → hits `/auth/callback?code=xxx` (server route) → exchanges code for session → redirects to `/`.
4. A database trigger on `auth.users` INSERT auto-creates a row in `public.profiles`.

**OAuth (Google) flow:**
1. User clicks "Continue with Google" on `/auth/sign-in` or `/auth/sign-up`
2. `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: "/auth/confirm" } })`
3. After Google auth, Supabase redirects to `/auth/confirm` — a **client component** that reads the hash fragment (`#access_token=...`), calls `supabase.auth.exchangeCodeForSession()`, then router.push("/").
4. **Why client page, not server route**: OAuth hash fragments are stripped by the browser before server routes see them. The server `/auth/callback` route handles PKCE code exchange (email flow); the client `/auth/confirm` page handles hash-based OAuth tokens.

**Apple OAuth**: Button exists in the UI but Apple OAuth is deferred — no Apple Developer account yet. The button should remain but is non-functional until configured.

**Session management:**
- `middleware.ts` / `lib/supabase/middleware.ts` runs on every request, calls `supabase.auth.getUser()`, and refreshes the session cookie.
- Protected routes: `/challenge`, `/journal`, `/progress`, `/history` — unauthenticated requests are redirected to `/auth/sign-in?next=<pathname>`.
- Authenticated users hitting `/auth/*` pages (except `/auth/sign-out`, `/auth/callback`, `/auth/confirm`, `/auth/update-password`) are redirected to `/`.

---

## 5. Database schema (Supabase / Postgres)

**`public.profiles`**
```sql
id             uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
display_name   text NOT NULL
date_of_birth  date  -- nullable for OAuth users who skip this step
created_at     timestamptz DEFAULT now()
-- CHECK: extract(year from age(date_of_birth)) >= 13 (when not null)
-- RLS: SELECT/UPDATE own row only (auth.uid() = id)
```

**`public.decisions`**
```sql
id                      uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id                 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
scenario_id             text NOT NULL
ticker                  text NOT NULL
company                 text NOT NULL
action                  text NOT NULL  -- 'BUY' | 'HOLD' | 'PASS'
confidence              integer NOT NULL  -- 1–10
reasoning               text NOT NULL
-- AI evaluation (nullable until evaluate step)
reasoning_score         integer
decision_score          integer
did_well                text[]
missed                  text[]
improvement             text
tags                    text[]
ideal_answer            text
-- Outcome (nullable until reveal step)
outcome_return_pct      numeric
outcome_verdict         text  -- 'CORRECT' | 'INCORRECT' | 'NEUTRAL'
-- Reflection (nullable until journal step)
reflection_missed       text
reflection_differently  text
reflection_key_signal   text
reflection_at           timestamptz
created_at              timestamptz DEFAULT now()
updated_at              timestamptz DEFAULT now()
-- RLS: all operations require auth.uid() = user_id
```

A DB trigger auto-updates `updated_at` on every row update.

---

## 6. Data layer — lib/supabase/decisions.ts

This is the live data layer. It replaces the old `lib/storage.ts` (which is dead code — do not use it).

| Function | What it does |
|---|---|
| `listDecisions()` | SELECT all for current user, newest first |
| `getDecision(id)` | SELECT single row by ID |
| `getDecisionForScenario(scenarioId)` | SELECT the most recent decision for a given scenario (used by challenge page to detect today's existing decision) |
| `saveDecision(params)` | INSERT new row, returns DB-generated UUID |
| `attachEvaluation(id, eval)` | UPDATE reasoning/decision scores + feedback fields |
| `attachOutcome(id, pct, verdict)` | UPDATE outcome fields |
| `attachReflection(id, reflection)` | UPDATE reflection fields |

All functions use `createClient()` (browser client). RLS enforces user isolation at the DB level — no need for manual user_id filters in app code beyond what's in `saveDecision`.

**All pages have been migrated** from `lib/storage.ts` to `lib/supabase/decisions.ts`. The old `storage.ts` file still exists but no page imports it.

---

## 7. Environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon/public key
ANTHROPIC_API_KEY=               # Optional — for AI evaluation
OPENAI_API_KEY=                  # Optional — for AI evaluation (fallback)
FINNHUB_API_KEY=                 # Required for Paper Trading (stock quotes, search, chart)
```

See `.env.local.example` for the full template. Never commit `.env.local`.

---

## 8. What NOT to change

- **`lib/evaluationPrompt.ts`** — the AI grading prompt is deliberately tuned. Do not rewrite the wording.
- **`data/scenarios.ts`** — scenario numbers are teaching setups. Do not "correct" them to real-world values.
- **Colour palette / layout / max-width** — all intentional design decisions.
- **`lib/storage.ts`** — leave it in place (dead code), do not delete or import it.
- **Auth redirect structure** — the client/server split between `/auth/callback` (server) and `/auth/confirm` (client) is intentional and load-bearing. Do not consolidate them.

---

## 9. Learning Tracks

A full structured learning system. Lives at `/tracks`.

**Routes:**
- `/tracks` — track listing with per-track progress bars
- `/tracks/[trackId]` — lesson list for a track, with locked/completed/next states
- `/tracks/[trackId]/[lessonId]` — lesson player (teaching → practice → apply → complete)

**Data:**
- `data/tracks.ts` — all hardcoded track and lesson content (`ALL_TRACKS`, `getTrackById()`, `getLessonById()`)
- `lib/supabase/lessonProgress.ts` — CRUD for `lesson_progress` table (`listLessonProgress`, `getLessonProgress`, `saveLessonProgress`)

**Components:**
- `components/LessonPlayer.tsx` — state machine: teaching → practice → apply → complete. Handles practice scoring, apply reveal, and saves progress to Supabase on completion.

**DB table: `lesson_progress`**
```
id                    uuid PK
user_id               uuid FK auth.users
track_id              text
lesson_id             text
practice_score        integer
practice_total        integer
application_completed boolean
completed_at          timestamptz (null until lesson finished)
UNIQUE(user_id, lesson_id)
RLS: user can only access own rows
```

**Lesson structure:** Each lesson has three phases — `teaching` (sectioned content + examples), `practice` (4 multiple choice questions with explanations), `apply` (a data scenario where the user applies the concept). Score = correct practice answers + correct apply answer.

**Lesson progression:** Lessons unlock sequentially within a track. A lesson is locked if the previous one isn't completed. On mount, the lesson page checks existing progress and restores `alreadyCompleted` state.

**Lesson difficulty:** Each `Lesson` has a `difficulty: "Easy" | "Medium" | "Hard"` field shown as a badge on the track detail page.

**Current content:** Track 1 "Financial Metrics 101" — 11 lessons:
1. P/E Ratio (Easy)
2. Revenue Growth (Easy)
3. Profit Margins (Easy)
4. Earnings Per Share (Easy)
5. Market Capitalization (Easy)
6. Debt-to-Equity Ratio (Medium)
7. Price-to-Book Ratio (Medium)
8. Free Cash Flow (Medium)
9. Return on Equity (Medium)
10. PEG Ratio (Medium)
11. EV/EBITDA (Hard)

**Protected route:** `/tracks` added to `PROTECTED_PREFIXES` in `lib/supabase/middleware.ts`.

---

## 10. Paper Trading

Live paper trading with real Finnhub stock prices. Lives at `/trade`.

**Route:** `app/trade/page.tsx` — three tabs: Portfolio, Trade, History.

**API routes (all server-side — Finnhub key never exposed to client):**
- `GET /api/stock/quote?symbol=AAPL` — returns price, change, day range, company name
- `GET /api/stock/search?q=apple` — returns up to 8 matching US common stocks
- `POST /api/trade/execute` — validates trade (sufficient cash/shares), fetches live price server-side, updates DB atomically. **Critical:** always `await createClient()` (it's async) — omitting the await causes a silent crash.
- `GET /api/portfolio/chart` — returns `{ portfolioPoints, spyPoints, annualReturn, totalReturn }`. Reconstructs daily portfolio value from trade history + Finnhub daily candles for each ticker held. SPY is indexed to $10,000 from the portfolio start date for fair comparison.

**Data layer:** `lib/supabase/paperTrading.ts` — `getOrCreatePortfolio`, `listPositions`, `listTrades`

**DB tables:**
```
paper_portfolios   — user_id (UNIQUE), cash (default $10,000)
paper_positions    — user_id, ticker, company_name, shares, avg_cost (UNIQUE user_id+ticker)
paper_trades       — user_id, ticker, company_name, trade_type, shares, price_per_share, total_value
All tables: RLS on user_id
```

**Trade execution flow:**
1. Client POSTs `{ ticker, companyName, tradeType, shares }` to `/api/trade/execute`
2. Server fetches live price from Finnhub (not trusted from client)
3. Server validates: BUY → sufficient cash; SELL → sufficient shares owned
4. Server updates: cash balance, position (weighted avg cost basis on buy; reduce/delete on sell), trade history
5. Returns `{ success, tradeType, shares, pricePerShare, totalValue }`

**Portfolio tab UI:**
- Each position card has **Buy more** / **Sell** buttons that switch to the Trade tab with the stock pre-loaded.
- Performance card shows an SVG line chart (portfolio vs S&P 500 indexed to $10,000), Total Return %, and Annualised Return %. Chart is hidden until trade history exists. The `PerformanceChart` component lives inline in `app/trade/page.tsx` — it is a pure SVG component with no chart library dependency.

**Environment variable required:** `FINNHUB_API_KEY` (free at finnhub.io)

**Portfolio initialisation:** `getOrCreatePortfolio()` upserts a $10,000 portfolio on first visit. Never manually create portfolio rows.

**Protected route:** `/trade` added to `PROTECTED_PREFIXES`.

---

## 11. Known deferred items (do not implement without being asked)

- **Apple OAuth** — wired up in UI but non-functional. Needs Apple Developer account.
- **`date_of_birth` for OAuth users** — currently nullable; a post-signup prompt to collect it may be added later.
- **Stripe / payments** — not started.
- **Email templates** — using Supabase defaults for now.
- **More scenarios** — only 8 hardcoded scenarios exist. Expansion planned.

---

## 10. How to run locally

```bash
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from the Supabase dashboard
# Optionally add ANTHROPIC_API_KEY or OPENAI_API_KEY

npm install
npx tsc --noEmit   # should be clean
npm run dev
```

**Smoke test the full auth + challenge flow:**
1. `/` loads with "Sign Up" CTA
2. Sign up with email → check email → verify → redirected to `/`
3. Or: Sign in with Google
4. `/challenge` renders a scenario card
5. Pick BUY, confidence 7, write ~2 sentences → submit
6. Without API key: fallback rubric returns a filled `Evaluation`
7. "Reveal what happened" → outcome panel shows return %, verdict pill
8. Fill 3 reflection fields → save → "done" state
9. `/journal` shows the saved reflection
10. `/progress` shows skill score > 0, 1 total decision
11. `/history` → click row → full detail expands
12. Sign out → redirected to `/`, protected routes redirect to `/auth/sign-in`
