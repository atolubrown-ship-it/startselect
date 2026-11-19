import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Storage bucket that holds the uploaded logo (created by quilo-backend.sql). */
export const LOGO_BUCKET = "branding";

let client: SupabaseClient | null | undefined;

/**
 * Browser Supabase client, or `null` when the two public environment variables
 * are missing. Callers must handle `null` — the site keeps working with its
 * default branding instead of crashing.
 *
 * Only the public URL and the public "anon" (publishable) key are used here.
 * Never put a service-role / secret key in a NEXT_PUBLIC_ variable.
 */
export function getSupabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (client !== undefined) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || !/^https:\/\/.+/i.test(url.trim())) {
    client = null;
    return client;
  }

  try {
    client = createClient(url.trim(), key.trim(), {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    });
  } catch {
    client = null;
  }
  return client;
}
