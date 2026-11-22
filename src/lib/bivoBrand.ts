import { getSupabase } from "./supabase";
import { friendlyError } from "./remote";
import { isHexColor, readableOn } from "./settings";

/**
 * Everything the Bivo sign-in app at /signin shows — branding, colours, copy,
 * and the size / spacing of every element — stored as JSON in one shared row
 * (`bivo_brand_settings.data`, id = 1; see section 6 of quilo-backend.sql).
 * Mirrors the shape of the main site's `site_settings`: everyone can read,
 * only an admin_users member can save (enforced by RLS, not by this file).
 *
 * Edited entirely at /signin/admin (BivoBrandEditor.tsx). sanitizeBivoBrand()
 * below is deliberately tolerant of missing/invalid/obsolete keys — a brand
 * saved by an older version of this file still loads fine, with new fields
 * filled in from DEFAULT_BIVO_BRAND and removed fields simply ignored.
 *
 * All sizes and spacings are in px.
 */

export type BivoFontFamily = "outfit" | "system" | "serif" | "mono";

export type BivoBrand = {
  appName: string;
  logoUrl: string;

  backgroundImageUrl: string;
  backgroundColor: string;
  /** Default text colour for body copy. */
  textColor: string;
  /** Controls the Next button. */
  buttonColor: string;
  /** Controls every hyperlink (Forgot email?, privacy policy, ...). */
  linkColor: string;
  /** Border colour of the card, header line and fields. */
  borderColor: string;

  fontFamily: BivoFontFamily;
  fontWeight: 400 | 500 | 600 | 700;

  // Copy
  signinHeadline: string;
  signinSubline: string;
  signinPasswordTitle: string;
  signinSwitchLabel: string;
  signinDoneTitle: string;
  emailLabel: string;
  passwordLabel: string;
  nextLabel: string;
  useAnotherAccountLabel: string;
  signedInAsTemplate: string;
  continueLabel: string;
  redirectingText: string;
  showPasswordLabel: string;
  demoNoticeText: string;

  // Validation / error copy
  genericErrorMessage: string;
  emailRequiredMessage: string;
  emailInvalidMessage: string;
  passwordRequiredMessage: string;
  /** May contain "{min}", filled in with the minimum password length. */
  passwordTooShortMessage: string;

  /** Where a visitor lands after signing in. Empty = stay on the success screen. A path ("/") or full https:// link. */
  successRedirectUrl: string;

  // Page & card
  pagePaddingX: number;
  pagePaddingY: number;
  cardWidth: number;
  cardPaddingX: number;
  cardPaddingY: number;
  cardRadius: number;

  // Header
  logoSize: number;
  headerPaddingY: number;
  headerTextSize: number;

  // Headings
  titleSize: number;
  sublineSize: number;
  /** Space between the heading and the subheading. */
  titleSpacing: number;
  /** Space between the subheading and the first field. */
  sublineSpacing: number;

  // Fields
  inputHeight: number;
  inputTextSize: number;
  labelSize: number;
  inputBorderWidth: number;
  inputBorderRadius: number;
  inputBackgroundColor: string;
  inputTextColor: string;
  /** Space between a field and the link / checkbox below it. */
  fieldSpacing: number;

  // Links, checkbox, policy text
  linkSize: number;
  checkboxSize: number;
  checkboxSpacing: number;
  policyTextSize: number;
  policySpacing: number;
  messageTextSize: number;

  // Button row
  buttonHeight: number;
  buttonTextSize: number;
  buttonPaddingX: number;
  buttonRowSpacing: number;

  // Success screen
  doneIconSize: number;

  // Footer
  footerTextSize: number;
  footerSpacing: number;

  // Top banner (promo card above the header)
  showBanner: boolean;
  bannerTitle: string;
  bannerText: string;
  bannerLinkLabel: string;
  /** A path ("/") or full https:// link. Empty = the link text is shown but goes nowhere. */
  bannerLinkUrl: string;
  /** Own icon (data: URL or https link). Empty = the logo, or the generated mark. */
  bannerIconUrl: string;
  bannerBackgroundColor: string;
  bannerIconSize: number;
  bannerTitleSize: number;
  bannerTextSize: number;
  bannerLinkSize: number;
  bannerPaddingX: number;
  bannerPaddingY: number;
  bannerRadius: number;
  /** Space around the banner (above, below and at the sides). */
  bannerSpacing: number;

  // Visibility toggles
  showLogo: boolean;
  showSubline: boolean;
  showSwitchLink: boolean;
};

export const DEFAULT_BIVO_BRAND: BivoBrand = {
  appName: "Bivo",
  logoUrl: "",

  backgroundImageUrl: "",
  backgroundColor: "#ffffff",
  textColor: "#202124",
  buttonColor: "#1d4ed8",
  linkColor: "#1d4ed8",
  borderColor: "#dadce0",

  fontFamily: "outfit",
  fontWeight: 400,

  signinHeadline: "Sign in",
  signinSubline: "Use your Bivo account to continue",
  signinPasswordTitle: "Welcome back",
  signinSwitchLabel: "Create account",
  signinDoneTitle: "You're in",
  emailLabel: "Email",
  passwordLabel: "Password",
  nextLabel: "Next",
  useAnotherAccountLabel: "Use another account",
  signedInAsTemplate: "Signed in as {email}",
  continueLabel: "Continue",
  redirectingText: "Taking you there automatically…",
  showPasswordLabel: "Show password",
  demoNoticeText: "Demo mode — connect Supabase to sign in real accounts.",

  genericErrorMessage: "Something went wrong. Try again.",
  emailRequiredMessage: "Enter an email address",
  emailInvalidMessage: "Enter a valid email address",
  passwordRequiredMessage: "Enter your password",
  passwordTooShortMessage: "Password must be at least {min} characters",

  successRedirectUrl: "",

  pagePaddingX: 16,
  pagePaddingY: 16,
  cardWidth: 448,
  cardPaddingX: 40,
  cardPaddingY: 48,
  cardRadius: 8,

  logoSize: 24,
  headerPaddingY: 16,
  headerTextSize: 16,

  titleSize: 24,
  sublineSize: 16,
  titleSpacing: 12,
  sublineSpacing: 32,

  inputHeight: 56,
  inputTextSize: 16,
  labelSize: 16,
  inputBorderWidth: 1,
  inputBorderRadius: 4,
  inputBackgroundColor: "#ffffff",
  inputTextColor: "#202124",
  fieldSpacing: 12,

  linkSize: 14,
  checkboxSize: 18,
  checkboxSpacing: 16,
  policyTextSize: 14,
  policySpacing: 40,
  messageTextSize: 13,

  buttonHeight: 40,
  buttonTextSize: 14,
  buttonPaddingX: 28,
  buttonRowSpacing: 40,

  doneIconSize: 56,

  footerTextSize: 12,
  footerSpacing: 24,

  showBanner: true,
  bannerTitle: "Experience Bivo at its best",
  bannerText: "Get the Bivo app for email that is smart, fast and organized.",
  bannerLinkLabel: "View",
  bannerLinkUrl: "",
  bannerIconUrl: "",
  bannerBackgroundColor: "#ffffff",
  bannerIconSize: 40,
  bannerTitleSize: 16,
  bannerTextSize: 14,
  bannerLinkSize: 14,
  bannerPaddingX: 16,
  bannerPaddingY: 16,
  bannerRadius: 8,
  bannerSpacing: 12,

  showLogo: true,
  showSubline: true,
  showSwitchLink: true,
};

/** Safe font-family stacks for the small admin-picked allow-list (never a raw admin-typed string). */
export const BIVO_FONT_STACKS: Record<BivoFontFamily, string> = {
  outfit: '"Outfit", ui-sans-serif, system-ui, sans-serif',
  system: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  serif: 'ui-serif, Georgia, "Times New Roman", serif',
  mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
};

/**
 * Every `--bivo-*` CSS custom property the public page and the admin's live
 * preview need, computed from one BivoBrand. Callers apply it as an inline
 * `style` on the component's OWN root element (BivoSignIn) — never on
 * `document.documentElement` — so the admin dashboard's own chrome can never
 * be changed by whatever is being drafted.
 */
export function buildBivoCssVars(brand: BivoBrand): Record<string, string> {
  const px = (n: number) => `${n}px`;
  return {
    "--bivo-primary": brand.buttonColor,
    "--bivo-primary-ink": readableOn(brand.buttonColor),
    "--bivo-link": brand.linkColor,
    "--bivo-ink": brand.textColor,
    "--bivo-border": brand.borderColor,
    "--bivo-bg-color": brand.backgroundColor,
    "--bivo-bg-image": brand.backgroundImageUrl ? `url("${brand.backgroundImageUrl}")` : "none",

    "--bivo-font-family": BIVO_FONT_STACKS[brand.fontFamily],
    "--bivo-font-weight": String(brand.fontWeight),

    "--bivo-input-height": px(brand.inputHeight),
    "--bivo-input-border-width": px(brand.inputBorderWidth),
    "--bivo-input-border-radius": px(brand.inputBorderRadius),
    "--bivo-input-bg": brand.inputBackgroundColor,
    "--bivo-input-text": brand.inputTextColor,
  };
}

/** Fills "{appName}" / "{name}" / "{min}" placeholders in an admin-edited template string. */
export function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (m, key: string) => vars[key] ?? m);
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function text(v: unknown, fallback: string, max = 200): string {
  if (typeof v !== "string") return fallback;
  const t = v.trim();
  return t ? t.slice(0, max) : fallback;
}

function hex(v: unknown, fallback: string): string {
  return typeof v === "string" && isHexColor(v.trim()) ? v.trim().toLowerCase() : fallback;
}

function num(v: unknown, fallback: number, min: number, max: number): number {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
}

function bool(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function oneOf<T extends string>(v: unknown, options: readonly T[], fallback: T): T {
  return typeof v === "string" && (options as readonly string[]).includes(v) ? (v as T) : fallback;
}

/**
 * An https:// image link, or a data: URL (uploaded logo/background — see
 * src/lib/image.ts, which itself caps a single upload at ~1.5M characters).
 * The cap below sits just above that, so a normal single upload always passes
 * here; if BOTH the logo and the background image are large, the two
 * together can still exceed the table's 2MB row limit (section 6 of
 * quilo-backend.sql) — saveBivoBrand() surfaces that as a visible "Couldn't
 * save" error rather than silently losing data.
 *
 * Deliberately REJECTS (falls back) an over-length value instead of slicing it:
 * truncating a base64 data: URL mid-string would corrupt it into an unreadable
 * image rather than shrink it.
 */
const MAX_IMAGE_CHARS = 1_600_000;
function safeImage(v: unknown, fallback: string): string {
  if (typeof v !== "string") return fallback;
  const t = v.trim();
  if (!t) return "";
  if (t.length > MAX_IMAGE_CHARS) return fallback;
  if (/^https:\/\/[^\s\\]+$/i.test(t) && !/[\u0000-\u001f\u007f]/.test(t)) return t;
  if (/^data:image\/(png|jpe?g|webp|svg\+xml);base64,/i.test(t)) return t;
  return fallback;
}

/** A path on this site ("/", "/thanks") or a full https:// link. Empty means "no redirect". */
function safeRedirect(v: unknown, fallback: string): string {
  if (typeof v !== "string") return fallback;
  const t = v.trim();
  if (!t) return "";
  // Accept same-site absolute paths, but reject protocol-relative URLs,
  // backslashes (which URL parsers may normalize), and control characters.
  if (t.startsWith("/") && !t.startsWith("//") && !t.includes("\\") && !/[\u0000-\u001f\u007f]/.test(t)) {
    return t.slice(0, 300);
  }
  if (/^https:\/\/[^\s\\]+$/i.test(t) && !/[\u0000-\u001f\u007f]/.test(t)) return t.slice(0, 300);
  return fallback;
}

/** Merge `input` over `fallback`, keeping only valid values — corrupted storage can never break the page. */
export function sanitizeBivoBrand(input: unknown, fallback: BivoBrand = DEFAULT_BIVO_BRAND): BivoBrand {
  if (!isObj(input)) return fallback;
  const fontWeight = num(input.fontWeight, fallback.fontWeight, 400, 700);
  const n = (key: keyof BivoBrand, min: number, max: number) => num(input[key], fallback[key] as number, min, max);
  return {
    appName: text(input.appName, fallback.appName, 40),
    logoUrl: safeImage(input.logoUrl, fallback.logoUrl),

    backgroundImageUrl: safeImage(input.backgroundImageUrl, fallback.backgroundImageUrl),
    backgroundColor: hex(input.backgroundColor, fallback.backgroundColor),
    textColor: hex(input.textColor, fallback.textColor),
    buttonColor: hex(input.buttonColor, fallback.buttonColor),
    linkColor: hex(input.linkColor, fallback.linkColor),
    borderColor: hex(input.borderColor, fallback.borderColor),

    fontFamily: oneOf(input.fontFamily, FONT_FAMILIES, fallback.fontFamily),
    fontWeight: (FONT_WEIGHTS.includes(fontWeight) ? fontWeight : fallback.fontWeight) as BivoBrand["fontWeight"],

    signinHeadline: text(input.signinHeadline, fallback.signinHeadline, 60),
    signinSubline: text(input.signinSubline, fallback.signinSubline, 120),
    signinPasswordTitle: text(input.signinPasswordTitle, fallback.signinPasswordTitle, 60),
    signinSwitchLabel: text(input.signinSwitchLabel, fallback.signinSwitchLabel, 30),
    signinDoneTitle: text(input.signinDoneTitle, fallback.signinDoneTitle, 60),
    emailLabel: text(input.emailLabel, fallback.emailLabel, 30),
    passwordLabel: text(input.passwordLabel, fallback.passwordLabel, 30),
    nextLabel: text(input.nextLabel, fallback.nextLabel, 30),
    useAnotherAccountLabel: text(input.useAnotherAccountLabel, fallback.useAnotherAccountLabel, 40),
    signedInAsTemplate: text(input.signedInAsTemplate, fallback.signedInAsTemplate, 100),
    continueLabel: text(input.continueLabel, fallback.continueLabel, 30),
    redirectingText: text(input.redirectingText, fallback.redirectingText, 100),
    showPasswordLabel: text(input.showPasswordLabel, fallback.showPasswordLabel, 40),
    demoNoticeText: text(input.demoNoticeText, fallback.demoNoticeText, 160),

    genericErrorMessage: text(input.genericErrorMessage, fallback.genericErrorMessage, 160),
    emailRequiredMessage: text(input.emailRequiredMessage, fallback.emailRequiredMessage, 100),
    emailInvalidMessage: text(input.emailInvalidMessage, fallback.emailInvalidMessage, 100),
    passwordRequiredMessage: text(input.passwordRequiredMessage, fallback.passwordRequiredMessage, 100),
    passwordTooShortMessage: text(input.passwordTooShortMessage, fallback.passwordTooShortMessage, 120),

    successRedirectUrl: safeRedirect(input.successRedirectUrl, fallback.successRedirectUrl),

    pagePaddingX: n("pagePaddingX", 0, 96),
    pagePaddingY: n("pagePaddingY", 0, 160),
    cardWidth: n("cardWidth", 280, 720),
    cardPaddingX: n("cardPaddingX", 8, 96),
    cardPaddingY: n("cardPaddingY", 8, 120),
    cardRadius: n("cardRadius", 0, 40),

    logoSize: n("logoSize", 16, 120),
    headerPaddingY: n("headerPaddingY", 0, 48),
    headerTextSize: n("headerTextSize", 11, 28),

    titleSize: n("titleSize", 16, 56),
    sublineSize: n("sublineSize", 11, 28),
    titleSpacing: n("titleSpacing", 0, 48),
    sublineSpacing: n("sublineSpacing", 0, 80),

    inputHeight: n("inputHeight", 36, 80),
    inputTextSize: n("inputTextSize", 12, 28),
    labelSize: n("labelSize", 11, 28),
    inputBorderWidth: n("inputBorderWidth", 0, 3),
    inputBorderRadius: n("inputBorderRadius", 0, 28),
    inputBackgroundColor: hex(input.inputBackgroundColor, fallback.inputBackgroundColor),
    inputTextColor: hex(input.inputTextColor, fallback.inputTextColor),
    fieldSpacing: n("fieldSpacing", 0, 48),

    linkSize: n("linkSize", 11, 24),
    checkboxSize: n("checkboxSize", 12, 32),
    checkboxSpacing: n("checkboxSpacing", 0, 48),
    policyTextSize: n("policyTextSize", 10, 22),
    policySpacing: n("policySpacing", 0, 96),
    messageTextSize: n("messageTextSize", 10, 22),

    buttonHeight: n("buttonHeight", 32, 72),
    buttonTextSize: n("buttonTextSize", 11, 24),
    buttonPaddingX: n("buttonPaddingX", 8, 80),
    buttonRowSpacing: n("buttonRowSpacing", 0, 96),

    doneIconSize: n("doneIconSize", 32, 120),

    footerTextSize: n("footerTextSize", 9, 20),
    footerSpacing: n("footerSpacing", 0, 80),

    showBanner: bool(input.showBanner, fallback.showBanner),
    bannerTitle: text(input.bannerTitle, fallback.bannerTitle, 80),
    bannerText: text(input.bannerText, fallback.bannerText, 200),
    bannerLinkLabel: text(input.bannerLinkLabel, fallback.bannerLinkLabel, 30),
    bannerLinkUrl: safeRedirect(input.bannerLinkUrl, fallback.bannerLinkUrl),
    bannerIconUrl: safeImage(input.bannerIconUrl, fallback.bannerIconUrl),
    bannerBackgroundColor: hex(input.bannerBackgroundColor, fallback.bannerBackgroundColor),
    bannerIconSize: n("bannerIconSize", 20, 96),
    bannerTitleSize: n("bannerTitleSize", 11, 32),
    bannerTextSize: n("bannerTextSize", 10, 26),
    bannerLinkSize: n("bannerLinkSize", 10, 26),
    bannerPaddingX: n("bannerPaddingX", 0, 64),
    bannerPaddingY: n("bannerPaddingY", 0, 64),
    bannerRadius: n("bannerRadius", 0, 40),
    bannerSpacing: n("bannerSpacing", 0, 64),

    showLogo: bool(input.showLogo, fallback.showLogo),
    showSubline: bool(input.showSubline, fallback.showSubline),
    showSwitchLink: bool(input.showSwitchLink, fallback.showSwitchLink),
  };
}

const FONT_FAMILIES: readonly BivoFontFamily[] = ["outfit", "system", "serif", "mono"];
const FONT_WEIGHTS: readonly number[] = [400, 500, 600, 700];

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

export type LoadResult = { ok: true; brand: BivoBrand } | { ok: false; error: string };
export type SaveResult = { ok: true; brand: BivoBrand } | { ok: false; error: string };

/** Loads the shared Bivo branding + copy. Falls back to the defaults when Supabase isn't configured. */
export async function loadBivoBrand(): Promise<LoadResult> {
  const sb = getSupabase();
  if (!sb) return { ok: true, brand: DEFAULT_BIVO_BRAND };
  try {
    const res = await withTimeout(Promise.resolve(sb.from(TABLE).select("data").eq("id", 1).maybeSingle()));
    if (res.error) return { ok: false, error: friendlyError(res.error.message, "Couldn't load the Bivo branding.") };
    return { ok: true, brand: sanitizeBivoBrand(res.data?.data) };
  } catch (e) {
    return { ok: false, error: friendlyError(e instanceof Error ? e.message : undefined, "Couldn't load the Bivo branding.") };
  }
}

/** Saves the shared Bivo branding + copy. Requires an admin session (enforced by RLS). */
export async function saveBivoBrand(brand: BivoBrand): Promise<SaveResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "Supabase isn't connected yet." };
  const clean = sanitizeBivoBrand(brand);
  try {
    const res = await withTimeout(Promise.resolve(sb.from(TABLE).update({ data: clean }).eq("id", 1).select("id")));
    if (res.error || !res.data || res.data.length === 0) {
      return {
        ok: false,
        error: res.error
          ? friendlyError(res.error.message, "Couldn't save the Bivo branding.")
          : "Nothing was saved. This account isn't an administrator, or the branding row is missing.",
      };
    }
    return { ok: true, brand: clean };
  } catch (e) {
    return { ok: false, error: friendlyError(e instanceof Error ? e.message : undefined, "Couldn't save the Bivo branding.") };
  }
}

/* ------------------------------ localization ------------------------------ */

/**
 * Stock copy for the Bivo sign-in page, by language (matching the main site's
 * "Language" setting — see src/lib/i18n.ts). Only the fields a visitor reads
 * as running text are covered here; colours, sizes and the "Bivo" app name
 * itself are never translated.
 *
 * `localizeBivoBrand()` below only swaps in a translation for a field that
 * still has its original English default value — the moment an admin types
 * their own copy into any of these fields in /signin/admin, that field is
 * treated as customized and is never overwritten, in any language.
 */
type BivoTextField = {
  [K in keyof BivoBrand]: BivoBrand[K] extends string ? (string extends BivoBrand[K] ? K : never) : never;
}[keyof BivoBrand];

const BIVO_TRANSLATIONS: Partial<Record<string, Partial<Record<BivoTextField, string>>>> = {
  Nederlands: {
    signinHeadline: "Inloggen",
    signinSubline: "Gebruik je Bivo-account om door te gaan",
    signinPasswordTitle: "Welkom terug",
    signinSwitchLabel: "Account aanmaken",
    signinDoneTitle: "Je bent ingelogd",
    emailLabel: "E-mail",
    passwordLabel: "Wachtwoord",
    nextLabel: "Volgende",
    useAnotherAccountLabel: "Ander account gebruiken",
    signedInAsTemplate: "Ingelogd als {email}",
    continueLabel: "Doorgaan",
    redirectingText: "Je wordt automatisch doorgestuurd…",
    showPasswordLabel: "Wachtwoord weergeven",
    demoNoticeText: "Demomodus — koppel Supabase om met echte accounts in te loggen.",

    genericErrorMessage: "Er is iets misgegaan. Probeer het opnieuw.",
    emailRequiredMessage: "Vul een e-mailadres in",
    emailInvalidMessage: "Vul een geldig e-mailadres in",
    passwordRequiredMessage: "Vul je wachtwoord in",
    passwordTooShortMessage: "Wachtwoord moet minstens {min} tekens bevatten",

    bannerTitle: "Beleef Bivo op zijn best",
    bannerText: "Download de Bivo-app voor e-mail die slim, snel en georganiseerd is.",
    bannerLinkLabel: "Bekijken",
  },
};

/**
 * Applies the stock-copy translation for `language` on top of `brand`,
 * leaving any field the admin has actually customized untouched. Call this
 * on a brand just loaded from Supabase, before handing it to <BivoSignIn>.
 */
export function localizeBivoBrand(brand: BivoBrand, language: string): BivoBrand {
  const overrides = BIVO_TRANSLATIONS[language];
  if (!overrides) return brand;
  const toApply: Partial<Record<BivoTextField, string>> = {};
  for (const key of Object.keys(overrides) as BivoTextField[]) {
    if (brand[key] === DEFAULT_BIVO_BRAND[key]) {
      toApply[key] = overrides[key];
    }
  }
  return { ...brand, ...toApply };
}
