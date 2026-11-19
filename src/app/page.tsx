"use client";

import { useEffect, useState } from "react";
import SiteShell from "@/components/SiteShell";
import { useSettings } from "@/components/SettingsProvider";
import { formatAlertDateTime } from "@/lib/settings";
import {
  ShieldAlertIcon,
  CheckIcon,
  PinIcon,
  DeviceIcon,
  ClockIcon,
  ChevronLeftIcon,
  InfoIcon,
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
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-q-field px-4 py-3 text-[13px] leading-5 text-q-sub">
          <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Sample details for demonstration only. This is not verified live account activity.</span>
        </p>
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
        on this page.
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
  return (
    <div className="pt-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
        <ShieldAlertIcon className="h-6 w-6" />
      </div>
      <h1 className="q-h1 mt-4">Thanks for letting us know</h1>
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

      <p className="q-sub mt-6 rounded-2xl bg-q-field px-4 py-4">
        This page will never ask you to enter your password, a verification code, or payment details. Always make
        account changes by going directly to the app yourself.
      </p>

      <button onClick={onBack} className="q-btn q-btn-secondary mt-8">
        Back
      </button>
    </div>
  );
}
