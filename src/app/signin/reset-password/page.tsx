"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon, SpinnerIcon } from "@/components/icons";
import { getSupabase } from "@/lib/supabase";
import { validatePassword } from "@/lib/bivoValidation";

/**
 * Landing page for the link sent by "Forgot password?" on /signin
 * (BivoAuthCard.tsx calls sb.auth.resetPasswordForEmail with
 * redirectTo: "<origin>/signin/reset-password"). Supabase puts the visitor
 * into a temporary recovery session when they arrive here from that email
 * link, which is what lets updateUser({ password }) below work without
 * asking for the old password again.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setReady(true);
      return;
    }
    void sb.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
      setReady(true);
    });
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const pwErr = validatePassword(password);
    if (pwErr) {
      setError(pwErr);
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const sb = getSupabase();
      if (sb) {
        const { error: updateErr } = await sb.auth.updateUser({ password });
        if (updateErr) throw updateErr;
      }
      setDone(true);
      setTimeout(() => router.push("/signin"), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update your password. The link may have expired.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bivo flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <h1 className="bivo-font-display text-3xl font-semibold">Choose a new password</h1>

        {!ready ? (
          <div className="mt-8 flex justify-center">
            <SpinnerIcon className="h-6 w-6" style={{ color: "var(--bivo-primary)" }} />
          </div>
        ) : done ? (
          <div className="bivo-card mt-8">
            <p>Your password has been updated. Taking you back to sign in…</p>
          </div>
        ) : !hasSession ? (
          <div className="bivo-card mt-8 space-y-3">
            <p>This reset link is invalid or has expired.</p>
            <Link href="/signin" className="bivo-link text-sm font-medium">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="bivo-card mt-8 space-y-5">
            <div>
              <label htmlFor="new-password" className="bivo-label">
                New password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  autoFocus
                  className="bivo-input bivo-input-pr"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="bivo-muted-text absolute inset-y-0 right-0 grid w-12 place-items-center"
                >
                  {show ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirm-password" className="bivo-label">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type={show ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                className="bivo-input"
              />
            </div>
            {error && <p className="bivo-error">{error}</p>}
            <button type="submit" className="bivo-btn bivo-btn-primary w-full" disabled={saving}>
              {saving && <SpinnerIcon className="h-4 w-4" />} Update password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
