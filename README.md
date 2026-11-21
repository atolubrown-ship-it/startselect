# Quilo — Security Alert

A small mobile-first demonstration web app: a sample "new sign-in detected"
alert, a "This wasn't me" response screen, a hamburger menu and a shared
header/footer. 

Built with Next.js (App Router), TypeScript and Tailwind CSS. Settings are
stored centrally in **Supabase** so every visitor and device sees the same
branding.

---

## How settings work

- The website reads one shared row from the Supabase table `site_settings`.
- The **Admin portal** (`/admin`) signs in with a **Supabase Auth** account and
  saves changes to that row. The logo is uploaded to Supabase **Storage**
  (bucket `branding`) and only its public link is stored in the settings.
- Permissions are enforced **by the database** (Row Level Security), not by the
  page: visitors can only read; only users listed in `admin_users` can change
  settings or upload/replace/delete the logo.
- If Supabase isn't configured yet, or is unreachable, the site still works
  with its default branding (name "Quilo", built-in logo mark).
- Only the **public** Supabase URL and **anon/publishable** key are used in the
  frontend. Never use a `service_role` / secret key here.

Admin can change: company name, logo (upload / replace / remove / size /
show-hide name), primary + secondary colour, header style, button shape,
demonstration location / device / date-time, app promotion heading + text +
download link + badge image, menu country / language chips and the menu
sign-in button (text, link, show/hide), menu icon gradient colour, footer legal links and social links.

---

## Bivo — the real sign-in app, at `/bivo`

Quilo now includes Bivo: a real two-step sign-in / sign-up page, mounted
inside this same site at `/bivo` and built on the same stack (Next.js +
Tailwind + Supabase) — not a separate project, build tool or deployment.

- On the **"This wasn't me"** screen, **"Continue with Google"** takes people
  straight to `/bivo` to sign in or create an account. (The Facebook and Apple
  buttons stay as demonstration-only, same as before.)
- Branding (app name, logo, sign-in heading/subtitle, support email) lives in
  the shared Supabase row `bivo_brand_settings` and is edited at **`/bivo/admin`**
  — gated by the same admin list as the rest of the site (`admin_users`), so
  there's one sign-in for everything.
- No new environment variables: Bivo reads and writes through the same
  `NEXT_SUPABASE_URL` / `NEXT_SUPABASE_ANON_KEY` already set up for the rest
  of the site, and its table is created by the same `quilo-backend.sql` (see
  step 1 below) — just re-run it after updating; it's safe to run again.

---

## Setup from your iPhone (Safari only)

Do these in order. Nothing needs a computer or terminal.

### 1. Create the database tables (Supabase)

1. Safari → **supabase.com/dashboard** → open your project.
2. Open the menu (☰) → **SQL Editor** → **New query**.
3. Paste the whole contents of `quilo-backend.sql` → tap **Run**.
   It is safe to run again later.

### 2. Create your admin login (Supabase)

1. Menu → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Enter your email + a strong password, switch on **Auto Confirm User**, tap
   **Create user**.
3. Menu → **SQL Editor** → **New query**, paste this (change the email to yours)
   and tap **Run**:

   `insert into public.admin_users (user_id) select id from auth.users where email = 'you@example.com' on conflict do nothing;`

### 3. Copy your two public Supabase values

1. Menu → **Project Settings** → **API** (called **API Keys** in newer
   dashboards).
2. Copy the **Project URL** (starts with `https://`).
3. Copy the **anon / publishable** key. Do **not** copy the `service_role` /
   secret key.

### 4. Add them to Vercel

1. Safari → **vercel.com** → your project → **Settings** →
   **Environment Variables**.
2. Add `NEXT_SUPABASE_URL` = your Project URL.
3. Add `NEXT_SUPABASE_ANON_KEY` = your anon/publishable key.
4. Tap **Save**. (Type the names exactly as shown. Tick all environments, or at least Production.)
5. **Redeploy** afterwards — these values are read when the site is built, so a deployment made before you added them won't see them.

### 5. Upload the project to GitHub

Download the ZIP and unzip it in the Files app. Then either:

- **Replace the whole project:** repo → **Add file** → **Upload files** →
  choose the unzipped files. (Safari can't pick folders, so use the second
  option for files inside folders.)
- **Only the changed files (reliable on iPhone):** for each file below, open it
  in GitHub → tap the pencil ✏️ → select all → paste the new contents →
  **Commit changes**. For a **new** file use **Add file → Create new file**
  and type the full path in the name box (typing `/` makes folders).

  | File | Status |
  | --- | --- |
  | `package.json` | changed (adds the Supabase library) |
  | `src/lib/settings.ts` | changed |
  | `src/components/SettingsProvider.tsx` | changed |
  | `src/components/BrandLogo.tsx` | changed |
  | `src/components/Footer.tsx` | changed |
  | `src/app/admin/page.tsx` | changed |
  | `src/lib/supabase.ts` | **new** |
  | `src/lib/remote.ts` | **new** |
  | `src/lib/useAdminAuth.ts` | **new** |
  | `quilo-backend.sql` | **new** (reference copy) |
  | `src/app/bivo/page.tsx` | **new** |
  | `src/app/bivo/layout.tsx` | **new** |
  | `src/app/bivo/admin/page.tsx` | **new** |
  | `src/components/BivoAuthCard.tsx` | **new** |
  | `src/components/BivoBrandEditor.tsx` | **new** |
  | `src/components/BivoLogo.tsx` | **new** |
  | `src/lib/bivoBrand.ts` | **new** |
  | `src/lib/bivoValidation.ts` | **new** |
  | `src/components/icons.tsx` | changed (a few small icons added) |
  | `src/app/globals.css` | changed (Bivo's styling, scoped under `.bivo`) |
  | `src/app/page.tsx` | changed ("Continue with Google" now links to `/bivo`) |
  | `public/site-settings.json` | no longer used — you can delete it |

Vercel then deploys automatically. If you added the Vercel variables **after**
a deployment already existed, open **Deployments** → latest → **⋯** →
**Redeploy** (variables only apply to new deployments).

### 6. Sign in and customise

Open `https://YOUR-SITE.vercel.app/admin`, sign in with the email and password
from step 2, change what you like and tap **Save changes**.

---

## Troubleshooting

| You see | Meaning / fix |
| --- | --- |
| "Supabase isn't connected yet" on /admin | The two Vercel variables are missing or the site wasn't redeployed after adding them. |
| "The settings table isn't set up yet" | Run `quilo-backend.sql` (step 1). |
| "No admin access" | You signed in with an account that isn't in `admin_users` — run the step 2 SQL with that email. |
| "That email or password isn't right" | Check the user in Supabase → Authentication → Users (reset the password there if needed). |
| "This email isn't confirmed" | In Supabase → Authentication → Users, confirm the user (or recreate with Auto Confirm User on). |
| Logo upload says bucket not found | Run `quilo-backend.sql` again. |
| Saved, but a visitor still sees old branding | The page shows its last-saved copy for a moment, then updates; a refresh fixes it. |

---

## Project layout (for reference)

- `src/lib/settings.ts` — settings model, defaults, validation, theme variables
- `src/lib/supabase.ts` — public Supabase client (returns `null` if not configured)
- `src/lib/remote.ts` — load/save settings + logo upload to Storage
- `src/lib/useAdminAuth.ts` — admin sign-in state (Supabase Auth)
- `src/components/SettingsProvider.tsx` — shared settings for the whole app
- `src/components/BrandLogo.tsx`, `Header.tsx`, `MenuPanel.tsx`, `Footer.tsx`, `SiteShell.tsx` — shared UI
- `src/app/page.tsx` — the alert + response screens
- `src/components/ResetPasswordForm.tsx` — reset-password form (preview only)
- `src/app/admin/page.tsx` — Admin portal
- `quilo-backend.sql` — database + Storage + security rules
