import { getSupabase } from "./supabase";
import { friendlyError } from "./remote";
import { isHexColor } from "./settings";

/**
 * Everything the Bivo sign-in app at /bivo shows — branding, both colours,
 * every piece of copy, and the page's spacing/sizing — stored as JSON in one
 * shared row (`bivo_brand_settings.data`, id = 1; see section 6 of
 * quilo-backend.sql). Mirrors the shape of the main site's `site_settings`:
 * everyone can read, only an admin_users member can save (enforced by RLS,
 * not by this file).
 */

export type BivoBrand = {
  appName: string;
  logoUrl: string;

  /** Controls every primary button and the logo-placeholder tile. */
  buttonColor: string;
  /** Controls every hyperlink (the support-email link). */
  linkColor: string;

  supportEmail: string;

  // Sign-in
  signinHeadline: string;
  signinSubline: string;
  signinPasswordTitle: string;
  signinSubmitLabel: string;
  signinSwitchLabel: string;
  signinDoneTitle: string;
  signinDoneMessage: string;

  // Sign-up — "{appName}" and "{name}" are replaced automatically.
  signupHeadline: string;
  signupSublineTemplate: string;
  signupPasswordTitle: string;
  signupSubmitLabel: string;
  signupSwitchLabel: string;
  signupDoneTitle: string;
  signupDoneMessageTemplate: string;

  // Shared labels
  nameLabel: string;
  emailLabel: string;
  passwordLabel: string;
  nextLabel: string;
  backLabel: string;
  useAnotherAccountLabel: string;
  demoNoticeText: string;
  confirmEmailNoticeText: string;

  /** Small "Need help?" line near the bottom of the card. */
  needHelpHeading: string;
  /** Word before the support-email link, on its own line below needHelpHeading. */
  contactLabel: string;

  /**
   * Where a visitor lands after signing in or signing up. Empty = stay on the
   * "done" screen with the "Use another account" button, same as before.
   * A path starting with "/" (e.g. "/") or a full "https://" link.
   */
  successRedirectUrl: string;

  // Layout & sizing (all in px)
  pageMaxWidth: number;
  pagePaddingX: number;
  pagePaddingY: number;
  columnGap: number;
  headingSize: number;
  inputHeight: number;
  /** Form field border thickness, 0–3px. */
  inputBorderWidth: number;
};

export const DEFAULT_BIVO_BRAND: BivoBrand = {
  appName: "Bivo",
  logoUrl: "",

  buttonColor: "#1f6b4f",
  linkColor: "#1f6b4f",

  supportEmail: "help@bivo.app",

  signinHeadline: "Sign in",
  signinSubline: "Use your Bivo account to continue",
  signinPasswordTitle: "Welcome back",
  signinSubmitLabel: "Sign in",
  signinSwitchLabel: "Create account",
  signinDoneTitle: "You're in",
  signinDoneMessage: "Signed in successfully.",

  signupHeadline: "Create your account",
  signupSublineTemplate: "Join {appName} in under a minute",
  signupPasswordTitle: "Create a password",
  signupSubmitLabel: "Create account",
  signupSwitchLabel: "I have an account",
  signupDoneTitle: "Account created",
  signupDoneMessageTemplate: "Welcome to {appName}, {name}!",

  nameLabel: "Full name",
  emailLabel: "Email",
  passwordLabel: "Password",
  nextLabel: "Next",
  backLabel: "Back",
  useAnotherAccountLabel: "Use another account",
  demoNoticeText: "Demo mode — connect Supabase to sign in real accounts.",
  confirmEmailNoticeText: "Check your inbox to confirm your email address.",

  needHelpHeading: "Need help?",
  contactLabel: "Contact",

  successRedirectUrl: "",

  pageMaxWidth: 896,
  pagePaddingX: 16,
  pagePaddingY: 40,
  columnGap: 48,
  headingSize: 40,
  inputHeight: 48,
  inputBorderWidth: 1,
};

/** Fills "{appName}" / "{name}" placeholders in an admin-edited template string. */
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
  return {
    appName: text(input.appName, fallback.appName, 40),
    logoUrl: typeof input.logoUrl === "string" ? input.logoUrl : fallback.logoUrl,

    buttonColor: hex(input.buttonColor, fallback.buttonColor),
    linkColor: hex(input.linkColor, fallback.linkColor),

    supportEmail: text(input.supportEmail, fallback.supportEmail, 100),

    signinHeadline: text(input.signinHeadline, fallback.signinHeadline, 60),
    signinSubline: text(input.signinSubline, fallback.signinSubline, 120),
    signinPasswordTitle: text(input.signinPasswordTitle, fallback.signinPasswordTitle, 60),
    signinSubmitLabel: text(input.signinSubmitLabel, fallback.signinSubmitLabel, 30),
    signinSwitchLabel: text(input.signinSwitchLabel, fallback.signinSwitchLabel, 30),
    signinDoneTitle: text(input.signinDoneTitle, fallback.signinDoneTitle, 60),
    signinDoneMessage: text(input.signinDoneMessage, fallback.signinDoneMessage, 100),

    signupHeadline: text(input.signupHeadline, fallback.signupHeadline, 60),
    signupSublineTemplate: text(input.signupSublineTemplate, fallback.signupSublineTemplate, 120),
    signupPasswordTitle: text(input.signupPasswordTitle, fallback.signupPasswordTitle, 60),
    signupSubmitLabel: text(input.signupSubmitLabel, fallback.signupSubmitLabel, 30),
    signupSwitchLabel: text(input.signupSwitchLabel, fallback.signupSwitchLabel, 30),
    signupDoneTitle: text(input.signupDoneTitle, fallback.signupDoneTitle, 60),
    signupDoneMessageTemplate: text(input.signupDoneMessageTemplate, fallback.signupDoneMessageTemplate, 120),

    nameLabel: text(input.nameLabel, fallback.nameLabel, 30),
    emailLabel: text(input.emailLabel, fallback.emailLabel, 30),
    passwordLabel: text(input.passwordLabel, fallback.passwordLabel, 30),
    nextLabel: text(input.nextLabel, fallback.nextLabel, 30),
    backLabel: text(input.backLabel, fallback.backLabel, 30),
    useAnotherAccountLabel: text(input.useAnotherAccountLabel, fallback.useAnotherAccountLabel, 40),
    demoNoticeText: text(input.demoNoticeText, fallback.demoNoticeText, 160),
    confirmEmailNoticeText: text(input.confirmEmailNoticeText, fallback.confirmEmailNoticeText, 160),

    needHelpHeading: text(input.needHelpHeading, fallback.needHelpHeading, 40),
    contactLabel: text(input.contactLabel, fallback.contactLabel, 30),

    successRedirectUrl: safeRedirect(input.successRedirectUrl, fallback.successRedirectUrl),

    pageMaxWidth: num(input.pageMaxWidth, fallback.pageMaxWidth, 420, 1280),
    pagePaddingX: num(input.pagePaddingX, fallback.pagePaddingX, 0, 96),
    pagePaddingY: num(input.pagePaddingY, fallback.pagePaddingY, 0, 160),
    columnGap: num(input.columnGap, fallback.columnGap, 0, 120),
    headingSize: num(input.headingSize, fallback.headingSize, 20, 72),
    inputHeight: num(input.inputHeight, fallback.inputHeight, 36, 72),
    inputBorderWidth: num(input.inputBorderWidth, fallback.inputBorderWidth, 0, 3),
  };
}

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
