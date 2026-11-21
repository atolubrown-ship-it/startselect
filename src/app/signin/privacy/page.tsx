import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";

/**
 * Placeholder privacy page for the Bivo sign-in app — linked from the
 * "Privacy" link in the page footer (PageFooter, BivoAuthCard.tsx). Bivo is
 * a fictional-brand sign-in concept with no real account data practices to
 * document, so this page says so plainly rather than presenting invented
 * policy language as if it were real — the goal is a real, working link
 * instead of a dead one, not a fabricated legal document.
 */
export default function BivoPrivacyPage() {
  return (
    <div className="bivo min-h-dvh px-4 py-10">
      <div className="mx-auto max-w-xl">
        <Link href="/signin" className="bivo-muted-text inline-flex items-center gap-2 text-sm hover:underline">
          <ArrowLeftIcon className="h-4 w-4" /> Back to sign in
        </Link>

        <h1 className="bivo-font-display mt-6 text-3xl font-semibold">Privacy</h1>
        <p className="mt-3 bivo-muted-text">
          Bivo is a sign-in design concept, not a live product — this page stands in for the privacy policy a real
          account system would publish here, covering what data is collected, how it&apos;s used, and how to request
          it be deleted.
        </p>
      </div>
    </div>
  );
}
