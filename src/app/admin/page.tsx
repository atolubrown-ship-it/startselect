"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { HEADER_VARIANTS } from "@/components/headerStyles";
import { useSettings } from "@/components/SettingsProvider";
import { AccountIcon, CartIcon, MenuIcon, SearchIcon } from "@/components/icons";
import { fileToLogoDataUrl } from "@/lib/image";
import { useAdminAuth } from "@/lib/useAdminAuth";
import {
  LEGAL_KEYS,
  LOGO_HEIGHT_MAX,
  LOGO_HEIGHT_MIN,
  SOCIAL_KEYS,
  formatAlertDateTime,
  isHexColor,
  nowForInput,
  safeUrl,
  themeVars,
  type ButtonShape,
  type HeaderStyle,
  type LegalKey,
  type SiteSettings,
  type SocialKey,
} from "@/lib/settings";

const INPUT =
  "h-12 w-full rounded-xl border border-q-line bg-white px-4 text-[16px] leading-6 text-q-ink outline-none placeholder:text-q-mute focus:border-q-blue";
const TEXTAREA =
  "min-h-[96px] w-full resize-y rounded-xl border border-q-line bg-white px-4 py-3 text-[16px] leading-6 text-q-ink outline-none placeholder:text-q-mute focus:border-q-blue";
const BTN_SECONDARY =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl border border-q-line bg-white px-4 text-[14px] font-semibold text-q-ink hover:bg-q-field active:bg-q-field";

const LEGAL_LABELS: Record<LegalKey, string> = {
  terms: "Terms & Conditions link",
  privacy: "Privacy Policy link",
  cookies: "Cookie Statement link",
  accessibility: "Accessibility link",
  sitemap: "Sitemap link",
};

const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/** "instagram.com/me" → "https://instagram.com/me"; anything that isn't http(s) becomes empty. */
function fixUrl(value: string): string {
  const t = value.trim();
  if (!t) return "";
  return safeUrl(/^[a-z][a-z0-9+.-]*:/i.test(t) ? t : `https://${t}`);
}

/* ------------------------------ small pieces ------------------------------ */

function Card({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-q-line bg-white p-4 sm:p-5">
      <h2 className="q-h3">{title}</h2>
      {hint && <p className="q-sub mt-1">{hint}</p>}
      <div className="mt-4 flex flex-col gap-5">{children}</div>
    </section>
  );
}

function Field({ label, htmlFor, help, children }: { label: string; htmlFor?: string; help?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[14px] font-medium leading-5 text-q-ink">
        {label}
      </label>
      {children}
      {help && <p className="q-sub mt-1.5">{help}</p>}
    </div>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[14px] font-medium leading-5 text-q-ink" id={`seg-${slug(label)}`}>
        {label}
      </p>
      <div role="radiogroup" aria-labelledby={`seg-${slug(label)}`} className="flex gap-1 rounded-xl bg-q-field p-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={`min-h-[40px] flex-1 rounded-lg px-2 text-[14px] font-medium transition-colors ${
              value === o.value ? "bg-white text-q-ink shadow-card" : "text-q-sub"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (hex: string) => void }) {
  const [raw, setRaw] = useState(value);
  useEffect(() => setRaw(value), [value]);
  const id = `color-${slug(label)}`;
  return (
    <Field label={label} htmlFor={id}>
      <div className="flex items-center gap-3">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-14 shrink-0 cursor-pointer rounded-xl border border-q-line bg-white p-1"
        />
        <input
          id={id}
          type="text"
          inputMode="text"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          value={raw}
          onChange={(e) => {
            const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
            setRaw(v);
            if (isHexColor(v)) onChange(v.toLowerCase());
          }}
          className={INPUT}
          placeholder="#4a72c4"
          maxLength={7}
        />
      </div>
    </Field>
  );
}

/** Centered single-column screen used for sign-in and status messages. */
function CenterScreen({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-sm flex-col justify-center px-4 py-10">
      <div className="text-q-ink">
        <BrandLogo />
      </div>
      {children}
    </main>
  );
}

/* ------------------------------ sign-in screen ----------------------------- */

function LoginForm({ onSignIn }: { onSignIn: (email: string, password: string) => Promise<string | null> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const err = await onSignIn(email, password);
    if (err) setError(err);
    setBusy(false);
  };

  return (
    <CenterScreen>
      <h1 className="q-h1 mt-6">Admin sign in</h1>
      <p className="q-body mt-2">Sign in with the administrator account to manage branding and alert details.</p>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
        <label htmlFor="admin-email" className="sr-only">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="off"
          autoCorrect="off"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={INPUT}
          placeholder="Email"
        />
        <label htmlFor="admin-password" className="sr-only">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={INPUT}
          placeholder="Password"
        />
        {error && (
          <p role="alert" className="text-[13px] leading-5 text-red-600">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className="q-btn q-btn-primary disabled:opacity-60">
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <Link href="/" className={BTN_SECONDARY}>
          Back to site
        </Link>
      </form>
    </CenterScreen>
  );
}

function StatusScreen({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <CenterScreen>
      <h1 className="q-h1 mt-6">{title}</h1>
      <div className="q-body mt-2">{children}</div>
      <div className="mt-6 flex flex-col gap-3">
        {actions}
        <Link href="/" className={BTN_SECONDARY}>
          Back to site
        </Link>
      </div>
    </CenterScreen>
  );
}

/* --------------------------------- panel --------------------------------- */

function AdminPanel({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const { settings, loaded, syncState, syncError, refresh, save } = useSettings();
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [pendingLogo, setPendingLogo] = useState<Blob | null>(null);
  const [synced, setSynced] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [logoBusy, setLogoBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Start editing from the shared settings once they have been read from the database.
  const ready = loaded && syncState !== "loading";
  useEffect(() => {
    if (ready && !synced) {
      setDraft(settings);
      setPendingLogo(null);
      setSynced(true);
    }
  }, [ready, synced, settings]);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(settings), [draft, settings]);

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setStatus(null);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setLogoBusy(true);
    setStatus(null);
    try {
      const dataUrl = await fileToLogoDataUrl(file);
      const blob = await (await fetch(dataUrl)).blob();
      setPendingLogo(blob);
      set("logoUrl", dataUrl); // local preview only — uploaded to Storage when you tap Save
    } catch (err) {
      setStatus({ kind: "error", text: err instanceof Error ? err.message : "Couldn't use that image." });
    } finally {
      setLogoBusy(false);
      if (fileRef.current) fileRef.current.value = ""; // allow picking the same file again
    }
  };

  const onRemoveLogo = () => {
    setPendingLogo(null);
    set("logoUrl", null);
  };

  const onSave = async () => {
    if (saving) return;
    setSaving(true);
    setStatus(null);
    const res = await save(draft, pendingLogo);
    setSaving(false);
    if (res.ok) {
      setDraft(res.settings);
      setPendingLogo(null);
      setStatus({ kind: "ok", text: "Saved. Your changes are now live for every visitor." });
    } else {
      setStatus({ kind: "error", text: res.error });
    }
  };

  const onDiscard = () => {
    setDraft(settings);
    setPendingLogo(null);
    setStatus(null);
  };

  const onRetryLoad = async () => {
    setSynced(false);
    await refresh();
  };

  if (!ready || !synced) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <p className="q-sub" role="status">
          Loading settings…
        </p>
      </div>
    );
  }

  const preview = HEADER_VARIANTS[draft.headerStyle];
  const previewVars = themeVars(draft) as unknown as CSSProperties;

  return (
    <div className="min-h-[100dvh] bg-q-field/60 pb-44" style={{ overflowX: "clip" }}>
      {/* Admin top bar */}
      <header className="sticky top-0 z-30 border-b border-q-line bg-white" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="mx-auto flex h-14 max-w-xl items-center justify-between gap-3 px-4">
          <h1 className="text-[17px] font-semibold text-q-ink">Admin portal</h1>
          <div className="flex items-center gap-2">
            <Link href="/" className={BTN_SECONDARY}>
              View site
            </Link>
            <button type="button" onClick={onSignOut} className={BTN_SECONDARY}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-4">
        <p className="q-sub truncate">Signed in as {email}</p>

        {syncState === "error" && syncError && (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-[14px] leading-5 text-red-800">
            <p>{syncError}</p>
            <p className="mt-1">You&apos;re seeing the last known settings. Saving may not work until this is fixed.</p>
            <button type="button" onClick={onRetryLoad} className={`${BTN_SECONDARY} mt-3`}>
              Try again
            </button>
          </div>
        )}

        {/* Branding */}
        <Card title="Branding" hint="The company name and logo update everywhere on the site when you save.">
          <Field label="Company / site name" htmlFor="site-name">
            <input
              id="site-name"
              type="text"
              value={draft.siteName}
              maxLength={60}
              onChange={(e) => set("siteName", e.target.value)}
              className={INPUT}
              placeholder="Quilo"
            />
          </Field>

          <div>
            <p className="mb-1.5 text-[14px] font-medium leading-5 text-q-ink">Logo</p>
            <div className="flex min-h-[96px] items-center justify-center rounded-xl border border-dashed border-q-line bg-white p-4 text-q-ink">
              <BrandLogo settings={draft} />
            </div>
            <p className="q-sub mt-1.5">
              {pendingLogo
                ? "New logo selected. Tap Save changes to upload it."
                : draft.logoUrl
                  ? "Preview. Your logo replaces the default icon and name everywhere."
                  : "Showing the default icon and name. Upload your own logo to replace both."}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {/* A real <label> + file input works reliably on iPhone Safari (Photos, Files, camera) */}
              <label className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-xl bg-q-blue px-4 text-[14px] font-semibold text-[color:var(--q-primary-ink)] hover:bg-q-blue-dark">
                {logoBusy ? "Processing…" : draft.logoUrl ? "Replace logo" : "Upload logo"}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => onFile(e.target.files?.[0])}
                />
              </label>
              {draft.logoUrl && (
                <button type="button" onClick={onRemoveLogo} className={BTN_SECONDARY}>
                  Remove logo
                </button>
              )}
            </div>
          </div>

          <Field label={`Logo size · ${draft.logoHeight}px`} htmlFor="logo-size">
            <input
              id="logo-size"
              type="range"
              min={LOGO_HEIGHT_MIN}
              max={LOGO_HEIGHT_MAX}
              step={2}
              value={draft.logoHeight}
              onChange={(e) => set("logoHeight", Number(e.target.value))}
              className="h-11 w-full accent-[var(--q-primary)]"
            />
          </Field>
        </Card>

        {/* Appearance */}
        <Card title="Appearance">
          <ColorField label="Primary brand colour" value={draft.primaryColor} onChange={(v) => set("primaryColor", v)} />
          <ColorField label="Secondary brand colour" value={draft.secondaryColor} onChange={(v) => set("secondaryColor", v)} />
          <Segmented<HeaderStyle>
            label="Header appearance"
            value={draft.headerStyle}
            options={(Object.keys(HEADER_VARIANTS) as HeaderStyle[]).map((k) => ({ value: k, label: HEADER_VARIANTS[k].label }))}
            onChange={(v) => set("headerStyle", v)}
          />
          <Segmented<ButtonShape>
            label="Button appearance"
            value={draft.buttonShape}
            options={[
              { value: "rounded", label: "Rounded" },
              { value: "pill", label: "Pill" },
              { value: "square", label: "Square" },
            ]}
            onChange={(v) => set("buttonShape", v)}
          />

          {/* Live preview (scoped theme variables) */}
          <div>
            <p className="mb-1.5 text-[14px] font-medium leading-5 text-q-ink">Preview</p>
            <div className="overflow-hidden rounded-xl border border-q-line bg-white" style={previewVars}>
              <div className={`border-b px-4 pb-3 pt-3 ${preview.bar}`} style={preview.style}>
                <div className="flex min-h-[44px] items-center justify-between gap-3">
                  <BrandLogo settings={draft} />
                  <div className="flex shrink-0 items-center gap-3">
                    <AccountIcon className="h-6 w-6" />
                    <CartIcon className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <MenuIcon className="h-6 w-6 shrink-0" />
                  <div className={`flex h-11 flex-1 items-center gap-3 rounded-full px-4 text-q-ink ${preview.field}`}>
                    <SearchIcon className="h-[18px] w-[18px]" />
                    <span className="text-[16px] text-q-mute">Search for</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 p-4">
                <span className="q-btn q-btn-primary">This wasn&apos;t me</span>
                <span className="q-btn q-btn-secondary">Yes, this was me</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Display settings */}
        <Card
          title="Alert display"
          hint="Demonstration details shown on the security-alert screen. They are labelled as sample data."
        >
          <Field label="Demonstration location" htmlFor="alert-location">
            <input
              id="alert-location"
              type="text"
              value={draft.alertLocation}
              maxLength={120}
              onChange={(e) => set("alertLocation", e.target.value)}
              className={INPUT}
            />
          </Field>
          <Field label="Device label" htmlFor="alert-device">
            <input
              id="alert-device"
              type="text"
              value={draft.alertDevice}
              maxLength={120}
              onChange={(e) => set("alertDevice", e.target.value)}
              className={INPUT}
            />
          </Field>
          <Field
            label="Display date / time"
            htmlFor="alert-date"
            help={`Shown as: ${formatAlertDateTime(draft.alertDateTime)}`}
          >
            <input
              id="alert-date"
              type="datetime-local"
              value={draft.alertDateTime.slice(0, 16)}
              onChange={(e) => e.target.value && set("alertDateTime", e.target.value)}
              className={INPUT}
            />
            <button type="button" onClick={() => set("alertDateTime", nowForInput())} className={`${BTN_SECONDARY} mt-2`}>
              Use today&apos;s date and time
            </button>
          </Field>
        </Card>

        {/* Footer settings */}
        <Card title="Footer" hint="Optional. Leave a link empty to keep it inactive.">
          <Field label="App promotion heading" htmlFor="promo-heading">
            <input
              id="promo-heading"
              type="text"
              value={draft.appPromoHeading}
              maxLength={80}
              onChange={(e) => set("appPromoHeading", e.target.value)}
              className={INPUT}
            />
          </Field>
          <Field label="App promotion text" htmlFor="promo-text" help="Tip: write {name} to insert the company name.">
            <textarea
              id="promo-text"
              value={draft.appPromoText}
              maxLength={200}
              onChange={(e) => set("appPromoText", e.target.value)}
              className={TEXTAREA}
            />
          </Field>
          <Field label="App download link" htmlFor="app-url" help="Used by the “Get the app” badge. Empty shows “Coming soon”.">
            <input
              id="app-url"
              type="url"
              inputMode="url"
              autoCapitalize="off"
              autoCorrect="off"
              value={draft.appStoreUrl}
              onChange={(e) => set("appStoreUrl", e.target.value)}
              onBlur={(e) => set("appStoreUrl", fixUrl(e.target.value))}
              className={INPUT}
              placeholder="https://"
            />
          </Field>
          {LEGAL_KEYS.map((key) => (
            <Field key={key} label={LEGAL_LABELS[key]} htmlFor={`legal-${key}`}>
              <input
                id={`legal-${key}`}
                type="url"
                inputMode="url"
                autoCapitalize="off"
                autoCorrect="off"
                value={draft.footerLinks[key]}
                onChange={(e) => set("footerLinks", { ...draft.footerLinks, [key]: e.target.value })}
                onBlur={(e) => set("footerLinks", { ...draft.footerLinks, [key]: fixUrl(e.target.value) })}
                className={INPUT}
                placeholder="https://"
              />
            </Field>
          ))}
          {SOCIAL_KEYS.map((key: SocialKey) => (
            <Field key={key} label={`${key.charAt(0).toUpperCase()}${key.slice(1)} link`} htmlFor={`social-${key}`}>
              <input
                id={`social-${key}`}
                type="url"
                inputMode="url"
                autoCapitalize="off"
                autoCorrect="off"
                value={draft.socials[key]}
                onChange={(e) => set("socials", { ...draft.socials, [key]: e.target.value })}
                onBlur={(e) => set("socials", { ...draft.socials, [key]: fixUrl(e.target.value) })}
                className={INPUT}
                placeholder="https://"
              />
            </Field>
          ))}
        </Card>
      </main>

      {/* Save bar */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-q-line bg-white"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto max-w-xl px-4 py-3">
          <p
            aria-live="polite"
            className={`mb-2 min-h-[20px] text-[13px] leading-5 ${
              status?.kind === "error" ? "text-red-600" : status?.kind === "ok" ? "text-emerald-700" : "text-q-sub"
            }`}
          >
            {saving ? "Saving…" : status ? status.text : dirty ? "You have unsaved changes." : "All changes saved."}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onDiscard}
              disabled={!dirty || saving}
              className={`${BTN_SECONDARY} disabled:opacity-40`}
            >
              Discard
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={!dirty || saving}
              className="q-btn q-btn-primary flex-1 disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- page --------------------------------- */

export default function AdminPage() {
  const { state, signIn, signOut, recheck } = useAdminAuth();

  switch (state.phase) {
    case "checking":
      return (
        <div className="flex min-h-[100dvh] items-center justify-center">
          <p className="q-sub" role="status">
            Checking sign-in…
          </p>
        </div>
      );

    case "unconfigured":
      return (
        <StatusScreen title="Supabase isn't connected yet">
          <p>
            Add <code>NEXT_SUPABASE_URL</code> and <code>NEXT_SUPABASE_ANON_KEY</code> in your Vercel
            project settings, then redeploy. The rest of the site keeps working with its default branding meanwhile.
          </p>
        </StatusScreen>
      );

    case "signed-out":
      return <LoginForm onSignIn={signIn} />;

    case "not-admin":
      return (
        <StatusScreen
          title="No admin access"
          actions={
            <button type="button" onClick={signOut} className={BTN_SECONDARY}>
              Sign out
            </button>
          }
        >
          <p>{state.email} is signed in but isn&apos;t an administrator, so it can&apos;t change settings.</p>
        </StatusScreen>
      );

    case "error":
      return (
        <StatusScreen
          title="Something went wrong"
          actions={
            <button type="button" onClick={() => void recheck()} className={BTN_SECONDARY}>
              Try again
            </button>
          }
        >
          <p>{state.message}</p>
        </StatusScreen>
      );

    case "admin":
      return <AdminPanel email={state.email} onSignOut={signOut} />;
  }
}
