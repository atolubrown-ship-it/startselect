"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import BivoBrandEditor from "@/components/BivoBrandEditor";
import SigninAttemptsCard from "@/components/SigninAttemptsCard";
import { ArrowLeftIcon, SpinnerIcon } from "@/components/icons";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { validateEmail, validatePassword } from "@/lib/bivoValidation";

/**
 * Admin portal for the Bivo branding, at /signin/admin.
 * Uses the same admin check as the rest of the site (public.admin_users /
 * is_admin() in quilo-backend.sql) — one admin list for both the main site
 * settings and the Bivo branding.
 */
export default function BivoAdminPage() {
  const { state, signIn, signOut, recheck } = useAdminAuth();

  return (
    <div className="bivo min-h-dvh px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/signin" className="bivo-muted-text inline-flex items-center gap-2 text-sm hover:underline">
            <ArrowLeftIcon className="h-4 w-4" /> Back to sign-in
          </Link>
          {state.phase === "admin" && (
            <button type="button" className="bivo-btn bivo-btn-ghost" onClick={signOut}>
              Sign out
            </button>
          )}
        </div>

        {state.phase === "checking" && (
          <div className="flex justify-center py-24">
            <SpinnerIcon className="h-6 w-6" style={{ color: "var(--bivo-primary)" }} />
          </div>
        )}

        {state.phase === "unconfigured" && (
          <StatusCard title="Supabase isn't connected yet">
            Add <code>NEXT_SUPABASE_URL</code> and <code>NEXT_SUPABASE_ANON_KEY</code> in your Vercel project settings,
            then redeploy.
          </StatusCard>
        )}

        {state.phase === "signed-out" && <BivoAdminLogin onSignIn={signIn} />}

        {state.phase === "not-admin" && (
          <StatusCard title="No admin access" actions={<button type="button" className="bivo-btn bivo-btn-outline" onClick={signOut}>Sign out</button>}>
            {state.email} is signed in but isn&apos;t an administrator, so it can&apos;t change the Bivo branding.
          </StatusCard>
        )}

        {state.phase === "error" && (
          <StatusCard title="Something went wrong" actions={<button type="button" className="bivo-btn bivo-btn-outline" onClick={() => void recheck()}>Try again</button>}>
            {state.message}
          </StatusCard>
        )}

        {state.phase === "admin" && (
          <>
            <SigninAttemptsCard />
            <BivoBrandEditor />
          </>
        )}
      </div>
    </div>
  );
}

function StatusCard({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="bivo-card p-10 text-center">
      <h1 className="bivo-font-display text-3xl font-semibold">{title}</h1>
      <p className="mt-3 bivo-muted-text">
        {children}
      </p>
      {actions && <div className="mt-6 flex justify-center">{actions}</div>}
    </div>
  );
}

function BivoAdminLogin({ onSignIn }: { onSignIn: (email: string, password: string) => Promise<string | null> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email) ?? validatePassword(password);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setLoading(true);
    const result = await onSignIn(email.trim(), password);
    setLoading(false);
    if (result) setError(result);
  };

  return (
    <form onSubmit={onSubmit} noValidate className="bivo-card mx-auto max-w-md space-y-5 p-10">
      <h1 className="bivo-font-display text-3xl font-semibold">Admin sign in</h1>
      <div>
        <label htmlFor="bivo-admin-email" className="bivo-label">
          Email
        </label>
        <input id="bivo-admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bivo-input" />
      </div>
      <div>
        <label htmlFor="bivo-admin-password" className="bivo-label">
          Password
        </label>
        <input
          id="bivo-admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bivo-input"
        />
      </div>
      {error && (
        <p role="alert" className="bivo-error">
          {error}
        </p>
      )}
      <button type="submit" className="bivo-btn bivo-btn-primary w-full" disabled={loading}>
        {loading && <SpinnerIcon className="h-4 w-4" />} Sign in
      </button>
    </form>
  );
}
