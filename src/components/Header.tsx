"use client";

import { forwardRef } from "react";
import { MenuIcon, CloseIcon, SearchIcon, AccountIcon, CartIcon } from "@/components/icons";

type HeaderProps = {
  menuOpen: boolean;
  onToggleMenu: () => void;
};

/**
 * Header proportions (mobile, 4px grid):
 *   row 1  — 44px: logo mark 32px + wordmark 26px on the left, account + cart
 *            (24–26px icons inside 44px touch targets) on the right
 *   gap    — 8px
 *   row 2  — 44px: hamburger (24px icon) + rounded search field
 * Both rows share the 16px page margin; icon artwork (not its touch target)
 * lines up with that margin.
 */
const Header = forwardRef<HTMLElement, HeaderProps>(function Header({ menuOpen, onToggleMenu }, ref) {
  return (
    <header
      ref={ref}
      className="sticky top-0 z-40 border-b border-q-line bg-white"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 pb-3 pt-4 sm:px-6 md:flex-nowrap md:py-3">
        {/* Logo — fixed-size mark keeps its 1:1 ratio; wordmark shares its centre line */}
        <a href="#main" className="flex h-11 shrink-0 items-center gap-2.5" aria-label="Quilo home">
          <svg
            width="32"
            height="32"
            viewBox="0 0 44 44"
            fill="none"
            aria-hidden="true"
            className="h-8 w-8 shrink-0"
          >
            <path
              d="M22 3.5l16 9.2v18.6L22 40.5 6 31.3V12.7L22 3.5z"
              stroke="#25282d"
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
            <circle cx="22" cy="22" r="6" fill="#7c3aed" />
            <circle cx="22" cy="22" r="2.2" fill="#6fe8c8" />
          </svg>
          <span className="text-[26px] font-bold leading-none tracking-[-0.02em] text-q-ink">Quilo</span>
        </a>

        {/* Account + cart — evenly spaced, last icon's artwork sits on the right margin */}
        <div className="-mr-2.5 ml-auto flex items-center md:order-3">
          <a href="#" aria-label="Account" className="flex h-11 w-11 items-center justify-center">
            <AccountIcon className="h-[26px] w-[26px]" />
          </a>
          <a href="#" aria-label="Cart" className="flex h-11 w-11 items-center justify-center text-q-ink">
            <CartIcon className="h-6 w-6" />
          </a>
        </div>

        {/* Hamburger + search */}
        <div className="order-last flex w-full items-center gap-[3px] md:order-2 md:w-auto md:flex-1 md:gap-1">
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={onToggleMenu}
            className="-ml-2.5 flex h-11 w-11 shrink-0 items-center justify-center text-q-ink"
          >
            {menuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
          <div className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-full bg-q-field px-4 md:max-w-xl">
            <SearchIcon className="h-[18px] w-[18px] shrink-0 text-q-ink" />
            <label htmlFor="help-search" className="sr-only">
              Search security help
            </label>
            <input
              id="help-search"
              type="search"
              placeholder="Search for help"
              className="h-full w-full min-w-0 bg-transparent text-[16px] leading-6 text-q-ink outline-none placeholder:text-q-mute"
            />
          </div>
        </div>
      </div>
    </header>
  );
});

export default Header;
