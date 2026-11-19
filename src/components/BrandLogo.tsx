"use client";

import { useSettings } from "@/components/SettingsProvider";
import type { SiteSettings } from "@/lib/settings";

type BrandLogoProps = {
  /** Render these settings instead of the saved ones (used by the admin preview). */
  settings?: SiteSettings;
  /** Multiplies the configured logo height (e.g. 0.85 in the footer). */
  scale?: number;
  className?: string;
};

/** Built-in placeholder mark, used until a logo is uploaded in the Admin Portal. */
function DefaultMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" aria-hidden="true" className="shrink-0">
      <path
        d="M22 3.5l16 9.2v18.6L22 40.5 6 31.3V12.7L22 3.5z"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <circle cx="22" cy="22" r="6" fill="var(--q-secondary)" />
      <circle cx="22" cy="22" r="2.2" fill="currentColor" />
    </svg>
  );
}

/**
 * The one place the logo and company name are rendered. An uploaded logo
 * replaces the default icon AND the default name completely; with no uploaded
 * logo, the default Quilo icon and company name are shown.
 * Header, footer and any
 * other branding use this component, so a change saved in the Admin Portal
 * shows up everywhere at once.
 */
export default function BrandLogo({ settings, scale = 1, className = "" }: BrandLogoProps) {
  const ctx = useSettings();
  const s = settings ?? ctx.settings;
  const ready = settings ? true : ctx.loaded;

  const height = Math.round(s.logoHeight * scale);
  const custom = !!s.logoUrl;

  return (
    <span
      className={`inline-flex min-w-0 items-center gap-2.5 ${className}`}
      style={{ visibility: ready ? "visible" : "hidden" }}
    >
      {s.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={s.logoUrl}
          alt={s.siteName}
          style={{ height, width: "auto", maxWidth: "min(55vw, 220px)", objectFit: "contain" }}
          className="shrink-0"
        />
      ) : (
        <DefaultMark size={height} />
      )}
      {/* Default icon + name only when no custom logo has been uploaded */}
      {!custom && (
        <span
          className="truncate font-bold leading-none tracking-[-0.02em]"
          style={{ fontSize: Math.max(14, Math.round(height * 0.78)) }}
        >
          {s.siteName}
        </span>
      )}
    </span>
  );
}
