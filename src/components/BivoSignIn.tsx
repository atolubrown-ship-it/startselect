"use client";

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { buildBivoCssVars, fillTemplate, type BivoBrand } from "@/lib/bivoBrand";
import { validateEmail, validatePassword } from "@/lib/bivoValidation";

/**
 * Bivo sign-in at /signin. Two-step email -> password flow. Colours, name,
 * logo and copy come from the shared `bivo_brand_settings` row, edited at
 * /signin/admin (BivoBrandEditor.tsx). Applied as an inline style scoped to
 * this component's own root, never to document.documentElement, so the
 * admin's live preview can render it safely.
 *
 * Uses the site's Supabase client when it is configured; otherwise it
 * simulates success after a short delay (UI-only demo).
 */

type Step = "email" | "password" | "done";

function goTo(href: string, router: ReturnType<typeof useRouter>) {
  if (href.startsWith("/")) router.push(href);
  else window.location.href = href;
}

function lighten(hex: string): string {
  const m = hex.replace("#", "");
  if (m.length !== 6) return "#6aa6ff";
  const r = Math.min(255, parseInt(m.slice(0, 2), 16) + 90);
  const g = Math.min(255, parseInt(m.slice(2, 4), 16) + 70);
  const b = Math.min(255, parseInt(m.slice(4, 6), 16) + 30);
  return `rgb(${r}, ${g}, ${b})`;
}

function BrandMark({ color, size = 20, letter = "B" }: { color: string; size?: number; letter?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden="true">
      <defs>
        <linearGradient id="bivo-mark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={lighten(color)} />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="56" height="56" rx="14" fill="url(#bivo-mark-grad)" />
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontWeight={800} fontSize={28} fill="#fff">
        {letter}
      </text>
    </svg>
  );
}

function FloatingInput({
  id,
  brand,
  label,
  type,
  value,
  onChange,
  inputRef,
  autoComplete,
}: {
  id: string;
  brand: BivoBrand;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  autoComplete?: string;
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
        className="w-full px-4 outline-none transition-colors"
        style={{
          height: brand.inputHeight,
          fontSize: brand.inputTextSize,
          backgroundColor: "var(--bivo-input-bg)",
          color: "var(--bivo-input-text)",
          borderStyle: "solid",
          borderWidth: "var(--bivo-input-border-width)",
          borderRadius: "var(--bivo-input-border-radius)",
          borderColor: active ? "var(--bivo-primary)" : "var(--bivo-border)",
        }}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-3 px-1 transition-all"
        style={{
          top: active ? -Math.round(brand.labelSize * 0.55) : Math.max(0, Math.round((brand.inputHeight - brand.labelSize * 1.5) / 2)),
          fontSize: active ? Math.max(10, Math.round(brand.labelSize * 0.75)) : brand.labelSize,
          lineHeight: 1.5,
          color: active ? "var(--bivo-primary)" : "#5f6368",
          backgroundColor: "var(--bivo-input-bg)",
        }}
      >
        {label}
      </label>
    </div>
  );
}

function ErrorText({ size, children }: { size: number; children: React.ReactNode }) {
  return (
    <p role="alert" className="mt-2" style={{ color: "var(--bivo-danger)", fontSize: size }}>
      {children}
    </p>
  );
}

function InlineLink({ children, onClick, href, size }: { children: React.ReactNode; onClick?: () => void; href?: string; size: number }) {
  const cls = "font-semibold hover:underline";
  const style = { color: "var(--bivo-link)", fontSize: size } as CSSProperties;
  if (href) {
    return (
      <a href={href} className={cls} style={style}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={`${cls} text-left`} style={style}>
      {children}
    </button>
  );
}

/** "Before using this app, you can review iOS's privacy policy and terms of service." with the two links in the link colour. */
function PolicyText({ brand }: { brand: BivoBrand }) {
  const linkStyle = { color: "var(--bivo-link)" } as CSSProperties;
  return (
    <p className="leading-relaxed text-[#5f6368]" style={{ marginTop: brand.policySpacing, fontSize: brand.policyTextSize }}>
      Before using this app, you can review iOS&apos;s{" "}
      <a href="#" className="font-medium hover:underline" style={linkStyle}>
        privacy policy
      </a>{" "}
      and{" "}
      <a href="#" className="font-medium hover:underline" style={linkStyle}>
        terms of service
      </a>
      .
    </p>
  );
}

function NextButton({ brand, label, submitting }: { brand: BivoBrand; label: string; submitting: boolean }) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className="rounded-full font-semibold disabled:opacity-70"
      style={{
        backgroundColor: "var(--bivo-primary)",
        color: "var(--bivo-primary-ink)",
        height: brand.buttonHeight,
        fontSize: brand.buttonTextSize,
        paddingLeft: brand.buttonPaddingX,
        paddingRight: brand.buttonPaddingX,
      }}
    >
      {submitting ? "Please wait…" : label}
    </button>
  );
}

export default function BivoSignIn({ brand, previewOnly = false }: { brand: BivoBrand; previewOnly?: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [canRedirect, setCanRedirect] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (previewOnly) return;
    if (step === "email") emailRef.current?.focus();
    else if (step === "password") passwordRef.current?.focus();
  }, [step, previewOnly]);

  // Admin-configured post-sign-in destination ("After sign-in" in /signin/admin).
  useEffect(() => {
    if (previewOnly || step !== "done" || !canRedirect || !brand.successRedirectUrl) return;
    const t = setTimeout(() => goTo(brand.successRedirectUrl, router), 1500);
    return () => clearTimeout(t);
  }, [previewOnly, step, canRedirect, brand.successRedirectUrl, router]);

  function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    if (previewOnly) return;
    setNotice(null);
    const err = validateEmail(email, { required: brand.emailRequiredMessage, invalid: brand.emailInvalidMessage });
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep("password");
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    if (previewOnly) return;
    setNotice(null);
    const err = validatePassword(password, {
      required: brand.passwordRequiredMessage,
      tooShortTemplate: brand.passwordTooShortMessage,
    });
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const sb = getSupabase();
      if (sb) {
        const { error: authErr } = await sb.auth.signInWithPassword({ email: email.trim(), password });
        if (authErr) throw authErr;
      } else {
        await new Promise((r) => setTimeout(r, 500));
        setNotice(brand.demoNoticeText);
      }
      setCanRedirect(true);
      setStep("done");
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : brand.genericErrorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  function startOver() {
    setStep("email");
    setPassword("");
    setShowPassword(false);
    setError(null);
    setNotice(null);
    setCanRedirect(false);
  }

  const cssVars = {
    ...buildBivoCssVars(brand),
    "--bivo-danger": "#d93025",
    "--bivo-success": "#1f9d6b",
  } as CSSProperties;
  const vars = { appName: brand.appName, email: email.trim() };
  const letter = (brand.appName.trim().charAt(0) || "B").toUpperCase();

  const px = brand.pagePaddingX;
  const py = brand.pagePaddingY;
  const muted = "#5f6368";

  return (
    <div
      style={cssVars}
      className={`bivo flex w-full flex-col ${previewOnly ? "min-h-[520px]" : "min-h-[100dvh]"}`}
    >
      <header
        className="flex w-full items-center gap-2 border-b px-4 sm:px-6"
        style={{ borderColor: "var(--bivo-border)", paddingTop: brand.headerPaddingY, paddingBottom: brand.headerPaddingY }}
      >
        {brand.showLogo && brand.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- logo is a data: URL or an external https link
          <img src={brand.logoUrl} alt={`${brand.appName} logo`} className="object-contain" style={{ height: brand.logoSize, maxWidth: 240 }} />
        ) : (
          <>
            {brand.showLogo && <BrandMark color={brand.buttonColor} size={brand.logoSize} letter={letter} />}
            <span style={{ fontSize: brand.headerTextSize, color: muted }}>Sign in with {brand.appName}</span>
          </>
        )}
      </header>

      <div
        className="flex flex-1 flex-col items-center justify-center"
        style={{ paddingLeft: px, paddingRight: px, paddingTop: py, paddingBottom: py }}
      >
        <div
          className="w-full border"
          style={{
            maxWidth: brand.cardWidth,
            borderColor: "var(--bivo-border)",
            borderRadius: brand.cardRadius,
            backgroundColor: "var(--bivo-bg-color)",
            paddingLeft: brand.cardPaddingX,
            paddingRight: brand.cardPaddingX,
            paddingTop: brand.cardPaddingY,
            paddingBottom: brand.cardPaddingY,
          }}
        >
          {step === "email" && (
            <>
              <h1 style={{ fontSize: brand.titleSize, fontWeight: "inherit" }}>{brand.signinHeadline}</h1>
              {brand.showSubline && (
                <p style={{ marginTop: brand.titleSpacing, fontSize: brand.sublineSize, color: muted }}>{brand.signinSubline}</p>
              )}
              <form onSubmit={handleEmailSubmit} noValidate style={{ marginTop: brand.sublineSpacing }}>
                <FloatingInput id="bivo-email" brand={brand} label={brand.emailLabel} type="email" value={email} onChange={setEmail} inputRef={emailRef} autoComplete="username" />
                {error && <ErrorText size={brand.messageTextSize}>{error}</ErrorText>}
                <div style={{ marginTop: brand.fieldSpacing }}>
                  <InlineLink size={brand.linkSize} onClick={() => setNotice("Email recovery isn't set up yet.")}>
                    Forgot email?
                  </InlineLink>
                </div>
                {notice && <p className="mt-2" style={{ fontSize: brand.messageTextSize, color: muted }}>{notice}</p>}
                <PolicyText brand={brand} />
                <div className="flex w-full items-center justify-between" style={{ marginTop: brand.buttonRowSpacing }}>
                  {brand.showSwitchLink ? (
                    <InlineLink size={brand.linkSize} href="#">
                      {brand.signinSwitchLabel}
                    </InlineLink>
                  ) : (
                    <span />
                  )}
                  <NextButton brand={brand} label={brand.nextLabel} submitting={submitting} />
                </div>
              </form>
            </>
          )}

          {step === "password" && (
            <>
              <h1 style={{ fontSize: brand.titleSize, fontWeight: "inherit" }}>{brand.signinPasswordTitle}</h1>
              <p className="flex items-center gap-2" style={{ marginTop: brand.titleSpacing, fontSize: brand.sublineSize, color: muted }}>
                <svg
                  width={Math.round(brand.sublineSize * 1.4)}
                  height={Math.round(brand.sublineSize * 1.4)}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3a3 3 0 110 6 3 3 0 010-6zm0 14.2a7.2 7.2 0 01-6-3.22c.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08a7.2 7.2 0 01-6 3.22z" />
                </svg>
                <span className="break-all">{email.trim()}</span>
              </p>
              <form onSubmit={handlePasswordSubmit} noValidate style={{ marginTop: brand.sublineSpacing }}>
                <FloatingInput
                  id="bivo-password"
                  brand={brand}
                  label={brand.passwordLabel}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={setPassword}
                  inputRef={passwordRef}
                  autoComplete="current-password"
                />
                {error && <ErrorText size={brand.messageTextSize}>{error}</ErrorText>}
                <label className="flex cursor-pointer items-center gap-3" style={{ marginTop: brand.checkboxSpacing, fontSize: brand.linkSize }}>
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    style={{ width: brand.checkboxSize, height: brand.checkboxSize, accentColor: "var(--bivo-primary)" }}
                  />
                  {brand.showPasswordLabel}
                </label>
                {notice && <p className="mt-3" style={{ fontSize: brand.messageTextSize, color: muted }}>{notice}</p>}
                <PolicyText brand={brand} />
                <div className="flex w-full items-center justify-between" style={{ marginTop: brand.buttonRowSpacing }}>
                  <InlineLink size={brand.linkSize} onClick={() => setNotice("Password recovery isn't set up yet.")}>
                    Forgot password?
                  </InlineLink>
                  <NextButton brand={brand} label={brand.nextLabel} submitting={submitting} />
                </div>
              </form>
            </>
          )}

          {step === "done" && (
            <div className="flex flex-col items-center py-6 text-center">
              <div
                className="flex items-center justify-center rounded-full"
                style={{ width: brand.doneIconSize, height: brand.doneIconSize, backgroundColor: "#e6f4ea", color: "var(--bivo-success)" }}
              >
                <BrandMark color={brand.buttonColor} size={Math.round(brand.doneIconSize * 0.5)} letter={letter} />
              </div>
              <h1 className="mt-4" style={{ fontSize: Math.round(brand.titleSize * 0.92), fontWeight: "inherit" }}>
                {brand.signinDoneTitle}
              </h1>
              <p style={{ marginTop: brand.titleSpacing, fontSize: brand.sublineSize, color: muted }}>
                {fillTemplate(brand.signedInAsTemplate, vars)}
              </p>
              {notice && <p className="mt-2" style={{ fontSize: brand.messageTextSize, color: muted }}>{notice}</p>}
              {canRedirect && brand.successRedirectUrl ? (
                <>
                  <button
                    type="button"
                    onClick={() => goTo(brand.successRedirectUrl, router)}
                    className="rounded-full font-semibold"
                    style={{
                      marginTop: brand.buttonRowSpacing,
                      backgroundColor: "var(--bivo-primary)",
                      color: "var(--bivo-primary-ink)",
                      height: brand.buttonHeight,
                      fontSize: brand.buttonTextSize,
                      paddingLeft: brand.buttonPaddingX,
                      paddingRight: brand.buttonPaddingX,
                    }}
                  >
                    {brand.continueLabel}
                  </button>
                  <p className="mt-3" style={{ fontSize: brand.messageTextSize, color: muted }}>{brand.redirectingText}</p>
                </>
              ) : (
                <button
                  type="button"
                  onClick={startOver}
                  className="font-semibold hover:underline"
                  style={{ marginTop: brand.buttonRowSpacing, fontSize: brand.linkSize, color: "var(--bivo-link)" }}
                >
                  {brand.useAnotherAccountLabel}
                </button>
              )}
            </div>
          )}
        </div>

        <footer
          className="flex w-full items-center justify-between px-2"
          style={{ maxWidth: brand.cardWidth, marginTop: brand.footerSpacing, fontSize: brand.footerTextSize, color: muted }}
        >
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
