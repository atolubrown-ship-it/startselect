import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";

/**
 * Placeholder terms page for the Bivo sign-in app — linked from the "Terms"
 * link in the page footer (PageFooter, BivoAuthCard.tsx). See the privacy
 * page's note: Bivo is a fictional-brand concept, so this says so plainly
 * rather than presenting invented legal language as real terms of service.
 */
export default function BivoTermsPage() {
  return (
    <div className="bivo min-h-dvh px-4 py-10">
      <div className="mx-auto max-w-xl">
        <Link href="/signin" className="bivo-muted-text inline-flex items-center gap-2 text-sm hover:underline">
          <ArrowLeftIcon className="h-4 w-4" /> Back to sign in
        </Link>

        <h1 className="bivo-font-display mt-6 text-3xl font-semibold">Terms</h1>
        <p className="mt-3 bivo-muted-text">
          Bivo is a sign-in design concept, not a live product — this page stands in for the terms of service a real
          account system would publish here.
        </p>
      </div>
    </div>
  );
}
