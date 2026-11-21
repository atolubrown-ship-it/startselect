import { getSupabase } from "./supabase";
import { friendlyError } from "./remote";

/**
 * Branding for the Bivo sign-in app at /bivo — one shared row in
 * `bivo_brand_settings` (same Supabase project and admin list as the rest of
 * the site; see section 6 of quilo-backend.sql).
 *
 * Mirrors the read/write split used for the main site settings: everyone can
 * read, only an admin_users member can save (enforced by RLS, not by this
 * file).
 */

export type BivoBrand = {
  appName: string;
  logoUrl: string;
  headline: string;
  subline: string;
  supportEmail: string;
};

export const DEFAULT_BIVO_BRAND: BivoBrand = {
  appName: "Bivo",
  logoUrl: "",
  headline: "Sign in",
  subline: "Use your Bivo account to continue",
  supportEmail: "help@bivo.app",
};

const TABLE = "bivo_brand_settings";
const TIMEOUT_MS = 8000;

function withTimeout<T>(p: Promise<T>, ms = TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

function fromRow(row: Record<string, unknown> | null): BivoBrand {
  if (!row) return DEFAULT_BIVO_BRAND;
  return {
    appName: (row["app_name"] as string) || DEFAULT_BIVO_BRAND.appName,
    logoUrl: (row["logo_url"] as string) || "",
    headline: (row["headline"] as string) || DEFAULT_BIVO_BRAND.headline,
    subline: (row["subline"] as string) || DEFAULT_BIVO_BRAND.subline,
    supportEmail: (row["support_email"] as string) || DEFAULT_BIVO_BRAND.supportEmail,
  };
}

export type LoadResult = { ok: true; brand: BivoBrand } | { ok: false; error: string };
export type SaveResult = { ok: true; brand: BivoBrand } | { ok: false; error: string };

/** Loads the shared Bivo branding. Falls back to the default when Supabase isn't configured. */
export async function loadBivoBrand(): Promise<LoadResult> {
  const sb = getSupabase();
  if (!sb) return { ok: true, brand: DEFAULT_BIVO_BRAND };
  try {
    const res = await withTimeout(Promise.resolve(sb.from(TABLE).select("*").eq("id", 1).maybeSingle()));
    if (res.error) return { ok: false, error: friendlyError(res.error.message, "Couldn't load the Bivo branding.") };
    return { ok: true, brand: fromRow(res.data as Record<string, unknown> | null) };
  } catch (e) {
    return { ok: false, error: friendlyError(e instanceof Error ? e.message : undefined, "Couldn't load the Bivo branding.") };
  }
}

/** Saves the shared Bivo branding. Requires an admin session (enforced by RLS). */
export async function saveBivoBrand(brand: BivoBrand): Promise<SaveResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "Supabase isn't connected yet." };
  try {
    const res = await withTimeout(
      Promise.resolve(
        sb
          .from(TABLE)
          .update({
            app_name: brand.appName,
            logo_url: brand.logoUrl,
            headline: brand.headline,
            subline: brand.subline,
            support_email: brand.supportEmail,
          })
          .eq("id", 1)
          .select("id"),
      ),
    );
    if (res.error || !res.data || res.data.length === 0) {
      return {
        ok: false,
        error: res.error
          ? friendlyError(res.error.message, "Couldn't save the Bivo branding.")
          : "Nothing was saved. This account isn't an administrator, or the branding row is missing.",
      };
    }
    return { ok: true, brand };
  } catch (e) {
    return { ok: false, error: friendlyError(e instanceof Error ? e.message : undefined, "Couldn't save the Bivo branding.") };
  }
}
