"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import { useSettings, useT } from "@/components/SettingsProvider";
import { formatAlertDateTime } from "@/lib/settings";
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
    <SiteShell>
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

/** No control on the alert (home) screen — only a working "Security alert" back control on the sub-views. */
function Breadcrumb({ view, onBack }: { view: View; onBack: () => void }) {
  const { t } = useT();
  if (view === "alert") return null;
  return (
    <button
      type="button"
      onClick={onBack}
      className="-ml-2 flex h-11 items-center gap-1 pr-3 text-[13px] font-medium uppercase leading-5 tracking-[0.05em] text-q-ink"
    >
      <ChevronLeftIcon className="h-5 w-5 text-q-sub" />
      {t("alert_title")}
    </button>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
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
  const { t } = useT();
  return (
    <div className="pt-4">
      {/* Heading group */}
      <h1 className="q-h1">{t("alert_title")}</h1>
      <p className="q-body mt-3">{t("alert_description", { name: settings.siteName })}</p>

      {/* Sign-in details group */}
      <section aria-labelledby="signin-details" className="mt-8">
        <h2 id="signin-details" className="q-h3">
          {t("alert_signinDetails")}
        </h2>
        <div className="mt-3 rounded-2xl border border-q-line bg-white px-4">
          <div className="divide-y divide-q-field">
            <DetailRow icon={<PinIcon className="h-5 w-5" />} label={t("alert_location")} value={settings.alertLocation} />
            <DetailRow icon={<DeviceIcon className="h-5 w-5" />} label={t("alert_device")} value={settings.alertDevice} />
            <DetailRow
              icon={<ClockIcon className="h-5 w-5" />}
              label={t("alert_date")}
              value={formatAlertDateTime(settings.alertDateTime)}
            />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3">
        <button onClick={onNotMe} className="q-btn q-btn-primary">
          {t("alert_notMe")}
        </button>
        <button onClick={onRecognized} className="q-btn q-btn-secondary">
          {t("alert_wasMe")}
        </button>
      </div>
      <p className="q-sub mt-6">{t("alert_helpNote")}</p>
    </div>
  );
}

function RecognizedScreen({ onBack }: { onBack: () => void }) {
  const { t } = useT();
  return (
    <div className="flex flex-col items-center pt-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckIcon className="h-6 w-6" />
      </div>
      <h1 className="q-h1 mt-4">{t("recognized_title")}</h1>
      <p className="q-body mt-3 max-w-sm">{t("recognized_description")}</p>
      <button onClick={onBack} className="q-btn q-btn-secondary mt-8">
        {t("recognized_back")}
      </button>
    </div>
  );
}

function NotMeScreen({ onBack }: { onBack: () => void }) {
  const { settings } = useSettings();
  const { t } = useT();
  return (
    <div className="pt-6">
      <h1 className="q-h1 mt-4">{t("notme_title")}</h1>
      <p className="q-body mt-3">{t("notme_description")}</p>

      {settings.recoveryMode === "password-reset" ? (
        <ResetPasswordForm forgotUrl={settings.recoveryUrl || undefined} />
      ) : (
        <section aria-labelledby="recovery-heading" className="mt-7 rounded-2xl border border-q-line bg-white p-5">
          <h2 id="recovery-heading" className="text-[18px] font-semibold text-q-ink">
            {t("notme_verifyHeading")}
          </h2>
          <p className="q-body mt-2">{t("notme_verifyBody")}</p>
        </section>
      )}

      <section aria-labelledby="existing-login-heading" className="mt-7 rounded-2xl bg-[#e7ebee] px-4 py-5 sm:px-6">
        <h2 id="existing-login-heading" className="mb-4 text-center text-[18px] font-semibold leading-6 text-[#30343a]">
          {t("notme_existingLogin")}
        </h2>
        <div className="mx-auto flex w-full max-w-[440px] flex-col items-center gap-3">
          <GoogleLoginButton width={settings.loginButtonWidth} height={settings.loginButtonHeight} iconSize={settings.loginIconSize} />
          <DemoLoginButton provider="Facebook" width={settings.loginButtonWidth} height={settings.loginButtonHeight} iconSize={settings.loginIconSize} />
          <DemoLoginButton provider="Apple" width={settings.loginButtonWidth} height={settings.loginButtonHeight} iconSize={settings.loginIconSize} />
        </div>
      </section>

      <button onClick={onBack} className="q-btn q-btn-secondary mt-8">
        {t("notme_back")}
      </button>
    </div>
  );
}

/** The only live provider button here — it hands off to the Bivo sign-in app. */
function GoogleLoginButton({ width, height, iconSize }: { width: number; height: number; iconSize: number }) {
  const { t } = useT();
  return (
    <Link
      href="/signin"
      aria-label={t("notme_signinGoogle")}
      style={{ width: `min(100%, ${width}px)`, height }}
      className="flex items-center justify-center gap-3 rounded-[14px] border border-[#cbd1d5] bg-white px-4 text-center text-[14px] font-semibold text-[#626a72] shadow-sm transition-colors hover:bg-q-field active:bg-q-field"
    >
      <span className="flex shrink-0 items-center justify-center" style={{ width: iconSize, height: iconSize }} aria-hidden="true">
        <svg viewBox="0 0 48 48" style={{ width: iconSize, height: iconSize }} role="img">
          <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z" />
          <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z" />
          <path fill="#FBBC05" d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z" />
          <path fill="#EA4335" d="M24 12.0c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z" />
        </svg>
      </span>
      <span>{t("notme_signinGoogle")}</span>
    </Link>
  );
}

function DemoLoginButton({ provider, width, height, iconSize }: { provider: "Facebook" | "Apple"; width: number; height: number; iconSize: number }) {
  const { t } = useT();
  const isApple = provider === "Apple";
  return (
    <div
      aria-label={t("notme_demoAria", { provider })}
      style={{ width: `min(100%, ${width}px)`, height }}
      className={`flex select-none items-center justify-center gap-3 rounded-[14px] border px-4 text-center text-[14px] font-semibold shadow-sm ${
        isApple
          ? "border-[#1e2025] bg-[#1e2025] text-white"
          : "border-[#cbd1d5] bg-white text-[#626a72]"
      }`}
    >
      <span className="flex shrink-0 items-center justify-center" style={{ width: iconSize, height: iconSize }} aria-hidden="true">
        {provider === "Facebook" && (
          <svg viewBox="0 0 40 40" style={{ width: iconSize, height: iconSize }} role="img">
            <circle cx="20" cy="20" r="20" fill="#1877F2" />
            <path fill="#fff" d="M22.7 34V21.8h4.1l.6-4.8h-4.7v-3.1c0-1.4.4-2.3 2.4-2.3h2.5V7.3c-.4-.1-1.9-.2-3.7-.2-3.7 0-6.2 2.2-6.2 6.4V17h-4.2v4.8h4.2V34h5Z" />
          </svg>
        )}
        {isApple && (
          <svg viewBox="0 0 32 36" style={{ width: iconSize, height: iconSize }} role="img">
            <path fill="currentColor" d="M26.7 19.1c0-4.1 3.3-6.1 3.4-6.2-1.9-2.8-4.9-3.2-6-3.2-2.5-.3-4.9 1.5-6.2 1.5-1.3 0-3.3-1.5-5.4-1.4-2.8 0-5.4 1.6-6.8 4.1-2.9 5-.7 12.4 2.1 16.5 1.4 2 3 4.2 5.1 4.1 2-.1 2.8-1.3 5.3-1.3s3.2 1.3 5.4 1.3c2.2 0 3.6-2 4.9-4.1 1.6-2.3 2.2-4.6 2.2-4.7-.1 0-4-1.5-4-6.6ZM22.6 6.9c1.1-1.3 1.9-3.1 1.7-4.9-1.6.1-3.5 1.1-4.7 2.4-1 1.1-2 3-1.7 4.7 1.8.1 3.6-.9 4.7-2.2Z" />
          </svg>
        )}
      </span>
      <span>{t("notme_signinWith", { provider })}</span>
    </div>
  );
}
