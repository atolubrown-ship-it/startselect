import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in with Bivo",
  description: "Sign in to your Bivo account.",
};

// The root layout already loads "Outfit" for the whole site (see src/app/layout.tsx);
// Bivo's CSS (src/app/globals.css, under .bivo) uses that same font, so no extra
// Google Fonts request is needed here. This layout also covers /signin/admin,
// /signin/recover-email and /signin/reset-password (all under src/app/signin/).
export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
