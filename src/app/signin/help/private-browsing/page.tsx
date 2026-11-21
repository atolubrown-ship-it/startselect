import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";

/**
 * Generic, vendor-neutral instructions for opening a private/incognito
 * window — linked from the "private window" phrase in the security notice
 * on /signin (SecurityMessage, src/components/BivoAuthCard.tsx). Kept as a
 * page on this site (rather than linking out to a browser vendor's own help
 * site) so the link always resolves and never depends on an external page's
 * URL staying the same.
 */
export default function PrivateBrowsingHelpPage() {
  return (
    <div className="bivo min-h-dvh px-4 py-10">
      <div className="mx-auto max-w-xl">
        <Link href="/signin" className="bivo-muted-text inline-flex items-center gap-2 text-sm hover:underline">
          <ArrowLeftIcon className="h-4 w-4" /> Back to sign in
        </Link>

        <h1 className="bivo-font-display mt-6 text-3xl font-semibold">Using a private window</h1>
        <p className="mt-3 bivo-muted-text">
          A private (or &quot;incognito&quot;) window doesn&apos;t save your sign-in, browsing history, or cookies once you close
          it — useful on a shared or public computer.
        </p>

        <div className="mt-8 space-y-6">
          <HelpStep browser="Chrome" steps={['Click the three-dot menu in the top-right corner.', 'Select "New Incognito window".', "Or press Ctrl+Shift+N (Windows/Linux) or ⌘+Shift+N (Mac)."]} />
          <HelpStep browser="Safari" steps={['Open the "File" menu.', 'Select "New Private Window".', "Or press ⌘+Shift+N."]} />
          <HelpStep browser="Firefox" steps={['Click the menu icon in the top-right corner.', 'Select "New Private Window".', "Or press Ctrl+Shift+P (Windows/Linux) or ⌘+Shift+P (Mac)."]} />
          <HelpStep browser="Edge" steps={['Click the three-dot menu in the top-right corner.', 'Select "New InPrivate window".', "Or press Ctrl+Shift+N."]} />
        </div>

        <p className="mt-10 bivo-muted-text text-sm">
          Once you&apos;re in a private window, go back to the sign-in page and sign in as usual.
        </p>
      </div>
    </div>
  );
}

function HelpStep({ browser, steps }: { browser: string; steps: string[] }) {
  return (
    <div className="bivo-card">
      <h2 className="bivo-font-display text-lg font-semibold">{browser}</h2>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </div>
  );
}
