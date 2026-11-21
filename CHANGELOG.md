# Changelog

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
