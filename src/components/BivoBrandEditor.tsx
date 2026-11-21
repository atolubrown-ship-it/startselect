"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import BivoLogo from "@/components/BivoLogo";
import { SpinnerIcon, TrashIcon, UploadIcon } from "@/components/icons";
import { fileToLogoDataUrl } from "@/lib/image";
import { DEFAULT_BIVO_BRAND, loadBivoBrand, saveBivoBrand, type BivoBrand } from "@/lib/bivoBrand";
import { validateEmail } from "@/lib/bivoValidation";
import { isHexColor, readableOn } from "@/lib/settings";

type NumberKey = "pageMaxWidth" | "pagePaddingX" | "pagePaddingY" | "columnGap" | "headingSize" | "inputHeight";
type TextKey = Exclude<keyof BivoBrand, "logoUrl" | "buttonColor" | "linkColor" | NumberKey>;

/** The branding + copy editor shown at /bivo/admin once an admin is signed in. */
export default function BivoBrandEditor() {
  const [brand, setBrand] = useState<BivoBrand>(DEFAULT_BIVO_BRAND);
  const [draft, setDraft] = useState<BivoBrand>(DEFAULT_BIVO_BRAND);
  const [ready, setReady] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<TextKey, string>>>({});
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

  const set = (key: TextKey) => (e: ChangeEvent<HTMLInputElement>) => setDraft((d) => ({ ...d, [key]: e.target.value }));
  const setColor = (key: "buttonColor" | "linkColor") => (hex: string) => setDraft((d) => ({ ...d, [key]: hex }));
  const setNumber = (key: NumberKey) => (n: number) => setDraft((d) => ({ ...d, [key]: n }));

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
    if (!draft.signinHeadline.trim()) next.signinHeadline = "Enter a heading";
    const supportErr = validateEmail(draft.supportEmail);
    if (supportErr) next.supportEmail = supportErr;
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    setMessage(null);
    const res = await saveBivoBrand(draft);
    setSaving(false);
    if (res.ok) {
      setBrand(res.brand);
      setDraft(res.brand);
      setMessage({ kind: "ok", text: "Branding saved." });
    } else {
      setMessage({ kind: "err", text: res.error });
    }
  };

  // Push the colours + layout being edited into CSS variables, live, so the buttons,
  // inputs and preview on this page reflect them immediately (same pattern as
  // SettingsProvider.tsx for the rest of the site). --bivo-* is only ever read
  // inside .bivo-scoped rules, so none of this affects the rest of the site.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--bivo-primary", draft.buttonColor);
    root.style.setProperty("--bivo-primary-ink", readableOn(draft.buttonColor));
    root.style.setProperty("--bivo-link", draft.linkColor);
    root.style.setProperty("--bivo-heading-size", `${draft.headingSize}px`);
    root.style.setProperty("--bivo-input-height", `${draft.inputHeight}px`);
  }, [draft.buttonColor, draft.linkColor, draft.headingSize, draft.inputHeight]);

  if (!ready) {
    return (
      <div className="flex justify-center py-24">
        <SpinnerIcon className="h-6 w-6" style={{ color: "var(--bivo-primary)" }} />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <form onSubmit={onSave} noValidate className="space-y-6">
        <div className="bivo-card space-y-6 p-8 sm:p-10">
          <div>
            <h1 className="bivo-font-display text-3xl font-semibold">Bivo branding</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--bivo-muted)" }}>
              Everything people see on the Bivo sign-in page — colours and text — is controlled from here.
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
          <TextField id="supportEmail" label="Support email" value={draft.supportEmail} onChange={set("supportEmail")} error={errors.supportEmail} />
        </div>

        <Card title="Colours" hint="The button colour is also used for the logo placeholder tile; text on buttons adjusts automatically for contrast.">
          <ColorField label="Button colour" value={draft.buttonColor} onChange={setColor("buttonColor")} />
          <ColorField label="Hyperlink text colour" value={draft.linkColor} onChange={setColor("linkColor")} />
        </Card>

        <Card title="Sign-in text">
          <TextField id="signinHeadline" label="Heading" value={draft.signinHeadline} onChange={set("signinHeadline")} error={errors.signinHeadline} />
          <TextField id="signinSubline" label="Subtitle" value={draft.signinSubline} onChange={set("signinSubline")} />
          <TextField id="signinPasswordTitle" label="Password step heading" value={draft.signinPasswordTitle} onChange={set("signinPasswordTitle")} />
          <TextField id="signinSubmitLabel" label="Submit button" value={draft.signinSubmitLabel} onChange={set("signinSubmitLabel")} />
          <TextField id="signinSwitchLabel" label="\"Switch to sign-up\" link" value={draft.signinSwitchLabel} onChange={set("signinSwitchLabel")} />
          <TextField id="signinDoneTitle" label="Success heading" value={draft.signinDoneTitle} onChange={set("signinDoneTitle")} />
          <TextField id="signinDoneMessage" label="Success message" value={draft.signinDoneMessage} onChange={set("signinDoneMessage")} />
        </Card>

        <Card title="Sign-up text" hint="Use {appName} and {name} — they're filled in automatically.">
          <TextField id="signupHeadline" label="Heading" value={draft.signupHeadline} onChange={set("signupHeadline")} />
          <TextField id="signupSublineTemplate" label="Subtitle" value={draft.signupSublineTemplate} onChange={set("signupSublineTemplate")} />
          <TextField id="signupPasswordTitle" label="Password step heading" value={draft.signupPasswordTitle} onChange={set("signupPasswordTitle")} />
          <TextField id="signupSubmitLabel" label="Submit button" value={draft.signupSubmitLabel} onChange={set("signupSubmitLabel")} />
          <TextField id="signupSwitchLabel" label="\"Switch to sign-in\" link" value={draft.signupSwitchLabel} onChange={set("signupSwitchLabel")} />
          <TextField id="signupDoneTitle" label="Success heading" value={draft.signupDoneTitle} onChange={set("signupDoneTitle")} />
          <TextField id="signupDoneMessageTemplate" label="Success message" value={draft.signupDoneMessageTemplate} onChange={set("signupDoneMessageTemplate")} />
        </Card>

        <Card title="Shared labels">
          <TextField id="nameLabel" label="Name field label" value={draft.nameLabel} onChange={set("nameLabel")} />
          <TextField id="emailLabel" label="Email field label" value={draft.emailLabel} onChange={set("emailLabel")} />
          <TextField id="passwordLabel" label="Password field label" value={draft.passwordLabel} onChange={set("passwordLabel")} />
          <TextField id="nextLabel" label="\"Next\" button" value={draft.nextLabel} onChange={set("nextLabel")} />
          <TextField id="backLabel" label="\"Back\" button" value={draft.backLabel} onChange={set("backLabel")} />
          <TextField id="useAnotherAccountLabel" label="\"Use another account\" button" value={draft.useAnotherAccountLabel} onChange={set("useAnotherAccountLabel")} />
          <TextField id="demoNoticeText" label="Demo-mode notice" value={draft.demoNoticeText} onChange={set("demoNoticeText")} />
          <TextField id="confirmEmailNoticeText" label="\"Confirm your email\" notice" value={draft.confirmEmailNoticeText} onChange={set("confirmEmailNoticeText")} />
        </Card>

        <Card title="Help line" hint="Shown lower on the page, below the form: a small heading, then \"Contact\" and the support email on their own line.">
          <TextField id="needHelpHeading" label="Heading" value={draft.needHelpHeading} onChange={set("needHelpHeading")} />
          <TextField id="contactLabel" label="Word before the email" value={draft.contactLabel} onChange={set("contactLabel")} />
        </Card>

        <Card title="Layout & spacing" hint="Controls the /bivo page itself — sizes are in pixels.">
          <NumberField id="pageMaxWidth" label="Content width" value={draft.pageMaxWidth} onChange={setNumber("pageMaxWidth")} min={420} max={1280} step={8} />
          <div className="grid grid-cols-2 gap-3">
            <NumberField id="pagePaddingX" label="Page padding, left/right" value={draft.pagePaddingX} onChange={setNumber("pagePaddingX")} min={0} max={96} step={2} />
            <NumberField id="pagePaddingY" label="Page padding, top/bottom" value={draft.pagePaddingY} onChange={setNumber("pagePaddingY")} min={0} max={160} step={2} />
          </div>
          <NumberField id="columnGap" label="Gap between the two columns" value={draft.columnGap} onChange={setNumber("columnGap")} min={0} max={120} step={4} />
          <NumberField id="headingSize" label="Heading text size" value={draft.headingSize} onChange={setNumber("headingSize")} min={20} max={72} step={2} />
          <NumberField id="inputHeight" label="Field height" value={draft.inputHeight} onChange={setNumber("inputHeight")} min={36} max={72} step={2} />
        </Card>

        <div className="bivo-card flex flex-wrap justify-end gap-3 p-6">
          <button type="button" className="bivo-btn bivo-btn-ghost" onClick={() => setDraft(brand)}>
            Discard changes
          </button>
          <button type="submit" className="bivo-btn bivo-btn-primary px-7" disabled={saving}>
            {saving && <SpinnerIcon className="h-4 w-4" />} Save changes
          </button>
        </div>
      </form>

      <aside className="bivo-card h-fit p-8" style={{ position: "sticky", top: "1rem" }}>
        <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--bivo-muted)" }}>
          Live preview
        </p>
        <div className="mt-6">
          <BivoLogo name={draft.appName || "B"} logoUrl={draft.logoUrl} />
          <h2 className="mt-6 font-medium" style={{ fontSize: "clamp(22px, 2.5vw, 30px)" }}>
            {draft.signinHeadline || "Sign in"}
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--bivo-muted)" }}>
            {draft.signinSubline}
          </p>
          <div className="relative mt-6" style={{ height: "var(--bivo-input-height)" }}>
            <div className="h-full w-full rounded-xl border" style={{ borderColor: "var(--bivo-input-border)" }} />
            <span className="absolute left-4 top-2 text-xs" style={{ color: "var(--bivo-primary)" }}>
              {draft.emailLabel}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="bivo-btn bivo-btn-ghost">{draft.signinSwitchLabel}</span>
            <span className="bivo-btn bivo-btn-primary">{draft.nextLabel}</span>
          </div>
          <div className="mt-8 text-sm" style={{ color: "var(--bivo-muted)" }}>
            <p>{draft.needHelpHeading}</p>
            <p className="mt-1">
              {draft.contactLabel} <a className="bivo-link font-medium underline">{draft.supportEmail}</a>
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="bivo-card space-y-5 p-8 sm:p-10">
      <div>
        <h2 className="bivo-font-display text-xl font-semibold">{title}</h2>
        {hint && (
          <p className="mt-1 text-sm" style={{ color: "var(--bivo-muted)" }}>
            {hint}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (hex: string) => void }) {
  const [raw, setRaw] = useState(value);
  useEffect(() => setRaw(value), [value]);
  return (
    <div>
      <span className="bivo-label">{label}</span>
      <div className="flex items-center gap-3">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-14 shrink-0 cursor-pointer rounded-xl border p-1"
          style={{ borderColor: "var(--bivo-input-border)" }}
        />
        <input
          type="text"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          value={raw}
          onChange={(e) => {
            const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
            setRaw(v);
            if (isHexColor(v)) onChange(v.toLowerCase());
          }}
          className="bivo-input h-11"
          placeholder="#1f6b4f"
          maxLength={7}
        />
      </div>
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string | undefined;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="bivo-label">
        {label}
      </label>
      <input id={id} value={value} onChange={onChange} placeholder={placeholder} aria-invalid={!!error} className="bivo-input h-11" />
      {error && <p className="bivo-error">{error}</p>}
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="bivo-label" style={{ marginBottom: 0 }}>
          {label}
        </label>
        <span className="text-sm tabular-nums" style={{ color: "var(--bivo-muted)" }}>
          {value}px
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full"
        style={{ accentColor: "var(--bivo-primary)" }}
      />
    </div>
  );
}
