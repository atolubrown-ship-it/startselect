import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";

/**
 * Help index for the Bivo sign-in app — linked from the "Help" link in the
 * page footer (PageFooter, src/components/BivoAuthCard.tsx). Points at the
 * two existing help articles rather than duplicating them.
 */
export default function BivoHelpIndexPage() {
  return (
    <div className="bivo min-h-dvh px-4 py-10">
      <div className="mx-auto max-w-xl">
        <Link href="/signin" className="bivo-muted-text inline-flex items-center gap-2 text-sm hover:underline">
          <ArrowLeftIcon className="h-4 w-4" /> Back to sign in
        </Link>

        <h1 className="bivo-font-display mt-6 text-3xl font-semibold">Help</h1>
        <p className="mt-3 bivo-muted-text">Common questions about signing in.</p>

        <div className="mt-8 space-y-4">
          <Link href="/signin/help/private-browsing" className="bivo-card block hover:opacity-90">
            <h2 className="bivo-font-display text-lg font-semibold">Using a private window</h2>
            <p className="mt-1 text-sm bivo-muted-text">How to open a private/incognito window on a shared or public computer.</p>
          </Link>
          <Link href="/signin/help/sign-out" className="bivo-card block hover:opacity-90">
            <h2 className="bivo-font-display text-lg font-semibold">Signing out</h2>
            <p className="mt-1 text-sm bivo-muted-text">How to sign out, and why it matters on a device you share with others.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
