import { createClient } from "@/lib/supabase/client";

export interface AwardedAchievement {
  id: string;
  awarded_at: string;
}

export async function listAwardedAchievements(): Promise<AwardedAchievement[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("achievements")
    .select("id, awarded_at")
    .order("awarded_at", { ascending: false });
  return (data ?? []) as AwardedAchievement[];
}

/** Awards any eligible IDs not yet recorded. Returns the newly awarded IDs. */
export async function awardAchievements(eligibleIds: string[]): Promise<string[]> {
  if (eligibleIds.length === 0) return [];
  const supabase = createClient();

  const { data: existing } = await supabase.from("achievements").select("id");
  const existingSet = new Set(((existing ?? []) as { id: string }[]).map((r) => r.id));
  const newIds = eligibleIds.filter((id) => !existingSet.has(id));
  if (newIds.length === 0) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  await supabase.from("achievements").upsert(
    newIds.map((id) => ({ id, user_id: user.id })),
    { onConflict: "id,user_id", ignoreDuplicates: true },
  );

  return newIds;
}
