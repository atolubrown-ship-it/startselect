# Changelog

## 4.2.3
- Build fix: `BivoBrandEditor.tsx` had several admin field labels written with `\"escaped quotes\"` inside a plain JSX attribute string (e.g. `label="\"Next\" button"`). JSX attribute strings don't support backslash escapes the way JS strings do, so this broke the parser for the whole file and failed the Vercel build. Rewrote those labels as `label={'"Next" button'}` (a real JS string expression, which does support quotes). No visual or behavioral change — same label text as before, now valid syntax.

## 4.2.2
- No SQL change needed — the Bivo branding row already stores everything as JSON, so new fields below just work once you save from `/bivo/admin`.
- Bivo fields are now floating-label inputs: empty and unfocused, the label sits centered like a placeholder; focused or filled, it rises and shrinks above the field, same behaviour as a typical native sign-in form.
- The "Sign in" / "Create your account" heading is a lighter weight.
- The help line is now two lines ("Need help?" then "Contact help@bivo.app" on its own line) and sits lower on the page, below the form — both lines are admin-editable under a new "Help line" card.
- Removed the language-picker / Help / Privacy / Terms row added in the previous round, along with its admin fields.
- The sign-in form no longer sits in its own white card with a border — it's directly on the page background now.
- New "Layout & spacing" card in `/bivo/admin`: content width, page padding (left/right, top/bottom), the gap between the two columns, heading text size, and field height — all in pixels, with a live-updating preview.

## 4.2.1
- Security alert screen: the "Home" button on the first (alert) page is removed. The back button on the "Yes, this was me" / "This wasn't me" screens is unchanged.
- Bivo (`/bivo`): background is now plain white, and **both the button colour and the hyperlink text colour are admin-controlled** (new "Colours" card in `/bivo/admin`) — button text contrast adjusts automatically.
- Bivo: **every piece of text on the sign-in / sign-up screens is now admin-editable** — headings, subtitles, field labels, button labels, success messages, the demo-mode notice, and more (new "Sign-in text", "Sign-up text" and "Shared labels" cards in `/bivo/admin`).
- Bivo sign-in page: removed the "Admin portal" link and the "© Bivo" line from the bottom of the card. Below the card there's now a footer with a language picker on the left and Help / Privacy / Terms (admin-editable label + link) on the right.
- Bivo sign-in/sign-up form: the secondary action ("Create account" / "I have an account" / "Back") now sits at the left edge, away from the primary button ("Next" / "Sign in" / "Create account") on the right.
- `bivo_brand_settings` is restructured to hold branding, colours and all copy as one JSON column (`data`), same pattern as the main site's `site_settings` — see the updated section 6 of `quilo-backend.sql`. **If you already ran an earlier version of this file**, run `drop table if exists public.bivo_brand_settings;` first, then re-run the whole file.

## 4.2.0
- **Bivo is now part of this site**, at `/bivo` — ported from the separate Bivo project onto Quilo's own stack (Next.js + Tailwind + Supabase) instead of its original TanStack Start / Vite / Bun setup. No new build tool, framework or Vercel project needed.
- On the "This wasn't me" screen, **"Continue with Google" is now a real button**: it takes people to the Bivo sign-in app at `/bivo`, inside this same site. The Facebook and Apple buttons are unchanged (demonstration only).
- New admin portal at `/bivo/admin` for the Bivo name, logo, sign-in heading/subtitle and support email — gated by the same admin list as the rest of the site (`public.admin_users` / `is_admin()`), so there's one sign-in for everything.
- New table `bivo_brand_settings` (one shared row) — added to `quilo-backend.sql`, section 6. Re-run the SQL file in Supabase; it's safe to run again. No new environment variables: Bivo reads/writes through the same `NEXT_SUPABASE_URL` / `NEXT_SUPABASE_ANON_KEY` as the rest of the site.
- New files: `src/app/bivo/page.tsx`, `src/app/bivo/layout.tsx`, `src/app/bivo/admin/page.tsx`, `src/components/BivoAuthCard.tsx`, `src/components/BivoBrandEditor.tsx`, `src/components/BivoLogo.tsx`, `src/lib/bivoBrand.ts`, `src/lib/bivoValidation.ts`. `src/components/icons.tsx` gains a few small icons (arrow-left, spinner, upload, trash, log-out) used by the new screens.

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
