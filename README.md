# Quilo — Security Alert (Stage 1)

> Layout update: shared site shell (`SiteShell`, `Header`, `MenuPanel`, `Footer` in
> `src/components`) now wraps every screen, so the alert and "This wasn't me"
> views share one header, hamburger menu and footer.

A small, focused mobile-first web app: a "new sign-in detected" alert, a
"this wasn't me" response flow, and a hamburger menu. **Frontend only** —
no login form, no password or verification-code field, no backend. Next.js
(App Router) + TypeScript + Tailwind CSS.

## Screens

- **Alert** — sign-in details (location, device, time) with "Yes, this was
  me" / "This wasn't me" actions.
- **Recognized** — simple confirmation when the user recognizes the sign-in.
- **This wasn't me** — numbered next-step guidance (none of which collects
  any credentials on this page) and a back button.
- **Hamburger menu** — slides in from the right with placeholder links, closes
  on backdrop tap or by tapping the hamburger again.

All data (location, device, time) is hard-coded placeholder text in
`src/app/page.tsx`.

## Uploading to GitHub from your iPhone (no terminal)

1. In Safari, go to **github.com** and sign in.
2. Tap **+** (top right) → **New repository**. Name it (e.g. `quilo-alert`),
   leave it empty (don't add a README there), and tap **Create repository**.
3. On the new repo's page, tap **Add file → Upload files**.
4. From the file I sent you, open the Files app, locate the project folder,
   and upload its contents — keep the folder structure intact (drag the
   whole unzipped folder in, or select all files/folders at once so the
   paths like `src/app/page.tsx` are preserved).
5. Scroll down and tap **Commit changes**.

## Deploying on Vercel from your iPhone

1. Go to **vercel.com** in Safari and sign in (you can use your GitHub
   account).
2. Tap **Add New → Project**.
3. Select the repo you just created.
4. Leave the defaults (Vercel auto-detects Next.js) and tap **Deploy**.
5. You'll get a preview link like `quilo-alert.vercel.app` — open it on
   your phone to see it live. Future GitHub commits redeploy automatically.
