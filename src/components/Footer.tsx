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
  CardIcon,
  DebitIcon,
  WalletIcon,
  BankIcon,
  DocIcon,
} from "@/components/icons";
import { useSettings, useT } from "@/components/SettingsProvider";
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

/** Neutral glyphs shown in a payment slot until an image is uploaded in the admin. */
const PAYMENT_GLYPHS: ((p: React.SVGProps<SVGSVGElement>) => JSX.Element)[] = [
  CardIcon,
  DebitIcon,
  WalletIcon,
  PhoneIcon,
  DocIcon,
  BankIcon,
];

const STAR = "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z";

/**
 * Five square tiles with a white star each. Fractional scores fill the last
 * tile partially (e.g. 4.5 = half). The tile colour comes from the admin.
 */
function Stars({ score, color }: { score: number; color: string }) {
  return (
    <span role="img" aria-label={`Rated ${score} out of 5`} className="inline-flex items-center gap-1">
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, score - i)) * 100;
        return (
          <span
            key={i}
            aria-hidden="true"
            className="flex h-6 w-6 items-center justify-center"
            style={{ background: `linear-gradient(90deg, ${color} ${fill}%, #dcdce6 ${fill}%)` }}
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]">
              <path d={STAR} fill="#ffffff" />
            </svg>
          </span>
        );
      })}
    </span>
  );
}

const LINK = "q-body flex min-h-[44px] items-center hover:text-q-ink md:min-h-[36px]";
const LEGAL_LINK = "q-sub flex min-h-[44px] items-center hover:text-q-ink";

export default function Footer() {
  const { settings } = useSettings();
  const { t } = useT();
  const name = settings.siteName;
  const LEGAL: { key: LegalKey; label: string }[] = [
    { key: "terms", label: t("footer_legalTerms") },
    { key: "privacy", label: t("footer_legalPrivacy") },
    { key: "cookies", label: t("footer_legalCookies") },
    { key: "accessibility", label: t("footer_legalAccessibility") },
    { key: "sitemap", label: t("footer_legalSitemap") },
  ];
  const showRating = !!settings.ratingLabel && settings.ratingScore > 0;
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
        <span className="text-[10px] font-medium tracking-[0.06em] text-white">{t("footer_downloadOn")}</span>
        <span className="mt-1 max-w-[190px] truncate text-[20px] font-semibold tracking-[-0.01em]">
          {name} {t("footer_appWord")}
        </span>
      </span>
    </span>
  );

  // An image uploaded in the admin replaces the generated badge entirely.
  const customBadge = settings.appBadgeUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={settings.appBadgeUrl}
      alt={t("footer_appAriaGet", { name })}
      style={{ height: settings.appBadgeHeight, width: "auto", maxWidth: "100%" }}
      className="block"
    />
  ) : null;
  const badgeContent = customBadge ?? badge;

  return (
    <footer className="mt-12 text-q-ink">
      {/* A — Payment methods + rating */}
      <section aria-label="Payment methods and rating" className="bg-q-panel">
        <div className={`${GRID} py-8 md:py-10`}>
          <ul className="flex flex-wrap items-center justify-center gap-x-[9px] gap-y-2">
            {settings.payments.map((p, i) => {
              if (!p.show) return null;
              const Glyph = PAYMENT_GLYPHS[i] ?? CardIcon;
              return p.imageUrl ? (
                <li key={i} title={p.label} className="flex h-[22px] w-[32px] items-center justify-center overflow-hidden rounded-[3px] bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.imageUrl} alt={p.label} className="h-full w-full object-contain" />
                </li>
              ) : (
                <li
                  key={i}
                  title={p.label}
                  className="flex h-[22px] w-[32px] items-center justify-center rounded-[3px] border border-q-line bg-white text-q-ink"
                >
                  <Glyph className="h-[14px] w-[14px]" />
                  <span className="sr-only">{p.label}</span>
                </li>
              );
            })}
            {settings.paymentMoreText && <li className="ml-3 text-[14px] leading-5 text-q-ink">{settings.paymentMoreText}</li>}
          </ul>

          {showRating && (
            <div className="mt-6 flex flex-col items-center gap-2 text-q-ink">
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                <span className="text-[18px] leading-6">{settings.ratingLabel}</span>
                <Stars score={settings.ratingScore} color={settings.ratingColor} />
              </div>
              {(settings.ratingCount || settings.ratingSource) && (
                <p className="flex items-center justify-center gap-2 text-[15px] leading-6">
                  {settings.ratingCount && <span>{settings.ratingCount}</span>}
                  {settings.ratingSource && (
                    <span className="inline-flex items-center gap-1 font-semibold">
                      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                        <path d={STAR} fill={settings.ratingColor} />
                      </svg>
                      {settings.ratingSource}
                    </span>
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* B + C + D — expandable navigation, app promotion, social */}
      <div className="bg-q-panel2">
        <div className={`${GRID} md:grid md:grid-cols-4 md:gap-x-10 md:py-12`}>
          {/* B — Expandable navigation */}
          <div className="border-t border-white/80 md:contents md:border-t-0">
            <Accordion title={t("footer_helpCenterTitle")}>
              <nav aria-label={t("footer_help")} className="flex flex-col">
                <a href="#site-search" className={LINK}>
                  {t("footer_help")}
                </a>
                <a href="#main" className={LINK}>
                  {t("footer_alertOverview")}
                </a>
                <a href="#main" className={LINK}>
                  {t("footer_contactSupport")}
                </a>
              </nav>
            </Accordion>
            <Accordion title={name}>
              <nav aria-label={t("footer_aboutNav", { name })} className="flex flex-col">
                <a href="#main" className={LINK}>
                  {t("footer_aboutNav", { name })}
                </a>
                <a href="#main" className={LINK}>
                  {t("footer_privacyInfo")}
                </a>
                <a href="#main" className={LINK}>
                  {t("footer_secureAccount")}
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
                <a href={settings.appStoreUrl} target="_blank" rel="noopener noreferrer" aria-label={t("footer_appAriaGet", { name })}>
                  {badgeContent}
                </a>
              ) : (
                <span aria-disabled={customBadge ? undefined : "true"}>{badgeContent}</span>
              )}
            </div>
          </section>

          {/* D — Social media */}
          <section aria-labelledby="footer-follow" className="pb-10 text-center md:pb-0 md:text-left">
            <h2 id="footer-follow" className="q-h2">
              {t("footer_followUs")}
            </h2>
            <p className="q-body mx-auto mt-3 max-w-sm md:mx-0">{t("footer_followBody", { name })}</p>
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
              © <span suppressHydrationWarning>{new Date().getFullYear()}</span> {name}. {t("footer_rights")}
            </p>
            <p className="q-sub mt-1">{t("footer_demo")}</p>
          </div>
        </div>
      </div>

      {/* Back to top */}
      <button
        type="button"
        aria-label={t("footer_backToTop")}
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
