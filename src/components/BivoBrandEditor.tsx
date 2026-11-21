"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import BivoLogo from "@/components/BivoLogo";
import { SpinnerIcon, TrashIcon, UploadIcon } from "@/components/icons";
import { fileToLogoDataUrl } from "@/lib/image";
import { DEFAULT_BIVO_BRAND, loadBivoBrand, saveBivoBrand, type BivoBrand } from "@/lib/bivoBrand";
import { validateEmail } from "@/lib/bivoValidation";

/** The branding editor shown at /bivo/admin once an admin is signed in. */
export default function BivoBrandEditor() {
  const [brand, setBrand] = useState<BivoBrand>(DEFAULT_BIVO_BRAND);
  const [draft, setDraft] = useState<BivoBrand>(DEFAULT_BIVO_BRAND);
  const [ready, setReady] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof BivoBrand, string>>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadBivoBrand().then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setBrand(res.brand);
        setDraft(res.brand);
      } else {
        setMessage({ kind: "err", text: res.error });
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const set = (key: keyof BivoBrand) => (e: ChangeEvent<HTMLInputElement>) => setDraft((d) => ({ ...d, [key]: e.target.value }));

  const onLogoFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const url = await fileToLogoDataUrl(file, 256);
      setDraft((d) => ({ ...d, logoUrl: url }));
    } catch (err) {
      setMessage({ kind: "err", text: err instanceof Error ? err.message : "Could not use that image." });
    }
  };

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!draft.appName.trim()) next.appName = "Enter a name";
    else if (draft.appName.trim().length > 40) next.appName = "Keep the name under 40 characters";
    if (!draft.headline.trim()) next.headline = "Enter a heading";
    const supportErr = validateEmail(draft.supportEmail);
    if (supportErr) next.supportEmail = supportErr;
    setErrors(next);
    if (Object.keys(next).length) return;

    const clean: BivoBrand = {
      appName: draft.appName.trim(),
      logoUrl: draft.logoUrl.trim(),
      headline: draft.headline.trim(),
      subline: draft.subline.trim(),
      supportEmail: draft.supportEmail.trim(),
    };
    setSaving(true);
    setMessage(null);
    const res = await saveBivoBrand(clean);
    setSaving(false);
    if (res.ok) {
      setBrand(res.brand);
      setDraft(res.brand);
      setMessage({ kind: "ok", text: "Branding saved." });
    } else {
      setMessage({ kind: "err", text: res.error });
    }
  };

  if (!ready) {
    return (
      <div className="flex justify-center py-24">
        <SpinnerIcon className="h-6 w-6" style={{ color: "var(--bivo-primary)" }} />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <form onSubmit={onSave} noValidate className="bivo-card space-y-6 p-8 sm:p-10">
        <div>
          <h1 className="bivo-font-display text-3xl font-semibold">Bivo branding</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--bivo-muted)" }}>
            Change the name, logo and text people see on the Bivo sign-in page.
          </p>
        </div>

        {message && (
          <p
            role={message.kind === "err" ? "alert" : undefined}
            className="rounded-xl px-4 py-3 text-sm"
            style={
              message.kind === "err"
                ? { backgroundColor: "var(--bivo-danger-bg)", color: "var(--bivo-danger)" }
                : { backgroundColor: "rgba(47, 143, 91, 0.12)", color: "var(--bivo-ink)" }
            }
          >
            {message.text}
          </p>
        )}

        <div className="space-y-3">
          <span className="bivo-label">Logo</span>
          <div className="flex flex-wrap items-center gap-4">
            <BivoLogo name={draft.appName || "B"} logoUrl={draft.logoUrl} className="h-16 w-16 text-2xl" />
            <label className="bivo-btn bivo-btn-outline cursor-pointer">
              <UploadIcon className="h-4 w-4" /> Upload image
              <input type="file" accept="image/*" className="sr-only" onChange={onLogoFile} />
            </label>
            {draft.logoUrl && (
              <button type="button" className="bivo-btn bivo-btn-ghost" onClick={() => setDraft((d) => ({ ...d, logoUrl: "" }))}>
                <TrashIcon className="h-4 w-4" /> Remove
              </button>
            )}
          </div>
          <input
            placeholder="…or paste an image link (https://…)"
            value={draft.logoUrl.startsWith("data:") ? "" : draft.logoUrl}
            onChange={set("logoUrl")}
            className="bivo-input h-11"
          />
        </div>

        <TextField id="appName" label="App name" value={draft.appName} onChange={set("appName")} error={errors.appName} />
        <TextField id="headline" label="Sign-in heading" value={draft.headline} onChange={set("headline")} error={errors.headline} />
        <TextField id="subline" label="Sign-in subtitle" value={draft.subline} onChange={set("subline")} error={errors.subline} />
        <TextField id="supportEmail" label="Support email" value={draft.supportEmail} onChange={set("supportEmail")} error={errors.supportEmail} />

        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <button type="button" className="bivo-btn bivo-btn-ghost" onClick={() => setDraft(brand)}>
            Discard changes
          </button>
          <button type="submit" className="bivo-btn bivo-btn-primary px-7" disabled={saving}>
            {saving && <SpinnerIcon className="h-4 w-4" />} Save changes
          </button>
        </div>
      </form>

      <aside className="bivo-card h-fit p-8">
        <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--bivo-muted)" }}>
          Live preview
        </p>
        <div className="mt-6">
          <BivoLogo name={draft.appName || "B"} logoUrl={draft.logoUrl} />
          <h2 className="bivo-font-display mt-6 text-3xl font-semibold">{draft.headline || "Sign in"}</h2>
          <p className="mt-2 text-sm" style={{ color: "var(--bivo-muted)" }}>
            {draft.subline}
          </p>
          <div className="mt-6 h-12 rounded-xl border" style={{ borderColor: "var(--bivo-border)" }} />
          <div className="mt-4 flex justify-end">
            <span className="bivo-btn bivo-btn-primary">Next</span>
          </div>
          <p className="mt-6 text-xs" style={{ color: "var(--bivo-muted)" }}>
            © {draft.appName}
          </p>
        </div>
      </aside>
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string | undefined;
}) {
  return (
    <div>
      <label htmlFor={id} className="bivo-label">
        {label}
      </label>
      <input id={id} value={value} onChange={onChange} aria-invalid={!!error} className="bivo-input h-11" />
      {error && <p className="bivo-error">{error}</p>}
    </div>
  );
}
