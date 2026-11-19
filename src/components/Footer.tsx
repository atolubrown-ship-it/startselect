"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
  YouTubeIcon,
  TwitchIcon,
  LinkedInIcon,
} from "@/components/icons";

/** Shared horizontal grid — identical to the header and <main> so everything lines up. */
const GRID = "mx-auto w-full max-w-6xl px-4 sm:px-6";

/**
 * Link group. On phones it is a tap-to-expand accordion; from `md` up it
 * becomes a plain always-open column (no chevron, not clickable).
 */
function Accordion({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/80 md:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="q-h3 flex min-h-[56px] w-full items-center justify-between py-4 text-left md:pointer-events-none md:min-h-0 md:pb-3 md:pt-0"
      >
        {title}
        <ChevronDownIcon className={`h-5 w-5 text-q-sub transition-transform md:hidden ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`${open ? "block" : "hidden"} pb-5 md:block md:pb-0`}>{children}</div>
    </div>
  );
}

const SOCIALS = [
  { label: "Instagram", Icon: InstagramIcon },
  { label: "Facebook", Icon: FacebookIcon },
  { label: "TikTok", Icon: TikTokIcon },
  { label: "YouTube", Icon: YouTubeIcon },
  { label: "Twitch", Icon: TwitchIcon },
  { label: "LinkedIn", Icon: LinkedInIcon },
];

const LINK = "q-body flex min-h-[44px] items-center hover:text-q-ink md:min-h-[36px]";

export default function Footer() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 240);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <footer className="mt-16 bg-q-panel text-q-ink">
      {/* Link groups + follow us */}
      <div className="bg-q-panel2">
        <div className={`${GRID} md:grid md:grid-cols-3 md:gap-x-12 md:py-12`}>
          <Accordion title="Help center">
            <nav aria-label="Help" className="flex flex-col">
              <a href="#help-search" className={LINK}>
                Help
              </a>
              <a href="#main" className={LINK}>
                Alert overview
              </a>
            </nav>
          </Accordion>
          <Accordion title="Quilo">
            <nav aria-label="About Quilo" className="flex flex-col">
              <a href="#main" className={LINK}>
                Privacy information
              </a>
              <a href="#main" className={LINK}>
                Alert overview
              </a>
            </nav>
          </Accordion>

          {/* Follow us */}
          <section className="py-10 text-center md:py-0 md:text-left">
            <h2 className="q-h2">Follow us!</h2>
            <p className="q-body mx-auto mt-3 max-w-sm md:mx-0">
              Stay informed about our latest updates and news from Quilo via our social media channels.
            </p>
            <ul className="mx-auto mt-6 flex max-w-[320px] items-center justify-between md:mx-0 md:-ml-2.5 md:max-w-none md:justify-start md:gap-1">
              {SOCIALS.map(({ label, Icon }) => (
                <li key={label}>
                  <a href="#" aria-label={label} className="flex h-11 w-11 items-center justify-center text-q-ink">
                    <Icon className="h-6 w-6" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* Legal */}
      <div style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }} className="pt-8">
        <div className={GRID}>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-1">
            <a href="#" className="q-body flex min-h-[44px] items-center">
              Terms &amp; Conditions
            </a>
            <a href="#" className="q-body flex min-h-[44px] items-center">
              Privacy Policy
            </a>
            <a href="#" className="q-body flex min-h-[44px] items-center">
              Cookie Statement
            </a>
            <a href="#" className="q-body flex min-h-[44px] items-center">
              Sitemap
            </a>
          </nav>
          <div className="mt-6 border-t border-q-line pt-6">
            <p className="q-sub">© 2026 Quilo · Security demo · All rights reserved.</p>
            <p className="q-sub mt-1">Illustrative interface using sample sign-in details.</p>
          </div>
        </div>
      </div>

      {/* Back to top */}
      <button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed right-4 z-20 flex h-11 w-11 items-center justify-center rounded-xl bg-q-blue text-white shadow-card transition-opacity duration-200 ${
          showTop ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        <ChevronUpIcon className="h-5 w-5" />
      </button>
    </footer>
  );
}
