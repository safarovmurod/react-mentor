# Accounts, profiles and device sync

ReactMentor supports recommended Google sign-in, email/password registration,
email confirmation/password recovery, first-login name onboarding, private
profile photos, account-scoped learning caches, cloud progress and TOTP MFA.
The phone QR opens this site's login page. Signing into the **same account**
connects the phone to the same progress; scanning alone does not log anyone in.
No SMS provider or paid phone verification is required.

## Existing shared Supabase project

Target: `alafwzjqxwjanoqrirwi`. One Supabase project can serve two applications.
Apply **only** `supabase/migrations/20261004000000_accounts.sql` for this feature.
It is standalone and uses `react_mentor_profiles`, `react_mentor_progress`,
`react-mentor-avatars` and prefixed functions/policies. It does not modify the
other application's tables or require the older workspace migration.

The migration uses auth.uid() owner policies, private storage and an MFA check.
When a verified factor exists, private database/storage access needs aal2.
Progress writes use a per-account lock and revision compare-and-swap. Offline
edits merge achievements once, use timestamps for preferences/code/reviews and
retain note deletion tombstones. Client timestamps are for conflict resolution,
not trusted competition scores. Simultaneous study time uses the greatest
reported total, rather than adding overlapping device sessions.

Guest progress stays in its old browser key. Accounts start separately; the
settings button imports guest progress explicitly. Logout hides the account's
UI, stops sync and unmounts chat. Account caches remain on the device for offline
use; they are not encrypted against someone with browser/device access.

## Provider configuration

1. In Supabase Authentication, enable Google using the existing Google Cloud
   OAuth client (or create a Web application OAuth client). Authorized redirect
   URI: `https://alafwzjqxwjanoqrirwi.supabase.co/auth/v1/callback`.
   Google credentials stay in Supabase. A shared project uses the same Auth
   users and MFA factors for both apps; do not change another app's OAuth setup.
2. Add allowed redirect URLs:
   - `https://react-mentor-opal.vercel.app/auth/callback`
   - `https://react-mentor-opal.vercel.app/auth/callback?recovery=1`
   Preserve the existing Site URL and all other app redirects. Add development
   callbacks only for development environments. Enable email signup/confirmation
   and TOTP enrollment/verification. Supabase's default email sender is limited;
   use a suitable SMTP service if production signup volume needs it.
3. Vercel project environment variables, Production:
   - `NEXT_PUBLIC_SUPABASE_URL=https://alafwzjqxwjanoqrirwi.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable or anon key>`
   **Never** use a service-role key for a NEXT_PUBLIC variable. Redeploy after
   changing these variables: Next.js includes them at build time.
4. Optional automated migration/redirect setup: bind `SUPABASE_ACCESS_TOKEN`
   securely for `api.supabase.com`, then `node scripts/setup-accounts.mjs`.
   It only targets this project, preserves other redirects and does not print
   keys. It cannot create Google OAuth credentials or configure Vercel by itself.
   The management token is not an application runtime requirement.

Auth, database, storage and TOTP can run within Supabase's Free plan limits;
Google OAuth does not require SMS. Free tiers have quotas and may pause inactive
projects. AnyModel's existing paid AI budget is separate. Known authored course
answers stay public/local and cost zero tokens. Paid AI requires a verified
account for every deployment. Missing Supabase configuration blocks paid AI
instead of falling back to anonymous access; durable billing quotas remain separate.

## Production diagnosis, 2026-10-05

The deployed `/login` returned HTTPS 200. Its served client chunk still contained
unresolved `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` references,
with no configured project URL. The client therefore sets `configured=false` and
disables Google and email signup before making an authentication request. This
is a deployment configuration blocker, rather than a rejected registration.
Supabase's Google authorize endpoint returned HTTP 302 to `accounts.google.com`;
that confirms the provider redirect, not a completed OAuth login or callback.

Set both public variables from the Provider configuration section in the actual
Vercel project's Production environment and redeploy. These are build-time
variables: adding them to cloud-environment settings alone does not update Vercel.
The current task had no saved/runtime Supabase management or Vercel API token,
so live configuration, migration and authenticated end-to-end verification remain
pending. Do not substitute a test placeholder or service-role key.

The unconfigured UI now explains the missing account connection, disables the
email fields and provides a prominent guest entry. Known provider errors have
specific safe messages for email confirmation, closed signup and temporary email
quotas. Mobile QA covers 320–430px headers, a 360×568px drawer with fixed controls
and scrolling navigation, keyboard/backdrop closing, and guest entry. Guest home
greetings no longer use a hard-coded person's name; signed-in greetings use the
current profile.

## Verification

`npm run test` verifies account cache isolation, guest preservation, merging,
note tombstones, delayed old-account responses and CAS conflict recovery.
`npm run test:e2e` runs existing course/Tutor regression checks without Supabase.
`npm run test:auth` uses an isolated mock Supabase backend for desktop/mobile
Google PKCE redirect, email signup/confirmation messaging, email quota errors,
email login, mandatory first name, account switching,
cloud note sync, reload, re-encoded photo upload, phone QR, TOTP enrollment and
MFA login challenge. These tests are **not** evidence of live OAuth/provider
connectivity. Browser plugin was unavailable; QA uses Playwright/Chromium.

Before calling production complete, verify a real Google login, a confirmed
email login, actual photo upload and two different accounts/device sessions on
Vercel. Real provider configuration and live verification require access; cloud
environment draft changes do not configure the Vercel deployment.

The older demo `/api/pair/create` and `/api/pair/connect` endpoints return 410.
They no longer simulate successful login or grant workspace membership using
a caller-supplied userId.
