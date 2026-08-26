import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client. Bypasses RLS — only for trusted server-side
 * operations (guest order lookup, webhook fulfillment). Never import
 * from client components.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_SECRET_KEY)",
    );
  }
  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
