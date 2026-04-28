import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { ALL_ACHIEVEMENTS } from "@/lib/achievements";
import { LEVELS } from "@/lib/xp";

export const runtime = "nodejs";
export const maxDuration = 60;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}

function getLevelTitle(xp: number): string {
  let title: string = LEVELS[0].title;
  for (const l of LEVELS) { if (xp >= l.xpRequired) title = l.title; }
  return title;
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  const admin = createAdminClient();
  const since = new Date(Date.now() - WEEK_MS).toISOString();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vanetex.vercel.app";

  // ── 1. Find users with ≥1 completed challenge this week ──────────────────
  const { data: activeRows } = await admin
    .from("decisions")
    .select("user_id")
    .gte("created_at", since)
    .not("outcome_verdict", "is", null);

  if (!activeRows?.length) return NextResponse.json({ sent: 0 });
  const userIds = [...new Set(activeRows.map((r) => r.user_id))] as string[];

  // ── 2. Batch fetch everything we need ────────────────────────────────────
  const [
    { data: decisions },
    { data: lessonRows },
    { data: achievementRows },
    { data: profiles },
    { data: portfolios },
    { data: { users: authUsers } },
  ] = await Promise.all([
    admin.from("decisions")
      .select("user_id, action, outcome_verdict, outcome_return_pct, ticker, company, created_at, reasoning_score, decision_score")
      .in("user_id", userIds)
      .order("created_at", { ascending: false }),
    admin.from("lesson_progress")
      .select("user_id, practice_score, practice_total, completed_at")
      .in("user_id", userIds)
      .gte("completed_at", since)
      .gt("practice_total", 0),
    admin.from("awarded_achievements")
      .select("user_id, id, awarded_at")
      .in("user_id", userIds)
      .gte("awarded_at", since),
    admin.from("profiles")
      .select("id, display_name, recap_portfolio_value")
      .in("id", userIds),
    admin.from("paper_portfolios")
      .select("user_id, portfolio_value")
      .in("user_id", userIds),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  // ── 3. Build lookup maps ─────────────────────────────────────────────────
  const emailMap = new Map(authUsers.map((u) => [u.id, u.email ?? ""]));
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const portfolioMap = new Map((portfolios ?? []).map((p) => [p.user_id, Number(p.portfolio_value ?? 10000)]));
  const achievementMeta = new Map(ALL_ACHIEVEMENTS.map((a) => [a.id, a]));

  // ── 4. Send recap to each user ───────────────────────────────────────────
  const resend = new Resend(process.env.RESEND_API_KEY);
  const FROM = process.env.RESEND_FROM ?? "Vanetex <reminders@vanetex.com>";
  const portfolioUpdates: { id: string; value: number }[] = [];

  const results = await Promise.allSettled(
    userIds.map(async (userId) => {
      const email = emailMap.get(userId);
      if (!email) return;

      const profile = profileMap.get(userId);
      const displayName = escapeHtml(profile?.display_name ?? "Investor");

      // ── Decisions this week ──────────────────────────────────────────────
      const allDecisions = (decisions ?? []).filter((d) => d.user_id === userId);
      const weekDecisions = allDecisions.filter((d) => d.created_at >= since && d.outcome_verdict != null);
      if (weekDecisions.length === 0) return; // skip — no completed challenges

      const correct = weekDecisions.filter((d) => d.outcome_verdict === "CORRECT").length;
      const accuracy = Math.round((correct / weekDecisions.length) * 100);

      const bestCall = weekDecisions
        .filter((d) => d.outcome_verdict === "CORRECT" && d.outcome_return_pct != null)
        .sort((a, b) => Number(b.outcome_return_pct) - Number(a.outcome_return_pct))[0];

      // ── Streak ───────────────────────────────────────────────────────────
      const doneDays = new Set(
        allDecisions
          .filter((d) => d.outcome_verdict != null)
          .map((d) => { const dt = new Date(d.created_at); return `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`; }),
      );
      const cursor = new Date();
      const key = (dt: Date) => `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
      if (!doneDays.has(key(cursor))) cursor.setDate(cursor.getDate() - 1);
      let streak = 0;
      while (doneDays.has(key(cursor))) { streak++; cursor.setDate(cursor.getDate() - 1); }

      // ── XP & level ───────────────────────────────────────────────────────
      let totalXP = 0;
      for (const d of allDecisions) {
        if (d.reasoning_score == null) continue;
        totalXP += 50 + Math.round(Number(d.reasoning_score) * 0.5);
        if (d.outcome_verdict === "CORRECT") totalXP += 25;
      }
      const level = getLevelTitle(totalXP);

      // ── Lessons ──────────────────────────────────────────────────────────
      const userLessons = (lessonRows ?? []).filter((l) => l.user_id === userId);
      const lessonScores = userLessons.map((l) => Math.round((l.practice_score / l.practice_total) * 100));
      const avgLessonScore = lessonScores.length
        ? Math.round(lessonScores.reduce((s, n) => s + n, 0) / lessonScores.length)
        : null;
      const highLessonScore = lessonScores.length ? Math.max(...lessonScores) : null;

      // ── Achievements ─────────────────────────────────────────────────────
      const userAchievements = (achievementRows ?? [])
        .filter((a) => a.user_id === userId)
        .map((a) => achievementMeta.get(a.id))
        .filter(Boolean);

      // ── Portfolio ────────────────────────────────────────────────────────
      const currentValue = portfolioMap.get(userId) ?? 10000;
      const lastValue = profile?.recap_portfolio_value != null
        ? Number(profile.recap_portfolio_value)
        : null;
      const portfolioDelta = lastValue != null ? currentValue - lastValue : null;
      const portfolioDeltaPct = lastValue != null && lastValue > 0
        ? ((currentValue - lastValue) / lastValue) * 100
        : null;
      portfolioUpdates.push({ id: userId, value: currentValue });

      // ── Send ─────────────────────────────────────────────────────────────
      await resend.emails.send({
        from: FROM,
        to: email,
        subject: `Your Vanetex week — ${weekDecisions.length} decision${weekDecisions.length !== 1 ? "s" : ""}, ${accuracy}% accuracy`,
        html: buildEmail({
          displayName, streak, level,
          weekDecisions: weekDecisions.length, accuracy,
          bestCall: bestCall ? {
            ticker: escapeHtml(bestCall.ticker),
            action: bestCall.action as string,
            returnPct: Number(bestCall.outcome_return_pct),
          } : null,
          avgLessonScore, highLessonScore,
          currentValue, portfolioDelta, portfolioDeltaPct,
          achievements: userAchievements as { icon: string; title: string }[],
          siteUrl,
        }),
      });
    }),
  );

  // ── 5. Update recap_portfolio_value for next week ────────────────────────
  await Promise.allSettled(
    portfolioUpdates.map(({ id, value }) =>
      admin.from("profiles").update({ recap_portfolio_value: value }).eq("id", id),
    ),
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  return NextResponse.json({ sent, total: userIds.length });
}

// ── Email template ────────────────────────────────────────────────────────

type EmailData = {
  displayName: string;
  streak: number;
  level: string;
  weekDecisions: number;
  accuracy: number;
  bestCall: { ticker: string; action: string; returnPct: number } | null;
  avgLessonScore: number | null;
  highLessonScore: number | null;
  currentValue: number;
  portfolioDelta: number | null;
  portfolioDeltaPct: number | null;
  achievements: { icon: string; title: string }[];
  siteUrl: string;
};

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function buildEmail(d: EmailData): string {
  const portfolioLine = d.portfolioDelta != null
    ? `${d.portfolioDelta >= 0 ? "+" : ""}$${fmt(Math.abs(d.portfolioDelta))} (${d.portfolioDeltaPct! >= 0 ? "+" : ""}${fmt(d.portfolioDeltaPct!)}%) this week`
    : `$${fmt(d.currentValue)} total value`;

  const achievementBlock = d.achievements.length > 0
    ? `<tr><td style="padding:0 36px 24px;">
        <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#8c8c8c;">Achievements Unlocked</p>
        ${d.achievements.map((a) => `<div style="display:inline-block;margin:0 8px 8px 0;background:#f0f0f0;border-radius:8px;padding:6px 12px;font-size:13px;">${a.icon} ${a.title}</div>`).join("")}
      </td></tr>`
    : "";

  const lessonsBlock = (d.avgLessonScore != null)
    ? `<tr><td style="padding:0 36px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f5;border-radius:12px;padding:16px 20px;">
          <tr>
            <td>
              <p style="margin:0 0 4px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#8c8c8c;">Lessons This Week</p>
              <p style="margin:0;font-size:22px;font-weight:700;color:#1a1a1a;">Avg ${d.avgLessonScore}% &nbsp;<span style="color:#8c8c8c;font-size:14px;font-weight:400;">·</span>&nbsp; Best ${d.highLessonScore}%</p>
            </td>
          </tr>
        </table>
      </td></tr>`
    : "";

  const bestCallBlock = d.bestCall
    ? `<p style="margin:8px 0 0;font-size:14px;color:#5a5a5a;">Best call: <strong>${d.bestCall.ticker}</strong> ${d.bestCall.action} → <strong style="color:#16A34A;">+${fmt(d.bestCall.returnPct, 1)}%</strong></p>`
    : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f5f5f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f3;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid rgba(0,0,0,0.06);">

        <!-- Header -->
        <tr><td style="padding:32px 36px 0;">
          <p style="margin:0;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#8c8c8c;">Vanetex · Weekly Recap</p>
        </td></tr>

        <!-- Greeting -->
        <tr><td style="padding:16px 36px 24px;">
          <h1 style="margin:0;font-size:24px;font-weight:700;color:#1a1a1a;line-height:1.3;">
            Good week, ${d.displayName}.
          </h1>
          <p style="margin:6px 0 0;font-size:14px;color:#5a5a5a;">
            ${d.streak > 0 ? `🔥 ${d.streak}-day streak &nbsp;·&nbsp; ` : ""}${d.level}
          </p>
        </td></tr>

        <!-- Challenge stats -->
        <tr><td style="padding:0 36px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;border-radius:16px;padding:20px 24px;">
            <tr>
              <td style="width:50%;padding-right:12px;">
                <p style="margin:0 0 2px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Decisions</p>
                <p style="margin:0;font-size:28px;font-weight:800;color:#ffffff;">${d.weekDecisions}</p>
              </td>
              <td style="width:50%;padding-left:12px;border-left:1px solid rgba(255,255,255,0.08);">
                <p style="margin:0 0 2px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Accuracy</p>
                <p style="margin:0;font-size:28px;font-weight:800;color:${d.accuracy >= 60 ? "#16A34A" : d.accuracy >= 40 ? "#D97706" : "#DC2626"};">${d.accuracy}%</p>
              </td>
            </tr>
            ${bestCallBlock ? `<tr><td colspan="2" style="padding-top:12px;border-top:1px solid rgba(255,255,255,0.08);margin-top:12px;">${bestCallBlock.replace('style="margin:8px', 'style="margin:0')}</td></tr>` : ""}
          </table>
        </td></tr>

        <!-- Portfolio -->
        <tr><td style="padding:0 36px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f5;border-radius:12px;padding:16px 20px;">
            <tr>
              <td>
                <p style="margin:0 0 4px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#8c8c8c;">Paper Portfolio</p>
                <p style="margin:0;font-size:22px;font-weight:700;color:#1a1a1a;">$${fmt(d.currentValue)}</p>
                <p style="margin:4px 0 0;font-size:13px;color:${d.portfolioDelta != null && d.portfolioDelta >= 0 ? "#16A34A" : "#DC2626"};">${portfolioLine}</p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Lessons -->
        ${lessonsBlock}

        <!-- Achievements -->
        ${achievementBlock}

        <!-- CTA -->
        <tr><td style="padding:0 36px 36px;">
          <a href="${d.siteUrl}/challenge"
             style="display:inline-block;background:#1a1a1a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:100px;">
            This week&rsquo;s challenge &rarr;
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 36px;border-top:1px solid rgba(0,0,0,0.06);">
          <p style="margin:0;font-size:12px;color:#a0a0a0;">
            Weekly recap from Vanetex. <a href="${d.siteUrl}/settings" style="color:#a0a0a0;">Manage preferences</a>.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
