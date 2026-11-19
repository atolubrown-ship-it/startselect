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

function Accordion({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/70">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-[18px] text-left text-[20px] font-semibold text-q-ink sm:px-6"
      >
        {title}
        <ChevronDownIcon className={`h-6 w-6 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="mx-auto max-w-6xl px-4 pb-5 sm:px-6">{children}</div>}
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

export default function Footer() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 240);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <footer className="mt-12 bg-q-panel text-q-ink">
      {/* Expandable link groups */}
      <div className="bg-q-panel2">
        <Accordion title="Help center">
          <nav aria-label="Help" className="flex flex-col gap-3 text-[17px] text-q-body">
            <a href="#help-search">Help</a>
            <a href="#main">Alert overview</a>
          </nav>
        </Accordion>
        <Accordion title="Quilo">
          <nav aria-label="About Quilo" className="flex flex-col gap-3 text-[17px] text-q-body">
            <a href="#main">Privacy information</a>
            <a href="#main">Alert overview</a>
          </nav>
        </Accordion>
      </div>

      {/* Follow us */}
      <div className="bg-q-panel2 px-4 pb-10 pt-10 text-center sm:px-6">
        <h2 className="text-[26px] font-bold">Follow us!</h2>
        <p className="mx-auto mt-5 max-w-md text-left text-[17px] leading-relaxed text-q-body sm:text-center">
          Stay informed about our latest updates and news from Quilo via our social media channels!
        </p>
        <ul className="mx-auto mt-8 flex max-w-sm items-center justify-between">
          {SOCIALS.map(({ label, Icon }) => (
            <li key={label}>
              <a href="#" aria-label={label} className="flex h-11 w-11 items-center justify-center text-q-ink">
                <Icon className="h-[30px] w-[30px]" />
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Legal */}
      <div
        className="bg-q-panel px-4 pt-8 sm:px-6"
        style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto max-w-6xl">
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-3 text-[16px] text-q-body">
            <a href="#">Terms &amp; Conditions</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Cookie Statement</a>
            <a href="#">Sitemap</a>
          </nav>
          <p className="mt-8 text-[15px] text-q-body">
            © 2026 Quilo · Security demo · All rights reserved.
          </p>
          <p className="mt-1.5 text-[13px] text-q-mute">Illustrative interface using sample sign-in details.</p>
        </div>
      </div>

      {/* Back to top */}
      <button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed right-4 z-20 flex h-10 w-10 items-center justify-center rounded-lg bg-q-blue text-white shadow-card transition-opacity duration-200 ${
          showTop ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        <ChevronUpIcon className="h-6 w-6" />
      </button>
    </footer>
  );
}
