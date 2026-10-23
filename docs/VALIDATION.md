# Validation record — 23 October 2026

Target: `safarovmurod/react-mentor`, branch `feat/devatlas-learning-platform`.

- Frozen `npm ci`: passed; installed Vite 8.3.5, Next.js 16.4.2 and reviewed DOMPurify 3.4.17.
- TypeScript and source ESLint: passed. The final production build also completed its TypeScript phase after the React corpus/cache repair.
- Final unit/integration run: **48 files passed; 361 tests passed, 8 skipped**. Skips explicitly cover unavailable Go, C#, Rust, PHP, Ruby, MongoDB, Swift and Kotlin runtimes; they are not passing execution checks.
- Full browser regression: **94 passed**, 47 desktop and 47 mobile. Covers category/subtrack and plan filters, search, written practice, day confirmation, local drafts, actual Monaco completion/diagnostics, isolated function execution/deadlines/network denial, locale selection, themes and subscription denial. This run preceded the final nineteen React text/example repairs; those repairs were subsequently validated by the final unit suite, TSX syntax tests, answer-library consistency tests and final production build.
- Separate mocked-auth browser run: **12 passed**, six desktop and six mobile. Covers signup, OAuth redirect, account isolation, remembered sessions/logout and MFA flows. This does not validate live Google/Supabase credentials or email delivery.
- Final `npm run build`: passed, including the self-hosted patched Monaco preparation hook. Vercel now calls this npm script instead of bypassing its prebuild step.
- Final production browser smoke: HTTP 200 at widths **360, 768, 1440**, no page errors or horizontal overflow; catalog made **zero Monaco requests**. HTML practice loaded the real editor. Local catalog navigation measured approximately 20–258 ms to first byte and 65–303 ms to DOMContentLoaded in this one-machine run; these are observations, not production/load guarantees.
- Production API smoke: all **38** course metadata records ready; unpaid premium API returns 401; premium lesson text absent from unauthenticated page payloads.
- Premium route review: independent inspection plus 57 scoped regression assertions covered course API, tutor references, attachment reads, server membership and initial-page serialization. No concrete bypass found in the reviewed paths.
- PostgreSQL-compatible PGlite tests execute the additive migrations with modeled Supabase identities. They verify RLS isolation, protected/idempotent XP, prerequisite confirmation, membership provisioning boundaries, chat limits and presence expiry. No shared live database was changed.
- Production dependency audit: **0 known advisories**. Full development audit retains five affected package entries through the unpatched braces advisory; see [DEPENDENCY-SECURITY.md](DEPENDENCY-SECURITY.md).
- Whitespace and source secret-pattern checks passed; generated Monaco assets, local env files and browser artifacts are excluded from Git.

Curriculum completeness is checked against every published schedule, not just catalog labels. All non-React published lessons have theory, questions and practice; all scheduled React topics have teaching sections, flow, code and code-backed tasks. Nineteen missing React topics were repaired with original material and exact RU/EN translations. Syntax checks are not a claim that every third-party-library example was executed in a browser. Manual exercises are labeled self-check; new protected server grading covers HTML day 1.

Live account/database configuration, payment integration, live deployment, backup/restore, load checks and human translation review remain release prerequisites. See [LAUNCH-STEPS-RU.md](LAUNCH-STEPS-RU.md) for the computer-side procedure. The owner later authorized public push and merge: main was updated, Vercel reported deployment success and the live API returned 38 courses while denying unpaid premium requests with 401. Live account/database/payment behavior remains unverified; no successful payment is claimed.

## GitHub CI follow-up

The first GitHub run exposed a real environment difference: Go is available on its Ubuntu runner, and compiling the examples with a cold standard-library cache exceeded Vitest's default five-second test deadline. Only that compiler test now has a 90-second deadline and bounded 40-second child processes; exact-output assertions remain unchanged. An official Go 1.27.3 Linux archive was checked against its published size and SHA-256 before extraction into temporary tooling. With a fresh Go cache, the focused suite passed **17 tests with 7 explicit runtime skips**, including actual execution of both Go examples (5.79 seconds total suite time). The follow-up GitHub run must independently confirm the CI result.
