# Accounts, profiles and device sync

ReactMentor supports recommended Google sign-in, email/password registration,
email confirmation/password recovery, first-login name onboarding, private
profile photos, account-scoped learning caches, cloud progress and TOTP MFA.
The phone QR opens this site's login page. Signing into the **same account**
connects the phone to the same progress; scanning alone does not log anyone in.
No SMS provider or paid phone verification is required.

## Existing shared Supabase project

Target: `sqveszluhdargkiqowjp` (safarovmurod's Project), selected by the owner after
the setup token confirmed access to this project. One Supabase project can serve
two applications. `REACT_MENTOR_SUPABASE_PROJECT_REF` overrides the setup script's
default when an explicitly selected project changes.
Apply `supabase/migrations/20261004000000_accounts.sql` and the incremental
`supabase/migrations/20261005000000_progress_conflict.sql` for this feature.
It is standalone and uses `react_mentor_profiles`, `react_mentor_progress`,
`react-mentor-avatars` and prefixed functions/policies. It does not modify the
other application's tables or require the older workspace migration.

The migration uses auth.uid() owner policies, private storage and an MFA check.
When a verified factor exists, private database/storage access needs aal2.
Progress writes use a per-account lock and revision compare-and-swap. Revision
mismatches return HTTP 409 (`PT409`) so they do not become retrying server errors;
the client rereads and merges before retrying and supports the older `40001` code. Offline
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
   URI: `https://sqveszluhdargkiqowjp.supabase.co/auth/v1/callback`.
   Google credentials stay in Supabase. A shared project uses the same Auth
   users and MFA factors for both apps; do not change another app's OAuth setup.
2. Add allowed redirect URLs:
   - `https://react-mentor-opal.vercel.app/auth/callback`
   - `https://react-mentor-opal.vercel.app/auth/callback?recovery=1`
   Preserve the existing Site URL and all other app redirects. Add development
   callbacks only for development environments. Enable email signup/confirmation
   and TOTP enrollment/verification. Supabase's default email sender is limited;
   configure custom SMTP for public email registration. Without custom SMTP,
   Supabase's built-in sender restricts recipients to project team addresses;
   this is a provider restriction, not a successful global registration setup.
3. Vercel project environment variables, Production:
   - `NEXT_PUBLIC_SUPABASE_URL=https://sqveszluhdargkiqowjp.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable or anon key>`
   **Never** use a service-role key for a NEXT_PUBLIC variable. Redeploy after
   changing these variables: Next.js includes them at build time.
4. Optional automated migration/redirect setup: bind `SUPABASE_ACCESS_TOKEN`
   securely for `api.supabase.com`, then `node scripts/setup-accounts.mjs`.
   It only targets this project, preserves other redirects and does not print
   keys. It cannot create Google OAuth credentials or configure Vercel by itself.
   Updating Auth callbacks also required `project_admin_write` on this scoped
   token in the live API, even with Auth Config read-write. Dashboard URL changes
   are an alternative. The management token is not a runtime requirement.

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
Vercel access was subsequently connected through the CLI. A project-scoped
Supabase setup token was entered as a Production Secret in Vercel and used only
inside an isolated setup deployment (`--prod --skip-domain`). No management token
was copied into repository files, client bundles or public configuration.

The token's real project listing identified `sqveszluhdargkiqowjp`, rather than
the initially supplied `alafwzjqxwjanoqrirwi`. The owner selected the accessible
project and resumed it from its Supabase dashboard. After it became
`ACTIVE_HEALTHY`, the standalone account migration was applied successfully.

Live checks created two temporary, preconfirmed accounts, signed in using real
password authentication, created profiles and progress, uploaded private photos,
and verified cross-account reads/updates and anonymous progress writes were
blocked. The initial `40001` revision error caused a real HTTP request timeout;
the incremental migration changes expected conflicts to HTTP 409 (`PT409`). The
same live check then passed, including stale-revision rejection. Temporary test
accounts, progress, profiles and photos were removed after verification.

Provider configuration at that check: email and signup enabled, TOTP enrollment
and verification enabled, Google initially disabled, email confirmation required, custom
SMTP absent, and ReactMentor callback missing. The owner then enabled Google;
the final management check confirmed `googleEnabled=true`. Preconfirmed test logins do not
verify confirmation email delivery. The owner is adding callback URLs and Google
credentials in the dashboard; full Google consent/callback remains unverified.
The setup token cannot PATCH Auth settings: HTTP 403 reported missing
`project_admin_write`. Preserve the shared project's Site URL and other callbacks.

Production public URL and validated anon key were saved through the Vercel API.
A CONNECT 403 blocked reading a protected temporary deployment from this cloud
instance, so the isolated build saved the public variables directly through
the Vercel API. Temporary management credentials were removed from the project
and all seven isolated setup deployments were deleted before the regular push.
The main domain was never promoted to an isolated setup deployment. Never substitute a test placeholder or
service-role key for the public client key.

The unconfigured UI now explains the missing account connection, disables the
email fields and provides a prominent guest entry. Known provider errors have
specific safe messages for email confirmation, closed signup and temporary email
quotas. Mobile QA covers 320–430px headers, a 360×568px drawer with fixed controls
and scrolling navigation, keyboard/backdrop closing, and guest entry. Guest home
greetings no longer use a hard-coded person's name; signed-in greetings use the
current profile.

## Remembered login

Supabase persists the session and refresh token in this browser's local storage;
the existing SDK storage key is retained so deployment does not log out current
users. Access tokens refresh automatically. If the server rejects a cached
access token, the app tries one refresh and verifies the new token before opening
private data. A revoked refresh token still requires a new login.

Temporary restoration/network errors show a retry screen and resume on reconnect
rather than presenting registration again. Returning through browser back/forward
cache rechecks the session. Repeated same-token SIGNED_IN notifications on tab
focus preserve the open lesson/Tutor and avoid resetting the verified account.
Name onboarding remains one time per account; logout still removes this device's
session. Other browsers/devices require their own initial login. Cleared browser
storage, private-browsing windows and server-side session revocation cannot retain
an indefinite login.

A persistent Chromium profile test closes and relaunches the actual browser,
restores the existing account, refreshes an expired access token without another
password/OAuth request, then verifies that explicit logout survives another
restart. These backend responses are mocked; no real refresh tokens are logged or
copied into test artifacts.

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
