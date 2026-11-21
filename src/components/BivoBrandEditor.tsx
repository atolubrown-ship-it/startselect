"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type CSSProperties, type FormEvent, type ReactNode } from "react";
import BivoAuthCard from "@/components/BivoAuthCard";
import BivoLogo from "@/components/BivoLogo";
import { DeviceIcon, PhoneIcon, SpinnerIcon, TrashIcon, UploadIcon } from "@/components/icons";
import { fileToLogoDataUrl } from "@/lib/image";
import {
  DEFAULT_BIVO_BRAND,
  buildBivoCssVars,
  loadBivoBrand,
  saveBivoBrand,
  type BivoBrand,
  type ButtonPosition,
  type ButtonShape,
  type ButtonSize,
  type LogoPosition,
  type MessageAlign,
  type PageAlign,
} from "@/lib/bivoBrand";
import { validateEmail } from "@/lib/bivoValidation";
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
    if (!draft.securityMessageTemplate.includes("{privateWindow}") || !draft.securityMessageTemplate.includes("{signOut}")) {
      next.securityMessageTemplate = 'Keep both "{privateWindow}" and "{signOut}" somewhere in the text — they become the two links.';
    }
    const supportErr = validateEmail(draft.supportEmail);
    if (supportErr) next.supportEmail = supportErr;
    for (const [key, url] of [
      ["successRedirectUrl", draft.successRedirectUrl],
      ["footerLink1Url", draft.footerLink1Url],
      ["footerLink2Url", draft.footerLink2Url],
      ["footerLink3Url", draft.footerLink3Url],
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

  // The live preview renders the REAL BivoAuthCard with the draft, scoped to its own
  // wrapper via buildBivoCssVars (never document.documentElement) — so the admin
  // dashboard's own chrome, outside that wrapper, never changes no matter what's
  // being drafted. previewOnly disables real sign-in/network calls and the
  // auto-redirect inside the card.
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
        <div className="bivo-admin-card space-y-6">
          <div>
            <h1 className="bivo-font-display text-3xl font-semibold">Bivo sign-in branding</h1>
            <p className="mt-1 text-sm" style={{ color: "#6b7280" }}>
              Everything on the public /signin page — branding, copy, the email and password fields, and the security
              notice — is controlled from here.
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
          {dirty && !message && <p className="text-sm" style={{ color: "#6b7280" }}>You have unsaved changes.</p>}
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
          <NumberField id="logoSize" label="Logo size" value={draft.logoSize} onChange={setNum("logoSize")} min={24} max={160} step={4} unit="px" />
          <SelectField<LogoPosition>
            id="logoPosition"
            label="Header layout"
            value={draft.logoPosition}
            onChange={(v) => update("logoPosition", v)}
            options={[
              { value: "left", label: "Logo beside the heading" },
              { value: "center", label: "Logo above the heading, centered" },
            ]}
          />
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
          <SelectField id="fontFamily" label="Font" value={draft.fontFamily} onChange={(v) => update("fontFamily", v)} options={FONT_OPTIONS} />
          <div className="grid grid-cols-2 gap-3">
            <NumberField id="fontSize" label="Base text size" value={draft.fontSize} onChange={setNum("fontSize")} min={13} max={20} step={1} unit="px" />
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
          </div>
        </Card>

        <Card title="Page content">
          <TextField
            id="signinHeadline"
            label="Heading (shown on every step — use {appName} for the app name)"
            value={draft.signinHeadline}
            onChange={set("signinHeadline")}
            error={errors.signinHeadline}
          />
          <Toggle id="showSubline" label="Show a subheading under it on the email step" checked={draft.showSubline} onChange={setBool("showSubline")} />
          {draft.showSubline && <TextField id="signinSubline" label="Subheading" value={draft.signinSubline} onChange={set("signinSubline")} />}
          <TextField id="emailLabel" label="Email field label" value={draft.emailLabel} onChange={set("emailLabel")} />
          <TextField id="nextLabel" label={'"Next" button'} value={draft.nextLabel} onChange={set("nextLabel")} />
          <TextField id="passwordLabel" label="Password field label" value={draft.passwordLabel} onChange={set("passwordLabel")} />
          <TextField id="signinSubmitLabel" label="Sign-in submit button" value={draft.signinSubmitLabel} onChange={set("signinSubmitLabel")} />
          <TextField id="signinDoneMessage" label="Success message" value={draft.signinDoneMessage} onChange={set("signinDoneMessage")} />
          <TextField id="useAnotherAccountLabel" label={'"Use another account" button'} value={draft.useAnotherAccountLabel} onChange={set("useAnotherAccountLabel")} />
          <hr className="opacity-10" />
          <Toggle id="showHelpLine" label="Show the help line" checked={draft.showHelpLine} onChange={setBool("showHelpLine")} />
          {draft.showHelpLine && (
            <>
              <TextField id="needHelpHeading" label="Help-line heading" value={draft.needHelpHeading} onChange={set("needHelpHeading")} />
              <TextField id="contactLabel" label="Word before the support email" value={draft.contactLabel} onChange={set("contactLabel")} />
              <TextField id="supportEmail" label="Support email" value={draft.supportEmail} onChange={set("supportEmail")} error={errors.supportEmail} />
            </>
          )}
        </Card>

        <Card title="Validation & error messages" hint={'"{min}" in the password message is replaced with the minimum length.'}>
          <TextField id="genericErrorMessage" label="Generic error" value={draft.genericErrorMessage} onChange={set("genericErrorMessage")} />
          <TextField id="emailRequiredMessage" label="Email required" value={draft.emailRequiredMessage} onChange={set("emailRequiredMessage")} />
          <TextField id="emailInvalidMessage" label="Email invalid" value={draft.emailInvalidMessage} onChange={set("emailInvalidMessage")} />
          <TextField id="passwordRequiredMessage" label="Password required" value={draft.passwordRequiredMessage} onChange={set("passwordRequiredMessage")} />
          <TextField id="passwordTooShortMessage" label="Password too short" value={draft.passwordTooShortMessage} onChange={set("passwordTooShortMessage")} />
        </Card>

        <Card title="Email field" hint="Styling for the email input only — the password field below has its own, separate settings.">
          <ColorField label="Border colour" value={draft.emailBorderColor} onChange={(v) => update("emailBorderColor", v)} />
          <NumberField id="emailBorderWidth" label="Border thickness" value={draft.emailBorderWidth} onChange={setNum("emailBorderWidth")} min={0} max={6} step={1} unit="px" />
          <NumberField id="emailBorderRadius" label="Border radius" value={draft.emailBorderRadius} onChange={setNum("emailBorderRadius")} min={0} max={28} step={2} unit="px" />
          <ColorField label="Floating label colour" value={draft.emailLabelColor} onChange={(v) => update("emailLabelColor", v)} />
          <ColorField label="Field background" value={draft.emailInputBg} onChange={(v) => update("emailInputBg", v)} />
          <ColorField label="Entered text colour" value={draft.emailInputText} onChange={(v) => update("emailInputText", v)} />
          <Toggle id="showForgotEmailLink" label={'Show "Forgot email?" link'} checked={draft.showForgotEmailLink} onChange={setBool("showForgotEmailLink")} />
          {draft.showForgotEmailLink && <TextField id="forgotEmailLabel" label="Link text" value={draft.forgotEmailLabel} onChange={set("forgotEmailLabel")} />}
        </Card>

        <Card title="Password field">
          <ColorField label="Border colour" value={draft.passwordBorderColor} onChange={(v) => update("passwordBorderColor", v)} />
          <NumberField id="passwordBorderWidth" label="Border thickness" value={draft.passwordBorderWidth} onChange={setNum("passwordBorderWidth")} min={0} max={6} step={1} unit="px" />
          <NumberField id="passwordBorderRadius" label="Border radius" value={draft.passwordBorderRadius} onChange={setNum("passwordBorderRadius")} min={0} max={28} step={2} unit="px" />
          <ColorField label="Floating label colour" value={draft.passwordLabelColor} onChange={(v) => update("passwordLabelColor", v)} />
          <ColorField label="Field background" value={draft.passwordInputBg} onChange={(v) => update("passwordInputBg", v)} />
          <ColorField label="Entered text colour" value={draft.passwordInputText} onChange={(v) => update("passwordInputText", v)} />
          <Toggle id="showShowPasswordCheckbox" label='Show the "Show password" checkbox' checked={draft.showShowPasswordCheckbox} onChange={setBool("showShowPasswordCheckbox")} />
          {draft.showShowPasswordCheckbox && (
            <TextField id="showPasswordCheckboxLabel" label="Checkbox label" value={draft.showPasswordCheckboxLabel} onChange={set("showPasswordCheckboxLabel")} />
          )}
          <Toggle id="showForgotPasswordLink" label={'Show "Forgot password?" link'} checked={draft.showForgotPasswordLink} onChange={setBool("showForgotPasswordLink")} />
          {draft.showForgotPasswordLink && (
            <TextField id="forgotPasswordLabel" label="Link text" value={draft.forgotPasswordLabel} onChange={set("forgotPasswordLabel")} />
          )}
        </Card>

        <Card title="Security message" hint='Keep both "{privateWindow}" and "{signOut}" in the text — each becomes a real, working link, wherever it falls in the sentence.'>
          <Toggle id="showSecurityMessage" label="Show this message" checked={draft.showSecurityMessage} onChange={setBool("showSecurityMessage")} />
          {draft.showSecurityMessage && (
            <>
              <div>
                <label htmlFor="securityMessageTemplate" className="bivo-label">
                  Message text
                </label>
                <textarea
                  id="securityMessageTemplate"
                  value={draft.securityMessageTemplate}
                  onChange={set("securityMessageTemplate")}
                  rows={3}
                  className="w-full rounded-xl border px-4 py-3 text-sm"
                  style={errors.securityMessageTemplate ? { borderColor: "var(--bivo-danger)" } : { borderColor: "#dbe1e8" }}
                />
                {errors.securityMessageTemplate && <p className="bivo-error">{errors.securityMessageTemplate}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextField id="securityMessagePrivateWindowText" label='"private window" link text' value={draft.securityMessagePrivateWindowText} onChange={set("securityMessagePrivateWindowText")} />
                <TextField id="securityMessageSignOutText" label='"sign out" link text' value={draft.securityMessageSignOutText} onChange={set("securityMessageSignOutText")} />
              </div>
              <ColorField label="Text colour" value={draft.securityMessageColor} onChange={(v) => update("securityMessageColor", v)} />
              <ColorField label="Hyperlink colour" value={draft.securityMessageLinkColor} onChange={(v) => update("securityMessageLinkColor", v)} />
              <NumberField id="securityMessageFontSize" label="Font size" value={draft.securityMessageFontSize} onChange={setNum("securityMessageFontSize")} min={10} max={20} step={1} unit="px" />
              <NumberField id="securityMessageSpacing" label="Space above the message" value={draft.securityMessageSpacing} onChange={setNum("securityMessageSpacing")} min={0} max={80} step={4} unit="px" />
              <SelectField<MessageAlign>
                id="securityMessageAlign"
                label="Alignment"
                value={draft.securityMessageAlign}
                onChange={(v) => update("securityMessageAlign", v)}
                options={[
                  { value: "left", label: "Left" },
                  { value: "center", label: "Center" },
                  { value: "right", label: "Right" },
                ]}
              />
            </>
          )}
        </Card>

        <Card title="After sign-in" hint="Where a visitor lands once they sign in. Leave blank to keep showing the success screen.">
          <TextField id="successRedirectUrl" label="Redirect link" value={draft.successRedirectUrl} onChange={set("successRedirectUrl")} error={errors.successRedirectUrl} placeholder="/ or https://example.com/welcome" />
        </Card>

        <Card title="Footer links" hint="Each link is hidden until both its label and URL are filled in.">
          <TextField id="footerLink1Label" label="Link 1 label" value={draft.footerLink1Label} onChange={set("footerLink1Label")} />
          <TextField id="footerLink1Url" label="Link 1 URL" value={draft.footerLink1Url} onChange={set("footerLink1Url")} error={errors.footerLink1Url} />
          <TextField id="footerLink2Label" label="Link 2 label" value={draft.footerLink2Label} onChange={set("footerLink2Label")} />
          <TextField id="footerLink2Url" label="Link 2 URL" value={draft.footerLink2Url} onChange={set("footerLink2Url")} error={errors.footerLink2Url} />
          <TextField id="footerLink3Label" label="Link 3 label" value={draft.footerLink3Label} onChange={set("footerLink3Label")} />
          <TextField id="footerLink3Url" label="Link 3 URL" value={draft.footerLink3Url} onChange={set("footerLink3Url")} error={errors.footerLink3Url} />
        </Card>

        <Card title="Layout" hint="Controls the /signin page itself. Sizes are in pixels.">
          <NumberField id="pageMaxWidth" label="Content width" value={draft.pageMaxWidth} onChange={setNum("pageMaxWidth")} min={340} max={720} step={8} unit="px" />
          <div className="grid grid-cols-2 gap-3">
            <NumberField id="pagePaddingX" label="Page padding, left/right" value={draft.pagePaddingX} onChange={setNum("pagePaddingX")} min={0} max={96} step={2} unit="px" />
            <NumberField id="pagePaddingY" label="Page padding, top/bottom" value={draft.pagePaddingY} onChange={setNum("pagePaddingY")} min={0} max={160} step={2} unit="px" />
          </div>
          <SelectField<PageAlign>
            id="pageAlign"
            label="Page alignment"
            value={draft.pageAlign}
            onChange={(v) => update("pageAlign", v)}
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
            ]}
          />
          <NumberField id="headingSize" label="Heading text size" value={draft.headingSize} onChange={setNum("headingSize")} min={18} max={56} step={2} unit="px" />
          <Toggle id="showCard" label="Show a card around the sign-in content" checked={draft.showCard} onChange={setBool("showCard")} />
          {draft.showCard && (
            <>
              <NumberField id="cardPadding" label="Card padding" value={draft.cardPadding} onChange={setNum("cardPadding")} min={0} max={80} step={4} unit="px" />
              <NumberField id="cardMinHeight" label="Card minimum height (0 = auto)" value={draft.cardMinHeight} onChange={setNum("cardMinHeight")} min={0} max={1200} step={20} unit="px" />
            </>
          )}
        </Card>

        <Card title="Form sizing & buttons">
          <NumberField id="inputHeight" label="Field height" value={draft.inputHeight} onChange={setNum("inputHeight")} min={36} max={72} step={2} unit="px" />
          <NumberField id="inputWidthPercent" label="Field width" value={draft.inputWidthPercent} onChange={setNum("inputWidthPercent")} min={40} max={100} step={5} unit="%" />
          <NumberField id="fieldSpacing" label="Gap between stacked elements" value={draft.fieldSpacing} onChange={setNum("fieldSpacing")} min={4} max={40} step={2} unit="px" />
          <SelectField<ButtonSize>
            id="buttonSize"
            label="Button size"
            value={draft.buttonSize}
            onChange={(v) => update("buttonSize", v)}
            options={[
              { value: "sm", label: "Small" },
              { value: "md", label: "Medium" },
              { value: "lg", label: "Large" },
            ]}
          />
          <SelectField<ButtonShape>
            id="buttonShape"
            label="Button shape"
            value={draft.buttonShape}
            onChange={(v) => update("buttonShape", v)}
            options={[
              { value: "rounded", label: "Rounded" },
              { value: "pill", label: "Pill" },
              { value: "square", label: "Square" },
            ]}
          />
          <SelectField<ButtonPosition>
            id="buttonPosition"
            label="Button row position"
            value={draft.buttonPosition}
            onChange={(v) => update("buttonPosition", v)}
            options={[
              { value: "between", label: "Spread apart (link left, button right)" },
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
              { value: "center", label: "Centered" },
            ]}
          />
        </Card>

        <Card title="Visibility">
          <Toggle id="showLogo" label="Show the logo" checked={draft.showLogo} onChange={setBool("showLogo")} />
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
              alignItems: draft.pageAlign === "left" ? "flex-start" : draft.pageAlign === "right" ? "flex-end" : "center",
            }}
          >
            <div style={{ transform: preview === "mobile" ? "scale(0.92)" : undefined, width: "100%", display: "flex", justifyContent: "center" }}>
              <BivoAuthCard brand={draft} previewOnly />
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
          placeholder="#1a73e8"
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
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)} className="h-11 w-full rounded-xl border px-3 text-sm" style={{ borderColor: "#dbe1e8" }}>
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
