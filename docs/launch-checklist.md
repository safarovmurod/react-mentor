# Launch checklist

Updated: 8 October 2026 (Asia/Dushanbe). Keep this file free of credentials and personal documents.

## Verified starting point

- Repository: https://github.com/safarovmurod/react-mentor
- Local and remote HEAD: `65211ff661b6e0df2c1c10fcbbd5c61addff59f6` (native `git ls-remote origin HEAD`).
- PR #2: https://github.com/safarovmurod/react-mentor/pull/2; merged before this work. Do not merge it again.
- Public GitHub Actions page currently lists https://github.com/safarovmurod/react-mentor/actions/runs/37758083354 as completed successfully.
- Implementation branch: `codex/launch-readiness-20261008`; implementation commit `eb050c8ef6c49fc89fd8f8d650cc3d45e8daa3da`, verified on the remote. Existing checkout is isolated; no extra worktree is needed.
- PR #3: https://github.com/safarovmurod/react-mentor/pull/3. Merged at 16:04:57 Asia/Dushanbe into `main` as `9124d8d439136bebd8b09407b284058782897d7c` after successful checks.
- PR CI: https://github.com/safarovmurod/react-mentor/actions/runs/37766941045 — successful on the exact implementation commit. Post-merge main CI: https://github.com/safarovmurod/react-mentor/actions/runs/37767718159; refresh the latest main run when resuming because later documentation commits may have their own runs.

## Progress

| Stage | Status | Evidence / remaining prerequisite |
|---|---|---|
| Repository and architecture inspection | DONE | Next 16.3.8, React 19.2.8, Zustand/browser caches, Supabase account snapshots, local Tutor with optional AnyModel. |
| Dependency installation | DONE | `npm ci --cache /workspace/.npm --no-audit --no-fund`: 510 packages; lockfile unchanged. Node 24.19.0/npm 11.9.0; CI uses Node 22. |
| Baseline ESLint / TypeScript | DONE | Both commands exit 0. |
| Baseline Vitest | DONE | 21 files / 110 tests passed. |
| Baseline production build | DONE | `npm run build` completed, 32 generated pages. |
| Baseline desktop/mobile E2E | DONE | 50 tests passed; system Chromium; includes 320/360/375/390/430 px checks. |
| Baseline mock authentication | DONE | 12 desktop/mobile tests passed. This cannot validate live providers. |
| Local production-server functional checks | DONE | `/`, `/privacy`, `/terms`: HTTP 200 with English application content; `/api/courses`: seven ready courses; retired pairing POST: HTTP 410. Baseline build tested. |
| Documentation accuracy | DONE | Removed obsolete claims about six-digit pairing, active Dexie storage, Monaco and weighted mastery. |
| Study-time tail preservation | DONE | Six regression cases pass: ordinary unmount, unfinished batch, course/account changes, direct cloud selection, hidden/pagehide; 23 targeted tests in five files passed. |
| Interface localization | DONE | Account/MFA/recovery/profile/session, assessment/course workspace, Tutor and explanation button now follow ru/en/tg/uk UI locale independently from content language. 31 new rendered localization regressions and final integrated browser suites pass. |
| Mobile settings overflow | DONE | Reproduced 365 px document width on a 320 px viewport. Stacked phone controls now fit 320/360/375/430 px in all four locales; added functional E2E regression. |
| Final ESLint / TypeScript / Vitest / build | DONE | ESLint and TypeScript pass; 24 files / 147 unit tests pass; final CSS production rebuild passes. |
| Final production-browser smoke | DONE | All four UI languages: meaningful public page identity, settings controls at 320/360/375/430/1280 px, real local Tutor reply and close. All seven course plans render. No console errors or page exceptions. |
| Final desktop/mobile E2E / mock auth | DONE | 54 E2E tests and 12 mock-auth tests passed after all source changes. Mock providers remain distinct from live verification. |
| Saved development startup | DONE | Exact saved dev command started successfully; real page and seven ready course records return HTTP 200. Development server is running in the current instance; processes will need restarting in a future task. |
| GitHub API / branch policy / metadata | DONE | Initial requests returned Forbidden; subsequent REST and GraphQL operations succeeded using existing platform authentication. PR creation, checks, merge and deployment metadata verified. Classic branch rule was null; effective `main` rules endpoint returned `[]`. No bypass/admin merge used. |
| Claude for Startups official conditions | BLOCKED | CONNECT to official page returns 403. No current eligibility, amounts, seats, expiry or payment conditions verified. |
| Tajikistan eligibility / founder facts | BLOCKED | Official supported-country source inaccessible; legal/company/funding facts awaiting founder reply. |
| CodeRavon collision review | IN PROGRESS | Public GitHub search returned 0 results. Company/trademark searches remain unverified. Provisional candidate only. |
| `coderavon.com` availability and price | BLOCKED | Registry RDAP CONNECT returns 403. No registrar quote, ownership confirmation or purchase. |
| Rebranding | BLOCKED | User requires final brand/domain validation first. Preserve existing service names and data identifiers until then. |
| Domain DNS / HTTPS / canonical / www | BLOCKED | No verified owned domain, registrar or Cloudflare access. Use records from actual Vercel domain configuration. |
| Corporate email / Gmail delivery | BLOCKED | Domain ownership and mail provider access needed. Proposed `founder@coderavon.com` is not a created mailbox. |
| Cloudflare | BLOCKED | No connector or authenticated browser session available. |
| Supabase live RLS/Auth/storage | BLOCKED | No connector, runtime credentials or secret bindings available in this environment. Do not modify shared project blindly. |
| Live Google/email login, MFA and database | BLOCKED | Needs configured Supabase and authorized test account/provider verification. |
| Vercel automatic production deployment | DONE | GitHub deployment `6933827871` reports `Production`, state `success`, SHA `9124d8d439136bebd8b09407b284058782897d7c`. This is provider metadata, not a browser/live-auth check. |
| Production reachability / Vercel direct configuration | BLOCKED | No direct Vercel binding yet. New Preview and Production page requests hit proxy CONNECT 403; no application HTTP response received. Documented `react-mentor-opal.vercel.app` alias is still unconfirmed. |
| Git commit / push / PR / CI / merge | DONE | Native push verified; PR #3 created and merged after CI success. First push GH007 privacy failure resolved by using the owner's existing public GitHub noreply address for the new unpublished commit only; privacy protection retained. |
| Anthropic application preparation | DONE | Source-backed draft in `startup-application.md`; unknown fields explicitly pending. Not submitted. |
| Anthropic submission | BLOCKED | Official rules/form, eligibility, real public site, verified business email and owner facts required first. |
| Claude Team / API credits | BLOCKED | No application approval or activated benefits observed. |

## Environment configuration

Saved `install_script` and `start_skill` in the environment configuration draft. Dependency installation completed twice; the complete saved installation script was executed successfully once. It uses `npm ci`, preserves the lockfile, checks the Node runtime and launches system Chromium through Playwright. Startup instructions include the existing checkout, managed server session, functional readiness requests, sequential browser suites and the difference between retained files and processes.

The draft preserves package-manager presets and adds required public/service destinations: `api.github.com`, `claude.com`, `www.anthropic.com`, `support.claude.com`, `platform.claude.com`, `react-mentor-opal.vercel.app`, `rdap.verisign.com`, `sqveszluhdargkiqowjp.supabase.co`, `api.vercel.com`, `api.supabase.com`, `api.cloudflare.com`, plus observed deployment hosts listed below.

Added public runtime requirements `NEXT_PUBLIC_SUPABASE_URL` (suggested existing project URL) and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The latter must be a public anon/publishable key, not a service-role key. Added personal API credential requirements `VERCEL_TOKEN`, `SUPABASE_ACCESS_TOKEN`, `CLOUDFLARE_API_TOKEN`, each restricted to its API hostname. These declarations contain no values and do not establish access. Existing GitHub authentication was reused; no extra GitHub token was requested.

Draft saving was confirmed (`status: saved`, `requires_publish: true`). The owner must review/save settings and publish the environment to activate the configuration/snapshot. Saving a draft does not execute scripts, inject values, apply network changes, publish Vercel or validate restoration in a fresh task. Retained dependencies do not imply that server processes survive publication.

## Conditions and claims

The X post claims (12 months of Team, five seats, $1,000 credits/six-month expiry, partner benefits, company-age limits, Gmail exclusion and fast review) are **unverified**, because official sources could not be opened. `In progress` means neither approval nor activation; a Team discount is not automatically a free subscription. No payment/card/renewal terms are established. Per-question findings and the brand/domain check are recorded in [anthropic-program-review.md](anthropic-program-review.md).

Local E2E country headers are simulated; they do not validate real geolocation from four countries. Mock authentication and provider tests do not prove live Google, Supabase or AnyModel connectivity. Account caches are unencrypted on-device; process-local Tutor throttling is not a durable per-user billing quota. Final privacy/operator/retention details still require owner facts and review.

## Next actionable steps

1. Review/save the environment draft and publish the environment; retry affected destinations only after network/value propagation. Installation, local validation and service startup are complete.
2. Supply actual founder/legal/start-date/funding/team/domain facts; do not invent company registration or traction.
3. Supply the saved personal Vercel/Supabase/Cloudflare API bindings and public Supabase variables securely in environment settings, or connect authorized integrations if available. Mail access is still needed separately. Never paste keys in chat.
4. Verify official program rules and domain price before purchase authorization. Then verify DNS, incoming/outgoing mail, actual production/auth and eligibility before application submission.

## Observed deployment links

- Preview: https://react-mentor-git-codex-launch-rea-6956e3-safarovmurods-projects.vercel.app — provider reports Ready; proxy denied the browser/request path.
- Production for merge `9124d8d`: https://react-mentor-2vgvaokcz-safarovmurods-projects.vercel.app — GitHub deployment status reports success; proxy denied the request path. This is a unique deployment URL, not a verified owned domain/canonical alias.
- No domain purchased, mailbox created, test email sent, application submitted, Claude Team subscription activated or API credits granted by this task.
