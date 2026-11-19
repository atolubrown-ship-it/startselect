"use client";

import type { ReactNode } from "react";
import {
  ChevronRightIcon,
  HomeFillIcon,
  HelpFillIcon,
  ChatFillIcon,
  LockFillIcon,
  ShieldFillIcon,
} from "@/components/icons";
import { useSettings } from "@/components/SettingsProvider";
import { countryName, flagEmoji } from "@/lib/countries";
import { readableOn } from "@/lib/settings";

type MenuPanelProps = {
  open: boolean;
  onClose: () => void;
  onHome: () => void;
};

function Divider() {
  return <div className="my-6 h-px bg-q-line" />;
}

function IconRow({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <li>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
        className="q-nav flex min-h-[52px] items-center gap-4 py-2"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center">{icon}</span>
        <span className="flex-1">{label}</span>
        <ChevronRightIcon className="h-5 w-5 shrink-0 text-q-sub" />
      </a>
    </li>
  );
}

function PlainRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <li>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
        className="q-nav flex min-h-[52px] items-center justify-between py-2"
      >
        <span>{label}</span>
        <ChevronRightIcon className="h-5 w-5 shrink-0 text-q-sub" />
      </a>
    </li>
  );
}

export default function MenuPanel({ open, onClose, onHome }: MenuPanelProps) {
  const { settings } = useSettings();
  const name = settings.siteName;
  return (
    <div
      id="site-menu"
      aria-hidden={!open}
      style={{ top: "var(--header-h, 124px)" }}
      className={`fixed inset-x-0 bottom-0 z-30 overflow-y-auto overscroll-contain bg-white transition-[opacity,transform,visibility] duration-200 ${
        open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
      }`}
    >
      <nav
        aria-label="Main menu"
        className="mx-auto max-w-xl px-4 pt-6 sm:px-6"
        style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}
      >
        <h2 className="q-h2 mb-2">Security</h2>
        <ul>
          <IconRow icon={<HomeFillIcon className="h-7 w-7" />} label="Home" onClick={() => { onHome(); onClose(); }} />
          <IconRow icon={<HelpFillIcon className="h-7 w-7" />} label="Help Center" onClick={onClose} />
          <IconRow icon={<ChatFillIcon className="h-7 w-7" />} label="Contact Support" onClick={onClose} />
          <IconRow icon={<LockFillIcon className="h-7 w-7" />} label="Privacy Policy" onClick={onClose} />
        </ul>

        <Divider />

        {/* Highlighted row — gradient outline */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="block rounded-2xl p-[2px]"
          style={{ backgroundImage: "linear-gradient(90deg, var(--q-secondary), var(--q-primary) 55%, var(--q-accent))" }}
        >
          <span className="q-nav flex min-h-[56px] items-center gap-4 rounded-[14px] bg-white px-4 py-3">
            <ShieldFillIcon className="h-7 w-7 shrink-0" />
            <span className="flex-1">Secure your account</span>
            <ChevronRightIcon className="h-5 w-5 shrink-0 text-q-sub" />
          </span>
        </a>

        <ul className="mt-3">
          <PlainRow label={`About ${name}`} onClick={onClose} />
        </ul>

        {settings.showPreferences && (
          <>
            <Divider />

            <h3 className="q-h3">{settings.prefsHeading}</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="q-nav flex min-h-[44px] items-center gap-3 rounded-full border border-q-line px-5">
                <span aria-hidden="true" className="text-[20px] leading-none">
                  {flagEmoji(settings.countryCode)}
                </span>
                {countryName(settings.countryCode)}
              </span>
              <span className="q-nav flex min-h-[44px] items-center rounded-full border border-q-line px-5">
                {settings.languageName}
              </span>
            </div>
            {settings.prefsNote && <p className="q-sub mt-4">{settings.prefsNote}</p>}
          </>
        )}

        {settings.showSignIn && (
          <>
            <Divider />

            <a
              href={settings.signInUrl || "#"}
              target={settings.signInUrl ? "_blank" : undefined}
              rel={settings.signInUrl ? "noopener noreferrer" : undefined}
              onClick={(e) => {
                if (!settings.signInUrl) e.preventDefault();
                onClose();
              }}
              className={`q-btn q-btn-primary gap-3 ${settings.signInColor ? "hover:brightness-95 active:brightness-95" : ""}`}
              style={
                settings.signInColor
                  ? { backgroundColor: settings.signInColor, color: readableOn(settings.signInColor) }
                  : undefined
              }
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="7.5" r="4.5" fill="currentColor" />
                <path d="M3.5 21c0-4.8 3.8-7.5 8.5-7.5s8.5 2.7 8.5 7.5z" fill="currentColor" />
              </svg>
              {settings.signInLabel}
            </a>
          </>
        )}
      </nav>
    </div>
  );
}
