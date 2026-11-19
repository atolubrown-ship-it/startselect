/**
 * Central site settings — the single source of truth for branding, appearance
 * and the sample alert details. Every component reads these through
 * `useSettings()`; nothing else hardcodes the company name, logo or colours.
 *
 * Where they live:
 *   - Shared + saved centrally in the Supabase `site_settings` table (row id = 1).
 *   - DEFAULT_SETTINGS below are used until Supabase is configured / reachable.
 *   - A copy of the last-loaded settings is cached in this browser only to avoid
 *     a flash of default branding on the next visit. It is never the source of truth.
 */

export const CACHE_KEY = "quilo.siteSettings.cache.v1";

export const SOCIAL_KEYS = ["instagram", "facebook", "tiktok", "youtube", "twitch", "linkedin"] as const;
export type SocialKey = (typeof SOCIAL_KEYS)[number];

export type HeaderStyle = "light" | "grey" | "brand";
export type ButtonShape = "rounded" | "pill" | "square";

export const LEGAL_KEYS = ["terms", "privacy", "cookies", "accessibility", "sitemap"] as const;
export type LegalKey = (typeof LEGAL_KEYS)[number];

export type SiteSettings = {
  // Branding
  siteName: string;
  /** Public URL of the uploaded logo (Supabase Storage). `null` = built-in placeholder mark. */
  logoUrl: string | null;
  /** Logo height in px (the header grows with it). */
  logoHeight: number;
  /** Show the company name next to an uploaded logo. */
  showNameWithLogo: boolean;
  // Appearance
  primaryColor: string;
  secondaryColor: string;
  headerStyle: HeaderStyle;
  buttonShape: ButtonShape;
  // Sample alert details (demonstration data)
  alertLocation: string;
  alertDevice: string;
  /** Local date-time, "YYYY-MM-DDTHH:mm". */
  alertDateTime: string;
  // Footer links
  appPromoHeading: string;
  /** May contain {name}, which is replaced by the company name. */
  appPromoText: string;
  appStoreUrl: string;
  socials: Record<SocialKey, string>;
  footerLinks: Record<LegalKey, string>;
};

export const LOGO_HEIGHT_MIN = 20;
export const LOGO_HEIGHT_MAX = 72;

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Quilo",
  logoUrl: null,
  logoHeight: 32,
  showNameWithLogo: true,
  primaryColor: "#4a72c4",
  secondaryColor: "#7c3aed",
  headerStyle: "light",
  buttonShape: "rounded",
  alertLocation: "Oregon, USA (approximate)",
  alertDevice: "iPhone 16 Plus",
  alertDateTime: "2026-11-19T15:42",
  appPromoHeading: "Download the app",
  appPromoText: "Manage your account security on the go with the {name} app.",
  appStoreUrl: "",
  socials: { instagram: "", facebook: "", tiktok: "", youtube: "", twitch: "", linkedin: "" },
  footerLinks: { terms: "", privacy: "", cookies: "", accessibility: "", sitemap: "" },
};

/* ------------------------------ validation ------------------------------ */

const HEX = /^#[0-9a-f]{6}$/i;
const DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

type Raw = Record<string, unknown>;

const isObj = (v: unknown): v is Raw => typeof v === "object" && v !== null && !Array.isArray(v);

function text(v: unknown, fallback: string, max: number): string {
  if (typeof v !== "string") return fallback;
  const t = v.trim().slice(0, max);
  return t || fallback;
}

/** Only plain http(s) links are allowed in href attributes (blocks javascript: etc.). */
export function safeUrl(v: unknown): string {
  if (typeof v !== "string") return "";
  const t = v.trim();
  return /^https?:\/\/[^\s]+$/i.test(t) ? t.slice(0, 500) : "";
}

/** https only — used for the logo, which is always served from Supabase Storage. */
export function safeHttpsUrl(v: unknown): string {
  const u = safeUrl(v);
  return u.toLowerCase().startsWith("https://") ? u : "";
}

/** Replaces {name} in admin-editable text with the company name. */
export function fillName(textValue: string, name: string): string {
  return textValue.replace(/\{name\}/g, name);
}

export function isHexColor(v: string): boolean {
  return HEX.test(v);
}

/**
 * Merge `input` over `fallback`, keeping only valid values. Unknown keys are
 * dropped and bad values fall back, so corrupted storage can never break the page.
 */
export function sanitizeSettings(input: unknown, fallback: SiteSettings): SiteSettings {
  if (!isObj(input)) return fallback;
  const has = (k: string) => k in input;

  // The logo is a plain https URL (Supabase Storage) — never an inline image.
  let logo = fallback.logoUrl;
  if (has("logoUrl")) logo = safeHttpsUrl(input.logoUrl) || null;

  const height = Number(input.logoHeight);
  const socialsIn = isObj(input.socials) ? input.socials : {};
  const socials = { ...fallback.socials };
  for (const k of SOCIAL_KEYS) if (k in socialsIn) socials[k] = safeUrl(socialsIn[k]);
  const linksIn = isObj(input.footerLinks) ? input.footerLinks : {};
  const footerLinks = { ...fallback.footerLinks };
  for (const k of LEGAL_KEYS) if (k in linksIn) footerLinks[k] = safeUrl(linksIn[k]);

  return {
    siteName: text(input.siteName, fallback.siteName, 60),
    logoUrl: logo,
    logoHeight: Number.isFinite(height)
      ? Math.min(LOGO_HEIGHT_MAX, Math.max(LOGO_HEIGHT_MIN, Math.round(height)))
      : fallback.logoHeight,
    showNameWithLogo: typeof input.showNameWithLogo === "boolean" ? input.showNameWithLogo : fallback.showNameWithLogo,
    primaryColor: typeof input.primaryColor === "string" && HEX.test(input.primaryColor) ? input.primaryColor.toLowerCase() : fallback.primaryColor,
    secondaryColor:
      typeof input.secondaryColor === "string" && HEX.test(input.secondaryColor)
        ? input.secondaryColor.toLowerCase()
        : fallback.secondaryColor,
    headerStyle:
      input.headerStyle === "light" || input.headerStyle === "grey" || input.headerStyle === "brand"
        ? input.headerStyle
        : fallback.headerStyle,
    buttonShape:
      input.buttonShape === "rounded" || input.buttonShape === "pill" || input.buttonShape === "square"
        ? input.buttonShape
        : fallback.buttonShape,
    alertLocation: text(input.alertLocation, fallback.alertLocation, 120),
    alertDevice: text(input.alertDevice, fallback.alertDevice, 120),
    alertDateTime: text(input.alertDateTime, fallback.alertDateTime, 40),
    appPromoHeading: text(input.appPromoHeading, fallback.appPromoHeading, 80),
    appPromoText: text(input.appPromoText, fallback.appPromoText, 200),
    appStoreUrl: has("appStoreUrl") ? safeUrl(input.appStoreUrl) : fallback.appStoreUrl,
    socials,
    footerLinks,
  };
}

/* -------------------------------- theming -------------------------------- */

const RADIUS: Record<ButtonShape, string> = { rounded: "12px", pill: "9999px", square: "6px" };

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function darken(hex: string, amount: number): string {
  const [r, g, b] = rgb(hex).map((c) => Math.round(c * (1 - amount)));
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/** Dark ink or white — whichever has the better contrast on `hex`. */
function readableOn(hex: string): string {
  const [r, g, b] = rgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const vsWhite = 1.05 / (lum + 0.05);
  const vsInk = (lum + 0.05) / 0.07;
  return vsWhite >= vsInk ? "#ffffff" : "#25282d";
}

/** CSS custom properties that drive colours + button shape across the whole app. */
export function themeVars(s: SiteSettings): Record<string, string> {
  return {
    "--q-primary": s.primaryColor,
    "--q-primary-dark": darken(s.primaryColor, 0.14),
    "--q-primary-ink": readableOn(s.primaryColor),
    "--q-secondary": s.secondaryColor,
    "--q-btn-radius": RADIUS[s.buttonShape],
  };
}

/* ------------------------------- formatting ------------------------------ */

/** "2026-11-19T15:42" → "Nov 19, 2026 · 3:42 PM". Falls back to the raw text. */
export function formatAlertDateTime(value: string): string {
  const m = DATE_TIME.exec(value);
  if (!m) return value;
  const [, y, mo, d, h, mi] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi));
  if (Number.isNaN(date.getTime())) return value;
  const day = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
  const time = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
  return `${day} · ${time}`;
}

/** Current local time as a value for <input type="datetime-local">. */
export function nowForInput(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
