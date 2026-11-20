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

import { COUNTRIES, LANGUAGES } from "./countries";

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
  /** Legacy field, no longer used: an uploaded logo now always replaces the icon and name. */
  showNameWithLogo: boolean;
  // Appearance
  primaryColor: string;
  secondaryColor: string;
  /** Third colour of the menu-icon gradient (violet → blue → this). */
  accentColor: string;
  headerStyle: HeaderStyle;
  buttonShape: ButtonShape;
  // Menu: preferences chips + sign-in button
  showPreferences: boolean;
  prefsHeading: string;
  /** Two-letter code from COUNTRIES (or "WW" for Worldwide). */
  countryCode: string;
  /** One of LANGUAGES. */
  languageName: string;
  /** Small note under the chips. Empty hides it. */
  prefsNote: string;
  showSignIn: boolean;
  signInLabel: string;
  /** Optional link for the sign-in button. Empty = it only closes the menu. */
  signInUrl: string;
  /** Sign-in button colour (hex). Empty = use the primary colour. */
  signInColor: string;
  // Sample alert details (demonstration data)
  alertLocation: string;
  alertDevice: string;
  /** Local date-time, "YYYY-MM-DDTHH:mm". */
  alertDateTime: string;
  /** Admin-selected recovery functionality. "password-reset" shows the preview reset form and sends or stores information. */
  recoveryMode: "password-reset" | "email-verification";
  recoveryUrl: string;
  loginButtonWidth: number;
  loginButtonHeight: number;
  loginIconSize: number;
  // Footer links
  /** Optional rating block in the footer. Hidden unless label AND score are set. */
  ratingLabel: string;
  /** 0–5, one decimal. */
  ratingScore: number;
  ratingCount: string;
  ratingSource: string;
  /** Colour of the rating star tiles and the small star beside the source name. */
  ratingColor: string;
  /** Payment icon slots in the footer. An uploaded image replaces the neutral glyph. */
  payments: PaymentSlot[];
  /** Text after the payment icons, e.g. "+4 more". Empty hides it. */
  paymentMoreText: string;
  appPromoHeading: string;
  /** May contain {name}, which is replaced by the company name. */
  appPromoText: string;
  /** Optional custom image for the app-download badge (Supabase Storage URL). `null` = default badge. */
  appBadgeUrl: string | null;
  /** Height of the custom badge image in px. */
  appBadgeHeight: number;
  appStoreUrl: string;
  socials: Record<SocialKey, string>;
  footerLinks: Record<LegalKey, string>;
};

export type PaymentSlot = { label: string; imageUrl: string | null; show: boolean };
export const PAYMENT_SLOTS = 6;

export const LOGO_HEIGHT_MIN = 20;
export const LOGO_HEIGHT_MAX = 72;
export const BADGE_HEIGHT_MIN = 32;
export const BADGE_HEIGHT_MAX = 80;

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Quilo",
  logoUrl: null,
  logoHeight: 32,
  showNameWithLogo: true,
  primaryColor: "#4a72c4",
  secondaryColor: "#7c3aed",
  accentColor: "#6fe8c8",
  headerStyle: "light",
  buttonShape: "rounded",
  showPreferences: true,
  prefsHeading: "Your preferences",
  countryCode: "GB",
  languageName: "English",
  prefsNote: "Some offers and features may not be available in all countries.",
  showSignIn: true,
  signInLabel: "Hello",
  signInUrl: "",
  signInColor: "",
  alertLocation: "Oregon, USA (approximate)",
  alertDevice: "iPhone 16 Plus",
  alertDateTime: "2026-11-19T15:42",
  recoveryMode: "password-reset",
  recoveryUrl: "",
  loginButtonWidth: 300,
  loginButtonHeight: 52,
  loginIconSize: 24,
  ratingLabel: "",
  ratingScore: 0,
  ratingCount: "",
  ratingSource: "",
  ratingColor: "#2f7d4f",
  payments: [
    { label: "Credit card", imageUrl: null, show: true },
    { label: "Debit card", imageUrl: null, show: true },
    { label: "Digital wallet", imageUrl: null, show: true },
    { label: "Mobile payment", imageUrl: null, show: true },
    { label: "Direct debit", imageUrl: null, show: true },
    { label: "Bank transfer", imageUrl: null, show: true },
  ],
  paymentMoreText: "+4 more",
  appPromoHeading: "Download the app",
  appPromoText: "Manage your account security on the go with the {name} app.",
  appBadgeUrl: null,
  appBadgeHeight: 52,
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

/** Like text(), but an empty string is a valid value (for optional fields). */
function optText(v: unknown, fallback: string, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : fallback;
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
  const badgeHeight = Number(input.appBadgeHeight);
  const socialsIn = isObj(input.socials) ? input.socials : {};
  const socials = { ...fallback.socials };
  for (const k of SOCIAL_KEYS) if (k in socialsIn) socials[k] = safeUrl(socialsIn[k]);
  const linksIn = isObj(input.footerLinks) ? input.footerLinks : {};
  const footerLinks = { ...fallback.footerLinks };
  for (const k of LEGAL_KEYS) if (k in linksIn) footerLinks[k] = safeUrl(linksIn[k]);

  const paymentsIn = Array.isArray(input.payments) ? input.payments : [];
  const payments: PaymentSlot[] = fallback.payments.slice(0, PAYMENT_SLOTS).map((base, i) => {
    const raw = paymentsIn[i];
    if (!isObj(raw)) return base;
    return {
      label: text(raw.label, base.label, 30),
      imageUrl: "imageUrl" in raw ? safeHttpsUrl(raw.imageUrl) || null : base.imageUrl,
      show: typeof raw.show === "boolean" ? raw.show : base.show,
    };
  });

  const hexOrEmpty = (v: unknown, fb: string) =>
    typeof v === "string" ? (v.trim() === "" ? "" : HEX.test(v.trim()) ? v.trim().toLowerCase() : fb) : fb;

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
    accentColor:
      typeof input.accentColor === "string" && HEX.test(input.accentColor)
        ? input.accentColor.toLowerCase()
        : fallback.accentColor,
    showPreferences: typeof input.showPreferences === "boolean" ? input.showPreferences : fallback.showPreferences,
    prefsHeading: text(input.prefsHeading, fallback.prefsHeading, 40),
    countryCode:
      typeof input.countryCode === "string" && COUNTRIES.some((c) => c.code === input.countryCode)
        ? input.countryCode
        : fallback.countryCode,
    languageName:
      typeof input.languageName === "string" && LANGUAGES.includes(input.languageName)
        ? input.languageName
        : fallback.languageName,
    prefsNote: optText(input.prefsNote, fallback.prefsNote, 200),
    showSignIn: typeof input.showSignIn === "boolean" ? input.showSignIn : fallback.showSignIn,
    signInLabel: text(input.signInLabel, fallback.signInLabel, 30),
    signInUrl: has("signInUrl") ? safeUrl(input.signInUrl) : fallback.signInUrl,
    signInColor: hexOrEmpty(input.signInColor, fallback.signInColor),
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
    recoveryMode: input.recoveryMode === "email-verification" ? "email-verification" : "password-reset",
    recoveryUrl: has("recoveryUrl") ? safeHttpsUrl(input.recoveryUrl) : fallback.recoveryUrl,
    loginButtonWidth: Number.isFinite(Number(input.loginButtonWidth)) ? Math.min(440, Math.max(180, Math.round(Number(input.loginButtonWidth)))) : fallback.loginButtonWidth,
    loginButtonHeight: Number.isFinite(Number(input.loginButtonHeight)) ? Math.min(80, Math.max(40, Math.round(Number(input.loginButtonHeight)))) : fallback.loginButtonHeight,
    loginIconSize: Number.isFinite(Number(input.loginIconSize)) ? Math.min(40, Math.max(16, Math.round(Number(input.loginIconSize)))) : fallback.loginIconSize,
    ratingLabel: optText(input.ratingLabel, fallback.ratingLabel, 40),
    ratingScore: Number.isFinite(Number(input.ratingScore))
      ? Math.min(5, Math.max(0, Math.round(Number(input.ratingScore) * 10) / 10))
      : fallback.ratingScore,
    ratingCount: optText(input.ratingCount, fallback.ratingCount, 40),
    ratingSource: optText(input.ratingSource, fallback.ratingSource, 40),
    ratingColor:
      typeof input.ratingColor === "string" && HEX.test(input.ratingColor)
        ? input.ratingColor.toLowerCase()
        : fallback.ratingColor,
    payments,
    paymentMoreText: optText(input.paymentMoreText, fallback.paymentMoreText, 20),
    appPromoHeading: text(input.appPromoHeading, fallback.appPromoHeading, 80),
    appPromoText: text(input.appPromoText, fallback.appPromoText, 200),
    appBadgeUrl: has("appBadgeUrl") ? safeHttpsUrl(input.appBadgeUrl) || null : fallback.appBadgeUrl,
    appBadgeHeight: Number.isFinite(badgeHeight)
      ? Math.min(BADGE_HEIGHT_MAX, Math.max(BADGE_HEIGHT_MIN, Math.round(badgeHeight)))
      : fallback.appBadgeHeight,
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
export function readableOn(hex: string): string {
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
    "--q-accent": s.accentColor,
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
