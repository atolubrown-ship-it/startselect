type Props = { name: string; logoUrl?: string; size?: number; className?: string };

/** Bivo's own mark: an uploaded logo, or the app name's first letter on a gradient tile. `size` (px) takes priority over `className` when given. */
export default function BivoLogo({ name, logoUrl, size, className }: Props) {
  const style = size ? { width: size, height: size } : undefined;
  const cls = size ? "" : className ?? "h-11 w-11 text-xl";
  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- logo is a data: URL or an external https link, not a static asset
    return <img src={logoUrl} alt={`${name} logo`} className={`rounded-xl object-contain ${cls}`} style={style} />;
  }
  return (
    <span
      aria-label={`${name} logo`}
      className={`bivo-mark bivo-font-display grid place-items-center rounded-xl font-bold ${cls}`}
      style={{ color: "var(--bivo-primary-ink)", fontSize: size ? Math.max(14, Math.round(size * 0.45)) : undefined, ...style }}
    >
      {name.trim().charAt(0).toLowerCase() || "b"}
    </span>
  );
}
