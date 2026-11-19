/**
 * Country + language choices for the menu's "Your preferences" chips.
 * Flags are standard Unicode flag emoji built from the two-letter country code
 * (they render as proper flags on iPhone, Mac and Android).
 */

export const COUNTRIES: { code: string; name: string }[] = [
  { code: "WW", name: "Worldwide" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "IE", name: "Ireland" },
  { code: "NG", name: "Nigeria" },
  { code: "GH", name: "Ghana" },
  { code: "KE", name: "Kenya" },
  { code: "ZA", name: "South Africa" },
  { code: "EG", name: "Egypt" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "TR", name: "Türkiye" },
  { code: "IN", name: "India" },
  { code: "PK", name: "Pakistan" },
  { code: "SG", name: "Singapore" },
  { code: "MY", name: "Malaysia" },
  { code: "PH", name: "Philippines" },
  { code: "ID", name: "Indonesia" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "CN", name: "China" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "PT", name: "Portugal" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "PL", name: "Poland" },
  { code: "GR", name: "Greece" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "AR", name: "Argentina" },
  { code: "CO", name: "Colombia" },
  { code: "CL", name: "Chile" },
];

export const LANGUAGES: string[] = [
  "English",
  "Español",
  "Français",
  "Deutsch",
  "Italiano",
  "Português",
  "Nederlands",
  "Svenska",
  "Polski",
  "Türkçe",
  "العربية",
  "हिन्दी",
  "中文",
  "日本語",
  "한국어",
];

export function countryName(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.name ?? "";
}

/** "GB" → 🇬🇧   ("WW" → 🌍) */
export function flagEmoji(code: string): string {
  if (code === "WW") return "🌍";
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return String.fromCodePoint(...Array.from(code).map((c) => 127397 + c.charCodeAt(0)));
}
