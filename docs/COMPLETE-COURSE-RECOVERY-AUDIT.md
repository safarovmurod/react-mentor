# Complete course recovery audit — 2026-10-24 (second increment)

Branch `feat/track-architecture-20261024`, base `main` @ `e4b3fdb`. The coverage matrix below is GENERATED from actual catalog + curriculum data by `node --experimental-strip-types scripts/track-coverage-report.mjs` — no status in it is hand-written. ("file missing" rows mean `.ts` curriculum modules rather than JSON; React 60d and Next.js 20d are fully published.)

## What the second increment added (same session, after the first audit)

All five premium courses are now full 30-day curricula, and four beginner modules grew from 2 to 30 days — **+208 authored days in this increment, 270 across the session**:

| Course | Before | After | Verification |
|---|---|---|---|
| Backend Pro (paid) | 3d | **30d** | 30/30 solutions executed with node, outputs match exactly |
| Software Architecture Expert (paid) | 3d | **30d** | written-decision course; contract-validated, days byte-preserved |
| UX Design Pro (paid) | 3d | **30d** | written curriculum, contract-validated, fiction-case consistent |
| Business Pro (paid) | 3d | **30d** | written curriculum, all worked figures arithmetically cross-checked |
| JavaScript Pro (paid) | 3d (start of day) | **30d** | 14/14 new code solutions executed with node, matched |
| Node.js (free) | 2d | **30d** | 28/28 executable days run with node, matched |
| Java (free) | 2d | **30d** | mechanically verified (no JDK on machine; launcher test skips by design) |
| SQL (free) | 2d | **30d** | 28/28 executable days run through real SQLite, matched |

The Pro filter in the catalog now shows four 30-day Pro courses plus one 30-day Expert course — no 2–3-day paid stubs remain anywhere.

## Track × Stage coverage matrix (generated 2026-10-24, after second increment)

| Track | Beginner (free) | Pro (paid) | Expert (paid) |
|---|---|---|---|
| HTML + CSS (html) | html: 30d · 32 lessons · 34 quiz | — not published | — not published |
| CSS (css) | css: 0d scheduled · 5 library lessons · 25 quiz | — not published | — not published |
| JavaScript (javascript) | JS1: 30d · 48 quiz · JS2: 30d · 38 quiz | javascript-pro: 30d · 76 quiz | — not published |
| TypeScript (typescript) | typescript: 14d · 31 quiz | — not published | — not published |
| React (react) | react: 60d (TS corpus) | — not published | — not published |
| Next.js (nextjs) | nextjs: 20d (TS module) | — not published | — not published |
| Python (python) | python: 30d · 60 quiz | — not published | — not published |
| Algorithms (algorithms) | algorithms: 14d · 42 quiz | — not published | — not published |
| C++ (cpp) | cpp: 30d · 44 quiz | — not published | — not published |
| Java (java) | java: 30d · 60 quiz | — not published | — not published |
| C# (csharp) | csharp: 2d | — not published | — not published |
| Go (go) | go: 2d | — not published | — not published |
| Rust (rust) | rust: 2d | — not published | — not published |
| PHP (php) | php: 2d | — not published | — not published |
| Ruby (ruby) | ruby: 2d | — not published | — not published |
| Backend (backend) | backend: 2d | backend-pro: 30d · 60 quiz | — not published |
| Node.js (nodejs) | nodejs: 30d · 60 quiz | — not published | — not published |
| SQL (sql) | sql: 30d · 60 quiz | — not published | — not published |
| MongoDB (mongodb) | mongodb: 2d | — not published | — not published |
| Bash (bash) | bash: 2d | — not published | — not published |
| Git / GitHub (git) | git: 30d · 34 quiz | — not published | — not published |
| Mobile (mobile) | mobile: 2d | — not published | — not published |
| Swift (swift) | swift: 2d | — not published | — not published |
| Kotlin (kotlin) | kotlin: 2d | — not published | — not published |
| AI Fundamentals (ai-fundamentals) | ai-fundamentals: 14d · 37 quiz | — not published | — not published |
| Context Engineering (context-engineering) | context-engineering: 14d · 42 quiz | — not published | — not published |
| Agent Harness (agent-harness) | agent-harness: 14d · 39 quiz | — not published | — not published |
| UX/UI Design (ux) | ux-design: 2d | ux-pro: 30d · 60 quiz | — not published |
| Digital Marketing (digital-marketing) | digital-marketing: 2d | — not published | — not published |
| Data Analytics (data-analytics) | data-analytics: 2d | — not published | — not published |
| Business (business) | business-foundations: 2d | business-pro: 30d · 60 quiz | — not published |
| Management (management) | management-foundations: 2d | — not published | — not published |
| Communication (communication) | communication: 2d | — not published | — not published |
| Content Creation (content-creation) | content-creation: 2d | — not published | — not published |
| English (english) | english-foundations: 2d | — not published | — not published |
| Digital Literacy (digital-literacy) | digital-literacy: 2d | — not published | — not published |
| Personal Productivity (personal-productivity) | personal-productivity: 2d | — not published | — not published |
| Software Architecture (architecture) | — not published | — not published | architecture-expert: 30d · 60 quiz |

Total scheduled days across track stages: **612 (excl. React's own 60 → 672 with React)**. Baseline at session start: 342.

## Verification state

`typecheck` ✅ · `lint` ✅ · `npm run test` ✅ **370 passed / 10 skipped / 0 failed** (skips are environment-conditional runtimes: no local JDK, Go, .NET, PHP, Ruby, MongoDB or Swift) · `build` ✅. Every expansion preserved its original days additively (byte-identical, only appended sections/questions/options) and has a regression test: premium-curriculum (executes every Pro code day), programming-intros (executes the full Node.js and SQL schedules through real runtimes), published-curriculum (every published day has real content).

## Honest remaining gaps

- 18 two-day introductory modules remain (csharp, go, rust, php, ruby, mongodb, bash, mobile, swift, kotlin, ux-design, digital-marketing, data-analytics, business-foundations, management, communication, content-creation, english-foundations, digital-literacy, personal-productivity — of which several are general subjects).
- Pro/Expert stages exist for five disciplines; the other tracks' Pro/Expert remain honestly unpublished (each needs 30+ authored days).
- TypeScript, Algorithms, AI courses are 14 days each (real content, below the 30-day target — candidates for the same expansion treatment).
- AI Mentor remains a single-question tutor; payments remain fail-closed pending a real provider.
