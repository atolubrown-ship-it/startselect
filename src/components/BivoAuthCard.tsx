"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import BivoLogo from "@/components/BivoLogo";
import { ArrowLeftIcon, CheckIcon, EyeIcon, EyeOffIcon, SpinnerIcon } from "@/components/icons";
import { getSupabase } from "@/lib/supabase";
import { fillTemplate, type BivoBrand } from "@/lib/bivoBrand";
import { validateEmail, validateName, validatePassword } from "@/lib/bivoValidation";

type Mode = "signin" | "signup";
type Step = "email" | "password" | "done";

/**
 * Bivo's two-step sign-in / sign-up screen — ported from the standalone Bivo
 * app onto the Quilo site's own Next.js + Supabase stack (same client as the
 * rest of the site: src/lib/supabase.ts), reached at /bivo. It sits directly
 * on the page background (no card), with floating-label fields. Every label,
 * both colours, and the page's spacing come from the shared
 * `bivo_brand_settings` row, editable at /bivo/admin.
 */
export default function BivoAuthCard({ brand }: { brand: BivoBrand }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [step, setStep] = useState<Step>("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const switchMode = (m: Mode) => {
    setMode(m);
    setStep("email");
    setPassword("");
    setErrors({});
    setNotice(null);
  };

  const onEmailNext = (e: FormEvent) => {
    e.preventDefault();
    const nameErr = mode === "signup" ? validateName(name) : null;
    const emailErr = validateEmail(email);
    if (nameErr || emailErr) {
      setErrors({ ...(nameErr ? { name: nameErr } : {}), ...(emailErr ? { email: emailErr } : {}) });
      return;
    }
    setErrors({});
    setStep("password");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const pwErr = validatePassword(password);
    if (pwErr) {
      setErrors({ password: pwErr });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const sb = getSupabase();
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
        }
      } else {
        await new Promise((r) => setTimeout(r, 700));
        setNotice(brand.demoNoticeText);
      }
      setStep("done");
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Something went wrong. Try again." });
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="bivo-animate-rise w-full" style={{ maxWidth: "var(--bivo-page-max-width)" }}>
      <div className="grid md:grid-cols-2" style={{ gap: "var(--bivo-column-gap)" }}>
        {/* Left: brand + heading */}
        <div>
          <BivoLogo name={brand.appName} logoUrl={brand.logoUrl} />
          <h1 className="mt-8 font-medium tracking-tight" style={{ fontSize: "var(--bivo-heading-size)" }}>
            {title}
          </h1>
          <p className="mt-4 text-base" style={{ color: "var(--bivo-muted)" }}>
            {step === "password" ? (
              <button
                type="button"
                onClick={() => setStep("email")}
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
                style={{ borderColor: "var(--bivo-border)", color: "var(--bivo-ink)" }}
              >
                <ArrowLeftIcon className="h-3.5 w-3.5" />
                {email.trim()}
              </button>
            ) : step === "done" ? (
              `Signed in as ${email.trim()}`
            ) : mode === "signin" ? (
              brand.signinSubline
            ) : (
              fillTemplate(brand.signupSublineTemplate, vars)
            )}
          </p>
        </div>

        {/* Right: form */}
        <div className="flex flex-col justify-between">
          {step === "email" && (
            <form onSubmit={onEmailNext} noValidate className="space-y-5">
              {mode === "signup" && (
                <FloatingInput
                  id="name"
                  label={brand.nameLabel}
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                />
              )}
              <FloatingInput
                id="email"
                label={brand.emailLabel}
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
              <Actions
                secondaryLabel={mode === "signin" ? brand.signinSwitchLabel : brand.signupSwitchLabel}
                onSecondary={() => switchMode(mode === "signin" ? "signup" : "signin")}
                primaryLabel={brand.nextLabel}
              />
            </form>
          )}

          {step === "password" && (
            <form onSubmit={onSubmit} noValidate className="space-y-5">
              <FloatingInput
                id="password"
                label={brand.passwordLabel}
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 grid w-12 place-items-center"
                    style={{ color: "var(--bivo-muted)" }}
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
              <Actions
                secondaryLabel={brand.backLabel}
                onSecondary={() => setStep("email")}
                primaryLabel={mode === "signin" ? brand.signinSubmitLabel : brand.signupSubmitLabel}
                loading={loading}
              />
            </form>
          )}

          {step === "done" && (
            <div className="space-y-5">
              <div className="bivo-success-row">
                <CheckIcon className="h-5 w-5 shrink-0" style={{ color: "var(--bivo-success)" }} />
                <span>{mode === "signin" ? brand.signinDoneMessage : fillTemplate(brand.signupDoneMessageTemplate, vars)}</span>
              </div>
              {notice && (
                <p className="text-sm" style={{ color: "var(--bivo-muted)" }}>
                  {notice}
                </p>
              )}
              <button type="button" className="bivo-btn bivo-btn-outline" onClick={() => switchMode("signin")}>
                {brand.useAnotherAccountLabel}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 text-sm" style={{ color: "var(--bivo-muted)" }}>
        <p>{brand.needHelpHeading}</p>
        <p className="mt-1">
          {brand.contactLabel}{" "}
          <a href={`mailto:${brand.supportEmail}`} className="bivo-link font-medium underline">
            {brand.supportEmail}
          </a>
        </p>
      </div>
    </div>
  );
}

function FloatingInput({
  id,
  label,
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
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  autoFocus?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  error?: string | undefined;
  rightSlot?: ReactNode;
}) {
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
}: {
  primaryLabel: string;
  secondaryLabel: string;
  onSecondary: () => void;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 pt-4">
      <button type="button" className="bivo-btn bivo-btn-ghost" onClick={onSecondary}>
        {secondaryLabel}
      </button>
      <button type="submit" className="bivo-btn bivo-btn-primary px-7" disabled={loading}>
        {loading && <SpinnerIcon className="h-4 w-4" />}
        {primaryLabel}
      </button>
    </div>
  );
}
