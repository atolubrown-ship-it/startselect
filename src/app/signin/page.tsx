"use client";

import BivoSignIn from "@/components/BivoSignIn";

/**
 * Bivo sign-in, reached from Quilo's "Sign in with Google" button
 * (src/app/page.tsx, the "Or use an existing login" section on the
 * "This wasn't me" screen). A visitor leaves Quilo's own site chrome
 * for Bivo's own sign-in UI here, then "Continue to Quilo" returns
 * them to "/" — the same back-and-forth a real OAuth hand-off has.
 */
export default function BivoSignInPage() {
  return <BivoSignIn appName="Bivo" primaryColor="#1d4ed8" backHref="/" backLabel="Quilo" />;
}
