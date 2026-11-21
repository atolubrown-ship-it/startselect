"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, SpinnerIcon } from "@/components/icons";
import { getSupabase } from "@/lib/supabase";

/**
 * Linked from the "sign out" phrase in the security notice on /signin
 * (SecurityMessage, src/components/BivoAuthCard.tsx). The sign-in page
 * itself has no active session to sign out of in the normal case, so this
 * page offers the real action when there IS a session (e.g. the visitor
 * followed the link after signing in elsewhere on a shared device) and
 * otherwise gives the same guidance as plain text.
 */
export default function SignOutHelpPage() {
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");

  const onSignOut = async () => {
    setState("working");
    try {
      const sb = getSupabase();
      if (sb) await sb.auth.signOut();
      setState("done");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="bivo min-h-dvh px-4 py-10">
      <div className="mx-auto max-w-xl">
        <Link href="/signin" className="bivo-muted-text inline-flex items-center gap-2 text-sm hover:underline">
          <ArrowLeftIcon className="h-4 w-4" /> Back to sign in
        </Link>

        <h1 className="bivo-font-display mt-6 text-3xl font-semibold">Signing out</h1>
        <p className="mt-3 bivo-muted-text">
          Always sign out when you&apos;re done on a device you share with other people, or on a public computer.
        </p>

        <div className="bivo-card mt-8 space-y-4">
          <p>If you&apos;re currently signed in on this browser, you can sign out right here:</p>
          <button type="button" className="bivo-btn bivo-btn-primary" onClick={() => void onSignOut()} disabled={state === "working"}>
            {state === "working" && <SpinnerIcon className="h-4 w-4" />} Sign out of this browser
          </button>
          {state === "done" && <p style={{ color: "var(--bivo-success)" }}>You&apos;re signed out.</p>}
          {state === "error" && <p style={{ color: "var(--bivo-danger)" }}>Couldn&apos;t sign out — try refreshing the page.</p>}
        </div>

        <p className="mt-6 bivo-muted-text text-sm">
          Signing out ends your session on this browser only. On a shared device, close all private/incognito windows
          afterwards too.
        </p>
      </div>
    </div>
  );
}
