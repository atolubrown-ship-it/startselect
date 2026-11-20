"use client";

import { useEffect, useState, type ReactNode } from "react";
import SiteShell from "@/components/SiteShell";
import { useSettings } from "@/components/SettingsProvider";
import { formatAlertDateTime } from "@/lib/settings";
import { KeyIcon, MailIcon } from "@/components/icons";
import {
  CheckIcon,
  PinIcon,
  DeviceIcon,
  ClockIcon,
  ChevronLeftIcon,
} from "@/components/icons";

type View = "alert" | "recognized" | "notme";

export default function SecurityAlertPage() {
  const [view, setView] = useState<View>("alert");

  // Navigating between views behaves like moving between pages: start at the top.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view]);

  return (
    <SiteShell onHome={() => setView("alert")}>
      <div className="mx-auto w-full max-w-xl">
        <Breadcrumb view={view} onBack={() => setView("alert")} />
        <div key={view} className="q-view-in">
          {view === "alert" && (
            <AlertScreen onRecognized={() => setView("recognized")} onNotMe={() => setView("notme")} />
          )}
          {view === "recognized" && <RecognizedScreen onBack={() => setView("alert")} />}
          {view === "notme" && <NotMeScreen onBack={() => setView("alert")} />}
        </div>
      </div>
    </SiteShell>
  );
}

function Breadcrumb({ view, onBack }: { view: View; onBack: () => void }) {
  const atHome = view === "alert";
  return (
    <button
      type="button"
      onClick={atHome ? () => window.scrollTo({ top: 0, behavior: "smooth" }) : onBack}
      className="-ml-2 flex h-11 items-center gap-1 pr-3 text-[13px] font-medium uppercase leading-5 tracking-[0.05em] text-q-ink"
    >
      <ChevronLeftIcon className="h-5 w-5 text-q-sub" />
      {atHome ? "Home" : "Security alert"}
    </button>
  );
}

function DetailRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 py-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-q-field text-q-ink">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="q-sub">{label}</p>
        <p className="text-[15px] font-medium leading-6 text-q-ink">{value}</p>
      </div>
    </div>
  );
}

function AlertScreen({ onRecognized, onNotMe }: { onRecognized: () => void; onNotMe: () => void }) {
  const { settings } = useSettings();
  return (
    <div className="pt-4">
      {/* Heading group */}
      <h1 className="q-h1">Security alert</h1>
      <p className="q-body mt-3">
        We noticed a sign-in to your {settings.siteName} account from a location and device we don&apos;t recognize.
        If this was you, you don&apos;t need to do anything.
      </p>

      {/* Sign-in details group */}
      <section aria-labelledby="signin-details" className="mt-8">
        <h2 id="signin-details" className="q-h3">
          Sign-in details
        </h2>
        <div className="mt-3 rounded-2xl border border-q-line bg-white px-4">
          <div className="divide-y divide-q-field">
            <DetailRow icon={<PinIcon className="h-5 w-5" />} label="Location" value={settings.alertLocation} />
            <DetailRow icon={<DeviceIcon className="h-5 w-5" />} label="Device" value={settings.alertDevice} />
            <DetailRow
              icon={<ClockIcon className="h-5 w-5" />}
              label="Date"
              value={formatAlertDateTime(settings.alertDateTime)}
            />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3">
        <button onClick={onNotMe} className="q-btn q-btn-primary">
          This wasn&apos;t me
        </button>
        <button onClick={onRecognized} className="q-btn q-btn-secondary">
          Yes, this was me
        </button>
      </div>
      <p className="q-sub mt-6">
        Letting us know helps keep your account secure. We&apos;ll never ask for your password or a verification code
        elsewhere.
      </p>
    </div>
  );
}

function RecognizedScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center pt-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckIcon className="h-6 w-6" />
      </div>
      <h1 className="q-h1 mt-4">Thanks for confirming</h1>
      <p className="q-body mt-3 max-w-sm">
        No further action is needed. We&apos;ll keep monitoring your account for anything unusual.
      </p>
      <button onClick={onBack} className="q-btn q-btn-secondary mt-8">
        Back
      </button>
    </div>
  );
}

const NEXT_STEPS = [
  "Sign in to your account the way you normally do, and update your password from your account settings.",
  "Review your active sessions and sign out of any devices you don't recognize.",
  "Contact support if you notice anything else out of the ordinary.",
];

function NotMeScreen({ onBack }: { onBack: () => void }) {
  const { settings } = useSettings();
  const name = settings.siteName;
  const showRecovery = settings.recoveryShowPasswordReset || settings.recoveryShowEmailVerification;
  const showLogins = settings.showGoogleButton || settings.showFacebookButton || settings.showAppleButton;

  const passwordCard = settings.recoveryShowPasswordReset && (
    <RecoveryCard
      key="password"
      icon={<KeyIcon className="h-5 w-5" />}
      title="Reset your password"
      text={`Go to the official ${name} account recovery page to change your password.`}
      href={settings.recoveryPasswordResetUrl}
      cta="Go to password recovery"
    />
  );
  const emailCard = settings.recoveryShowEmailVerification && (
    <RecoveryCard
      key="email"
      icon={<MailIcon className="h-5 w-5" />}
      title="Verify it's you by email"
      text={`We can send a verification link to the email on your ${name} account. We will never show or ask for a verification code on this page.`}
      href={settings.recoveryEmailVerificationUrl}
      cta="Start email verification"
    />
  );
  const orderedCards = settings.recoveryPreferredMethod === "email" ? [emailCard, passwordCard] : [passwordCard, emailCard];

  return (
    <div className="pt-6">
      <h1 className="q-h1">Thanks for letting us know</h1>
      <p className="q-body mt-3">
        We&apos;ve recorded that you don&apos;t recognize this sign-in. Here&apos;s what we recommend next:
      </p>

      <ul className="mt-6 flex flex-col gap-3">
        {NEXT_STEPS.map((text, i) => (
          <li key={i} className="flex items-start gap-4 rounded-2xl border border-q-line p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[13px] font-bold text-q-blue">
              {i + 1}
            </span>
            <p className="q-body">{text}</p>
          </li>
        ))}
      </ul>

      {showRecovery && (
        <section aria-labelledby="recovery-heading" className="mt-8">
          <h2 id="recovery-heading" className="q-h3">
            Recover your account
          </h2>
          <div className="mt-3 flex flex-col gap-3">{orderedCards}</div>
          <p className="q-sub mt-3">
            This page will never ask you to enter your password, a verification code, or payment details. Always
            make account changes by going directly to the app yourself.
          </p>
        </section>
      )}

      {showLogins && (
        <section aria-labelledby="existing-login-heading" className="mt-8 rounded-2xl bg-[#e7ebee] px-5 py-7 sm:px-8 sm:py-9">
          <div className="mb-6 flex items-center justify-center gap-3">
            <h2 id="existing-login-heading" className="text-center text-[19px] font-semibold leading-7 text-[#30343a] sm:text-[22px]">
              Or use an existing login
            </h2>
            <span className="rounded-full bg-white/80 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#69717a]">
              Demo
            </span>
          </div>
          <div className="mx-auto flex w-full max-w-[440px] flex-col gap-4">
            {settings.showGoogleButton && <DemoLoginButton provider="Google" />}
            {settings.showFacebookButton && <DemoLoginButton provider="Facebook" />}
            {settings.showAppleButton && <DemoLoginButton provider="Apple" />}
          </div>
        </section>
      )}

      <button onClick={onBack} className="q-btn q-btn-secondary mt-8">
        Back
      </button>
    </div>
  );
}

/** One recovery option. Shown only when the admin has turned it on and given it a destination. */
function RecoveryCard({
  icon,
  title,
  text,
  href,
  cta,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-q-line p-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-q-blue">{icon}</span>
      <div className="min-w-0">
        <p className="text-[15px] font-semibold leading-6 text-q-ink">{title}</p>
        <p className="q-body mt-1">{text}</p>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="q-body mt-2 inline-block font-semibold text-q-blue underline">
            {cta}
          </a>
        ) : (
          <p className="q-sub mt-2">No link configured yet.</p>
        )}
      </div>
    </div>
  );
}

/**
 * Non-functional demonstration button only. It does not open any sign-in flow,
 * collect credentials, or connect to Google, Facebook or Apple in any way.
 */
function DemoLoginButton({ provider }: { provider: "Google" | "Facebook" | "Apple" }) {
  const isApple = provider === "Apple";
  return (
    <div
      aria-label={`${provider} sign-in demonstration button. Not connected to authentication.`}
      className={`flex min-h-[66px] select-none items-center justify-center gap-5 rounded-[18px] border px-5 py-4 text-center text-[17px] font-semibold shadow-sm sm:min-h-[76px] sm:text-[19px] ${
        isApple ? "border-[#1e2025] bg-[#1e2025] text-white" : "border-[#cbd1d5] bg-white text-[#626a72]"
      }`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center" aria-hidden="true">
        {provider === "Google" && (
          <svg viewBox="0 0 48 48" className="h-8 w-8" role="img">
            <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z" />
            <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z" />
            <path fill="#FBBC05" d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z" />
            <path fill="#EA4335" d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z" />
          </svg>
        )}
        {provider === "Facebook" && (
          <svg viewBox="0 0 40 40" className="h-8 w-8" role="img">
            <circle cx="20" cy="20" r="20" fill="#1877F2" />
            <path fill="#fff" d="M22.7 34V21.8h4.1l.6-4.8h-4.7v-3.1c0-1.4.4-2.3 2.4-2.3h2.5V7.3c-.4-.1-1.9-.2-3.7-.2-3.7 0-6.2 2.2-6.2 6.4V17h-4.2v4.8h4.2V34h5Z" />
          </svg>
        )}
        {isApple && (
          <svg viewBox="0 0 32 36" className="h-8 w-8" role="img">
            <path
              fill="currentColor"
              d="M26.7 19.1c0-4.1 3.3-6.1 3.4-6.2-1.9-2.8-4.9-3.2-6-3.2-2.5-.3-4.9 1.5-6.2 1.5-1.3 0-3.3-1.5-5.4-1.4-2.8 0-5.4 1.6-6.8 4.1-2.9 5-.7 12.4 2.1 16.5 1.4 2 3 4.2 5.1 4.1 2-.1 2.8-1.3 5.3-1.3s3.2 1.3 5.4 1.3c2.2 0 3.6-2 4.9-4.1 1.6-2.3 2.2-4.6 2.2-4.7-.1 0-4-1.5-4-6.6ZM22.6 6.9c1.1-1.3 1.9-3.1 1.7-4.9-1.6.1-3.5 1.1-4.7 2.4-1 1.1-2 3-1.7 4.7 1.8.1 3.6-.9 4.7-2.2Z"
            />
          </svg>
        )}
      </span>
      <span>Sign in with {provider}</span>
    </div>
  );
}
