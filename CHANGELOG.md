# Quilo — version history

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
