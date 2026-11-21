# Quilo v4.3.1

- Fixed the stale legacy `BivoSignIn.tsx` type-check failure by replacing it with an unused compatibility stub; the active route remains `/signin` and uses `BivoAuthCard`.
- Made sign-in fail closed when Supabase is not configured; the UI can no longer show a successful sign-in without a real Supabase authentication response.
- Password-reset requests now display success only after Supabase accepts the request and show a useful error if the request fails or Supabase is unavailable.
- Password updates now fail safely when Supabase is unavailable instead of displaying a false success.

# Changelog

## 4.3.0
- Moved the Bivo sign-in experience from `/bivo` to `/signin` (its own layout, metadata), and its dashboard from `/bivo/admin` to `/signin/admin`. Removed the old `/bivo` and `/bivo/admin` routes and the now-unused standalone `BivoSignIn.tsx` component. The "Continue with Google" button on the main Quilo page already pointed at `/signin`, so this reconnects it to the real, admin-configurable page for the first time — it had been pointing at the old static component this whole time.
- Removed the back arrow from the sign-in header entirely (it came from the old component now removed) — on every step, with no replacement.
- Rebuilt the sign-in flow as a single-column, Google-style layout: logo + a constant heading, then the active step. Dropped the sign-up/switch-mode path, since the new spec only ever describes a sign-in flow — tell me if account creation should still be reachable from here and I'll add it back deliberately.
- Email step: a prominent, admin-configurable border (default 4px, blue) with a floating label that sits on the border when focused/filled; a functional, enumeration-safe "Forgot email?" link (`/signin/recover-email`) that always shows the same confirmation regardless of what's entered; Next button.
- Password step: same per-field styling (independently configurable from the email field); a real "Show password" checkbox (not an icon button) that toggles masking; "Forgot password?" replaces the old "Back"/"Create account" link and calls Supabase's `resetPasswordForEmail` for real, landing on a new `/signin/reset-password` page that lets the visitor set a new password from the emailed link.
- Added the required "Not your device?" security notice under the form on both the email and password steps, at the same position/width/styling on both (one shared component, not two copies). "private window" and "sign out" are real links — admin-editable text/colour — to two new in-app help pages (`/signin/help/private-browsing`, `/signin/help/sign-out`), rather than external or dead links.
- Expanded the Bivo admin dashboard (same `bivo_brand_settings` table, no new table, no migration needed — it's schema-less JSON) with dedicated "Email field", "Password field" and "Security message" sections, and removed now-dead sign-up-era controls (column order, label position, generic shared field border/colour, switch-link copy) from the editor since nothing renders them any more.

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
