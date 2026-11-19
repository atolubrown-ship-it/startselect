"use client";

import { MenuIcon, CloseIcon } from "@/components/icons";

export default function Header({
  menuOpen,
  onToggleMenu,
}: {
  menuOpen: boolean;
  onToggleMenu: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3.5">
        <a href="#" className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 32 32" aria-hidden="true">
            <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" fill="none" stroke="#2563EB" strokeWidth="2.2" />
            <circle cx="16" cy="16" r="4" fill="#7C3AED" />
          </svg>
          <span className="text-lg font-extrabold tracking-tight text-ink-900">quilo</span>
        </a>

        <button
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={onToggleMenu}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 text-ink-700"
        >
          {menuOpen ? (
            <CloseIcon className="h-[18px] w-[18px]" />
          ) : (
            <MenuIcon className="h-[18px] w-[18px]" />
          )}
        </button>
      </div>
    </header>
  );
}
