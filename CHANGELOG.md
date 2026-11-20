# Quilo — version history

## v3.8.0
- "This wasn't me" screen: removed the red icon and its background box, and removed the old grey "never ask…" disclaimer box.
- New "Recover your account" section: admin-configurable password-recovery and email-verification guidance, each a link to your own page, with a preferred method shown first. Never shows or collects a verification code.
- New "Or use an existing login" section: Google, Facebook and Apple buttons, each individually shown/hidden from the admin. These are demonstration buttons only — labelled "Demo", not connected to any real sign-in, and do not collect credentials.
- New Admin card "Account Recovery Settings" controlling all of the above.
- No SQL change needed.

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
