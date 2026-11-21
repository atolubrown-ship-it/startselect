import { getSupabase } from "./supabase";
import { friendlyError } from "./remote";
import { isHexColor, readableOn } from "./settings";

/**
 * Everything the Bivo sign-in app at /signin shows — branding, colours, every
 * piece of copy, every field/button/layout knob, visibility toggles and
 * footer links — stored as JSON in one shared row (`bivo_brand_settings.data`,
 * id = 1; see section 6 of quilo-backend.sql). Mirrors the shape of the main
 * site's `site_settings`: everyone can read, only an admin_users member can
 * save (enforced by RLS, not by this file).
 *
 * Edited entirely at /signin/admin (BivoBrandEditor.tsx), independent of the
 * main site's /admin dashboard. sanitizeBivoBrand() below is deliberately
 * tolerant of missing/invalid keys — a brand saved by an older version of
 * this file (fewer fields) still loads fine, with the new fields filled
 * in from DEFAULT_BIVO_BRAND.
 */

export type LogoPosition = "left" | "center";
export type LabelPosition = "floating" | "top";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonShape = "rounded" | "pill" | "square";
export type ButtonPosition = "left" | "right" | "between" | "center";
export type PageAlign = "left" | "center" | "right";
export type ColumnOrder = "brandFirst" | "formFirst";
export type BivoFontFamily = "outfit" | "system" | "serif" | "mono";
export type MessageAlign = "left" | "center" | "right";

export type BivoBrand = {
  appName: string;
  logoUrl: string;
  /** Logo size, px (square). */
  logoSize: number;
  logoPosition: LogoPosition;

  /** Optional full-bleed page background image (data: URL or https link). Empty = none. */
  backgroundImageUrl: string;
  backgroundColor: string;
  /** Default text colour for body copy (headings/labels keep their own colour logic). */
  textColor: string;
  /** Controls every primary button and the logo-placeholder tile. */
  buttonColor: string;
  /** Controls every hyperlink (the support-email link, footer links). */
  linkColor: string;
  /** Generic border colour — the email chip, the card (if shown), the error banner border isn't included (uses its own danger colour). */
  borderColor: string;

  fontFamily: BivoFontFamily;
  /** Base body text size, px. Headings and inputs keep their own size controls. */
  fontSize: number;
  fontWeight: 400 | 500 | 600 | 700;

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

  // Validation / error copy
  genericErrorMessage: string;
  emailRequiredMessage: string;
  emailInvalidMessage: string;
  passwordRequiredMessage: string;
  /** May contain "{min}", filled in with the minimum password length. */
  passwordTooShortMessage: string;
  nameRequiredMessage: string;

  /**
   * Where a visitor lands after signing in or signing up. Empty = stay on the
   * "done" screen with the "Use another account" button, same as before.
   * A path starting with "/" (e.g. "/") or a full "https://" link.
   */
  successRedirectUrl: string;

  // Up to three optional footer links, each hidden until both fields are filled in.
  footerLink1Label: string;
  footerLink1Url: string;
  footerLink2Label: string;
  footerLink2Url: string;
  footerLink3Label: string;
  footerLink3Url: string;

  // Layout & sizing (all px unless noted)
  pageMaxWidth: number;
  pagePaddingX: number;
  pagePaddingY: number;
  pageAlign: PageAlign;
  columnGap: number;
  columnOrder: ColumnOrder;
  headingSize: number;

  /** Wraps the sign-in content in a bordered, padded card instead of sitting on the bare page background. */
  showCard: boolean;
  cardPadding: number;
  /** 0 = auto height. */
  cardMinHeight: number;

  // Form appearance
  inputHeight: number;
  /** Form field border thickness, 0–3px. */
  inputBorderWidth: number;
  inputBorderRadius: number;
  inputBackgroundColor: string;
  inputTextColor: string;
  /** Field width as a percentage of the column it sits in. */
  inputWidthPercent: number;
  labelPosition: LabelPosition;
  /** Vertical gap between stacked fields. */
  fieldSpacing: number;
  buttonSize: ButtonSize;
  buttonShape: ButtonShape;
  /** How the Next/Back (or Sign in/Back) pair are laid out. */
  buttonPosition: ButtonPosition;

  // Visibility toggles
  showLogo: boolean;
  showSubline: boolean;
  showSwitchLink: boolean;
  showHelpLine: boolean;

  // Email field — styled independently of the shared "Form appearance" group
  // above, per-field, because the email and password fields need genuinely
  // different borders/colours (not just one shared theme).
  emailBorderColor: string;
  /** 0–6px. */
  emailBorderWidth: number;
  emailBorderRadius: number;
  emailLabelColor: string;
  emailInputBg: string;
  emailInputText: string;
  forgotEmailLabel: string;
  showForgotEmailLink: boolean;

  // Password field
  passwordBorderColor: string;
  /** 0–6px. */
  passwordBorderWidth: number;
  passwordBorderRadius: number;
  passwordLabelColor: string;
  passwordInputBg: string;
  passwordInputText: string;
  showPasswordCheckboxLabel: string;
  showShowPasswordCheckbox: boolean;
  forgotPasswordLabel: string;
  showForgotPasswordLink: boolean;

  /**
   * "Not your device?" security notice, shown under the form on both the
   * email and password steps at the same position. The template contains
   * the literal tokens "{privateWindow}" and "{signOut}" — each is rendered
   * as its own real hyperlink using the matching …Text field below, so an
   * admin can reword the surrounding sentence while the two phrases stay
   * clickable wherever they appear in it.
   */
  securityMessageTemplate: string;
  securityMessagePrivateWindowText: string;
  securityMessageSignOutText: string;
  securityMessageFontSize: number;
  securityMessageColor: string;
  securityMessageLinkColor: string;
  securityMessageAlign: MessageAlign;
  /** Space above the message, px. */
  securityMessageSpacing: number;
  showSecurityMessage: boolean;

  /**
   * The page-level header bar (logo + "Sign in with {appName}" + a bottom
   * divider) shown above the card, and the page-level footer (language +
   * up to three links) shown below it. Neither ever contains a back
   * control — restoring this chrome (requested after the original design)
   * is scoped to look only, not navigation.
   */
  showHeaderBar: boolean;
  headerText: string;
  showPageFooter: boolean;
  footerLanguageLabel: string;
};

export const DEFAULT_BIVO_BRAND: BivoBrand = {
  appName: "Bivo",
  logoUrl: "",
  logoSize: 44,
  logoPosition: "left",

  backgroundImageUrl: "",
  backgroundColor: "#ffffff",
  textColor: "#1b1f24",
  buttonColor: "#1f6b4f",
  linkColor: "#1f6b4f",
  borderColor: "#dbe1e8",

  fontFamily: "outfit",
  fontSize: 16,
  fontWeight: 400,

  supportEmail: "help@bivo.app",

  signinHeadline: "Sign in",
  signinSubline: "Use your {appName} account",
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

  genericErrorMessage: "Something went wrong. Try again.",
  emailRequiredMessage: "Enter an email address",
  emailInvalidMessage: "Enter a valid email address",
  passwordRequiredMessage: "Enter your password",
  passwordTooShortMessage: "Password must be at least {min} characters",
  nameRequiredMessage: "Enter your name",

  successRedirectUrl: "",

  footerLink1Label: "Help",
  footerLink1Url: "/signin/help",
  footerLink2Label: "Privacy",
  footerLink2Url: "/signin/privacy",
  footerLink3Label: "Terms",
  footerLink3Url: "/signin/terms",

  pageMaxWidth: 896,
  pagePaddingX: 16,
  pagePaddingY: 40,
  pageAlign: "center",
  columnGap: 48,
  columnOrder: "brandFirst",
  headingSize: 40,

  showCard: false,
  cardPadding: 32,
  cardMinHeight: 0,

  inputHeight: 48,
  inputBorderWidth: 1,
  inputBorderRadius: 12,
  inputBackgroundColor: "#ffffff",
  inputTextColor: "#1b1f24",
  inputWidthPercent: 100,
  labelPosition: "floating",
  fieldSpacing: 20,
  buttonSize: "md",
  buttonShape: "rounded",
  buttonPosition: "between",

  showLogo: true,
  showSubline: true,
  showSwitchLink: true,
  showHelpLine: true,

  emailBorderColor: "#1a73e8",
  emailBorderWidth: 4,
  emailBorderRadius: 8,
  emailLabelColor: "#1a73e8",
  emailInputBg: "#ffffff",
  emailInputText: "#1b1f24",
  forgotEmailLabel: "Forgot email?",
  showForgotEmailLink: true,

  passwordBorderColor: "#1a73e8",
  passwordBorderWidth: 4,
  passwordBorderRadius: 8,
  passwordLabelColor: "#1a73e8",
  passwordInputBg: "#ffffff",
  passwordInputText: "#1b1f24",
  showPasswordCheckboxLabel: "Show password",
  showShowPasswordCheckbox: true,
  forgotPasswordLabel: "Forgot password?",
  showForgotPasswordLink: true,

  securityMessageTemplate: "Not your device? Use a {privateWindow} to sign in, and remember to {signOut} before you leave.",
  securityMessagePrivateWindowText: "private window",
  securityMessageSignOutText: "sign out",
  securityMessageFontSize: 13,
  securityMessageColor: "#5f6368",
  securityMessageLinkColor: "#1a73e8",
  securityMessageAlign: "left",
  securityMessageSpacing: 24,
  showSecurityMessage: true,

  showHeaderBar: true,
  headerText: "Sign in with {appName}",
  showPageFooter: true,
  footerLanguageLabel: "English (United States)",
};

/** Safe font-family stacks for the small admin-picked allow-list (never a raw admin-typed string). */
export const BIVO_FONT_STACKS: Record<BivoFontFamily, string> = {
  outfit: '"Outfit", ui-sans-serif, system-ui, sans-serif',
  system: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  serif: 'ui-serif, Georgia, "Times New Roman", serif',
  mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
};

const BTN_RADIUS: Record<ButtonShape, string> = { rounded: "12px", pill: "999px", square: "6px" };
const BTN_HEIGHT: Record<ButtonSize, string> = { sm: "40px", md: "48px", lg: "56px" };
const BTN_JUSTIFY: Record<ButtonPosition, string> = { left: "flex-start", right: "flex-end", between: "space-between", center: "center" };

/**
 * Every `--bivo-*` CSS custom property the public page and the admin's live
 * preview need, computed from one BivoBrand. Deliberately returned as a
 * plain string-keyed object (not a React type) so this file stays
 * framework-agnostic — callers apply it as `style={vars as React.CSSProperties}`.
 *
 * IMPORTANT: callers apply this as an inline `style` on the component's OWN
 * root element (BivoAuthCard, the /signin page wrapper, or the admin preview
 * frame) — never on `document.documentElement`. CSS custom properties
 * cascade to descendants only, so scoping it this way means the admin's own
 * dashboard chrome (which never receives these vars) can never be corrupted
 * by whatever colours/sizes are being drafted, while the public page and the
 * live preview — which render these same values on purpose — pick them up
 * identically.
 */
export function buildBivoCssVars(brand: BivoBrand): Record<string, string> {
  return {
    "--bivo-primary": brand.buttonColor,
    "--bivo-primary-ink": readableOn(brand.buttonColor),
    "--bivo-link": brand.linkColor,
    "--bivo-ink": brand.textColor,
    "--bivo-border": brand.borderColor,
    "--bivo-bg-color": brand.backgroundColor,
    "--bivo-bg-image": brand.backgroundImageUrl ? `url("${brand.backgroundImageUrl}")` : "none",

    "--bivo-font-family": BIVO_FONT_STACKS[brand.fontFamily],
    "--bivo-font-size": `${brand.fontSize}px`,
    "--bivo-font-weight": String(brand.fontWeight),

    "--bivo-page-max-width": `${brand.pageMaxWidth}px`,
    "--bivo-page-px": `${brand.pagePaddingX}px`,
    "--bivo-page-py": `${brand.pagePaddingY}px`,
    "--bivo-column-gap": `${brand.columnGap}px`,
    "--bivo-heading-size": `${brand.headingSize}px`,

    "--bivo-card-padding": `${brand.cardPadding}px`,
    "--bivo-card-min-height": brand.cardMinHeight > 0 ? `${brand.cardMinHeight}px` : "auto",

    "--bivo-input-height": `${brand.inputHeight}px`,
    "--bivo-input-border-width": `${brand.inputBorderWidth}px`,
    "--bivo-input-border-radius": `${brand.inputBorderRadius}px`,
    "--bivo-input-bg": brand.inputBackgroundColor,
    "--bivo-input-text": brand.inputTextColor,
    "--bivo-input-width": `${brand.inputWidthPercent}%`,
    "--bivo-field-spacing": `${brand.fieldSpacing}px`,

    "--bivo-btn-radius": BTN_RADIUS[brand.buttonShape],
    "--bivo-btn-height": BTN_HEIGHT[brand.buttonSize],
    "--bivo-btn-justify": BTN_JUSTIFY[brand.buttonPosition],

    "--bivo-security-font-size": `${brand.securityMessageFontSize}px`,
    "--bivo-security-color": brand.securityMessageColor,
    "--bivo-security-link-color": brand.securityMessageLinkColor,
    "--bivo-security-align": brand.securityMessageAlign,
    "--bivo-security-spacing": `${brand.securityMessageSpacing}px`,
  };
}

/**
 * Per-field styling (email vs. password — Part 3/4 of the Bivo spec) as CSS
 * custom properties, meant to be applied on that ONE field's own wrapper
 * (`.bivo-field`), not globally — so the email input and the password input
 * can have genuinely different borders/colours even though both use the
 * same `.bivo-input` CSS (see src/app/globals.css, which reads
 * `--bivo-field-*` with a fallback to the old shared `--bivo-input-*` vars).
 */
export function buildFieldVars(opts: {
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  bg: string;
  text: string;
  labelColor: string;
}): Record<string, string> {
  return {
    "--bivo-field-border-color": opts.borderColor,
    "--bivo-field-border-width": `${opts.borderWidth}px`,
    "--bivo-field-border-radius": `${opts.borderRadius}px`,
    "--bivo-field-bg": opts.bg,
    "--bivo-field-text": opts.text,
    "--bivo-field-label-color": opts.labelColor,
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

/** Like text(), but an empty string is a valid value (for optional fields such as footer links). */
function optText(v: unknown, fallback: string, max = 200): string {
  return typeof v === "string" ? v.trim().slice(0, max) : fallback;
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

/** Same rule as safeRedirect, for the optional footer links. */
const safeFooterUrl = safeRedirect;

const BUTTON_SIZES: readonly ButtonSize[] = ["sm", "md", "lg"];
const BUTTON_SHAPES: readonly ButtonShape[] = ["rounded", "pill", "square"];
const BUTTON_POSITIONS: readonly ButtonPosition[] = ["left", "right", "between", "center"];
const PAGE_ALIGNS: readonly PageAlign[] = ["left", "center", "right"];
const COLUMN_ORDERS: readonly ColumnOrder[] = ["brandFirst", "formFirst"];
const FONT_FAMILIES: readonly BivoFontFamily[] = ["outfit", "system", "serif", "mono"];
const LOGO_POSITIONS: readonly LogoPosition[] = ["left", "center"];
const LABEL_POSITIONS: readonly LabelPosition[] = ["floating", "top"];
const FONT_WEIGHTS: readonly number[] = [400, 500, 600, 700];
const MESSAGE_ALIGNS: readonly MessageAlign[] = ["left", "center", "right"];

/** Merge `input` over `fallback`, keeping only valid values — corrupted storage can never break the page. */
export function sanitizeBivoBrand(input: unknown, fallback: BivoBrand = DEFAULT_BIVO_BRAND): BivoBrand {
  if (!isObj(input)) return fallback;
  const fontWeight = num(input.fontWeight, fallback.fontWeight, 400, 700);
  return {
    appName: text(input.appName, fallback.appName, 40),
    logoUrl: safeImage(input.logoUrl, fallback.logoUrl),
    logoSize: num(input.logoSize, fallback.logoSize, 24, 160),
    logoPosition: oneOf(input.logoPosition, LOGO_POSITIONS, fallback.logoPosition),

    backgroundImageUrl: safeImage(input.backgroundImageUrl, fallback.backgroundImageUrl),
    backgroundColor: hex(input.backgroundColor, fallback.backgroundColor),
    textColor: hex(input.textColor, fallback.textColor),
    buttonColor: hex(input.buttonColor, fallback.buttonColor),
    linkColor: hex(input.linkColor, fallback.linkColor),
    borderColor: hex(input.borderColor, fallback.borderColor),

    fontFamily: oneOf(input.fontFamily, FONT_FAMILIES, fallback.fontFamily),
    fontSize: num(input.fontSize, fallback.fontSize, 13, 20),
    fontWeight: (FONT_WEIGHTS.includes(fontWeight) ? fontWeight : fallback.fontWeight) as BivoBrand["fontWeight"],

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

    genericErrorMessage: text(input.genericErrorMessage, fallback.genericErrorMessage, 160),
    emailRequiredMessage: text(input.emailRequiredMessage, fallback.emailRequiredMessage, 100),
    emailInvalidMessage: text(input.emailInvalidMessage, fallback.emailInvalidMessage, 100),
    passwordRequiredMessage: text(input.passwordRequiredMessage, fallback.passwordRequiredMessage, 100),
    passwordTooShortMessage: text(input.passwordTooShortMessage, fallback.passwordTooShortMessage, 120),
    nameRequiredMessage: text(input.nameRequiredMessage, fallback.nameRequiredMessage, 100),

    successRedirectUrl: safeRedirect(input.successRedirectUrl, fallback.successRedirectUrl),

    footerLink1Label: optText(input.footerLink1Label, fallback.footerLink1Label, 30),
    footerLink1Url: safeFooterUrl(input.footerLink1Url, fallback.footerLink1Url),
    footerLink2Label: optText(input.footerLink2Label, fallback.footerLink2Label, 30),
    footerLink2Url: safeFooterUrl(input.footerLink2Url, fallback.footerLink2Url),
    footerLink3Label: optText(input.footerLink3Label, fallback.footerLink3Label, 30),
    footerLink3Url: safeFooterUrl(input.footerLink3Url, fallback.footerLink3Url),

    pageMaxWidth: num(input.pageMaxWidth, fallback.pageMaxWidth, 420, 1280),
    pagePaddingX: num(input.pagePaddingX, fallback.pagePaddingX, 0, 96),
    pagePaddingY: num(input.pagePaddingY, fallback.pagePaddingY, 0, 160),
    pageAlign: oneOf(input.pageAlign, PAGE_ALIGNS, fallback.pageAlign),
    columnGap: num(input.columnGap, fallback.columnGap, 0, 120),
    columnOrder: oneOf(input.columnOrder, COLUMN_ORDERS, fallback.columnOrder),
    headingSize: num(input.headingSize, fallback.headingSize, 20, 72),

    showCard: bool(input.showCard, fallback.showCard),
    cardPadding: num(input.cardPadding, fallback.cardPadding, 0, 80),
    cardMinHeight: num(input.cardMinHeight, fallback.cardMinHeight, 0, 1200),

    inputHeight: num(input.inputHeight, fallback.inputHeight, 36, 72),
    inputBorderWidth: num(input.inputBorderWidth, fallback.inputBorderWidth, 0, 3),
    inputBorderRadius: num(input.inputBorderRadius, fallback.inputBorderRadius, 0, 28),
    inputBackgroundColor: hex(input.inputBackgroundColor, fallback.inputBackgroundColor),
    inputTextColor: hex(input.inputTextColor, fallback.inputTextColor),
    inputWidthPercent: num(input.inputWidthPercent, fallback.inputWidthPercent, 40, 100),
    labelPosition: oneOf(input.labelPosition, LABEL_POSITIONS, fallback.labelPosition),
    fieldSpacing: num(input.fieldSpacing, fallback.fieldSpacing, 4, 40),
    buttonSize: oneOf(input.buttonSize, BUTTON_SIZES, fallback.buttonSize),
    buttonShape: oneOf(input.buttonShape, BUTTON_SHAPES, fallback.buttonShape),
    buttonPosition: oneOf(input.buttonPosition, BUTTON_POSITIONS, fallback.buttonPosition),

    showLogo: bool(input.showLogo, fallback.showLogo),
    showSubline: bool(input.showSubline, fallback.showSubline),
    showSwitchLink: bool(input.showSwitchLink, fallback.showSwitchLink),
    showHelpLine: bool(input.showHelpLine, fallback.showHelpLine),

    emailBorderColor: hex(input.emailBorderColor, fallback.emailBorderColor),
    emailBorderWidth: num(input.emailBorderWidth, fallback.emailBorderWidth, 0, 6),
    emailBorderRadius: num(input.emailBorderRadius, fallback.emailBorderRadius, 0, 28),
    emailLabelColor: hex(input.emailLabelColor, fallback.emailLabelColor),
    emailInputBg: hex(input.emailInputBg, fallback.emailInputBg),
    emailInputText: hex(input.emailInputText, fallback.emailInputText),
    forgotEmailLabel: text(input.forgotEmailLabel, fallback.forgotEmailLabel, 30),
    showForgotEmailLink: bool(input.showForgotEmailLink, fallback.showForgotEmailLink),

    passwordBorderColor: hex(input.passwordBorderColor, fallback.passwordBorderColor),
    passwordBorderWidth: num(input.passwordBorderWidth, fallback.passwordBorderWidth, 0, 6),
    passwordBorderRadius: num(input.passwordBorderRadius, fallback.passwordBorderRadius, 0, 28),
    passwordLabelColor: hex(input.passwordLabelColor, fallback.passwordLabelColor),
    passwordInputBg: hex(input.passwordInputBg, fallback.passwordInputBg),
    passwordInputText: hex(input.passwordInputText, fallback.passwordInputText),
    showPasswordCheckboxLabel: text(input.showPasswordCheckboxLabel, fallback.showPasswordCheckboxLabel, 30),
    showShowPasswordCheckbox: bool(input.showShowPasswordCheckbox, fallback.showShowPasswordCheckbox),
    forgotPasswordLabel: text(input.forgotPasswordLabel, fallback.forgotPasswordLabel, 30),
    showForgotPasswordLink: bool(input.showForgotPasswordLink, fallback.showForgotPasswordLink),

    securityMessageTemplate: text(input.securityMessageTemplate, fallback.securityMessageTemplate, 300),
    securityMessagePrivateWindowText: text(input.securityMessagePrivateWindowText, fallback.securityMessagePrivateWindowText, 40),
    securityMessageSignOutText: text(input.securityMessageSignOutText, fallback.securityMessageSignOutText, 40),
    securityMessageFontSize: num(input.securityMessageFontSize, fallback.securityMessageFontSize, 10, 20),
    securityMessageColor: hex(input.securityMessageColor, fallback.securityMessageColor),
    securityMessageLinkColor: hex(input.securityMessageLinkColor, fallback.securityMessageLinkColor),
    securityMessageAlign: oneOf(input.securityMessageAlign, MESSAGE_ALIGNS, fallback.securityMessageAlign),
    securityMessageSpacing: num(input.securityMessageSpacing, fallback.securityMessageSpacing, 0, 80),
    showSecurityMessage: bool(input.showSecurityMessage, fallback.showSecurityMessage),

    showHeaderBar: bool(input.showHeaderBar, fallback.showHeaderBar),
    headerText: text(input.headerText, fallback.headerText, 60),
    showPageFooter: bool(input.showPageFooter, fallback.showPageFooter),
    footerLanguageLabel: text(input.footerLanguageLabel, fallback.footerLanguageLabel, 40),
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
