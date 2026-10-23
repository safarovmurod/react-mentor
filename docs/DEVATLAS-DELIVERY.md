# DevAtlas implementation and release gates

DevAtlas is the new product name for the `safarovmurod/react-mentor` course platform. The GitHub repository name, database identifiers, locale cookie and existing browser storage keys remain compatible with previous users. `safarovmurod/react-practice` is a separate reference repository and was not replaced.

## Implemented development workflow

- Responsive catalog with 38 published courses across 10 categories: programming, design, marketing, analytics, business and management, soft skills, content creation, foreign languages, children, and lifestyle. Programming has six subtracks: frontend, backend, mobile, programming languages, databases, and tools. Shared `/practice` navigation supports coding exercises and written/project assignments without presenting every subject as programming.
- HTML starts at day 1. Theory and practice must be completed before explicit day confirmation opens the next day. React month 2 requires the confirmed first month. Future lesson/practice URLs show the prerequisite state.
- Lazy Monaco editor served from local assets: completion, syntax/type diagnostics, persistent drafts and collapsible instructions/reference. Invalid alternative variable names are not used as a grading heuristic.
- HTML day 1 uses actual document-semantic checks. React function labs run inside the existing opaque iframe/worker boundary with execution deadlines and blocked network. Unsupported automatic tasks report that they are unavailable; manual self-check is labeled accordingly.
- Twenty-five two-day Starter introductions include programming subjects and general subjects. Programming introductions cover Python, Backend, Mobile, Java, C#, Go, Rust, PHP, Ruby, SQL, Bash, Node.js, MongoDB, Swift and Kotlin. General introductions cover UX/UI design, digital marketing, data analytics, business foundations, communication, content creation, English foundations, digital literacy, personal productivity and management foundations. These are introductory modules, not advertised professional qualifications. Language-aware editing does not imply native language execution inside the browser.
- Russian, Tajik, English, Japanese and Korean interface dictionaries, plus existing Ukrainian support. Region headers/browser preferences select a first locale; explicit choice takes priority. Authored lessons remain RU/TG/EN with a visible translation notice for other interface languages. Human translation review remains necessary.
- Separate published curricula for Starter, Pro and Expert: 33 Starter courses, four Pro modules and one Expert module. Pro includes JavaScript Pro, Backend Pro, UX Design Pro and Business Pro; Expert adds Software Architecture Expert. Each premium module has three authored days with practice. Checkout is intentionally unavailable, subscriber chat uses real expiring presence and server-managed membership, and no online users, payment success or subscriber access are invented.
- Additive server-attested HTML day 1 API and separate protected XP/confirmation records. Legacy browser study progress remains self-study data and is not represented as a certificate or protected payment entitlement.

## Published curriculum inventory

Counts below were calculated directly from the current catalog, JSON curricula, generated Next.js content module and React plan; they are not marketing estimates.

| Published schedule | Days |
| --- | ---: |
| HTML + CSS, JavaScript JS1, JavaScript JS2, Git, C++ | 30 each |
| CSS | 5 |
| Next.js | 20 |
| React | 60 across two months |
| 25 Starter introductory modules | 2 each |
| JavaScript Pro, Backend Pro, UX Design Pro, Business Pro, Software Architecture Expert | 3 each |

There are **300 scheduled day slots** in total: 285 Starter and 15 premium. The 37 non-React courses contain **265 lesson records**, of which **240 are scheduled days** and 25 are additional library/reference lessons. Every one of those 265 lesson records has a practice assignment; together they include 319 question records. React uses a separate corpus of 60 topics and a 60-day learning/project plan. These are different data structures: 300 day slots must not be described as 300 distinct lessons or verified passing submissions. The completeness audit found and repaired 19 existing React topics with missing teaching text and code. Each now has two specific explanations, a concrete flow, a TSX example and exact Russian/English translations of the new Tajik material; the duplicated answer-library content is synchronized. Regression tests verify every scheduled React topic has explanations, questions, flow, code and code-backed practice. The 19 new examples pass TSX syntax checks; this does not claim execution of every external-library example or human editorial certification.

`courseMonthPlan` publishes each unscheduled lesson once and retains explicit authored schedules; it no longer pads a short course with generated review days. Unscheduled reference lessons in explicitly scheduled courses stay in their answer library, not in invented extra days. Cards and navigation use actual `publishedDays` metadata. A short introduction is not silently expanded into a full 30-day course.

## Premium content boundary

Published catalog metadata is public, but paid lesson bodies, practice solutions and reference answers require a verified account and an active server-managed membership. Expert includes Pro; a Pro account cannot access the Expert module. The implementation guards `/api/courses/:courseId`, tutor reference lookup, and premium-only file downloads. A file already published by a Starter course remains public. Responses containing premium content and authorization denials use `private, no-store` caching.

Premium course pages do **not** embed paid content in their initial HTML or React Server Component payload. The client obtains premium content only through the authorized API; selecting a plan or editing browser state does not grant access. The page shell and catalog remain visible without revealing the paid body. Unauthenticated, insufficient-tier and unavailable-membership states fail closed. These boundaries have scoped tests; live Supabase authorization and deployment behavior still require production verification.

The step-by-step computer, Supabase and Vercel launch guide is [LAUNCH-STEPS-RU.md](LAUNCH-STEPS-RU.md). This is a deployment procedure, not a claim that production configuration or publication has been completed.

## Running locally

Use Node.js 24, npm, Python 3 for the example-execution tests, and Chromium for browser tests.

```bash
cd /workspace/react-mentor
npm ci --cache /workspace/.npm-cache --no-audit --no-fund
npm run dev
```

`predev` and `prebuild` prepare ignored self-hosted Monaco assets. The editor is downloaded only when a practice workspace needs it. Guest learning works without Supabase; no paid checkout is configured.

```bash
npm run typecheck
npm run lint
npm run test -- --maxWorkers=2
npm run test:e2e
npm run test:auth
npm run build
```

The standard browser test runner starts its own server on port 3100. If a known test server already runs, use `PLAYWRIGHT_REUSE_SERVER=true`. Keep independent Playwright runs in separate output directories. Stop only owned dev processes before rebuilding production outputs.

## Database and account integration

Use the existing account setup instructions in [accounts-setup.md](accounts-setup.md). Required public project configuration is `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Server-attested HTML grading additionally needs the existing server-only `SUPABASE_SERVICE_ROLE_KEY`. Never put that service key in a `NEXT_PUBLIC_*` variable, source control, chat or frontend bundle.

Review migrations in a test database before applying them to a shared project:

1. Existing account and progress-conflict migrations.
2. `20261022000000_verified_practice.sql`.
3. `20261022010000_memberships_chat.sql`.

`tests/database-migrations.test.ts` executes the new migrations in PGlite's PostgreSQL-compatible engine. It verifies role grants, private reads, idempotent XP, prerequisite confirmation, membership provisioning denial, chat authorization/rate limits and presence expiry. Its identity/MFA helpers model Supabase's JWT boundary; it does not establish that a live Supabase deployment has been configured correctly.

For real server-attested progress, the API derives identity from a verified Supabase session, parses HTML without running learner scripts, records only a SHA-256 solution hash and writes via service-role-only functions. User-provided XP, grade flags and learner IDs are rejected. The first HTML exercise is the only new server-graded exercise in this increment. Other course completion, written work and manual practice acknowledgments remain explicitly self-study progress; their XP and day confirmations are not represented as server-certified assessments.

## Payments and community

See [MEMBERSHIP-COMMUNITY.md](MEMBERSHIP-COMMUNITY.md). The four Pro modules and one Expert module are published behind the server membership gate, but checkout intentionally fails closed until a payment provider, prices, currencies, account and signed webhook integration are supplied. Until then only a trusted administrator can provision a real membership; the application does not make a browser plan selection equivalent to a purchase. A success redirect must never grant membership. Subscriber chat needs the reviewed migration and a real, unexpired server membership; without configuration the UI explains the unavailable service.

## Review and publication boundaries

Ten distinct specialists participated across architecture, curriculum, frontend, editor/grading, backend, localization, subscriptions/community, security, visual/performance review and browser QA. Their review is evidence-based and scoped; there is no assertion of perfect security, perfect translations or guaranteed uptime.

Before production launch: configure and test live authentication/database migrations, verify backup/restore and deployment HTTPS, provision secure isolated runners before advertising additional automatic language execution, integrate verified payment webhooks before selling paid access, review translations/content, and perform deployment/load/security checks.

The user requires the destination repository to be private before pushing. Git read access does not prove visibility. GitHub API access was enabled through the environment draft and confirmed that this repository is currently **public**. Changing visibility failed with HTTP 403 `Resource not accessible by integration`; the owner must make it private in GitHub settings. No push is permitted until private visibility is verified.

The cloud environment draft stores installation/startup instructions. Draft saving does not publish the environment or deploy the website. Repository changes and production publication are separate operations.

Dependency remediation and the locally rebuilt patched editor are documented in [DEPENDENCY-SECURITY.md](DEPENDENCY-SECURITY.md). The recorded production dependency audit reported zero known vulnerabilities; the development-tool audit still has the documented unpatched `braces` advisory. See the dependency report for scope and limitations; neither result is a security guarantee.
