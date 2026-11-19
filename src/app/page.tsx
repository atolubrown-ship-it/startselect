"use client";

import { useState } from "react";
import Header from "@/components/Header";
import MenuPanel from "@/components/MenuPanel";
import {
  ShieldAlertIcon,
  CheckIcon,
  PinIcon,
  DeviceIcon,
  ClockIcon,
} from "@/components/icons";

type View = "alert" | "recognized" | "notme";

const LOGIN_DETAILS = {
  location: "Lagos, Nigeria (approximate)",
  device: "Chrome on Windows 11",
  time: "Nov 19, 2026 · 3:42 PM WAT",
};

export default function SecurityAlertPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState<View>("alert");

  return (
    <div className="min-h-screen bg-white">
      <Header menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((v) => !v)} />
      <MenuPanel open={menuOpen} onClose={() => setMenuOpen(false)} />

      <main id="main" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-xl">
        <div className="mb-6 md:hidden">
          <label htmlFor="mobile-help-search" className="sr-only">Search security help</label>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500"><span aria-hidden="true">⌕</span><input id="mobile-help-search" placeholder="Search security help" className="w-full bg-transparent outline-none placeholder:text-slate-400" /></div>
        </div>
        {view === "alert" && (
          <AlertScreen
            onRecognized={() => setView("recognized")}
            onNotMe={() => setView("notme")}
          />
        )}
        {view === "recognized" && <RecognizedScreen onBack={() => setView("alert")} />}
        {view === "notme" && <NotMeScreen onBack={() => setView("alert")} />}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-7 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div><p className="font-semibold text-slate-800">Quilo · Security demo</p><p className="mt-1 text-xs text-slate-500">Illustrative interface using sample sign-in details.</p></div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 text-slate-600"><a href="#main" className="hover:text-slate-900">Alert overview</a><a href="#help-search" className="hover:text-slate-900">Help</a><a href="#main" className="hover:text-slate-900">Privacy information</a></nav>
      </div>
    </footer>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-700">
        {icon}
      </span>
      <div>
        <p className="text-xs text-ink-500">{label}</p>
        <p className="text-sm font-medium text-ink-900">{value}</p>
      </div>
    </div>
  );
}

function AlertScreen({
  onRecognized,
  onNotMe,
}: {
  onRecognized: () => void;
  onNotMe: () => void;
}) {
  return (
    <div>
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
        <ShieldAlertIcon className="h-6 w-6" />
      </div>

      <h1 className="text-xl font-bold text-ink-900">Security alert</h1>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
        We noticed a sign-in to your Quilo account from a location and device we
        don&apos;t recognize. If this was you, you don&apos;t need to do anything.
      </p>

      <div className="mt-5 rounded-xl2 border border-amber-100 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-800">
        This location doesn&apos;t match where you usually sign in from.
      </div>

      <div className="mt-2 divide-y divide-ink-100 rounded-xl2 border border-ink-100 px-4">
        <DetailRow icon={<PinIcon className="h-4 w-4" />} label="Location" value={LOGIN_DETAILS.location} />
        <DetailRow icon={<DeviceIcon className="h-4 w-4" />} label="Device & browser" value={LOGIN_DETAILS.device} />
        <DetailRow icon={<ClockIcon className="h-4 w-4" />} label="Date & time" value={LOGIN_DETAILS.time} />
      </div>

      <p className="mt-5 text-xs leading-relaxed text-ink-500">
        Letting us know helps keep your account secure. We&apos;ll never ask for your
        password or a verification code on this page.
      </p>

      <div className="mt-6 flex flex-col gap-2.5">
        <button
          onClick={onNotMe}
          className="w-full rounded-xl bg-brand-600 px-5 py-3.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          This wasn&apos;t me
        </button>
        <button
          onClick={onRecognized}
          className="w-full rounded-xl border border-ink-300 px-5 py-3.5 text-sm font-semibold text-ink-900 hover:bg-ink-100"
        >
          Yes, this was me
        </button>
      </div>
    </div>
  );
}

function RecognizedScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckIcon className="h-6 w-6" />
      </div>
      <h1 className="text-xl font-bold text-ink-900">Thanks for confirming</h1>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-ink-500">
        No further action is needed. We&apos;ll keep monitoring your account for
        anything unusual.
      </p>
      <button
        onClick={onBack}
        className="mt-6 rounded-xl border border-ink-300 px-5 py-2.5 text-sm font-semibold text-ink-900 hover:bg-ink-100"
      >
        Back
      </button>
    </div>
  );
}

function NotMeScreen({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
        <ShieldAlertIcon className="h-6 w-6" />
      </div>
      <h1 className="text-xl font-bold text-ink-900">Thanks for letting us know</h1>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
        We&apos;ve recorded that you don&apos;t recognize this sign-in. Here&apos;s what
        we recommend next:
      </p>

      <ul className="mt-5 flex flex-col gap-3">
        <li className="flex items-start gap-3 rounded-xl2 border border-ink-100 p-3.5">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
            1
          </span>
          <p className="text-sm text-ink-700">
            Sign in to your account the way you normally do, and update your
            password from your account settings.
          </p>
        </li>
        <li className="flex items-start gap-3 rounded-xl2 border border-ink-100 p-3.5">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
            2
          </span>
          <p className="text-sm text-ink-700">
            Review your active sessions and sign out of any devices you
            don&apos;t recognize.
          </p>
        </li>
        <li className="flex items-start gap-3 rounded-xl2 border border-ink-100 p-3.5">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
            3
          </span>
          <p className="text-sm text-ink-700">
            Contact support if you notice anything else out of the ordinary.
          </p>
        </li>
      </ul>

      <p className="mt-5 rounded-xl2 bg-ink-100 px-4 py-3 text-xs leading-relaxed text-ink-700">
        This page will never ask you to enter your password, a verification
        code, or payment details. Always make account changes by going
        directly to the app yourself.
      </p>

      <button
        onClick={onBack}
        className="mt-6 w-full rounded-xl border border-ink-300 px-5 py-3 text-sm font-semibold text-ink-900 hover:bg-ink-100"
      >
        Back
      </button>
    </div>
  );
}
