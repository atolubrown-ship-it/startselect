"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import BivoLogo from "@/components/BivoLogo";
import { ArrowLeftIcon, CheckIcon, EyeIcon, EyeOffIcon, SpinnerIcon } from "@/components/icons";
import { getSupabase } from "@/lib/supabase";
import type { BivoBrand } from "@/lib/bivoBrand";
import { validateEmail, validateName, validatePassword } from "@/lib/bivoValidation";

type Mode = "signin" | "signup";
type Step = "email" | "password" | "done";

/**
 * Bivo's two-step sign-in / sign-up card — ported from the standalone Bivo
 * app onto the Quilo site's own Next.js + Supabase stack (same client as the
 * rest of the site: src/lib/supabase.ts), reached at /bivo. Branding comes
 * from the shared `bivo_brand_settings` row, editable at /bivo/admin.
 */
export default function BivoAuthCard({ initialBrand }: { initialBrand: BivoBrand }) {
  const [brand] = useState<BivoBrand>(initialBrand);
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
          setNotice(data.session ? null : "Check your inbox to confirm your email address.");
        }
      } else {
        await new Promise((r) => setTimeout(r, 700));
        setNotice("Demo mode — connect Supabase to sign in real accounts.");
      }
      setStep("done");
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Something went wrong. Try again." });
    } finally {
      setLoading(false);
    }
  };

  const title =
    step === "done"
      ? mode === "signin"
        ? "You're in"
        : "Account created"
      : step === "password"
        ? mode === "signin"
          ? "Welcome back"
          : "Create a password"
        : mode === "signin"
          ? brand.headline
          : "Create your account";

  return (
    <div className="bivo-card bivo-animate-rise w-full max-w-4xl p-8 sm:p-12">
      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        {/* Left: brand + heading */}
        <div>
          <BivoLogo name={brand.appName} logoUrl={brand.logoUrl} />
          <h1 className="bivo-font-display mt-8 text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
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
              brand.subline
            ) : (
              `Join ${brand.appName} in under a minute`
            )}
          </p>
        </div>

        {/* Right: form */}
        <div className="flex flex-col justify-between">
          {step === "email" && (
            <form onSubmit={onEmailNext} noValidate className="space-y-5">
              {mode === "signup" && (
                <Field id="name" label="Full name" error={errors.name}>
                  <input
                    id="name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className="bivo-input"
                  />
                </Field>
              )}
              <Field id="email" label="Email" error={errors.email}>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className="bivo-input"
                />
              </Field>
              <p className="text-sm" style={{ color: "var(--bivo-muted)" }}>
                Need help? Contact{" "}
                <a href={`mailto:${brand.supportEmail}`} className="font-medium underline" style={{ color: "var(--bivo-primary)" }}>
                  {brand.supportEmail}
                </a>
              </p>
              <Actions
                secondaryLabel={mode === "signin" ? "Create account" : "I have an account"}
                onSecondary={() => switchMode(mode === "signin" ? "signup" : "signin")}
                primaryLabel="Next"
              />
            </form>
          )}

          {step === "password" && (
            <form onSubmit={onSubmit} noValidate className="space-y-5">
              <Field id="password" label="Password" error={errors.password}>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    className="bivo-input pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 grid w-12 place-items-center"
                    style={{ color: "var(--bivo-muted)" }}
                  >
                    {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
              {errors.form && (
                <p role="alert" className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "var(--bivo-danger-bg)", color: "var(--bivo-danger)" }}>
                  {errors.form}
                </p>
              )}
              <Actions
                secondaryLabel="Back"
                onSecondary={() => setStep("email")}
                primaryLabel={mode === "signin" ? "Sign in" : "Create account"}
                loading={loading}
              />
            </form>
          )}

          {step === "done" && (
            <div className="space-y-5">
              <div className="bivo-success-row">
                <CheckIcon className="h-5 w-5 shrink-0" style={{ color: "var(--bivo-success)" }} />
                <span>{mode === "signin" ? "Signed in successfully." : `Welcome to ${brand.appName}, ${name.trim()}!`}</span>
              </div>
              {notice && (
                <p className="text-sm" style={{ color: "var(--bivo-muted)" }}>
                  {notice}
                </p>
              )}
              <button type="button" className="bivo-btn bivo-btn-outline" onClick={() => switchMode("signin")}>
                Use another account
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t pt-6 text-xs"
        style={{ borderColor: "var(--bivo-border)", color: "var(--bivo-muted)" }}
      >
        <span>
          © {new Date().getFullYear()} {brand.appName}
        </span>
        <Link href="/bivo/admin" className="hover:underline">
          Admin portal
        </Link>
      </div>
    </div>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string | undefined; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="bivo-label">
        {label}
      </label>
      {children}
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
    <div className="flex items-center justify-end gap-3 pt-4">
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
