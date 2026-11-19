"use client";

import { MenuIcon, CloseIcon } from "@/components/icons";

export default function Header({ menuOpen, onToggleMenu }: { menuOpen: boolean; onToggleMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-[68px] max-w-6xl items-center gap-4 px-4 sm:px-6">
        <a href="#main" className="flex shrink-0 items-center gap-2.5" aria-label="Quilo security demo home">
          <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
            <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" fill="none" stroke="#2563EB" strokeWidth="2.2" />
            <circle cx="16" cy="16" r="4" fill="#7C3AED" />
          </svg>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">Quilo</span>
          <span className="hidden rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:inline-flex">Security demo</span>
        </a>
        <div className="ml-auto hidden w-full max-w-sm md:block">
          <label htmlFor="help-search" className="sr-only">Search security help</label>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
            <span aria-hidden="true">⌕</span><input id="help-search" placeholder="Search security help" className="w-full bg-transparent outline-none placeholder:text-slate-400" />
          </div>
        </div>
        <button aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={onToggleMenu} className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 md:ml-3">
          {menuOpen ? <CloseIcon className="h-[18px] w-[18px]" /> : <MenuIcon className="h-[18px] w-[18px]" />}
        </button>
      </div>
    </header>
  );
}
