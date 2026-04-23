import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS. Only use in server-side cron/admin routes.
// Never import this in client components or regular API routes.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
