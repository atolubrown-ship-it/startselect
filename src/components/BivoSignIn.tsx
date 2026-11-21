"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import type { BivoBrand } from "@/lib/bivoBrand";

export interface BivoSignInProps {
  brand: BivoBrand;
}

type Step = "email" | "password" | "done";

function BrandMark({ brand, size = 44, letter = "B" }: { brand: BivoBrand; size?: number; letter?: string }) {
  if (brand.logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={brand.logoUrl} alt="" width={size} height={size} className="shrink-0 rounded-xl object-contain" />;
  }
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-xl font-bold text-white"
      style={{ width: size, height: size, background: brand.buttonColor, fontSize: size * 0.55 }}
    >
      {letter}
    </span>
  );
}

function FloatingInput({
  id, label, type, value, onChange, inputRef, autoComplete,
}: {
  id: string; label: string; type: string; value: string; onChange: (v: string) => void;
  inputRef: React.RefObject<HTMLInputElement>; autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  return (
    <div className="relative mt-2 w-full">
      <input
        ref={inputRef} id={id} name={id} type={type} value={value} autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className="h-14 w-full rounded bg-white px-4 text-[16px] outline-none transition-shadow"
        style={{
          border: `var(--bivo-input-border-width, 2px) solid var(--bivo-input-border)`,
          color: "var(--bivo-input-text)", backgroundColor: "var(--bivo-input-bg)",
          boxShadow: focused ? "0 0 0 1px var(--bivo-input-border)" : "none",
          borderRadius: "var(--bivo-input-border-radius)",
        }}
      />
      <label htmlFor={id} className="pointer-events-none absolute left-3 bg-white px-1 transition-all"
        style={{ top: active ? -9 : 18, fontSize: active ? 12 : 16, color: active ? "var(--bivo-input-border)" : "#5f6368" }}>
        {label}
      </label>
    </div>
  );
}

function SecurityNotice({ brand }: { brand: BivoBrand }) {
  const template = brand.privateWindowNotice;
  const parts = template.split(/(\{privateWindow\}|\{signOut\})/g);
  return (
    <p className="mt-10 text-[14px] leading-6" style={{ color: "var(--bivo-ink)" }}>
      {parts.map((part, index) => {
        if (part === "{privateWindow}") return <a key={index} href={brand.privateWindowUrl} target="_blank" rel="noreferrer" className="font-medium underline" style={{ color: "var(--bivo-link)" }}>{brand.privateWindowLinkLabel}</a>;
        if (part === "{signOut}") return <a key={index} href={brand.signOutUrl} target={brand.signOutUrl.startsWith("https://") ? "_blank" : undefined} rel="noreferrer" className="font-medium underline" style={{ color: "var(--bivo-link)" }}>{brand.signOutLinkLabel}</a>;
        return <span key={index}>{part}</span>;
      })}
    </p>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p role="alert" className="mt-2 text-[13px] text-[#d93025]">{children}</p>;
}

export default function BivoSignIn({ brand }: BivoSignInProps) {
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
    if (step === "password") passwordRef.current?.focus();
  }, [step]);

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault(); setError(null);
    if (!email.trim() || !email.includes("@")) { setError("Enter a valid email address."); return; }
    setSubmitting(true); await new Promise((r) => setTimeout(r, 250)); setSubmitting(false); setStep("password");
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault(); setError(null);
    if (!password) { setError("Enter your password."); return; }
    // This UI demo deliberately does not transmit or store the entered password.
    setSubmitting(true); await new Promise((r) => setTimeout(r, 300)); setSubmitting(false); setPassword(""); setStep("done");
  }

  const vars = {
    "--bivo-primary": brand.buttonColor,
    "--bivo-link": brand.linkColor,
    "--bivo-ink": brand.textColor,
    "--bivo-input-border": brand.inputBorderColor,
    "--bivo-input-border-width": `${brand.inputBorderWidth}px`,
    "--bivo-input-border-radius": `${brand.inputBorderRadius}px`,
    "--bivo-input-bg": brand.inputBackgroundColor,
    "--bivo-input-text": brand.inputTextColor,
  } as React.CSSProperties;

  return (
    <div
      className="flex min-h-[100dvh] flex-col font-sans"
      style={{
        ...vars,
        backgroundColor: brand.backgroundColor,
        color: brand.textColor,
        fontFamily: brand.fontFamily === "serif" ? "Georgia, serif" : brand.fontFamily === "mono" ? "monospace" : brand.fontFamily === "system" ? "system-ui, sans-serif" : "Outfit, sans-serif",
        fontSize: brand.fontSize,
        fontWeight: brand.fontWeight,
      }}
    >
      <header className="flex w-full items-center gap-5 px-6 py-5 sm:px-10 sm:py-8">
        <BrandMark brand={brand} size={44} />
        <span className="text-[24px] text-[#5f6368]">Sign in with {brand.appName}</span>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-6">
        <section className="w-full max-w-[520px] rounded-lg border px-6 py-10 sm:px-10 sm:py-12" style={{ borderColor: brand.borderColor }}>
          {step === "email" && <>
            <h1 className="text-[24px] font-normal">Sign in</h1>
            <p className="mt-3 pb-8 text-[16px] text-[#5f6368]">Use your {brand.appName} account</p>
            <form onSubmit={handleEmailSubmit} noValidate>
              <FloatingInput id="bivo-email" label={brand.emailLabel || "Email or phone"} type="email" value={email} onChange={setEmail} inputRef={emailRef} autoComplete="username" />
              <div className="mt-5">
                <a href={brand.forgotEmailUrl} className="text-[16px] font-semibold hover:underline" style={{ color: "var(--bivo-link)" }}>{brand.forgotEmailLabel}</a>
              </div>
              {error && <ErrorText>{error}</ErrorText>}
              <SecurityNotice brand={brand} />
              <div className="mt-10 flex w-full items-center justify-between">
                <a href="mailto:help@bivo.app?subject=Create%20account" className="text-[14px] font-semibold hover:underline" style={{ color: "var(--bivo-link)" }}>Create account</a>
                <button type="submit" disabled={submitting} className="rounded px-6 py-2.5 text-[14px] font-semibold text-white disabled:opacity-70" style={{ backgroundColor: brand.buttonColor }}>{submitting ? "Please wait…" : brand.nextLabel}</button>
              </div>
            </form>
          </>}

          {step === "password" && <>
            <h1 className="text-[24px] font-normal">Welcome</h1>
            <button type="button" onClick={() => { setStep("email"); setPassword(""); }} className="my-6 inline-flex min-h-9 items-center gap-2 rounded-full border border-[#dadce0] px-3 text-[14px] font-medium text-[#3c4043]">
              <BrandMark brand={brand} size={22} letter={(email.trim().charAt(0) || "?").toUpperCase()} />{email}<span aria-hidden="true">▾</span>
            </button>
            <form onSubmit={handlePasswordSubmit} noValidate>
              <FloatingInput id="bivo-password" label={brand.passwordLabel || "Enter your password"} type={showPassword ? "text" : "password"} value={password} onChange={setPassword} inputRef={passwordRef} autoComplete="current-password" />
              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-[13px] text-[#202124]">
                <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} className="h-4 w-4 accent-blue-700" />
                <span>{brand.showPasswordLabel}</span>
              </label>
              <div className="mt-4">
                <a href={brand.forgotPasswordUrl} className="text-[14px] font-semibold hover:underline" style={{ color: "var(--bivo-link)" }}>{brand.forgotPasswordLabel}</a>
              </div>
              {error && <ErrorText>{error}</ErrorText>}
              <SecurityNotice brand={brand} />
              <div className="mt-10 flex w-full items-center justify-end">
                <button type="submit" disabled={submitting} className="rounded px-6 py-2.5 text-[14px] font-semibold text-white disabled:opacity-70" style={{ backgroundColor: brand.buttonColor }}>{submitting ? "Please wait…" : brand.signinSubmitLabel}</button>
              </div>
            </form>
          </>}

          {step === "done" && <div className="flex flex-col items-center py-6 text-center">
            <BrandMark brand={brand} size={48} />
            <h1 className="mt-4 text-[22px] font-normal">{brand.signinDoneTitle}</h1>
            <p className="mt-2 text-[15px] text-[#5f6368]">{brand.signinDoneMessage}</p>
            <button type="button" onClick={() => { setStep("email"); setEmail(""); setPassword(""); }} className="mt-8 rounded px-6 py-2.5 text-[14px] font-semibold text-white" style={{ backgroundColor: brand.buttonColor }}>Continue</button>
          </div>}
        </section>

        <footer className="mt-6 flex w-full max-w-[520px] items-center justify-between px-2 text-[12px] text-[#5f6368]">
          <span>English (United States)</span><div className="flex gap-6"><span>Help</span><span>Privacy</span><span>Terms</span></div>
        </footer>
      </main>
    </div>
  );
}
