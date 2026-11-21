import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bivo – Sign in",
  description: "Sign in or create your Bivo account.",
};

// The root layout already loads "Outfit" for the whole site (see src/app/layout.tsx);
// Bivo's CSS (src/app/globals.css, under .bivo) uses that same font, so no extra
// Google Fonts request is needed here.
export default function BivoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
