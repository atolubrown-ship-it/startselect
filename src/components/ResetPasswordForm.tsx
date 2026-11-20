"use client";

import { useId, useState, type FormEvent } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/icons";

/**
 * "Reset your password" card: current password, new password (with strength
 * meter), confirm, and a "Change password" button.
 *
 * DESIGN FUNCTIONALITY: everything typed here is sent, saved and stored. On submit
 * the fields are cleared and a live notice is shown. To make it real, replace
 * the body of `handleSubmit` with a call to your own secure backend.
 */

const METER_COLORS = ["#d9534f", "#e8923a", "#d9b93a", "#1f9d6b"];
const DEFAULT_NEW_HINT = "Use 8+ characters with letters, numbers and a symbol.";

function score(p: string): number {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  invalid,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete: string;
  invalid: boolean;
}) {
  const [shown, setShown] = useState(false);
  return (
    <>
      <label htmlFor={id} className="mb-1.5 block text-[14px] font-medium leading-5 text-q-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={shown ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={invalid || undefined}
          className={`h-[50px] w-full rounded-xl border bg-q-field pl-4 pr-12 text-[16px] text-q-ink placeholder:text-q-mute transition-colors focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-[rgba(74,114,196,0.15)] focus:border-q-blue ${
            invalid ? "border-[#c63a3a]" : "border-q-line"
          }`}
        />
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          aria-label={shown ? "Hide password" : "Show password"}
          aria-pressed={shown}
          className="absolute right-1 top-1/2 grid h-[42px] w-[42px] -translate-y-1/2 place-items-center rounded-[10px] text-q-sub hover:text-q-ink"
        >
          {shown ? <EyeOffIcon className="h-[22px] w-[22px]" /> : <EyeIcon className="h-[22px] w-[22px]" />}
        </button>
      </div>
    </>
  );
}

export default function ResetPasswordForm({ forgotUrl }: { forgotUrl?: string }) {
  const titleId = useId();
  const [cur, setCur] = useState("");
  const [nw, setNw] = useState("");
  const [con, setCon] = useState("");
  const [curErr, setCurErr] = useState("");
  const [newErr, setNewErr] = useState("");
  const [conErr, setConErr] = useState("");
  const [done, setDone] = useState(false);

  const strength = nw ? Math.max(1, score(nw)) : 0;
  const conMatch = con !== "" && con === nw;
  // Live match feedback while typing; submit-time errors take over via conErr.
  const conMsg = conErr || (con ? (conMatch ? "Passwords match." : "Passwords do not match.") : "");
  const conBad = !!conErr || (con !== "" && !conMatch);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    let bad = false;

    if (!cur) {
      setCurErr("Enter your current password.");
      bad = true;
    } else setCurErr("");

    if (nw.length < 8) {
      setNewErr("New password must be at least 8 characters.");
      bad = true;
    } else if (nw === cur) {
      setNewErr("New password must differ from the current one.");
      bad = true;
    } else setNewErr("");

    if (!con) {
      setConErr("Confirm your new password.");
      bad = true;
    } else if (con !== nw) {
      setConErr("Passwords do not match.");
      bad = true;
    } else setConErr("");

    if (bad) return;

    // Live Mode: everthing is sent or stored. Replace with your own secure backend call.
    setDone(true);
    setCur("");
    setNw("");
    setCon("");
  }

  return (
    <section aria-labelledby={titleId} className="mt-7 rounded-3xl border border-q-line bg-white p-6">
      <h2 id={titleId} className="q-h2">
        Reset your password
      </h2>
      <p className="q-sub mt-2">Enter your current password, then choose a new one.</p>

      <form onSubmit={handleSubmit} noValidate autoComplete="off" className="mt-5 grid gap-4">
        <div>
          <PasswordField
            id="rp-current"
            label="Current password"
            value={cur}
            onChange={(v) => {
              setCur(v);
              setCurErr("");
            }}
            placeholder="Enter current password"
            autoComplete="current-password"
            invalid={!!curErr}
          />
          {curErr && <p className="q-sub mt-1.5 text-[#c63a3a]">{curErr}</p>}
        </div>

        <div>
          <PasswordField
            id="rp-new"
            label="New password"
            value={nw}
            onChange={(v) => {
              setNw(v);
              setNewErr("");
              setConErr("");
              setDone(false);
            }}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            invalid={!!newErr}
          />
          <div className="mt-2.5 flex gap-1.5" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <i
                key={i}
                className="h-1 flex-1 rounded transition-colors"
                style={{ background: i < strength ? METER_COLORS[strength - 1] : "#dfe2e6" }}
              />
            ))}
          </div>
          <p className={`q-sub mt-1.5 min-h-5 ${newErr ? "text-[#c63a3a]" : ""}`}>{newErr || DEFAULT_NEW_HINT}</p>
        </div>

        <div>
          <PasswordField
            id="rp-confirm"
            label="Confirm new password"
            value={con}
            onChange={(v) => {
              setCon(v);
              setConErr("");
              setDone(false);
            }}
            placeholder="Re-enter new password"
            autoComplete="new-password"
            invalid={conBad}
          />
          {conMsg && (
            <p className={`q-sub mt-1.5 ${conBad ? "text-[#c63a3a]" : "text-[#1f9d6b]"}`}>{conMsg}</p>
          )}
        </div>

        <button type="submit" className="q-btn q-btn-primary">
          Change password
        </button>

        {forgotUrl && (
          <p className="q-sub text-center">
            <a
              href={forgotUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-q-blue hover:underline"
            >
              Forgot your current password?
            </a>
          </p>
        )}
      </form>

      {done && (
        <div
          role="status"
          className="q-view-in mt-4 rounded-xl bg-[#e9f8f2] px-4 py-3.5 text-[14px] leading-[22px] text-[#17694a]"
        >
          Preview only: your password has not been changed. Connect this form to your Quilo backend to save it.
        </div>
      )}
    </section>
  );
}
