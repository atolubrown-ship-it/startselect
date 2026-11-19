"use client";

import { forwardRef } from "react";
import { MenuIcon, CloseIcon, SearchIcon, AccountIcon, CartIcon } from "@/components/icons";

type HeaderProps = {
  menuOpen: boolean;
  onToggleMenu: () => void;
};

const Header = forwardRef<HTMLElement, HeaderProps>(function Header({ menuOpen, onToggleMenu }, ref) {
  return (
    <header ref={ref} className="sticky top-0 z-40 border-b border-q-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 px-4 pt-3 sm:px-6 md:flex-nowrap md:py-3">
        {/* Logo */}
        <a href="#main" className="flex shrink-0 items-center gap-2.5" aria-label="Quilo home">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
            <path
              d="M22 3.5l16 9.2v18.6L22 40.5 6 31.3V12.7L22 3.5z"
              stroke="#25282d"
              strokeWidth="2.6"
              strokeLinejoin="round"
            />
            <circle cx="22" cy="22" r="6" fill="#7c3aed" />
            <circle cx="22" cy="22" r="2.2" fill="#6fe8c8" />
          </svg>
          <span className="text-[30px] font-bold leading-none tracking-tight text-q-ink">Quilo</span>
        </a>

        {/* Account + cart */}
        <div className="ml-auto flex items-center gap-1 md:order-3">
          <a href="#" aria-label="Account" className="flex h-11 w-11 items-center justify-center">
            <AccountIcon className="h-[34px] w-[34px]" />
          </a>
          <a href="#" aria-label="Cart" className="flex h-11 w-11 items-center justify-center text-q-ink">
            <CartIcon className="h-[30px] w-[30px]" />
          </a>
        </div>

        {/* Hamburger + search */}
        <div className="order-last flex w-full items-center gap-3 pb-3 pt-1 md:order-2 md:flex-1 md:py-0 md:pt-0">
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={onToggleMenu}
            className="-ml-1 flex h-11 w-11 shrink-0 items-center justify-center text-q-ink"
          >
            {menuOpen ? <CloseIcon className="h-[26px] w-[26px]" /> : <MenuIcon className="h-[26px] w-[26px]" />}
          </button>
          <div className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-full bg-q-field px-4 md:max-w-xl">
            <SearchIcon className="h-5 w-5 shrink-0 text-q-ink" />
            <label htmlFor="help-search" className="sr-only">
              Search security help
            </label>
            <input
              id="help-search"
              type="search"
              placeholder="Search for help"
              className="w-full min-w-0 bg-transparent text-[17px] text-q-ink outline-none placeholder:text-q-mute"
            />
          </div>
        </div>
      </div>
    </header>
  );
});

export default Header;
