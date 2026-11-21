"use client";

import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import BivoLogo from "@/components/BivoLogo";
import { CheckIcon, EyeIcon, EyeOffIcon, SpinnerIcon } from "@/components/icons";
import { getSupabase } from "@/lib/supabase";
import { buildBivoCssVars, fillTemplate, type BivoBrand } from "@/lib/bivoBrand";
import { validateEmail, validateName, validatePassword } from "@/lib/bivoValidation";

type Mode = "signin" | "signup";
type Step = "email" | "password" | "done";

/** A path on this site uses the SPA router; a full https:// link is a real navigation. */
function goTo(href: string, router: ReturnType<typeof useRouter>) {
  if (href.startsWith("/")) router.push(href);
  else window.location.href = href;
}

/**
 * Bivo's two-step sign-in / sign-up screen — ported from the standalone Bivo
 * app onto the Quilo site's own Next.js + Supabase stack (same client as the
 * rest of the site: src/lib/supabase.ts), reached at /bivo.
 *
 * Every visual and copy detail (colours, fonts, spacing, card vs. bare page,
 * field styling, button shape/size/position, footer links, visibility
 * toggles) comes from the shared `bivo_brand_settings` row, editable at
 * /signin/admin — see BivoBrandEditor.tsx. This component applies all of it as
 * a React inline `style` scoped to its own root element (never to
 * `document.documentElement`), so it renders identically whether it's the
 * real public page or the admin's own live preview, without ever touching
 * the admin dashboard's own chrome.
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
  const [notice, setNotice] = useState<string | null>(null);
  const [canRedirect, setCanRedirect] = useState(false);

  const switchMode = (m: Mode) => {
    setMode(m);
    setStep("email");
    setPassword("");
    setErrors({});
    setNotice(null);
    setCanRedirect(false);
  };

  const onEmailNext = (e: FormEvent) => {
    e.preventDefault();
    if (previewOnly) return;
    const nameErr = mode === "signup" ? validateName(name, { required: brand.nameRequiredMessage }) : null;
    const emailErr = validateEmail(email, { required: brand.emailRequiredMessage, invalid: brand.emailInvalidMessage });
    if (nameErr || emailErr) {
      setErrors({ ...(nameErr ? { name: nameErr } : {}), ...(emailErr ? { email: emailErr } : {}) });
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
      let authenticated = true;
      if (sb) {
        if (mode === "signin") {
          const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
          if (error) throw error;
          setNotice(null);
        } else {
          const { data, error } = await sb.auth.signUp({
            email: email.trim(),
            password,
            options: { data: { full_name: name.trim() } },
          });
          if (error) throw error;
          setNotice(data.session ? null : brand.confirmEmailNoticeText);
          authenticated = Boolean(data.session);
        }
      } else {
        await new Promise((r) => setTimeout(r, 700));
        setNotice(brand.demoNoticeText);
      }
      setCanRedirect(authenticated);
      setStep("done");
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : brand.genericErrorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Admin-configured post-sign-in destination (BivoBrandEditor -> "After sign-in").
  // Empty = stay on this screen, same as before this was added. Never fires in the
  // admin's own live preview.
  useEffect(() => {
    if (previewOnly || step !== "done" || !canRedirect || !brand.successRedirectUrl) return;
    const t = setTimeout(() => goTo(brand.successRedirectUrl, router), 1500);
    return () => clearTimeout(t);
  }, [previewOnly, step, canRedirect, brand.successRedirectUrl, router]);

  const vars = { appName: brand.appName, name: name.trim() };
  const title =
    step === "done"
      ? mode === "signin"
        ? brand.signinDoneTitle
        : brand.signupDoneTitle
      : step === "password"
        ? mode === "signin"
          ? brand.signinPasswordTitle
          : brand.signupPasswordTitle
        : mode === "signin"
          ? brand.signinHeadline
          : brand.signupHeadline;

  const cssVars = buildBivoCssVars(brand) as CSSProperties;
  const footerLinks = [
    { label: brand.footerLink1Label, url: brand.footerLink1Url },
    { label: brand.footerLink2Label, url: brand.footerLink2Url },
    { label: brand.footerLink3Label, url: brand.footerLink3Url },
  ].filter((l) => l.label && l.url);

  const brandColumn = (
    <div style={{ order: brand.columnOrder === "formFirst" ? 1 : 0 }}>
      {brand.showLogo && <BivoLogo name={brand.appName} logoUrl={brand.logoUrl} size={brand.logoSize} />}
      <h1
        className={`mt-8 font-medium tracking-tight ${brand.logoPosition === "center" ? "text-center" : ""}`}
        style={{ fontSize: "var(--bivo-heading-size)" }}
      >
        {title}
      </h1>
      <p className="mt-4 text-base">
        {step === "password" ? (
          <span className="bivo-muted-text">{email.trim()}</span>
        ) : step === "done" ? (
          <span className="bivo-muted-text">{fillTemplate(brand.signedInAsTemplate, { ...vars, email: email.trim() })}</span>
        ) : (
          brand.showSubline && (
            <span className="bivo-muted-text">{mode === "signin" ? brand.signinSubline : fillTemplate(brand.signupSublineTemplate, vars)}</span>
          )
        )}
      </p>
    </div>
  );

  const formColumn = (
    <div className="flex flex-col justify-between" style={{ order: brand.columnOrder === "formFirst" ? 0 : 1 }}>
      {step === "email" && (
        <form onSubmit={onEmailNext} noValidate className="flex flex-col" style={{ gap: "var(--bivo-field-spacing)" }}>
          {mode === "signup" && (
            <FloatingInput
              id="name"
              label={brand.nameLabel}
              labelPosition={brand.labelPosition}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />
          )}
          <FloatingInput
            id="email"
            label={brand.emailLabel}
            labelPosition={brand.labelPosition}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus={!previewOnly}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          {brand.showSwitchLink ? (
            <Actions
              secondaryLabel={mode === "signin" ? brand.signinSwitchLabel : brand.signupSwitchLabel}
              onSecondary={() => switchMode(mode === "signin" ? "signup" : "signin")}
              primaryLabel={brand.nextLabel}
              position={brand.buttonPosition}
              size={brand.buttonSize}
            />
          ) : (
            <PrimaryOnly label={brand.nextLabel} position={brand.buttonPosition} size={brand.buttonSize} />
          )}
        </form>
      )}

      {step === "password" && (
        <form onSubmit={onSubmit} noValidate className="flex flex-col" style={{ gap: "var(--bivo-field-spacing)" }}>
          <FloatingInput
            id="password"
            label={brand.passwordLabel}
            labelPosition={brand.labelPosition}
            type={showPassword ? "text" : "password"}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            autoFocus={!previewOnly}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? brand.hidePasswordLabel : brand.showPasswordLabel}
                className="bivo-muted-text absolute inset-y-0 right-0 grid w-12 place-items-center"
              >
                {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            }
          />
          {errors.form && (
            <p role="alert" className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "var(--bivo-danger-bg)", color: "var(--bivo-danger)" }}>
              {errors.form}
            </p>
          )}
          <PrimaryOnly
            label={mode === "signin" ? brand.signinSubmitLabel : brand.signupSubmitLabel}
            position={brand.buttonPosition}
            size={brand.buttonSize}
          />
        </form>
      )}

      {step === "done" && (
        <div className="flex flex-col" style={{ gap: "var(--bivo-field-spacing)" }}>
          <div className="bivo-success-row">
            <CheckIcon className="h-5 w-5 shrink-0" style={{ color: "var(--bivo-success)" }} />
            <span>{mode === "signin" ? brand.signinDoneMessage : fillTemplate(brand.signupDoneMessageTemplate, vars)}</span>
          </div>
          {notice && <p className="bivo-muted-text text-sm">{notice}</p>}
          {canRedirect && brand.successRedirectUrl ? (
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className="bivo-btn bivo-btn-primary" onClick={() => !previewOnly && goTo(brand.successRedirectUrl, router)}>
                {brand.continueLabel}
              </button>
              <span className="bivo-muted-text text-sm">{brand.redirectingText}</span>
            </div>
          ) : (
            <button type="button" className="bivo-btn bivo-btn-outline" onClick={() => switchMode("signin")}>
              {brand.useAnotherAccountLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );

  const content = (
    <div className="bivo-animate-rise w-full" style={{ maxWidth: "var(--bivo-page-max-width)" }}>
      <div className={`grid md:grid-cols-2 ${brand.pageAlign === "left" ? "justify-start" : brand.pageAlign === "right" ? "justify-end" : ""}`} style={{ gap: "var(--bivo-column-gap)" }}>
        {brandColumn}
        {formColumn}
      </div>

      {brand.showHelpLine && (
        <div className="mt-12 text-sm">
          <p className="bivo-muted-text">{brand.needHelpHeading}</p>
          <p className="mt-1 bivo-muted-text">
            {brand.contactLabel}{" "}
            <a href={previewOnly ? undefined : `mailto:${brand.supportEmail}`} className="bivo-link font-medium underline" style={{ opacity: 1 }}>
              {brand.supportEmail}
            </a>
          </p>
        </div>
      )}

      {footerLinks.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          {footerLinks.map((l, i) => (
            <a key={i} href={previewOnly ? undefined : l.url} className="bivo-link underline">
              {l.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={cssVars} className="bivo">
      {brand.showCard ? <div className="bivo-card">{content}</div> : content}
    </div>
  );
}

function FloatingInput({
  id,
  label,
  labelPosition,
  type = "text",
  value,
  onChange,
  autoComplete,
  autoFocus,
  inputMode,
  error,
  rightSlot,
}: {
  id: string;
  label: string;
  labelPosition: BivoBrand["labelPosition"];
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  autoFocus?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  error?: string | undefined;
  rightSlot?: ReactNode;
}) {
  if (labelPosition === "top") {
    return (
      <div>
        <label htmlFor={id} className="bivo-top-label">
          {label}
        </label>
        <div className="bivo-field" style={{ position: "relative" }}>
          <input
            id={id}
            type={type}
            inputMode={inputMode}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            value={value}
            onChange={onChange}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className={`bivo-input ${rightSlot ? "bivo-input-pr" : ""}`}
          />
          {rightSlot}
        </div>
        {error && (
          <p id={`${id}-error`} className="bivo-error">
            {error}
          </p>
        )}
      </div>
    );
  }
  return (
    <div className="bivo-field">
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        value={value}
        onChange={onChange}
        placeholder=" "
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`bivo-input ${rightSlot ? "bivo-input-pr" : ""}`}
      />
      <label htmlFor={id} className="bivo-floating-label">
        {label}
      </label>
      {rightSlot}
      {error && (
        <p id={`${id}-error`} className="bivo-error">
          {error}
        </p>
      )}
    </div>
  );
}

function Actions({
  primaryLabel,
  secondaryLabel,
  onSecondary,
  loading,
  position,
  size,
}: {
  primaryLabel: string;
  secondaryLabel: string;
  onSecondary: () => void;
  loading?: boolean;
  position: BivoBrand["buttonPosition"];
  size: BivoBrand["buttonSize"];
}) {
  const sizeClass = size === "sm" ? "text-sm px-5" : size === "lg" ? "text-base px-8" : "px-7";
  return (
    <div className="flex items-center gap-3 pt-4" style={{ justifyContent: "var(--bivo-btn-justify, space-between)" }}>
      {position === "right" && <span />}
      <button type="button" className="bivo-btn bivo-btn-ghost" onClick={onSecondary}>
        {secondaryLabel}
      </button>
      <button type="submit" className={`bivo-btn bivo-btn-primary ${sizeClass}`} disabled={loading}>
        {loading && <SpinnerIcon className="h-4 w-4" />}
        {primaryLabel}
      </button>
    </div>
  );
}

/** Same layout as Actions, but with no secondary/switch control (brand.showSwitchLink === false). */
function PrimaryOnly({ label, position, size }: { label: string; position: BivoBrand["buttonPosition"]; size: BivoBrand["buttonSize"] }) {
  const sizeClass = size === "sm" ? "text-sm px-5" : size === "lg" ? "text-base px-8" : "px-7";
  const justify = position === "left" ? "flex-start" : position === "right" || position === "between" ? "flex-end" : "center";
  return (
    <div className="flex items-center pt-4" style={{ justifyContent: justify }}>
      <button type="submit" className={`bivo-btn bivo-btn-primary ${sizeClass}`}>
        {label}
      </button>
    </div>
  );
}
