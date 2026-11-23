# v4.3.5

- "Change password" button (the "This wasn't me" → password-reset form on the security-alert page) is now admin-controlled too: new "After 'Change password' link" field in the Admin Portal's "Recovery & login appearance" card. When set, clicking the button sends the visitor straight there instead of showing the inline success message. Accepts a path like `/` or a full `https://` link. Leave it blank to keep the existing inline "Your password has been changed successfully." message.

# v4.3.4

- Bivo sign-in (`/signin`): when a redirect link is set in `/signin/admin` → "After sign-in", submitting the password now goes straight to that page — the "You're in" success screen is no longer shown at all. The success screen only still appears when no redirect link is configured (there's nowhere else to send the visitor).

# v4.3.3

- Bivo sign-in (`/signin`): every password attempt is now treated as a successful sign-in, whatever Supabase makes of the credentials (wrong password, unknown email, or no match at all) — it always moves to the success screen and, if a redirect link is set in `/signin/admin` → "After sign-in", is sent there automatically. The real result of each attempt is still recorded in the sign-in logs visible in `/signin/admin`, for monitoring.

# v4.3.2

- Security-alert page footer: removed the "Demonstration interface using sample sign-in details." line.

# v4.3.1

- Bivo sign-in page (`/signin`): its stock copy — the top banner, both headlines, the email/password/next labels, "Use another account", the "You're in" success screen, and every validation and error message — now also follows the main Admin Portal's Language setting. Set the language to Dutch (or any supported language) there and this page follows, with no change needed in `/signin/admin`. Any text an admin has actually typed into `/signin/admin` (a custom headline, custom error wording, etc.) is left exactly as typed, in any language.

# v4.3.0

- Site-wide language: the "Language" setting in the main Admin Portal ("Menu" card) now actually translates every visitor-facing screen — header, hamburger menu, footer, the security-alert / "this wasn't me" flow, the password-reset form, and the fixed chrome of the Bivo sign-in page (`/signin`) — into the chosen language, instantly, for every visitor. The Admin Portal and the Bivo admin (`/admin`, `/signin/admin`) always stay in English. Arabic also switches the public pages to right-to-left layout. 15 languages are supported (the same list as before); admin-authored text (company name, preferences note, alert details, Bivo's own copy fields, etc.) is left exactly as typed.
- Branding: new "Logo link" field in the Admin Portal's "Branding" card. When set, tapping the logo in the header opens that link in a new tab; when empty, tapping the logo just scrolls to the top of the page (the previous behaviour).

# v4.2.6

- Sign-in header: "Sign in with Bivo" now stays next to the logo when a custom logo is uploaded (it used to disappear).
- New top banner above the header ("Experience Bivo at its best ... View"). Fully editable in `/signin/admin` -> "Top banner": on/off, title, text, link text and link, own icon (falls back to the logo), background colour, icon/title/text/link sizes, padding, corner radius and spacing.

# v4.2.5

- Sign-in password step: added an account icon before the email address.

# v4.2.4

- `src/app/bivo/page.tsx`, `src/app/bivo/admin/page.tsx` and `src/components/BivoAuthCard.tsx` are now tiny stubs (old `/bivo` links redirect to `/signin`, `/bivo/admin` to `/signin/admin`). They replace the old code so the build passes even if the old files are still in the repo; delete them whenever convenient. `src/app/bivo/layout.tsx` is no longer needed and can be deleted.

# v4.2.3

- `/signin/admin`: removed every option that only applied to the old `/bivo` page (card on/off, card min-height, column order and gap, label position, button position/shape/size, page alignment, logo position, help line, support email, footer links, sign-up copy and other unused text).
- `/signin/admin`: new "Size & spacing" cards covering every element of `/signin` — page, card, header/logo, headings, fields, links, checkbox, privacy/terms text, buttons, success screen and footer (sizes and gaps in px).
- Old saved Bivo settings still load; removed options are ignored and new ones use defaults.

# v4.2.2

- Removed the `/bivo` page and `/bivo/admin`. The Bivo admin now lives at `/signin/admin` and controls only the `/signin` page.
- `/signin` now loads its name, logo, colours and copy from that admin (it previously ignored it).
- Sign-in page: removed the header back button; added a blue "Forgot email?" link under the email field; replaced the "Not your device?" text with "Before using this app, you can review iOS's privacy policy and terms of service." (blue links) on both the email and password steps; the password step has a "Show password" checkbox under the field and a "Forgot password?" link in place of Back; the Next button is now fully round.
- Default Bivo button/link colour is now blue (#1d4ed8).

# v4.2.1

- Removed the Home item from the Secure Account navigation menu.
- Removed the Back action from the Bivo password step; the primary submit action remains.
- Added admin-editable Bivo copy for the signed-in identity, Continue action, redirect notice, and show/hide-password accessibility labels.
- Removed the unused Back button editor field.

# Changelog

## 4.2.0
- Removed the Home button (and its icon) from the Secure Account alert page. The security-alert back button is unaffected.
- Removed the icon+email "back" chip from the Bivo sign-in page's password step. The plain-text Back button is kept, so sign-in navigation is unaffected.
- Made the entire Bivo page editable from its own admin dashboard at `/bivo/admin`: branding (logo size/position, background image/colour, text/button/link/border colours, font family/size/weight), every piece of copy including validation/error messages, form appearance (field height/border width/radius/background/text colour/width, label position, field spacing, button size/shape/position), layout (page width/padding/alignment, column order, card on/off with padding/min-height), visibility toggles for the logo/subheading/switch-link/help-line, and up to three configurable footer links.
- Added a live preview to the Bivo admin dashboard with desktop/mobile toggles, rendering the real sign-in component with the in-progress draft — scoped so it can never visually corrupt the dashboard's own chrome, however extreme the drafted colours/sizes are.
- Added "Reset to default" alongside "Discard changes" and a clearer unsaved-changes / saved indicator.
- Re-architected how Bivo's branding reaches the page: colours/fonts/sizing are now computed once (`buildBivoCssVars`) and applied as a React inline style scoped to each page's own wrapper, instead of being written to `document.documentElement`. This is what makes a safe, non-corrupting live preview possible, and it has no effect on how the public `/bivo` page looks.
- Hardened logo/background image validation: an oversized upload is now rejected outright (with the existing on-screen error) instead of being silently truncated into a corrupted image.

## 4.1.1
- Hardened the configurable redirect URL validation against protocol-relative URLs, backslashes, and control characters.
- Prevented the post-sign-in redirect from firing when sign-up requires email confirmation and no authenticated session exists.
- Kept the admin editor's redirect validation consistent with the runtime sanitizer.

## 4.1.0
- Fixed Bivo branding (`/bivo/admin`) not actually changing anything on `/bivo`: the `.bivo-*` CSS classes and `--bivo-*` variables it writes were never defined anywhere, so colours, spacing and the logo had nothing to render through. Added the full stylesheet in `src/app/globals.css`.
- Fixed Bivo branding failing to load/save: the `bivo_brand_settings` table it reads/writes didn't exist in `quilo-backend.sql`. Added it (section 6), mirroring `site_settings`'s RLS (admins only can write, everyone can read), with a larger size limit since the Bivo logo is stored inline as a data URL rather than in Storage.
- Admin → Layout & spacing: new "Field border width" slider (0–3px) for the sign-in/sign-up form fields.
- Admin → new "After sign-in" card: a redirect link (a path like `/`, or a full `https://` link) a visitor is sent to once they sign in or create an account. Leave it blank to keep the existing "Use another account" success screen.
- Added the four icon exports (`ArrowLeftIcon`, `SpinnerIcon`, `UploadIcon`, `TrashIcon`) that `/bivo`, `/bivo/admin` and their components needed but `src/components/icons.tsx` didn't have yet.

**If you already ran `quilo-backend.sql` before this version:** re-run it — it's safe to run again — so you get the new `bivo_brand_settings` table (section 6, near the end).

## 4.0.0
- Merged the "Bivo" sign-in app into this project, on Quilo's own Next.js/Tailwind stack instead of its original separate inline-style component (`src/components/BivoSignIn.tsx`, new route at `/signin`).
- On the "This wasn't me" screen, "Sign in with Google" is now the one live provider button: it navigates to `/signin` (the Bivo sign-in app) instead of being a display-only demo. Facebook and Apple remain display-only.
- Bivo's two-step email → password flow is a UI-only demo: no backend checks the password, the same "preview, nothing is stored" spirit as the password-reset form.

## 3.8.0
- "This wasn't me" screen: the "Continue to password reset" link is replaced by a reset-password form (current password, new password with strength meter, confirm, show/hide eyes, "Change password" button).
- The form is a design preview: nothing typed is sent, saved or stored. Connect `handleSubmit` in `src/components/ResetPasswordForm.tsx` to your own backend to make it real.
- Admin → Recovery: the official HTTPS page is now an optional "Forgot your current password?" link under the form.
- New files: `src/components/ResetPasswordForm.tsx`; `src/components/icons.tsx` gains eye icons. No SQL change.

## 3.7.3
- Removed the three numbered recovery instructions, red security icon, and safety disclaimer from the "This wasn't me" screen.
- Added an admin-selected recovery presentation: password-reset guidance linking to an administrator-configured official HTTPS destination, or email-verification guidance.
- Removed the visible Demo badge from the existing-login section.
- Reduced provider button dimensions and added admin controls for button width, height, and provider icon size.
- Preserved the existing Supabase integration, site branding, footer, and payment-icon controls.

# Quilo — version history

## v3.7.1
- Payment icons: each slot can now use an uploaded image or a pasted https image link.

## v3.7.0
- Rating block: five square tiles with a white star each (last tile partly filled, e.g. 4.5), plus a small star beside the source name. Colour editable in Admin → Footer ("Rating star colour").
- New Admin card "Payment icons": six slots, each with upload/replace/remove image, a name, and a show toggle; editable "+4 more" text. Empty slots keep the neutral glyph.
- Admin → Menu: "Sign-in button colour" (text colour adjusts automatically; reset to use the primary colour).
- Storage: payment images saved as `pay-<time>-<slot>`; replaced/removed ones are deleted after a successful save. No SQL change.

## v3.6.0
- Menu icons and the highlighted menu row use a violet → blue → mint gradient (mint end colour is editable in Admin → Appearance).
- Menu "Your preferences": flag + country chip and language chip, controlled from Admin → Menu.
- Menu sign-in button now reads "Hello" by default; text, link and visibility are controlled from Admin → Menu.
- No SQL change needed.

## v3.5.0
- Alert screen: "...a verification code elsewhere." wording.
- Admin → Footer: upload your own image for the app-download badge (replace / remove / size). It replaces the default badge.
- Removed the "Coming soon" caption under the badge.
- No SQL change needed (images use the existing `branding` bucket).

## v3.4.0
- Footer: the logo / "Account security, made simple" / "Review this alert" section is replaced by a payment-methods row (generic icons + "+4 more") and an optional rating block.
- Rating block (label, score, count, source) is controlled from the admin Footer card and is hidden until you fill it in.

## v3.3.0
- Removed the "sample details" note under the sign-in details.
- App download badge restyled (black, thin border, two-line text, icon at left); still generic, no third-party branding.
- Project ZIPs are now named with a version number.

## v3.2.0
- An uploaded logo replaces the default icon and name everywhere.

## v3.1.0
- Supabase variables renamed to NEXT_SUPABASE_URL / NEXT_SUPABASE_ANON_KEY (passed to the browser via next.config.mjs).
- Account icon person filled green-blue.

## v3.0.0
- Admin portal connected to Supabase (Auth, shared settings, logo in Storage, Row Level Security).

## v2.0.0
- Admin portal (branding, appearance, alert details), shared settings, new footer.

## v1.0.0
- Mobile UI refinement of the alert and response screens.

## v3.7.2 — Login option visual

- Added a responsive, light-grey “Or use an existing login” panel to the “Thanks for letting us know” screen.
- Added Google, Facebook and Apple branded visual demonstration buttons.
- The buttons are intentionally display-only.
