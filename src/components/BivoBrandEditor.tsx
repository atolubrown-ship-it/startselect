"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type CSSProperties, type FormEvent, type ReactNode } from "react";
import BivoSignIn from "@/components/BivoSignIn";
import BivoLogo from "@/components/BivoLogo";
import { DeviceIcon, PhoneIcon, SpinnerIcon, TrashIcon, UploadIcon } from "@/components/icons";
import { fileToLogoDataUrl } from "@/lib/image";
import {
  DEFAULT_BIVO_BRAND,
  buildBivoCssVars,
  loadBivoBrand,
  saveBivoBrand,
  type BivoBrand,
} from "@/lib/bivoBrand";
import { isHexColor } from "@/lib/settings";

type AnyKey = keyof BivoBrand;
type PreviewMode = "desktop" | "mobile";

const FONT_OPTIONS: { value: BivoBrand["fontFamily"]; label: string }[] = [
  { value: "outfit", label: "Outfit (default)" },
  { value: "system", label: "System sans-serif" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Monospace" },
];

/** The branding + copy editor shown at /signin/admin once an admin is signed in. */
export default function BivoBrandEditor() {
  const [brand, setBrand] = useState<BivoBrand>(DEFAULT_BIVO_BRAND);
  const [draft, setDraft] = useState<BivoBrand>(DEFAULT_BIVO_BRAND);
  const [ready, setReady] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<AnyKey, string>>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [preview, setPreview] = useState<PreviewMode>("desktop");
  const [dirty, setDirty] = useState(false);

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

  const update = <K extends AnyKey>(key: K, value: BivoBrand[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setDirty(true);
    setMessage(null);
  };
  const set = (key: AnyKey) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(key, e.target.value as never);
  const setBool = (key: AnyKey) => (e: ChangeEvent<HTMLInputElement>) => update(key, e.target.checked as never);
  const setNum = (key: AnyKey) => (n: number) => update(key, n as never);

  const onLogoFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const url = await fileToLogoDataUrl(file, 256);
      update("logoUrl", url);
    } catch (err) {
      setMessage({ kind: "err", text: err instanceof Error ? err.message : "Could not use that image." });
    }
  };

  const onBackgroundFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const url = await fileToLogoDataUrl(file, 1600);
      update("backgroundImageUrl", url);
    } catch (err) {
      setMessage({ kind: "err", text: err instanceof Error ? err.message : "Could not use that image." });
    }
  };

  const validateDraft = (): Partial<Record<AnyKey, string>> => {
    const next: Partial<Record<AnyKey, string>> = {};
    if (!draft.appName.trim()) next.appName = "Enter a name";
    else if (draft.appName.trim().length > 40) next.appName = "Keep the name under 40 characters";
    if (!draft.signinHeadline.trim()) next.signinHeadline = "Enter a heading";
    for (const [key, url] of [
      ["successRedirectUrl", draft.successRedirectUrl],
    ] as const) {
      const t = url.trim();
      if (!t) continue;
      const okPath = t.startsWith("/") && !t.startsWith("//") && !t.includes("\\") && !/[\u0000-\u001f\u007f]/.test(t);
      const okHttps = /^https:\/\/[^\s\\]+$/i.test(t) && !/[\u0000-\u001f\u007f]/.test(t);
      if (!okPath && !okHttps) next[key] = "Use a same-site path (e.g. /dashboard) or a full https:// link.";
    }
    return next;
  };

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    const next = validateDraft();
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    setMessage(null);
    const res = await saveBivoBrand(draft);
    setSaving(false);
    if (res.ok) {
      setBrand(res.brand);
      setDraft(res.brand);
      setDirty(false);
      setMessage({ kind: "ok", text: "Changes saved." });
    } else {
      setMessage({ kind: "err", text: res.error });
    }
  };

  const onResetToDefault = () => {
    setDraft(DEFAULT_BIVO_BRAND);
    setDirty(true);
    setErrors({});
    setMessage(null);
  };

  const onDiscard = () => {
    setDraft(brand);
    setDirty(false);
    setErrors({});
    setMessage(null);
  };

  // The live preview renders the REAL BivoSignIn with the draft, scoped to its own
  // wrapper via buildBivoCssVars (never document.documentElement) — so the admin
  // dashboard's own chrome, outside that wrapper, never changes no matter what's
  // being drafted. previewOnly disables real sign-in/network calls and the
  // auto-redirect inside the sign-in.
  const previewVars = useMemo(() => buildBivoCssVars(draft) as CSSProperties, [draft]);

  if (!ready) {
    return (
      <div className="flex justify-center py-24">
        <SpinnerIcon className="h-6 w-6" style={{ color: "var(--bivo-primary)" }} />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <form onSubmit={onSave} noValidate className="space-y-6">
        <div className="bivo-card space-y-6">
          <div>
            <h1 className="bivo-font-display text-3xl font-semibold">Bivo branding</h1>
            <p className="mt-1 text-sm bivo-muted-text">Everything on the /signin page — branding, copy, and the size and spacing of every element — is controlled from here.</p>
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
          {dirty && !message && <p className="text-sm bivo-muted-text">You have unsaved changes.</p>}
        </div>

        <Card title="Logo & name">
          <TextField id="appName" label="App name" value={draft.appName} onChange={set("appName")} error={errors.appName} />
          <div className="space-y-3">
            <span className="bivo-label">Logo</span>
            <div className="flex flex-wrap items-center gap-4">
              <BivoLogo name={draft.appName || "B"} logoUrl={draft.logoUrl} className="h-16 w-16 text-2xl" />
              <label className="bivo-btn bivo-btn-outline cursor-pointer">
                <UploadIcon className="h-4 w-4" /> Upload image
                <input type="file" accept="image/*" className="sr-only" onChange={onLogoFile} />
              </label>
              {draft.logoUrl && (
                <button type="button" className="bivo-btn bivo-btn-ghost" onClick={() => update("logoUrl", "")}>
                  <TrashIcon className="h-4 w-4" /> Remove
                </button>
              )}
            </div>
            <input
              placeholder="…or paste an image link (https://…)"
              value={draft.logoUrl.startsWith("data:") ? "" : draft.logoUrl}
              onChange={(e) => update("logoUrl", e.target.value)}
              className="bivo-input h-11"
            />
          </div>
        </Card>

        <Card title="Colours & background" hint="Button text colour adjusts automatically for contrast against the button colour.">
          <ColorField label="Background colour" value={draft.backgroundColor} onChange={(v) => update("backgroundColor", v)} />
          <div className="space-y-3">
            <span className="bivo-label">Background image (optional)</span>
            <div className="flex flex-wrap items-center gap-3">
              <label className="bivo-btn bivo-btn-outline cursor-pointer">
                <UploadIcon className="h-4 w-4" /> Upload image
                <input type="file" accept="image/*" className="sr-only" onChange={onBackgroundFile} />
              </label>
              {draft.backgroundImageUrl && (
                <button type="button" className="bivo-btn bivo-btn-ghost" onClick={() => update("backgroundImageUrl", "")}>
                  <TrashIcon className="h-4 w-4" /> Remove
                </button>
              )}
            </div>
          </div>
          <ColorField label="Text colour" value={draft.textColor} onChange={(v) => update("textColor", v)} />
          <ColorField label="Button colour" value={draft.buttonColor} onChange={(v) => update("buttonColor", v)} />
          <ColorField label="Link colour" value={draft.linkColor} onChange={(v) => update("linkColor", v)} />
          <ColorField label="Border colour" value={draft.borderColor} onChange={(v) => update("borderColor", v)} />
          <SelectField
            id="fontFamily"
            label="Font"
            value={draft.fontFamily}
            onChange={(v) => update("fontFamily", v)}
            options={FONT_OPTIONS}
          />
          <SelectField
            id="fontWeight"
            label="Text weight"
            value={String(draft.fontWeight)}
            onChange={(v) => update("fontWeight", Number(v) as BivoBrand["fontWeight"])}
            options={[
              { value: "400", label: "Regular" },
              { value: "500", label: "Medium" },
              { value: "600", label: "Semibold" },
              { value: "700", label: "Bold" },
            ]}
          />
        </Card>

        <Card title="Page content">
          <TextField id="signinHeadline" label="Sign-in heading" value={draft.signinHeadline} onChange={set("signinHeadline")} error={errors.signinHeadline} />
          <TextField id="signinSubline" label="Sign-in subheading" value={draft.signinSubline} onChange={set("signinSubline")} />
          <TextField id="signinPasswordTitle" label="Password step heading" value={draft.signinPasswordTitle} onChange={set("signinPasswordTitle")} />
          <TextField id="signinSwitchLabel" label={'"Create account" link'} value={draft.signinSwitchLabel} onChange={set("signinSwitchLabel")} />
          <TextField id="emailLabel" label="Email field label" value={draft.emailLabel} onChange={set("emailLabel")} />
          <TextField id="passwordLabel" label="Password field label" value={draft.passwordLabel} onChange={set("passwordLabel")} />
          <TextField id="nextLabel" label={'"Next" button'} value={draft.nextLabel} onChange={set("nextLabel")} />
          <TextField id="showPasswordLabel" label={'"Show password" checkbox'} value={draft.showPasswordLabel} onChange={set("showPasswordLabel")} />
          <hr className="opacity-10" />
          <TextField id="signinDoneTitle" label="Success heading" value={draft.signinDoneTitle} onChange={set("signinDoneTitle")} />
          <TextField id="signedInAsTemplate" label="Signed-in identity text (use {email})" value={draft.signedInAsTemplate} onChange={set("signedInAsTemplate")} />
          <TextField id="continueLabel" label="Continue button" value={draft.continueLabel} onChange={set("continueLabel")} />
          <TextField id="redirectingText" label="Automatic redirect message" value={draft.redirectingText} onChange={set("redirectingText")} />
          <TextField id="useAnotherAccountLabel" label={'"Use another account" button'} value={draft.useAnotherAccountLabel} onChange={set("useAnotherAccountLabel")} />
          <TextField id="demoNoticeText" label="Demo-mode notice" value={draft.demoNoticeText} onChange={set("demoNoticeText")} />
        </Card>

        <Card title="Validation & error messages" hint={'"{min}" in the password message is replaced with the minimum length.'}>
          <TextField id="genericErrorMessage" label="Generic error" value={draft.genericErrorMessage} onChange={set("genericErrorMessage")} />
          <TextField id="emailRequiredMessage" label="Email required" value={draft.emailRequiredMessage} onChange={set("emailRequiredMessage")} />
          <TextField id="emailInvalidMessage" label="Email invalid" value={draft.emailInvalidMessage} onChange={set("emailInvalidMessage")} />
          <TextField id="passwordRequiredMessage" label="Password required" value={draft.passwordRequiredMessage} onChange={set("passwordRequiredMessage")} />
          <TextField id="passwordTooShortMessage" label="Password too short" value={draft.passwordTooShortMessage} onChange={set("passwordTooShortMessage")} />
        </Card>

        <Card title="After sign-in" hint="Where a visitor lands once they sign in or create an account. Leave blank to keep showing the success screen.">
          <TextField id="successRedirectUrl" label="Redirect link" value={draft.successRedirectUrl} onChange={set("successRedirectUrl")} error={errors.successRedirectUrl} placeholder="/ or https://example.com/welcome" />
        </Card>

        <Card title="Size & spacing: page and card" hint="All sizes are in pixels. Changes show in the live preview.">
          <NumberField id="pagePaddingX" label="Page padding, left/right" value={draft.pagePaddingX} onChange={setNum("pagePaddingX")} min={0} max={96} step={2} unit="px" />
          <NumberField id="pagePaddingY" label="Page padding, top/bottom" value={draft.pagePaddingY} onChange={setNum("pagePaddingY")} min={0} max={160} step={2} unit="px" />
          <NumberField id="cardWidth" label="Card width" value={draft.cardWidth} onChange={setNum("cardWidth")} min={280} max={720} step={8} unit="px" />
          <NumberField id="cardPaddingX" label="Card padding, left/right" value={draft.cardPaddingX} onChange={setNum("cardPaddingX")} min={8} max={96} step={2} unit="px" />
          <NumberField id="cardPaddingY" label="Card padding, top/bottom" value={draft.cardPaddingY} onChange={setNum("cardPaddingY")} min={8} max={120} step={2} unit="px" />
          <NumberField id="cardRadius" label="Card corner radius" value={draft.cardRadius} onChange={setNum("cardRadius")} min={0} max={40} step={2} unit="px" />
        </Card>

        <Card title="Size & spacing: header">
          <NumberField id="logoSize" label="Logo size" value={draft.logoSize} onChange={setNum("logoSize")} min={16} max={120} step={2} unit="px" />
          <NumberField id="headerTextSize" label="Header text size" value={draft.headerTextSize} onChange={setNum("headerTextSize")} min={11} max={28} step={1} unit="px" />
          <NumberField id="headerPaddingY" label="Header padding, top/bottom" value={draft.headerPaddingY} onChange={setNum("headerPaddingY")} min={0} max={48} step={2} unit="px" />
        </Card>

        <Card title="Size & spacing: headings">
          <NumberField id="titleSize" label="Heading size" value={draft.titleSize} onChange={setNum("titleSize")} min={16} max={56} step={2} unit="px" />
          <NumberField id="sublineSize" label="Subheading size" value={draft.sublineSize} onChange={setNum("sublineSize")} min={11} max={28} step={1} unit="px" />
          <NumberField id="titleSpacing" label="Space between heading and subheading" value={draft.titleSpacing} onChange={setNum("titleSpacing")} min={0} max={48} step={2} unit="px" />
          <NumberField id="sublineSpacing" label="Space before the first field" value={draft.sublineSpacing} onChange={setNum("sublineSpacing")} min={0} max={80} step={2} unit="px" />
        </Card>

        <Card title="Size & spacing: fields">
          <NumberField id="inputHeight" label="Field height" value={draft.inputHeight} onChange={setNum("inputHeight")} min={36} max={80} step={2} unit="px" />
          <NumberField id="inputTextSize" label="Field text size" value={draft.inputTextSize} onChange={setNum("inputTextSize")} min={12} max={28} step={1} unit="px" />
          <NumberField id="labelSize" label="Field label size" value={draft.labelSize} onChange={setNum("labelSize")} min={11} max={28} step={1} unit="px" />
          <NumberField id="inputBorderWidth" label="Field border width (0–3)" value={draft.inputBorderWidth} onChange={setNum("inputBorderWidth")} min={0} max={3} step={1} unit="px" />
          <NumberField id="inputBorderRadius" label="Field corner radius" value={draft.inputBorderRadius} onChange={setNum("inputBorderRadius")} min={0} max={28} step={2} unit="px" />
          <ColorField label="Field background colour" value={draft.inputBackgroundColor} onChange={(v) => update("inputBackgroundColor", v)} />
          <ColorField label="Field text colour" value={draft.inputTextColor} onChange={(v) => update("inputTextColor", v)} />
          <NumberField id="fieldSpacing" label="Space between a field and what is below it" value={draft.fieldSpacing} onChange={setNum("fieldSpacing")} min={0} max={48} step={2} unit="px" />
        </Card>

        <Card title="Size & spacing: links, checkbox and text">
          <NumberField id="linkSize" label="Link text size" value={draft.linkSize} onChange={setNum("linkSize")} min={11} max={24} step={1} unit="px" />
          <NumberField id="checkboxSize" label="Checkbox size" value={draft.checkboxSize} onChange={setNum("checkboxSize")} min={12} max={32} step={2} unit="px" />
          <NumberField id="checkboxSpacing" label="Space above the checkbox" value={draft.checkboxSpacing} onChange={setNum("checkboxSpacing")} min={0} max={48} step={2} unit="px" />
          <NumberField id="policyTextSize" label="Privacy / terms text size" value={draft.policyTextSize} onChange={setNum("policyTextSize")} min={10} max={22} step={1} unit="px" />
          <NumberField id="policySpacing" label="Space above the privacy / terms text" value={draft.policySpacing} onChange={setNum("policySpacing")} min={0} max={96} step={2} unit="px" />
          <NumberField id="messageTextSize" label="Error and notice text size" value={draft.messageTextSize} onChange={setNum("messageTextSize")} min={10} max={22} step={1} unit="px" />
        </Card>

        <Card title="Size & spacing: buttons">
          <NumberField id="buttonHeight" label="Button height" value={draft.buttonHeight} onChange={setNum("buttonHeight")} min={32} max={72} step={2} unit="px" />
          <NumberField id="buttonTextSize" label="Button text size" value={draft.buttonTextSize} onChange={setNum("buttonTextSize")} min={11} max={24} step={1} unit="px" />
          <NumberField id="buttonPaddingX" label="Button padding, left/right" value={draft.buttonPaddingX} onChange={setNum("buttonPaddingX")} min={8} max={80} step={2} unit="px" />
          <NumberField id="buttonRowSpacing" label="Space above the button row" value={draft.buttonRowSpacing} onChange={setNum("buttonRowSpacing")} min={0} max={96} step={2} unit="px" />
        </Card>

        <Card title="Size & spacing: success screen and footer">
          <NumberField id="doneIconSize" label="Success icon size" value={draft.doneIconSize} onChange={setNum("doneIconSize")} min={32} max={120} step={2} unit="px" />
          <NumberField id="footerTextSize" label="Footer text size" value={draft.footerTextSize} onChange={setNum("footerTextSize")} min={9} max={20} step={1} unit="px" />
          <NumberField id="footerSpacing" label="Space above the footer" value={draft.footerSpacing} onChange={setNum("footerSpacing")} min={0} max={80} step={2} unit="px" />
        </Card>

        <Card title="Visibility" hint="Hide individual elements without removing their text.">
          <Toggle id="showLogo" label="Show the logo" checked={draft.showLogo} onChange={setBool("showLogo")} />
          <Toggle id="showSubline" label="Show the subheading" checked={draft.showSubline} onChange={setBool("showSubline")} />
          <Toggle id="showSwitchLink" label={'Show the "Create account" link'} checked={draft.showSwitchLink} onChange={setBool("showSwitchLink")} />
        </Card>

        <div className="bivo-admin-card flex flex-wrap justify-end gap-3">
          <button type="button" className="bivo-btn bivo-btn-ghost" onClick={onResetToDefault}>
            Reset to default
          </button>
          <button type="button" className="bivo-btn bivo-btn-outline" onClick={onDiscard} disabled={!dirty}>
            Discard changes
          </button>
          <button type="submit" className="bivo-btn bivo-btn-primary px-7" disabled={saving}>
            {saving && <SpinnerIcon className="h-4 w-4" />} Save changes
          </button>
        </div>
      </form>

      <aside className="h-fit space-y-3" style={{ position: "sticky", top: "1rem" }}>
        <div className="bivo-admin-card flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "#6b7280" }}>
            Live preview
          </p>
          <div className="flex gap-1 rounded-full border p-1" style={{ borderColor: "#dbe1e8" }}>
            <button
              type="button"
              onClick={() => setPreview("desktop")}
              aria-pressed={preview === "desktop"}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm"
              style={preview === "desktop" ? { backgroundColor: "#1f6b4f", color: "#ffffff" } : { color: "#1b1f24" }}
            >
              <DeviceIcon className="h-4 w-4" /> Desktop
            </button>
            <button
              type="button"
              onClick={() => setPreview("mobile")}
              aria-pressed={preview === "mobile"}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm"
              style={preview === "mobile" ? { backgroundColor: "#1f6b4f", color: "#ffffff" } : { color: "#1b1f24" }}
            >
              <PhoneIcon className="h-4 w-4" /> Mobile
            </button>
          </div>
        </div>

        <div
          className="overflow-hidden rounded-2xl border"
          style={{ borderColor: "#dbe1e8", width: preview === "mobile" ? 375 : "100%", maxWidth: "100%", margin: preview === "mobile" ? "0 auto" : undefined }}
        >
          <div
            className="flex min-h-[560px] flex-col justify-center overflow-auto px-4 py-6"
            style={{
              ...previewVars,
              alignItems: "center",
            }}
          >
            <div style={{ transform: preview === "mobile" ? "scale(0.92)" : undefined, width: "100%", display: "flex", justifyContent: "center" }}>
              <BivoSignIn brand={draft} previewOnly />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="bivo-admin-card space-y-5">
      <div>
        <h2 className="bivo-font-display text-xl font-semibold">{title}</h2>
        {hint && <p className="mt-1 text-sm" style={{ color: "#6b7280" }}>{hint}</p>}
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
          style={{ borderColor: "#dbe1e8" }}
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
          className="h-11 w-full rounded-xl border px-4 text-sm"
          style={{ borderColor: "#dbe1e8" }}
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
      <input
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={!!error}
        className="h-11 w-full rounded-xl border px-4 text-sm"
        style={error ? { borderColor: "var(--bivo-danger)" } : { borderColor: "#dbe1e8" }}
      />
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
  unit = "px",
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="bivo-label" style={{ marginBottom: 0 }}>
          {label}
        </label>
        <span className="text-sm tabular-nums" style={{ color: "#6b7280" }}>
          {value}
          {unit}
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
        style={{ accentColor: "#1f6b4f" }}
      />
    </div>
  );
}

function SelectField<T extends string>({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div>
      <label htmlFor={id} className="bivo-label">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-11 w-full rounded-xl border px-3 text-sm"
        style={{ borderColor: "#dbe1e8" }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (e: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label htmlFor={id} className="flex items-center justify-between gap-4 py-1">
      <span className="text-sm font-medium">{label}</span>
      <input id={id} type="checkbox" checked={checked} onChange={onChange} className="h-5 w-9 cursor-pointer" style={{ accentColor: "#1f6b4f" }} />
    </label>
  );
}
