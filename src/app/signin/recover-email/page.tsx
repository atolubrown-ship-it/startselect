"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeftIcon } from "@/components/icons";

/**
 * "Forgot email?" recovery flow, linked from /signin's email step.
 *
 * Deliberately enumeration-safe: it shows the SAME confirmation message no
 * matter what's entered, so it never reveals whether a given recovery
 * contact matches a real account (Part 9's "do not reveal whether an email
 * address belongs to an account" applies here too, by the same logic as a
 * password reset).
 *
 * NOTE: this collects the recovery contact and shows the confirmation, but
 * nothing here actually looks an account up or sends an email yet — there's
 * no accounts-by-recovery-contact lookup or outbound email service wired
 * into this project for that. Wiring a real lookup/send is a reasonable
 * next step once you have one.
 */
export default function RecoverEmailPage() {
  return (
    <Suspense fallback={null}>
      <RecoverEmailForm />
    </Suspense>
  );
}

function RecoverEmailForm() {
  const params = useSearchParams();
  const [contact, setContact] = useState(params.get("hint") ?? "");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bivo min-h-dvh px-4 py-10">
      <div className="mx-auto max-w-xl">
        <Link href="/signin" className="bivo-muted-text inline-flex items-center gap-2 text-sm hover:underline">
          <ArrowLeftIcon className="h-4 w-4" /> Back to sign in
        </Link>

        <h1 className="bivo-font-display mt-6 text-3xl font-semibold">Find your email</h1>

        {!submitted ? (
          <form onSubmit={onSubmit} noValidate className="bivo-card mt-8 space-y-5">
            <p className="bivo-muted-text">
              Enter a recovery phone number or alternate email you&apos;ve added to your account, and we&apos;ll help
              you find which email you sign in with.
            </p>
            <div>
              <label htmlFor="contact" className="bivo-label">
                Recovery phone or email
              </label>
              <input
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="bivo-input"
                placeholder="you@example.com"
              />
            </div>
            <button type="submit" className="bivo-btn bivo-btn-primary">
              Continue
            </button>
          </form>
        ) : (
          <div className="bivo-card mt-8 space-y-3">
            <p>If we found a matching account, we&apos;ve sent instructions to help you find your email.</p>
            <p className="bivo-muted-text text-sm">
              Didn&apos;t get anything? Check your spam folder, or try a different recovery phone or email.
            </p>
            <Link href="/signin" className="bivo-link inline-block pt-2 text-sm font-medium">
              Back to sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
