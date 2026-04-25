# CLAUDE.md — Vanetex Investing (AI Investing Trainer)

This file is read automatically by Claude Code. Read it fully before making any changes.
**Production launch target: 1–2 months. Treat every change as production-grade.**

---

## What the app is

A daily training tool for beginner investors (target: high school + early college, 13+). One scenario/day → user makes a Buy/Hold/Pass call with confidence + written reasoning → AI analyst grades the reasoning 0–100 → outcome is revealed → user journals a reflection. All user data is persisted in **Supabase** (not localStorage).

---

## Tech stack

- **Next.js 14.2.35** (App Router, `app/` directory)
- **React 18.3.1**, TypeScript 5.5.3, strict mode
- **Tailwind 3.4.6** — custom palette: `ink` `paper` `accent` `success` `warn` `danger` `muted`
- **Supabase** (`@supabase/ssr ^0.10.2`) — auth + database
- **Node runtime** on all API routes (`export const runtime = "nodejs"`)
- No state library. No ORM. No chart library (SVG built by hand). No other runtime deps.
- Package manager: **npm**. Node ≥ 18.17.

---

## Hard rules — do not violate

1. **No localStorage.** All user data lives in Supabase. `lib/storage.ts` is dead code — do not import it.
2. **Always `await createClient()`** in server components and route handlers. It is async. Omitting the await returns a Promise, not the client — all DB calls will silently fail.
3. **RLS is enforced at the DB.** Don't manually filter by `user_id` in client code (except in `saveDecision()` which sets the FK). Trust RLS.
4. **Auth split is intentional.** `/auth/callback` (server route) handles PKCE email flow. `/auth/confirm` (client page) handles OAuth hash fragments. Do not merge them.
5. **Apple OAuth is deferred.** Button exists but is non-functional. Do not wire it up or remove it.
6. **Don't touch the AI prompt.** `lib/evaluationPrompt.ts` is deliberately tuned.
7. **Don't touch scenario data.** `data/scenarios.ts` values are teaching setups, not real numbers.
8. **Don't restyle.** Colour palette, layout, and max-width are intentional. Custom CSS classes (`surface-card`, `surface-soft`, `cta-primary`, `field-focus`, `app-shell`, `interactive-panel`) are defined in `globals.css`.

---

## Supabase clients

```ts
// Client components / browser
import { createClient } from "@/lib/supabase/client"

// Server components / route handlers — always await
const supabase = await createClient()   // lib/supabase/server.ts
```

Never import from `@supabase/supabase-js` directly.

---

## File map

```
app/
  layout.tsx                  Global shell — wraps ShellWrapper; no Nav directly here
  page.tsx                    Dark marketing homepage — HomeNav + Hero + StatsBar; Demo + HomepageSections for logged-out only
  globals.css                 Tailwind + custom CSS classes + keyframes

  challenge/page.tsx          Daily challenge state machine: loading → deciding → evaluating → feedback → outcome → done
  journal/page.tsx            Combined journal + history — "All" | "Reflections" toggle, expandable rows
  history/page.tsx            Redirects to /journal
  progress/page.tsx           Skill score, accuracy, calibration, trend
  settings/page.tsx           Change username, change email, reset paper trading account

  api/
    evaluate/route.ts         POST — AI grading (Anthropic/OpenAI with local rubric fallback)
    stock/
      quote/route.ts          GET ?symbol= — Finnhub price + company info
      search/route.ts         GET ?q= — Finnhub symbol search, US common stocks only, max 8
    trade/
      execute/route.ts        POST — validates + executes paper trade, fetches live price server-side
      reset/route.ts          POST — wipes paper_trades + paper_positions, resets cash to $10,000
    portfolio/
      chart/route.ts          GET — daily portfolio value vs SPY indexed to $10,000; annualReturn + totalReturn
    cron/
      streak-reminder/route.ts  GET — nightly cron; emails users with active streaks who haven't done today's challenge

  auth/
    callback/route.ts         Server — PKCE code exchange (email flow)
    confirm/page.tsx          Client — OAuth hash fragment exchange
    sign-in / sign-up / verify / reset-password / update-password

components/
  ShellWrapper.tsx            Client component — renders Nav + shell on all routes except "/"; homepage is full-bleed
  Nav.tsx                     Sidebar (desktop) + top bar (mobile); History removed; gear icon → /settings
  homepage/
    HomeNav.tsx               Fixed marketing nav with scroll glassmorphism; auth-aware CTA buttons
    Hero.tsx                  Full-viewport hero + 3D tilt ScenarioPreviewCard; exports StatsBar
    Demo.tsx                  Interactive BUY/HOLD/PASS scenario with animated AI score reveal
    HomepageSections.tsx      TheLoop + Features (2×2 grid) + FinalCTA + Footer
  ScenarioCard.tsx            Scenario display
  DecisionInput.tsx           Buy/Hold/Pass + confidence + reasoning
  FeedbackPanel.tsx           Score tiles + feedback
  OutcomePanel.tsx            Return %, verdict, insight
  ReflectionPrompt.tsx        Three reflection fields

data/
  scenarios.ts                8 hardcoded scenarios — do not alter values
  tracks.ts                   35 lessons across 5 tracks — add new content here only

lib/
  types.ts                    Core types
  storage.ts                  DEAD CODE — do not import
  scoring.ts                  verdictFor(), levelFor(), computeProgress()
  evaluationPrompt.ts         AI grading prompt — do not rewrite
  supabase/
    client.ts                 Browser client
    server.ts                 Server client (async — always await)
    admin.ts                  Service-role client (bypasses RLS) — cron/admin routes only
    middleware.ts             Session refresh + route protection
    decisions.ts              CRUD for decisions table
    lessonProgress.ts         CRUD for lesson_progress table
    paperTrading.ts           getOrCreatePortfolio, listPositions, listTrades

supabase/migrations/
  20260421000001_streak_reminder.sql  get_streak_reminder_targets() SECURITY DEFINER function

vercel.json                   Vercel cron — runs streak-reminder at 20:00 UTC daily

middleware.ts                 Thin wrapper — calls updateSession()
```

---

## Protected routes

`/challenge` `/journal` `/progress` `/tracks` `/trade` `/settings` — defined in `lib/supabase/middleware.ts` `PROTECTED_PREFIXES`. Unauthenticated → redirect to `/auth/sign-in?next=<path>`. `/history` redirects to `/journal`.

---

## Database schema

**`profiles`** — `id` (FK auth.users), `display_name`, `date_of_birth` (nullable for OAuth), `created_at`. RLS: own row only.

**`decisions`** — full challenge lifecycle. Snake_case in DB → camelCase in app via `rowToRecord()` in `decisions.ts`. RLS: own rows only.

**`lesson_progress`** — `user_id`, `track_id`, `lesson_id`, `practice_score`, `practice_total`, `application_completed`, `completed_at`. UNIQUE on `(user_id, lesson_id)`. RLS: own rows only.

**`paper_portfolios`** — `user_id` (UNIQUE), `cash` (default $10,000). Auto-created on first `/trade` visit via `getOrCreatePortfolio()` — never manually insert.

**`paper_positions`** — `user_id`, `ticker`, `company_name`, `shares`, `avg_cost`. UNIQUE on `(user_id, ticker)`.

**`paper_trades`** — `user_id`, `ticker`, `company_name`, `trade_type`, `shares`, `price_per_share`, `total_value`, `created_at`.

All tables have RLS enabled.

---

## Paper trading details

- Portfolio tab: position cards have **Buy more** / **Sell** buttons that switch to Trade tab with stock pre-loaded
- Performance chart: `PerformanceChart` is a pure inline SVG component in `app/trade/page.tsx` — no chart library. Reconstructs daily portfolio value from trade history + Finnhub daily candles (carry-forward on weekends). SPY indexed to $10,000 for fair comparison.
- Trade execution always fetches price server-side — never trust client-supplied price
- `/api/trade/reset` — deletes trades → positions → resets cash to $10,000 (used by Settings page)

---

## Learning Tracks

- `/tracks` — listing with progress bars
- `/tracks/[trackId]` — lesson list, sequential unlock
- `/tracks/[trackId]/[lessonId]` — 4-stage player: teaching → practice → apply → complete
- `components/LessonPlayer.tsx` — state machine, saves progress on completion
- Each lesson has `difficulty: "Easy" | "Medium" | "Hard"`

---

## Auth flow summary

| Flow | Path |
|---|---|
| Email sign-up | sign-up → /auth/verify → email link → /auth/callback (server, PKCE) → / |
| Google OAuth | sign-in → Google → /auth/confirm (client, hash fragment) → / |
| Password reset | reset-password → email → /auth/update-password |

---

## Environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=       # required
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # required
SUPABASE_SERVICE_ROLE_KEY=      # required — streak-reminder cron (bypasses RLS)
FINNHUB_API_KEY=                # required — paper trading (quotes, search, chart)
ANTHROPIC_API_KEY=              # optional — AI evaluation
OPENAI_API_KEY=                 # optional — AI evaluation fallback
RESEND_API_KEY=                 # required — streak reminder emails
RESEND_FROM=                    # optional — sender address (default: reminders@vanetex.com)
CRON_SECRET=                    # required — Bearer token to authenticate /api/cron/* routes
```

---

## Running locally

```bash
cp .env.local.example .env.local
# Fill in all required vars above
npm install
npx tsc --noEmit   # should be clean
npm run dev
```

---

## Learning Tracks summary

5 tracks, 35 lessons total:
- **Financial Metrics 101** (Beginner) — 5 lessons: EPS, P/E, revenue growth, debt-to-equity, competitive moats
- **Reading the Market** (Intermediate) — 6 lessons: market sentiment, technical analysis, analyst ratings, sector rotation, macro signals, bull/bear markets
- **Volatility & Risk** (Intermediate) — 6 lessons: understanding volatility, beta, confidence calibration, position sizing, diversification, market cycles
- **Market Indicators** (Intermediate) — 6 lessons: earnings reports, economic indicators, analyst ratings, volume analysis, moving averages, earnings surprises
- **Advanced Concepts** (Advanced) — 6 lessons (all Hard): DCF, ROIC/capital allocation, options/derivatives, macro/interest rates, M&A mechanics, short selling

---

## Known deferred items (do not implement without being asked)

- `date_of_birth` for OAuth users — currently nullable
- Stripe / payments — not started
- Apple OAuth — not implemented, needs Apple Developer account if ever added
