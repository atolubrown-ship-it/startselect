"use client";

import { forwardRef } from "react";
import { MenuIcon, CloseIcon, SearchIcon, AccountIcon, CartIcon } from "@/components/icons";
import BrandLogo from "@/components/BrandLogo";
import { HEADER_VARIANTS } from "@/components/headerStyles";
import { useSettings, useT } from "@/components/SettingsProvider";

type HeaderProps = {
  menuOpen: boolean;
  onToggleMenu: () => void;
};

/**
 * Header proportions (mobile, 4px grid):
 *   row 1  — min 44px: logo on the left (height set in the Admin Portal),
 *            account + cart (24px icons inside 44px touch targets) on the right
 *   gap    — 8px
 *   row 2  — 44px: hamburger (24px icon) + rounded search field
 * Both rows share the 16px page margin; icon artwork (not its touch target)
 * lines up with that margin. Colours come from the header style setting.
 */
const Header = forwardRef<HTMLElement, HeaderProps>(function Header({ menuOpen, onToggleMenu }, ref) {
  const { settings } = useSettings();
  const { t } = useT();
  const variant = HEADER_VARIANTS[settings.headerStyle];
  const hasLogoLink = !!settings.logoLinkUrl;

  return (
    <header
      ref={ref}
      className={`sticky top-0 z-40 border-b ${variant.bar}`}
      style={{ paddingTop: "env(safe-area-inset-top)", ...variant.style }}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 pb-3 pt-3 sm:px-6 md:flex-nowrap md:py-3">
        {/* Logo + company name (shared component). Links to the URL set in the
            Admin Portal's "Logo link" field; with none set, it just scrolls to the top. */}
        <a
          href={settings.logoLinkUrl || "#main"}
          target={hasLogoLink ? "_blank" : undefined}
          rel={hasLogoLink ? "noopener noreferrer" : undefined}
          className="flex min-h-[44px] min-w-0 shrink items-center"
          aria-label={t("header_homeAria", { name: settings.siteName })}
        >
          <BrandLogo />
        </a>

        {/* Account + cart — evenly spaced, last icon's artwork sits on the right margin */}
        <div className="-mr-2.5 ml-auto flex shrink-0 items-center md:order-3">
          <a href="#" aria-label={t("header_account")} className="flex h-11 w-11 items-center justify-center">
            <AccountIcon className="h-6 w-6" />
          </a>
          <a href="#" aria-label={t("header_cart")} className="flex h-11 w-11 items-center justify-center">
            <CartIcon className="h-6 w-6" />
          </a>
        </div>

        {/* Hamburger + search */}
        <div className="order-last flex w-full items-center gap-[3px] md:order-2 md:w-auto md:flex-1 md:gap-1">
          <button
            type="button"
            aria-label={menuOpen ? t("header_closeMenu") : t("header_openMenu")}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={onToggleMenu}
            className="-ml-2.5 flex h-11 w-11 shrink-0 items-center justify-center"
          >
            {menuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
          <div
            className={`flex h-11 min-w-0 flex-1 items-center gap-3 rounded-full px-4 text-q-ink md:max-w-xl ${variant.field}`}
          >
            <SearchIcon className="h-[18px] w-[18px] shrink-0" />
            <label htmlFor="site-search" className="sr-only">
              {t("header_search")}
            </label>
            <input
              id="site-search"
              type="search"
              placeholder={t("header_search")}
              className="h-full w-full min-w-0 bg-transparent text-[16px] leading-6 text-q-ink outline-none placeholder:text-q-mute"
            />
          </div>
        </div>
      </div>
    </header>
  );
});

export default Header;
