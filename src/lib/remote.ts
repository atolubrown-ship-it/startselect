import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_SETTINGS, sanitizeSettings, type SiteSettings } from "./settings";
import { LOGO_BUCKET } from "./supabase";

/**
 * Remote (Supabase) read/write for the shared settings row.
 * Security note: these calls are only convenience — the database itself
 * (Row Level Security, see quilo-backend.sql) decides who may change anything.
 */

export type LoadResult = { ok: true; data: unknown } | { ok: false; error: string };
export type SaveResult = { ok: true; settings: SiteSettings } | { ok: false; error: string };

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

/** Turns raw database/network errors into short, human sentences. */
export function friendlyError(message: string | undefined, fallback: string): string {
  const m = (message || "").toLowerCase();
  if (!m) return fallback;
  if (m === "timeout" || m.includes("failed to fetch") || m.includes("network") || m.includes("load failed"))
    return "Can't reach the database right now. Check your connection and try again.";
  if (m.includes("does not exist") || m.includes("schema cache") || m.includes("could not find the table"))
    return "The settings table isn't set up yet. Run quilo-backend.sql in Supabase first.";
  if (m.includes("bucket not found")) return "The logo storage bucket isn't set up yet. Run quilo-backend.sql in Supabase first.";
  if (m.includes("row-level security") || m.includes("not authorized") || m.includes("permission denied"))
    return "This account isn't allowed to change settings.";
  if (m.includes("jwt") || m.includes("invalid api key") || m.includes("apikey"))
    return "The Supabase key looks wrong. Check NEXT_SUPABASE_ANON_KEY in Vercel.";
  if (m.includes("payload too large") || m.includes("exceeded the maximum")) return "That logo file is too large.";
  return fallback;
}

export async function fetchRemoteSettings(sb: SupabaseClient): Promise<LoadResult> {
  try {
    const res = await withTimeout(Promise.resolve(sb.from("site_settings").select("data").eq("id", 1).maybeSingle()));
    if (res.error) return { ok: false, error: friendlyError(res.error.message, "Couldn't load the shared settings.") };
    if (!res.data) return { ok: false, error: "The settings row is missing. Run quilo-backend.sql in Supabase." };
    return { ok: true, data: res.data.data };
  } catch (e) {
    return { ok: false, error: friendlyError(e instanceof Error ? e.message : undefined, "Couldn't load the shared settings.") };
  }
}

const PUBLIC_MARKER = `/storage/v1/object/public/${LOGO_BUCKET}/`;

/** Our own uploaded files only ("logo-<timestamp>.png|jpg" or "badge-<timestamp>.png|jpg"). Returns the object path or null. */
export function assetPathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const i = url.indexOf(PUBLIC_MARKER);
  if (i === -1) return null;
  const name = decodeURIComponent(url.slice(i + PUBLIC_MARKER.length).split("?")[0]);
  return /^(logo|badge)-\d+\.(png|jpg)$/.test(name) ? name : null;
}

export type ImageUploads = { logo?: Blob | null; badge?: Blob | null };
export type PreviousImages = { logoUrl: string | null; appBadgeUrl: string | null };

type UploadResult = { ok: true; path: string; url: string } | { ok: false; error: string };

async function uploadImage(sb: SupabaseClient, prefix: "logo" | "badge", blob: Blob): Promise<UploadResult> {
  const ext = blob.type === "image/jpeg" ? "jpg" : "png";
  const path = `${prefix}-${Date.now()}.${ext}`;
  const up = await withTimeout(
    sb.storage.from(LOGO_BUCKET).upload(path, blob, {
      contentType: ext === "jpg" ? "image/jpeg" : "image/png",
      cacheControl: "31536000",
      upsert: false,
    }),
    20000,
  );
  if (up.error) return { ok: false, error: friendlyError(up.error.message, "The image couldn't be uploaded.") };
  return { ok: true, path, url: sb.storage.from(LOGO_BUCKET).getPublicUrl(path).data.publicUrl };
}

/**
 * Saves settings to the shared row. New images (logo / app badge) are uploaded
 * to Storage first under fresh file names (so browsers never show a stale
 * image); replaced or removed image files are deleted after a successful save,
 * and files uploaded for a save that fails are cleaned up again.
 */
export async function saveRemoteSettings(
  sb: SupabaseClient,
  next: SiteSettings,
  uploads: ImageUploads,
  previous: PreviousImages,
): Promise<SaveResult> {
  let logoUrl = next.logoUrl;
  let appBadgeUrl = next.appBadgeUrl;
  const uploaded: string[] = [];
  const cleanUploaded = async () => {
    if (uploaded.length) await sb.storage.from(LOGO_BUCKET).remove(uploaded).catch(() => undefined);
  };

  try {
    if (uploads.logo) {
      const r = await uploadImage(sb, "logo", uploads.logo);
      if (!r.ok) return { ok: false, error: r.error };
      uploaded.push(r.path);
      logoUrl = r.url;
    }
    if (uploads.badge) {
      const r = await uploadImage(sb, "badge", uploads.badge);
      if (!r.ok) {
        await cleanUploaded();
        return { ok: false, error: r.error };
      }
      uploaded.push(r.path);
      appBadgeUrl = r.url;
    }

    const clean = sanitizeSettings({ ...next, logoUrl, appBadgeUrl }, DEFAULT_SETTINGS);

    // RLS silently filters rows a user may not update, so we ask for the row back
    // and treat "no rows" as "not allowed".
    const res = await withTimeout(Promise.resolve(sb.from("site_settings").update({ data: clean }).eq("id", 1).select("id")));
    if (res.error || !res.data || res.data.length === 0) {
      await cleanUploaded();
      return {
        ok: false,
        error: res.error
          ? friendlyError(res.error.message, "Couldn't save your changes.")
          : "Nothing was saved. This account isn't an administrator, or the settings row is missing.",
      };
    }

    // Best-effort tidy-up of replaced / removed image files.
    const stale = [
      previous.logoUrl !== clean.logoUrl ? assetPathFromUrl(previous.logoUrl) : null,
      previous.appBadgeUrl !== clean.appBadgeUrl ? assetPathFromUrl(previous.appBadgeUrl) : null,
    ].filter((x): x is string => !!x);
    if (stale.length) await sb.storage.from(LOGO_BUCKET).remove(stale).catch(() => undefined);

    return { ok: true, settings: clean };
  } catch (e) {
    await cleanUploaded();
    return { ok: false, error: friendlyError(e instanceof Error ? e.message : undefined, "Couldn't save your changes.") };
  }
}
