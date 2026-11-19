"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
  YouTubeIcon,
  TwitchIcon,
  LinkedInIcon,
  PhoneIcon,
} from "@/components/icons";
import BrandLogo from "@/components/BrandLogo";
import { useSettings } from "@/components/SettingsProvider";
import { fillName, type LegalKey, type SocialKey } from "@/lib/settings";

/** Shared horizontal grid — identical to the header and <main> so everything lines up. */
const GRID = "mx-auto w-full max-w-6xl px-4 sm:px-6";

/**
 * Link group. On phones it is a tap-to-expand accordion (tap again to close);
 * from `md` up it becomes a plain always-open column (no chevron, not clickable).
 */
function Accordion({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div className="border-b border-white/80 md:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="q-h3 flex min-h-[56px] w-full items-center justify-between py-4 text-left md:pointer-events-none md:min-h-0 md:pb-3 md:pt-0"
      >
        {title}
        <ChevronDownIcon className={`h-5 w-5 text-q-sub transition-transform md:hidden ${open ? "rotate-180" : ""}`} />
      </button>
      <div id={panelId} className={`${open ? "block" : "hidden"} pb-4 md:block md:pb-0`}>
        {children}
      </div>
    </div>
  );
}

const SOCIALS: { key: SocialKey; label: string; Icon: (p: React.SVGProps<SVGSVGElement>) => JSX.Element }[] = [
  { key: "instagram", label: "Instagram", Icon: InstagramIcon },
  { key: "facebook", label: "Facebook", Icon: FacebookIcon },
  { key: "tiktok", label: "TikTok", Icon: TikTokIcon },
  { key: "youtube", label: "YouTube", Icon: YouTubeIcon },
  { key: "twitch", label: "Twitch", Icon: TwitchIcon },
  { key: "linkedin", label: "LinkedIn", Icon: LinkedInIcon },
];

const LEGAL: { key: LegalKey; label: string }[] = [
  { key: "terms", label: "Terms & Conditions" },
  { key: "privacy", label: "Privacy Policy" },
  { key: "cookies", label: "Cookie Statement" },
  { key: "accessibility", label: "Accessibility" },
  { key: "sitemap", label: "Sitemap" },
];

const LINK = "q-body flex min-h-[44px] items-center hover:text-q-ink md:min-h-[36px]";
const LEGAL_LINK = "q-sub flex min-h-[44px] items-center hover:text-q-ink";

export default function Footer() {
  const { settings } = useSettings();
  const name = settings.siteName;
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 240);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const badge = (
    <span className="inline-flex h-[52px] min-w-[168px] items-center gap-3 rounded-[10px] border border-[#a6a6a6] bg-black px-4 text-white">
      <PhoneIcon className="h-7 w-7 shrink-0" />
      <span className="flex min-w-0 flex-col text-left leading-none">
        <span className="text-[10px] font-medium tracking-[0.06em] text-white">Download on the</span>
        <span className="mt-1 max-w-[190px] truncate text-[20px] font-semibold tracking-[-0.01em]">{name} app</span>
      </span>
    </span>
  );

  return (
    <footer className="mt-12 text-q-ink">
      {/* A — Supporting information */}
      <section aria-labelledby="footer-info" className="bg-q-panel">
        <div className={`${GRID} py-8 md:py-10`}>
          <div className="text-q-ink">
            <BrandLogo scale={0.85} />
          </div>
          <h2 id="footer-info" className="q-h3 mt-5">
            Account security, made simple
          </h2>
          <p className="q-sub mt-2 max-w-md">
            {name} will never ask for your password or a verification code on this page. If something looks
            unfamiliar, review your recent sign-ins and let us know.
          </p>
          <a href="#main" className="mt-1 inline-flex min-h-[44px] items-center text-[14px] font-medium text-q-blue hover:underline">
            Review this alert
          </a>
        </div>
      </section>

      {/* B + C + D — expandable navigation, app promotion, social */}
      <div className="bg-q-panel2">
        <div className={`${GRID} md:grid md:grid-cols-4 md:gap-x-10 md:py-12`}>
          {/* B — Expandable navigation */}
          <div className="border-t border-white/80 md:contents md:border-t-0">
            <Accordion title="Help center">
              <nav aria-label="Help" className="flex flex-col">
                <a href="#site-search" className={LINK}>
                  Help
                </a>
                <a href="#main" className={LINK}>
                  Alert overview
                </a>
                <a href="#main" className={LINK}>
                  Contact support
                </a>
              </nav>
            </Accordion>
            <Accordion title={name}>
              <nav aria-label={`About ${name}`} className="flex flex-col">
                <a href="#main" className={LINK}>
                  About {name}
                </a>
                <a href="#main" className={LINK}>
                  Privacy information
                </a>
                <a href="#main" className={LINK}>
                  Secure your account
                </a>
              </nav>
            </Accordion>
          </div>

          {/* C — App promotion */}
          <section aria-labelledby="footer-app" className="py-8 text-center md:py-0 md:text-left">
            <h2 id="footer-app" className="q-h2">
              {settings.appPromoHeading}
            </h2>
            <p className="q-body mx-auto mt-3 max-w-sm md:mx-0">{fillName(settings.appPromoText, name)}</p>
            <div className="mt-5 flex flex-col items-center md:items-start">
              {settings.appStoreUrl ? (
                <a href={settings.appStoreUrl} target="_blank" rel="noopener noreferrer" aria-label={`Get the ${name} app`}>
                  {badge}
                </a>
              ) : (
                <>
                  <span aria-disabled="true">{badge}</span>
                  <span className="q-sub mt-2">Coming soon</span>
                </>
              )}
            </div>
          </section>

          {/* D — Social media */}
          <section aria-labelledby="footer-follow" className="pb-10 text-center md:pb-0 md:text-left">
            <h2 id="footer-follow" className="q-h2">
              Follow us!
            </h2>
            <p className="q-body mx-auto mt-3 max-w-sm md:mx-0">
              Stay informed about our latest updates and news from {name} via our social media channels.
            </p>
            <ul className="mx-auto mt-5 flex max-w-[320px] items-center justify-between md:mx-0 md:-ml-2.5 md:max-w-none md:justify-start md:gap-1">
              {SOCIALS.map(({ key, label, Icon }) => {
                const href = settings.socials[key];
                return (
                  <li key={key}>
                    <a
                      href={href || "#"}
                      target={href ? "_blank" : undefined}
                      rel={href ? "noopener noreferrer" : undefined}
                      onClick={href ? undefined : (e: React.MouseEvent) => e.preventDefault()}
                      aria-label={label}
                      className="flex h-11 w-11 items-center justify-center text-q-ink"
                    >
                      <Icon className="h-6 w-6" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>

      {/* E + F — Legal links and copyright */}
      <div className="bg-q-field pt-6" style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}>
        <div className={GRID}>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6">
            {LEGAL.map(({ key, label }) => {
              const href = settings.footerLinks[key];
              return (
                <a
                  key={key}
                  href={href || "#"}
                  target={href ? "_blank" : undefined}
                  rel={href ? "noopener noreferrer" : undefined}
                  onClick={href ? undefined : (e: React.MouseEvent) => e.preventDefault()}
                  className={LEGAL_LINK}
                >
                  {label}
                </a>
              );
            })}
          </nav>
          <div className="mt-4 border-t border-q-line pt-4">
            <p className="q-sub">
              © <span suppressHydrationWarning>{new Date().getFullYear()}</span> {name}. All rights reserved.
            </p>
            <p className="q-sub mt-1">Demonstration interface using sample sign-in details.</p>
          </div>
        </div>
      </div>

      {/* Back to top */}
      <button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed right-4 z-20 flex h-11 w-11 items-center justify-center rounded-xl bg-q-blue text-[color:var(--q-primary-ink)] shadow-card transition-opacity duration-200 ${
          showTop ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        <ChevronUpIcon className="h-5 w-5" />
      </button>
    </footer>
  );
}
