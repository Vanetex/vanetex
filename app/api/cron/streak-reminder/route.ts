import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

type ReminderTarget = {
  user_id: string;
  email: string;
  display_name: string;
  streak_days: number;
};

export async function GET(request: NextRequest) {
  // Always require CRON_SECRET — no fallback to open access
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  const supabase = createAdminClient();
  const { data: targets, error } = await supabase.rpc("get_streak_reminder_targets");

  if (error) {
    console.error("[streak-reminder] RPC error:", error.message);
    return NextResponse.json({ error: "Failed to fetch targets" }, { status: 500 });
  }

  if (!targets?.length) {
    return NextResponse.json({ sent: 0, message: "No users to remind today" });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const FROM = process.env.RESEND_FROM ?? "Vanetex <reminders@vanetex.com>";
  const results = await Promise.allSettled(
    (targets as ReminderTarget[]).map((t) =>
      resend.emails.send({
        from: FROM,
        to: t.email,
        subject: `Keep your ${t.streak_days}-day streak alive`,
        html: buildEmail(t),
      }),
    ),
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - sent;

  if (failed > 0) {
    console.error(`[streak-reminder] ${failed} emails failed to send`);
  }

  return NextResponse.json({ sent, failed, total: targets.length });
}

function buildEmail({ display_name, streak_days }: ReminderTarget): string {
  const plural = streak_days !== 1 ? "days" : "day";
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f5f5f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f3;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:32px 36px 0;">
              <p style="margin:0;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#8c8c8c;">Vanetex</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 36px 0;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#1a1a1a;line-height:1.3;">
                ${display_name}, your ${streak_days}-${plural} streak is at risk
              </h1>
              <p style="margin:12px 0 0;font-size:15px;color:#5a5a5a;line-height:1.6;">
                You haven&rsquo;t completed today&rsquo;s challenge yet. Take 2 minutes to keep your momentum going.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 36px;">
              <table cellpadding="0" cellspacing="0" style="background:#f0edff;border-radius:12px;padding:16px 20px;width:100%;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6340f0;">Your streak</p>
                    <p style="margin:4px 0 0;font-size:28px;font-weight:700;color:#1a1a1a;">${streak_days} ${plural}</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#5a5a5a;">One decision a day builds real investment judgment.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 36px;">
              <a href="https://vanetex.vercel.app/challenge"
                 style="display:inline-block;background:#1a1a1a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:100px;">
                Do today&rsquo;s challenge &rarr;
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 36px;border-top:1px solid rgba(0,0,0,0.06);">
              <p style="margin:0;font-size:12px;color:#a0a0a0;">
                You&rsquo;re receiving this because you have an active streak on Vanetex.
                <br />To unsubscribe, update your preferences in <a href="https://vanetex.vercel.app/settings" style="color:#a0a0a0;">Settings</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
