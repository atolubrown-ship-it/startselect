"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CACHE_KEY, DEFAULT_SETTINGS, sanitizeSettings, themeVars, type SiteSettings } from "@/lib/settings";
import { getSupabase } from "@/lib/supabase";
import { fetchRemoteSettings, saveRemoteSettings, type ImageUploads, type SaveResult } from "@/lib/remote";

type SyncState = "loading" | "ok" | "error" | "unconfigured";

type SettingsContextValue = {
  /** The settings currently in effect. */
  settings: SiteSettings;
  /** False until it is safe to show branding (avoids flashing the default logo). */
  loaded: boolean;
  /** State of the connection to the shared settings in Supabase. */
  syncState: SyncState;
  syncError: string | null;
  /** Re-reads the shared settings from Supabase. */
  refresh: () => Promise<void>;
  /** Saves to Supabase (admins only — enforced by the database). */
  save: (next: SiteSettings, uploads: ImageUploads) => Promise<SaveResult>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

/** Last-loaded settings, kept in this browser only to avoid a flash of default branding. */
function readCache(): SiteSettings | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? sanitizeSettings(JSON.parse(raw), DEFAULT_SETTINGS) : null;
  } catch {
    return null;
  }
}

function writeCache(s: SiteSettings) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(s));
  } catch {
    /* cache is optional */
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>("loading");
  const [syncError, setSyncError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) {
      setSyncState("unconfigured");
      setSyncError(null);
      setLoaded(true);
      return;
    }
    setSyncState("loading");
    const res = await fetchRemoteSettings(sb);
    if (res.ok) {
      const clean = sanitizeSettings(res.data, DEFAULT_SETTINGS);
      setSettings(clean);
      writeCache(clean);
      setSyncError(null);
      setSyncState("ok");
    } else {
      // Keep whatever we already show (cache or defaults) so the site stays usable.
      setSyncError(res.error);
      setSyncState("error");
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    // Show the cached branding straight away if we have it …
    const cached = readCache();
    if (cached) {
      setSettings(cached);
      setLoaded(true);
    }
    // … never wait more than a moment for the database on a first visit.
    const t = setTimeout(() => setLoaded(true), 2500);
    void refresh();
    return () => clearTimeout(t);
  }, [refresh]);

  // Push colours / button shape into CSS variables and keep the tab title in sync.
  useEffect(() => {
    const root = document.documentElement;
    const vars = themeVars(settings);
    for (const key of Object.keys(vars)) root.style.setProperty(key, vars[key]);
    document.title = `${settings.siteName} — Security Alert`;
  }, [settings]);

  const save = useCallback(
    async (next: SiteSettings, uploads: ImageUploads): Promise<SaveResult> => {
      const sb = getSupabase();
      if (!sb) {
        return {
          ok: false,
          error: "Supabase isn't configured yet. Add the two Supabase variables in Vercel and redeploy.",
        };
      }
      const res = await saveRemoteSettings(sb, next, uploads, {
        logoUrl: settings.logoUrl,
        appBadgeUrl: settings.appBadgeUrl,
      });
      if (res.ok) {
        setSettings(res.settings);
        writeCache(res.settings);
        setSyncError(null);
        setSyncState("ok");
      }
      return res;
    },
    [settings.logoUrl, settings.appBadgeUrl],
  );

  const value = useMemo(
    () => ({ settings, loaded, syncState, syncError, refresh, save }),
    [settings, loaded, syncState, syncError, refresh, save],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
}
