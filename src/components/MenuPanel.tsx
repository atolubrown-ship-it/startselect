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

type MenuPanelProps = {
  open: boolean;
  onClose: () => void;
  onHome: () => void;
};

function Divider() {
  return <div className="my-5 h-px bg-q-line" />;
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
        className="flex items-center gap-4 py-3 text-[19px] text-q-ink"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center">{icon}</span>
        <span className="flex-1">{label}</span>
        <ChevronRightIcon className="h-5 w-5 shrink-0 text-q-ink" />
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
        className="flex items-center justify-between py-3 text-[19px] text-q-ink"
      >
        <span>{label}</span>
        <ChevronRightIcon className="h-5 w-5 shrink-0 text-q-ink" />
      </a>
    </li>
  );
}

export default function MenuPanel({ open, onClose, onHome }: MenuPanelProps) {
  return (
    <div
      id="site-menu"
      aria-hidden={!open}
      style={{ top: "var(--header-h, 112px)" }}
      className={`fixed inset-x-0 bottom-0 z-30 overflow-y-auto overscroll-contain bg-white transition-[opacity,transform,visibility] duration-200 ${
        open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
      }`}
    >
      <nav
        aria-label="Main menu"
        className="mx-auto max-w-xl px-6 pt-7"
        style={{ paddingBottom: "calc(2.5rem + env(safe-area-inset-bottom))" }}
      >
        <h2 className="mb-3 text-[26px] font-bold text-q-ink">Security</h2>
        <ul>
          <IconRow icon={<HomeFillIcon className="h-8 w-8" />} label="Home" onClick={() => { onHome(); onClose(); }} />
          <IconRow icon={<HelpFillIcon className="h-8 w-8" />} label="Help Center" onClick={onClose} />
          <IconRow icon={<ChatFillIcon className="h-8 w-8" />} label="Contact Support" onClick={onClose} />
          <IconRow icon={<LockFillIcon className="h-8 w-8" />} label="Privacy Policy" onClick={onClose} />
        </ul>

        <Divider />

        {/* Highlighted row — gradient outline */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="block rounded-2xl bg-gradient-to-r from-[#6c5ce7] via-[#5b8def] to-[#6fe8c8] p-[2px]"
        >
          <span className="flex items-center gap-4 rounded-[14px] bg-white px-4 py-4 text-[19px] text-q-ink">
            <ShieldFillIcon className="h-8 w-8 shrink-0" />
            <span className="flex-1">Secure your account</span>
            <ChevronRightIcon className="h-5 w-5 shrink-0" />
          </span>
        </a>

        <ul className="mt-2">
          <PlainRow label="About Quilo" onClick={onClose} />
        </ul>

        <Divider />

        <h3 className="text-[22px] font-semibold text-q-ink">Your preferences</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="#" onClick={(e) => e.preventDefault()} className="rounded-full border border-q-line px-5 py-2.5 text-[17px] text-q-ink">
            Worldwide
          </a>
          <a href="#" onClick={(e) => e.preventDefault()} className="rounded-full border border-q-line px-5 py-2.5 text-[17px] text-q-ink">
            English
          </a>
        </div>
        <p className="mt-4 text-[17px] leading-relaxed text-q-mute">
          Tap here to change region/language. Note: some features may not be available in all regions.
        </p>

        <Divider />

        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="flex h-[52px] items-center justify-center gap-3 rounded-xl bg-q-yellow text-[18px] font-semibold text-q-ink"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="7.5" r="4.5" fill="currentColor" />
            <path d="M3.5 21c0-4.8 3.8-7.5 8.5-7.5s8.5 2.7 8.5 7.5z" fill="currentColor" />
          </svg>
          Sign in to Quilo
        </a>
      </nav>
    </div>
  );
}
