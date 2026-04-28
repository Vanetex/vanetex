import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scenarioId = searchParams.get("scenarioId");
  if (!scenarioId) {
    return NextResponse.json({ error: "Missing scenarioId" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("decisions")
    .select("action, outcome_verdict")
    .eq("scenario_id", scenarioId)
    .not("outcome_verdict", "is", null);

  if (error || !data || data.length < 10) {
    // Don't surface stats until there's a meaningful sample size
    return NextResponse.json({ total: 0 });
  }

  const total = data.length;
  const correct = data.filter((d) => d.outcome_verdict === "CORRECT").length;
  const correctPct = Math.round((correct / total) * 100);

  const counts: Record<string, number> = {};
  for (const d of data) {
    counts[d.action] = (counts[d.action] ?? 0) + 1;
  }
  const actionDistribution: Record<string, number> = {};
  for (const [k, v] of Object.entries(counts)) {
    actionDistribution[k] = Math.round((v / total) * 100);
  }

  return NextResponse.json({ total, correctPct, actionDistribution });
}
