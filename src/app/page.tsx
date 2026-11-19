"use client";

import { useEffect, useState } from "react";
import SiteShell from "@/components/SiteShell";
import {
  ShieldAlertIcon,
  CheckIcon,
  PinIcon,
  DeviceIcon,
  ClockIcon,
  ChevronLeftIcon,
} from "@/components/icons";

type View = "alert" | "recognized" | "notme";

const LOGIN_DETAILS = {
  location: "Lagos, Nigeria (approximate)",
  device: "Chrome on Windows 11",
  time: "Nov 19, 2026 · 3:42 PM WAT",
};

const PRIMARY_BTN =
  "w-full rounded-xl bg-q-blue px-5 py-3.5 text-[18px] font-semibold text-white active:bg-q-blue-dark hover:bg-q-blue-dark";
const SECONDARY_BTN =
  "w-full rounded-xl border border-q-line bg-white px-5 py-3.5 text-[18px] font-semibold text-q-ink hover:bg-q-field";

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
      className="-ml-1 flex h-11 items-center gap-3 px-1 text-[17px] uppercase tracking-wide text-q-ink"
    >
      <ChevronLeftIcon className="h-6 w-6 text-q-body" />
      {atHome ? "Home" : "Security alert"}
    </button>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3.5">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-q-field text-q-ink">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[14px] text-q-mute">{label}</p>
        <p className="text-[17px] font-medium text-q-ink">{value}</p>
      </div>
    </div>
  );
}

function AlertScreen({ onRecognized, onNotMe }: { onRecognized: () => void; onNotMe: () => void }) {
  return (
    <div className="pt-4">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
        <ShieldAlertIcon className="h-6 w-6" />
      </div>

      <h1 className="text-[32px] font-bold leading-tight text-q-ink">Security alert</h1>
      <p className="mt-3 text-[17px] leading-relaxed text-q-body">
        We noticed a sign-in to your Quilo account from a location and device we don&apos;t recognize. If this was
        you, you don&apos;t need to do anything.
      </p>

      <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-[15px] font-medium text-amber-800">
        This location doesn&apos;t match where you usually sign in from.
      </div>

      <div className="mt-3 divide-y divide-q-field rounded-2xl border border-q-line px-4">
        <DetailRow icon={<PinIcon className="h-[18px] w-[18px]" />} label="Location" value={LOGIN_DETAILS.location} />
        <DetailRow icon={<DeviceIcon className="h-[18px] w-[18px]" />} label="Device & browser" value={LOGIN_DETAILS.device} />
        <DetailRow icon={<ClockIcon className="h-[18px] w-[18px]" />} label="Date & time" value={LOGIN_DETAILS.time} />
      </div>

      <p className="mt-5 text-[15px] leading-relaxed text-q-body">
        Letting us know helps keep your account secure. We&apos;ll never ask for your password or a verification code
        on this page.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <button onClick={onNotMe} className={PRIMARY_BTN}>
          This wasn&apos;t me
        </button>
        <button onClick={onRecognized} className={SECONDARY_BTN}>
          Yes, this was me
        </button>
      </div>
    </div>
  );
}

function RecognizedScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center pt-10 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckIcon className="h-6 w-6" />
      </div>
      <h1 className="text-[32px] font-bold leading-tight text-q-ink">Thanks for confirming</h1>
      <p className="mt-3 max-w-xs text-[17px] leading-relaxed text-q-body">
        No further action is needed. We&apos;ll keep monitoring your account for anything unusual.
      </p>
      <button onClick={onBack} className={`${SECONDARY_BTN} mt-8`}>
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
    <div className="pt-4">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
        <ShieldAlertIcon className="h-6 w-6" />
      </div>
      <h1 className="text-[32px] font-bold leading-tight text-q-ink">Thanks for letting us know</h1>
      <p className="mt-3 text-[17px] leading-relaxed text-q-body">
        We&apos;ve recorded that you don&apos;t recognize this sign-in. Here&apos;s what we recommend next:
      </p>

      <ul className="mt-5 flex flex-col gap-3">
        {NEXT_STEPS.map((text, i) => (
          <li key={i} className="flex items-start gap-3 rounded-2xl border border-q-line p-4">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[14px] font-bold text-q-blue">
              {i + 1}
            </span>
            <p className="text-[16px] leading-relaxed text-q-body">{text}</p>
          </li>
        ))}
      </ul>

      <p className="mt-5 rounded-2xl bg-q-field px-4 py-3.5 text-[15px] leading-relaxed text-q-body">
        This page will never ask you to enter your password, a verification code, or payment details. Always make
        account changes by going directly to the app yourself.
      </p>

      <button onClick={onBack} className={`${SECONDARY_BTN} mt-6`}>
        Back
      </button>
    </div>
  );
}
