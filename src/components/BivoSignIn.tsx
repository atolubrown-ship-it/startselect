"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ChevronLeftIcon, EyeIcon, EyeOffIcon } from "@/components/icons";

/**
 * Bivo sign-in — the app Quilo's "Sign in with Google" button hands
 * visitors off to (see the Google entry in src/app/page.tsx's
 * "Or use an existing login" section). Two-step email -> password
 * flow, built on Quilo's own Next.js/Tailwind stack and q- design
 * tokens, in place of the original standalone inline-style component.
 *
 * Demo only, same spirit as ResetPasswordForm elsewhere in this app:
 * onSubmitPassword never checks against a real account — there is no
 * auth backend wired up here — it just simulates success after a
 * short delay.
 */

export interface BivoSignInProps {
  /** Brand name shown in the header and copy. */
  appName?: string;
  /** Primary accent colour (buttons, links, focus rings, generated mark). */
  primaryColor?: string;
  /** Where "back" / "cancel" / the final continue link return to. */
  backHref?: string;
  /** Label for the place being returned to, e.g. "Quilo". */
  backLabel?: string;
}

type Step = "email" | "password" | "done";

function BrandMark({
  color,
  size = 20,
  shape = "rounded",
  letter = "B",
}: {
  color: string;
  size?: number;
  shape?: "rounded" | "circle";
  letter?: string;
}) {
  const gradId = `bivo-mark-${shape}`;
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={lighten(color)} />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
      </defs>
      {shape === "circle" ? (
        <circle cx="28" cy="28" r="28" fill={`url(#${gradId})`} />
      ) : (
        <rect x="0" y="0" width="56" height="56" rx="14" fill={`url(#${gradId})`} />
      )}
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontWeight={800} fontSize={28} fill="#fff">
        {letter}
      </text>
    </svg>
  );
}

function lighten(hex: string): string {
  const m = hex.replace("#", "");
  if (m.length !== 6) return "#6aa6ff";
  const r = Math.min(255, parseInt(m.slice(0, 2), 16) + 90);
  const g = Math.min(255, parseInt(m.slice(2, 4), 16) + 70);
  const b = Math.min(255, parseInt(m.slice(4, 6), 16) + 30);
  return `rgb(${r}, ${g}, ${b})`;
}

function FloatingInput({
  id,
  label,
  type,
  value,
  onChange,
  inputRef,
  autoComplete,
  trailing,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  autoComplete?: string;
  trailing?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  return (
    <div className="relative mt-2 w-full">
      <input
        ref={inputRef}
        id={id}
        name={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`h-14 w-full rounded border bg-white px-4 text-[16px] text-[#202124] outline-none transition-colors ${
          trailing ? "pr-12" : ""
        } ${active ? "border-[var(--bivo-primary)]" : "border-[#dadce0]"}`}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-3 bg-white px-1 transition-all"
        style={{
          top: active ? -9 : 18,
          fontSize: active ? 12 : 16,
          color: active ? "var(--bivo-primary)" : "#5f6368",
        }}
      >
        {label}
      </label>
      {trailing && <div className="absolute right-1 top-1/2 -translate-y-1/2">{trailing}</div>}
    </div>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="mt-2 text-[13px] text-[#d93025]">
      {children}
    </p>
  );
}

function BottomRow({
  leftHref,
  leftLabel,
  onBack,
  submitting,
}: {
  leftHref?: string;
  leftLabel?: string;
  onBack?: () => void;
  submitting: boolean;
}) {
  return (
    <div className="mt-10 flex w-full items-center justify-between">
      {leftHref && leftLabel ? (
        <Link href={leftHref} className="text-[14px] font-semibold text-[var(--bivo-primary)] hover:underline">
          {leftLabel}
        </Link>
      ) : onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="text-[14px] font-semibold text-[var(--bivo-primary)] hover:underline"
        >
          Back
        </button>
      ) : (
        <span />
      )}
      <button
        type="submit"
        disabled={submitting}
        className="rounded px-6 py-2.5 text-[14px] font-semibold text-white disabled:opacity-70"
        style={{ backgroundColor: "var(--bivo-primary)" }}
      >
        {submitting ? "Please wait…" : "Next"}
      </button>
    </div>
  );
}

export default function BivoSignIn({
  appName = "Bivo",
  primaryColor = "#1d4ed8",
  backHref = "/",
  backLabel = "Quilo",
}: BivoSignInProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "email") emailRef.current?.focus();
    else if (step === "password") passwordRef.current?.focus();
  }, [step]);

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    setSubmitting(true);
    // No lookup backend is wired up — this is a UI-only demo flow.
    await new Promise((r) => setTimeout(r, 300));
    setSubmitting(false);
    setStep("password");
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!password) {
      setError("Enter your password.");
      return;
    }
    setSubmitting(true);
    // Demo only: nothing here checks the password against a real account.
    await new Promise((r) => setTimeout(r, 500));
    setSubmitting(false);
    setStep("done");
  }

  const vars = { "--bivo-primary": primaryColor } as React.CSSProperties;

  return (
    <div style={vars} className="flex min-h-[100dvh] flex-col bg-white font-sans text-[#202124]">
      <header className="flex w-full items-center gap-2 border-b border-[#e6e8ec] px-4 py-4 sm:px-6">
        <Link
          href={backHref}
          aria-label={`Back to ${backLabel}`}
          className="-ml-1 flex h-8 w-8 items-center justify-center rounded-full text-[#5f6368] hover:bg-[#f1f3f4]"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <BrandMark color={primaryColor} size={20} />
        <span className="text-[16px] text-[#5f6368]">Sign in with {appName}</span>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="w-full max-w-[448px] rounded-lg border border-[#dadce0] px-6 py-10 sm:px-10 sm:py-12">
          {step === "email" && (
            <>
              <h1 className="text-[24px] font-normal">Sign in</h1>
              <p className="mt-3 pb-8 text-[16px] text-[#5f6368]">Use your {appName} account</p>
              <form onSubmit={handleEmailSubmit} noValidate>
                <FloatingInput id="bivo-email" label="Email address" type="email" value={email} onChange={setEmail} inputRef={emailRef} autoComplete="username" />
                {error && <ErrorText>{error}</ErrorText>}
                <p className="mt-10 text-[14px] leading-6 text-[#5f6368]">
                  Not your device? Use a private window to sign in, and remember to sign out before you leave.
                </p>
                <BottomRow leftHref="#" leftLabel="Create account" submitting={submitting} />
              </form>
            </>
          )}

          {step === "password" && (
            <>
              <h1 className="text-[24px] font-normal">Welcome</h1>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="my-6 inline-flex h-8 items-center gap-2 rounded-full border border-[#dadce0] px-3 text-[14px] font-medium text-[#3c4043]"
              >
                <BrandMark color={primaryColor} size={22} shape="circle" letter={(email.trim().charAt(0) || "?").toUpperCase()} />
                {email}
                <span aria-hidden="true">▾</span>
              </button>
              <form onSubmit={handlePasswordSubmit} noValidate>
                <FloatingInput
                  id="bivo-password"
                  label="Enter your password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={setPassword}
                  inputRef={passwordRef}
                  autoComplete="current-password"
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-[#5f6368] hover:bg-[#f1f3f4]"
                    >
                      {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  }
                />
                {error && <ErrorText>{error}</ErrorText>}
                <BottomRow onBack={() => setStep("email")} submitting={submitting} />
              </form>
            </>
          )}

          {step === "done" && (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <BrandMark color={primaryColor} size={28} shape="circle" />
              </div>
              <h1 className="mt-4 text-[22px] font-normal">You&apos;re signed in</h1>
              <p className="mt-2 text-[15px] text-[#5f6368]">as {email}</p>
              <Link
                href={backHref}
                className="mt-8 rounded px-6 py-2.5 text-[14px] font-semibold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Continue to {backLabel}
              </Link>
            </div>
          )}
        </div>

        <footer className="mt-6 flex w-full max-w-[448px] items-center justify-between px-2 text-[12px] text-[#5f6368]">
          <span>English (United States)</span>
          <div className="flex gap-6">
            <span>Help</span>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
