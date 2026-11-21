import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function MenuIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M3 6.5h18M3 12h18M3 17.5h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ShieldAlertIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 2.5l8.5 3.8v5.4c0 5-3.4 8.9-8.5 10.3-5.1-1.4-8.5-5.3-8.5-10.3V6.3L12 2.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 8v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16.2" r="1" fill="currentColor" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 12c-2.5 4.5-9.5 9-9.5 9z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function DeviceIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="3" y="4.5" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 17.5h4M10 14.5v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- Site shell icons ---------- */

/** Hidden gradient definition used by the filled menu icons (fill="url(#q-grad)"). */
export function IconDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="q-grad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" style={{ stopColor: "var(--q-secondary)" }} />
          <stop offset="55%" style={{ stopColor: "var(--q-primary)" }} />
          <stop offset="100%" style={{ stopColor: "var(--q-accent)" }} />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path d="M15.5 15.5L20.5 20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function AccountIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" {...props}>
      <defs>
        <clipPath id="q-acct-clip">
          <circle cx="20" cy="20" r="17" />
        </clipPath>
      </defs>
      <g clipPath="url(#q-acct-clip)">
        <path
          d="M2 40c2-11 9-14 18-14s16 3 18 14z"
          fill="#6fe8c8"
          stroke="currentColor"
          strokeWidth="2.4"
        />
      </g>
      <circle cx="20" cy="15.5" r="5" fill="#6fe8c8" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="2.4" />
    </svg>
  );
}

export function CartIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M2.5 3.5h3l2.4 11.2a1.6 1.6 0 0 0 1.6 1.3h8.2a1.6 1.6 0 0 0 1.6-1.2L21 7.5H6.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="20" r="1.6" fill="currentColor" />
      <circle cx="17.5" cy="20" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M5 9l7 7 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronUpIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M5 15l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Gradient-filled menu icons */

export function HomeFillIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M12 2.8l9 7.4V21a1 1 0 0 1-1 1h-5.5v-6.5h-5V22H4a1 1 0 0 1-1-1V10.2l9-7.4z" fill="url(#q-grad)" />
    </svg>
  );
}

export function HelpFillIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" fill="url(#q-grad)" />
      <path
        d="M9.2 9.4a2.9 2.9 0 0 1 5.6 1c0 1.9-2.8 2.3-2.8 4"
        stroke="#fff"
        strokeWidth="1.9"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="12" cy="17.6" r="1.2" fill="#fff" />
    </svg>
  );
}

export function ChatFillIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M5 3h14a3 3 0 0 1 3 3v8.5a3 3 0 0 1-3 3h-6.6L7 21.6v-4.1H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z"
        fill="url(#q-grad)"
      />
      <circle cx="8" cy="10.3" r="1.1" fill="#fff" />
      <circle cx="12" cy="10.3" r="1.1" fill="#fff" />
      <circle cx="16" cy="10.3" r="1.1" fill="#fff" />
    </svg>
  );
}

export function LockFillIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M7.5 10V7.5a4.5 4.5 0 0 1 9 0V10"
        stroke="url(#q-grad)"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="4" y="10" width="16" height="12" rx="3" fill="url(#q-grad)" />
      <circle cx="12" cy="15.2" r="1.5" fill="#fff" />
      <path d="M12 15.5v3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ShieldFillIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M12 2l8.5 3.6v5.7c0 5.1-3.5 9.1-8.5 10.7-5-1.6-8.5-5.6-8.5-10.7V5.6L12 2z" fill="url(#q-grad)" />
      <path d="M8.2 12.2l2.8 2.8 4.8-5.2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* Generic payment-type glyphs (no third-party brand marks) */

export function CardIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2.5 10h19" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function DebitIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="5.5" y="9.5" width="5" height="3.6" rx="1" fill="currentColor" />
      <path d="M14 15.5h4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function WalletIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M4.5 7.5V6.8A2.3 2.3 0 0 1 6.8 4.5H17v3" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <rect x="2.5" y="7.5" width="19" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="13.5" r="1.3" fill="currentColor" />
    </svg>
  );
}

export function BankIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M3 9.5L12 4l9 5.5H3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M5.5 11.5v6M10 11.5v6M14 11.5v6M18.5 11.5v6M3 20h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function DocIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M7 3.5h7.5L19 8v12.5H7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14.5 3.5V8H19M10 12.5h5M10 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10.5 18.5h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 11v5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="7.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

/* Social icons (footer) */

export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.4" cy="6.6" r="1.3" fill="currentColor" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M14.2 22v-8.2h2.8l.5-3.3h-3.3V8.6c0-1 .4-1.7 1.8-1.7h1.6V4a20 20 0 0 0-2.4-.1c-2.5 0-4.2 1.5-4.2 4.3v2.3H8.2v3.3H11V22z" fill="currentColor" />
    </svg>
  );
}

export function TikTokIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M16.3 2h-3.2v13.2a2.8 2.8 0 1 1-2.8-2.8c.3 0 .6 0 .8.1V9.2a6 6 0 1 0 5.2 5.9V8.5a7.3 7.3 0 0 0 4.2 1.3V6.6A4.3 4.3 0 0 1 16.3 2z" fill="currentColor" />
    </svg>
  );
}

export function YouTubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.5 5h11A4.5 4.5 0 0 1 22 9.5v5a4.5 4.5 0 0 1-4.5 4.5h-11A4.5 4.5 0 0 1 2 14.5v-5A4.5 4.5 0 0 1 6.5 5zM10 9v6l5.2-3z"
        fill="currentColor"
      />
    </svg>
  );
}

export function TwitchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M5 3h16v11l-4 4h-4l-3 3v-3H5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M11 8v4M16 8v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function LinkedInIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <rect x="3" y="9" width="4" height="12" fill="currentColor" />
      <circle cx="5" cy="5" r="2.3" fill="currentColor" />
      <path d="M10 9h3.8v1.7c.6-1.1 2-2 3.9-2 3.3 0 4.3 2 4.3 5.1V21h-4v-6c0-1.5-.5-2.5-1.8-2.5S14 13.5 14 15v6h-4z" fill="currentColor" />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M3 3l18 18M10.6 5.1A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7c1.7 0 3.2-.4 4.5-1M9.9 9.9a3 3 0 0 0 4.2 4.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- Bivo icons ---------- */

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 15.5V4M8 8l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 15.5V18a2.5 2.5 0 0 0 2.5 2.5h10a2.5 2.5 0 0 0 2.5-2.5v-2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M4 7h16M9.5 7V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 7l1 13a1.8 1.8 0 0 0 1.8 1.7h6.4A1.8 1.8 0 0 0 17 20L18 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** Self-contained loading spinner — rotates on its own via SMIL, no Tailwind animate-spin needed at the call site. */
export function SpinnerIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.2" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}
