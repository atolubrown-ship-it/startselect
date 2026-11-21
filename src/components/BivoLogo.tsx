type Props = { name: string; logoUrl?: string; className?: string };

/** Bivo's own mark: an uploaded logo, or the app name's first letter on a gradient tile. */
export default function BivoLogo({ name, logoUrl, className }: Props) {
  const cls = className ?? "h-11 w-11";
  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- logo is a data: URL or an external https link, not a static asset
    return <img src={logoUrl} alt={`${name} logo`} className={`rounded-xl object-contain ${cls}`} />;
  }
  return (
    <span
      aria-label={`${name} logo`}
      className={`bivo-mark bivo-font-display grid place-items-center rounded-xl text-xl font-bold ${cls}`}
      style={{ color: "var(--bivo-primary-ink)" }}
    >
      {name.trim().charAt(0).toLowerCase() || "b"}
    </span>
  );
}
