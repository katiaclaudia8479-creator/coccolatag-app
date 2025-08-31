import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE!;
  if (!url || !serviceKey) throw new Error("Supabase env mancanti");
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
