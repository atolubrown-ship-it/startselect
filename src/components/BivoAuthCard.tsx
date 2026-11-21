"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BivoLogo from "@/components/BivoLogo";
import { SpinnerIcon } from "@/components/icons";
import { getSupabase } from "@/lib/supabase";
import { buildBivoCssVars, buildFieldVars, fillTemplate, type BivoBrand } from "@/lib/bivoBrand";
import { validateEmail, validateName, validatePassword } from "@/lib/bivoValidation";

type Step = "email" | "password" | "done";
type Mode = "signin" | "signup";

/** A path on this site uses the SPA router; a full https:// link is a real navigation. */
function goTo(href: string, router: ReturnType<typeof useRouter>) {
  if (href.startsWith("/")) router.push(href);
  else window.location.href = href;
}

/**
 * Bivo's sign-in/create-account screen, at /signin — a single-column,
 * Google-style flow (email [+ name when creating an account], then
 * password), admin-configurable end to end at /signin/admin
 * (BivoBrandEditor.tsx). There is no back arrow or back button anywhere in
 * this component or in HeaderBar/PageFooter below — switching between
 * "Sign in" and "Create account" only ever happens on the email step, via
 * the switch link, never as a way to step backwards once on the password
 * step.
 *
 * All styling is applied as a React inline `style`, scoped to this
 * component's own root element (buildBivoCssVars) and, per-field, to each
 * field's own wrapper (buildFieldVars) — never to `document.documentElement`
 * — so the same component is safe to render inside the admin's own live
 * preview without corrupting the dashboard's chrome.
 */
export default function BivoAuthCard({ brand, previewOnly = false }: { brand: BivoBrand; previewOnly?: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [step, setStep] = useState<Step>("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);
  const [canRedirect, setCanRedirect] = useState(false);
  const [signupPending, setSignupPending] = useState(false);
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [resetSending, setResetSending] = useState(false);

  const switchMode = () => {
    if (previewOnly) return;
    setMode((m) => (m === "signin" ? "signup" : "signin"));
    setErrors({});
  };

  const onEmailNext = (e: FormEvent) => {
    e.preventDefault();
    if (previewOnly) return;
    if (mode === "signup") {
      const nameErr = validateName(name, { required: brand.nameRequiredMessage });
      if (nameErr) {
        setErrors({ name: nameErr });
        return;
      }
    }
    const emailErr = validateEmail(email, { required: brand.emailRequiredMessage, invalid: brand.emailInvalidMessage });
    if (emailErr) {
      setErrors({ email: emailErr });
      return;
    }
    setErrors({});
    setStep("password");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (previewOnly) return;
    const pwErr = validatePassword(password, {
      required: brand.passwordRequiredMessage,
      tooShortTemplate: brand.passwordTooShortMessage,
    });
    if (pwErr) {
      setErrors({ password: pwErr });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const sb = getSupabase();
      if (mode === "signup") {
        if (!sb) {
          throw new Error("Account creation is temporarily unavailable. Please try again later.");
        }
        const { data, error } = await sb.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim() } },
        });
        if (error) throw error;
        const hasSession = Boolean(data.session);
        setSignupPending(!hasSession);
        setCanRedirect(hasSession);
        setStep("done");
      } else {
        if (!sb) {
          throw new Error("Sign-in is temporarily unavailable. Please try again later.");
        }
        const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        setCanRedirect(true);
        setStep("done");
      }
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : brand.genericErrorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Admin-configured post-sign-in destination. Empty = stay on the "done" screen.
  // Never fires while a sign-up is still pending email confirmation (no session yet).
  useEffect(() => {
    if (previewOnly || step !== "done" || !canRedirect || !brand.successRedirectUrl) return;
    const t = setTimeout(() => goTo(brand.successRedirectUrl, router), 1500);
    return () => clearTimeout(t);
  }, [previewOnly, step, canRedirect, brand.successRedirectUrl, router]);

  const onForgotEmail = () => {
    if (previewOnly) return;
    goTo(`/signin/recover-email${email.trim() ? `?hint=${encodeURIComponent(email.trim())}` : ""}`, router);
  };

  // Real password-reset request via Supabase Auth — never reveals whether the
  // address has an account (Supabase's own resetPasswordForEmail doesn't either).
  const onForgotPassword = async () => {
    if (previewOnly) return;
    const emailErr = validateEmail(email, { required: brand.emailRequiredMessage, invalid: brand.emailInvalidMessage });
    if (emailErr) {
      setStep("email");
      setErrors({ email: emailErr });
      return;
    }
    setResetSending(true);
    setResetNotice(null);
    try {
      const sb = getSupabase();
      if (!sb) {
        throw new Error("Password recovery is temporarily unavailable. Please try again later.");
      }
      const { error } = await sb.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/signin/reset-password` : undefined,
      });
      if (error) throw error;
      // Deliberately the same confirmation whether or not the account exists.
      setResetNotice("If an account exists for that email, we've sent a link to reset the password.");
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : brand.genericErrorMessage });
    } finally {
      setResetSending(false);
    }
  };

  const cssVars = buildBivoCssVars(brand) as CSSProperties;
  const emailFieldVars = buildFieldVars({
    borderColor: brand.emailBorderColor,
    borderWidth: brand.emailBorderWidth,
    borderRadius: brand.emailBorderRadius,
    bg: brand.emailInputBg,
    text: brand.emailInputText,
    labelColor: brand.emailLabelColor,
  }) as CSSProperties;
  const passwordFieldVars = buildFieldVars({
    borderColor: brand.passwordBorderColor,
    borderWidth: brand.passwordBorderWidth,
    borderRadius: brand.passwordBorderRadius,
    bg: brand.passwordInputBg,
    text: brand.passwordInputText,
    labelColor: brand.passwordLabelColor,
  }) as CSSProperties;

  const content = (
    <div className="bivo-animate-rise w-full" style={{ maxWidth: "var(--bivo-page-max-width)", margin: "0 auto" }}>
      <div className="mt-8">
        {step === "email" && (
          <form onSubmit={onEmailNext} noValidate className="flex flex-col" style={{ gap: "var(--bivo-field-spacing)" }}>
            <h1 className="bivo-font-display font-medium tracking-tight" style={{ fontSize: "var(--bivo-heading-size)" }}>
              {mode === "signup" ? brand.signupHeadline : brand.signinHeadline}
            </h1>
            {brand.showSubline && (
              <p className="bivo-muted-text -mt-2 mb-1">
                {fillTemplate(mode === "signup" ? brand.signupSublineTemplate : brand.signinSubline, { appName: brand.appName })}
              </p>
            )}

            {mode === "signup" && (
              <>
                <div className="bivo-field">
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    autoFocus={!previewOnly}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder=" "
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className="bivo-input"
                  />
                  <label htmlFor="name" className="bivo-floating-label">
                    {brand.nameLabel}
                  </label>
                </div>
                {errors.name && (
                  <p id="name-error" className="bivo-error">
                    {errors.name}
                  </p>
                )}
              </>
            )}

            <div className="bivo-field" style={emailFieldVars}>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus={!previewOnly && mode === "signin"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className="bivo-input"
              />
              <label htmlFor="email" className="bivo-floating-label">
                {brand.emailLabel}
              </label>
            </div>
            {errors.email && (
              <p id="email-error" className="bivo-error">
                {errors.email}
              </p>
            )}

            {mode === "signin" && brand.showForgotEmailLink && (
              <div className="pt-1">
                <button type="button" onClick={onForgotEmail} className="bivo-link text-sm font-medium">
                  {brand.forgotEmailLabel}
                </button>
              </div>
            )}

            {brand.showSecurityMessage && <SecurityMessage brand={brand} />}

            <div className="flex items-center justify-between pt-2">
              {brand.showSwitchLink ? (
                <button type="button" onClick={switchMode} className="bivo-link text-sm font-medium">
                  {mode === "signup" ? brand.signupSwitchLabel : brand.signinSwitchLabel}
                </button>
              ) : (
                <span />
              )}
              <button type="submit" className="bivo-btn bivo-btn-primary px-7">
                {brand.nextLabel}
              </button>
            </div>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={onSubmit} noValidate className="flex flex-col" style={{ gap: "var(--bivo-field-spacing)" }}>
            <h1 className="bivo-font-display font-medium tracking-tight" style={{ fontSize: "var(--bivo-heading-size)" }}>
              {mode === "signup" ? brand.signupPasswordTitle : brand.signinPasswordTitle}
            </h1>
            <p className="bivo-muted-text -mt-2 mb-1">{email.trim()}</p>

            <div className="bivo-field" style={passwordFieldVars}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                autoFocus={!previewOnly}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                className="bivo-input"
              />
              <label htmlFor="password" className="bivo-floating-label">
                {brand.passwordLabel}
              </label>
            </div>
            {errors.password && (
              <p id="password-error" className="bivo-error">
                {errors.password}
              </p>
            )}

            {brand.showShowPasswordCheckbox && (
              <div className="bivo-checkbox-row">
                <input
                  id="show-password"
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                <label htmlFor="show-password">{brand.showPasswordCheckboxLabel}</label>
              </div>
            )}

            {errors.form && (
              <p role="alert" className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "var(--bivo-danger-bg)", color: "var(--bivo-danger)" }}>
                {errors.form}
              </p>
            )}
            {mode === "signin" && resetNotice && <p className="bivo-muted-text text-sm">{resetNotice}</p>}

            <div className="flex items-center justify-between pt-2">
              {mode === "signin" && brand.showForgotPasswordLink ? (
                <button type="button" onClick={() => void onForgotPassword()} disabled={resetSending} className="bivo-link text-sm font-medium">
                  {resetSending && <SpinnerIcon className="mr-1 inline h-3.5 w-3.5" />}
                  {brand.forgotPasswordLabel}
                </button>
              ) : (
                <span />
              )}
              <button type="submit" className="bivo-btn bivo-btn-primary px-7" disabled={loading}>
                {loading && <SpinnerIcon className="h-4 w-4" />}
                {mode === "signup" ? brand.signupSubmitLabel : brand.signinSubmitLabel}
              </button>
            </div>

            {brand.showSecurityMessage && <SecurityMessage brand={brand} />}
          </form>
        )}

        {step === "done" && (
          <div className="flex flex-col" style={{ gap: "var(--bivo-field-spacing)" }}>
            <h1 className="bivo-font-display font-medium tracking-tight" style={{ fontSize: "var(--bivo-heading-size)" }}>
              {mode === "signup" ? brand.signupDoneTitle : brand.signinDoneTitle}
            </h1>
            <p className="bivo-muted-text">
              {mode === "signup"
                ? signupPending
                  ? brand.confirmEmailNoticeText
                  : fillTemplate(brand.signupDoneMessageTemplate, { appName: brand.appName, name: name.trim() || email.trim() })
                : brand.signinDoneMessage}
            </p>
            {canRedirect && brand.successRedirectUrl ? (
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" className="bivo-btn bivo-btn-primary" onClick={() => !previewOnly && goTo(brand.successRedirectUrl, router)}>
                  Continue
                </button>
                <span className="bivo-muted-text text-sm">Taking you there automatically…</span>
              </div>
            ) : (
              <button
                type="button"
                className="bivo-btn bivo-btn-outline"
                onClick={() => {
                  setStep("email");
                  setPassword("");
                  setErrors({});
                  setCanRedirect(false);
                  setSignupPending(false);
                }}
              >
                {brand.useAnotherAccountLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={cssVars} className="bivo">
      {brand.showCard ? <div className="bivo-card">{content}</div> : content}
    </div>
  );
}

/**
 * The page-level header bar — logo + "Sign in with {appName}" + a bottom
 * divider, restoring the original look. Deliberately contains no link,
 * button, or icon of any kind: there is no back control here, on any step.
 * Rendered by the real page (src/app/signin/page.tsx) and by the admin's
 * live preview (BivoBrandEditor.tsx), both as a sibling ABOVE BivoAuthCard
 * rather than inside it, so it can span the full width of its container
 * (the card below it stays centered and width-limited on its own).
 */
export function HeaderBar({ brand }: { brand: BivoBrand }) {
  return (
    <div className="bivo-header-bar">
      {brand.showLogo && <BivoLogo name={brand.appName} logoUrl={brand.logoUrl} size={20} />}
      <span>{fillTemplate(brand.headerText, { appName: brand.appName })}</span>
    </div>
  );
}

/**
 * The page-level footer — a (cosmetic) language label on the left, and up to
 * three admin-configured links on the right (default: Help / Privacy /
 * Terms, pointing at real pages on this site — see src/app/signin/help,
 * /privacy and /terms — never a dead link). Rendered below the card by the
 * real page and by the admin's live preview.
 */
export function PageFooter({ brand }: { brand: BivoBrand }) {
  const links = [
    { label: brand.footerLink1Label, url: brand.footerLink1Url },
    { label: brand.footerLink2Label, url: brand.footerLink2Url },
    { label: brand.footerLink3Label, url: brand.footerLink3Url },
  ].filter((l) => l.label.trim() && l.url.trim());

  return (
    <footer className="bivo-page-footer">
      <span>{brand.footerLanguageLabel}</span>
      {links.length > 0 && (
        <nav>
          {links.map((l, i) =>
            l.url.startsWith("http") ? (
              <a key={i} href={l.url} target="_blank" rel="noopener noreferrer">
                {l.label}
              </a>
            ) : (
              <Link key={i} href={l.url}>
                {l.label}
              </Link>
            ),
          )}
        </nav>
      )}
    </footer>
  );
}

/**
 * The "Not your device?" notice (Part 6) — one component used identically by
 * both the email and password forms above, so its markup, position and
 * styling never differ between steps; only the step's own content above it
 * changes. Splits the admin-edited template on its two known tokens and
 * renders each as a real link, wherever in the sentence it falls.
 */
function SecurityMessage({ brand }: { brand: BivoBrand }) {
  const parts = brand.securityMessageTemplate.split(/(\{privateWindow\}|\{signOut\})/g);
  return (
    <p className="bivo-security-message">
      {parts.map((part, i) => {
        if (part === "{privateWindow}") {
          return (
            <a key={i} href="/signin/help/private-browsing" target="_blank" rel="noopener noreferrer">
              {brand.securityMessagePrivateWindowText}
            </a>
          );
        }
        if (part === "{signOut}") {
          return (
            <a key={i} href="/signin/help/sign-out" target="_blank" rel="noopener noreferrer">
              {brand.securityMessageSignOutText}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}
