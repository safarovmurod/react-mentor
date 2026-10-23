# Complete course recovery audit — 2026-10-24

Phase 0 of the strict recovery prompt. Facts measured directly from the working tree (branch `feat/track-architecture-20261024`, base `main` @ `e4b3fdb`). The coverage matrix below is GENERATED from actual catalog + curriculum data by `node --experimental-strip-types scripts/track-coverage-report.mjs` — no status in it is hand-written.

## Re-audit summary (commit e4b3fdb baseline)

Confirmed against the recovery prompt's list: 41 courses (36 Starter incl React, 4 Pro, 1 Expert), 25 two-day Starter modules, 5 three-day paid modules, 3 AI courses × 14 days, no per-track three-level system, no Algorithms direction, no TypeScript course, 30-day caps in schema/route/workspace, AI Tutor not a persistent multi-conversation chat, payments intentionally unconfigured (checkout fails closed). Since then this branch changed the structural items — see below. ("React/nextjs: file missing" rows in the generator output mean `.ts` curriculum modules rather than JSON; both are fully published: React 60 days, Next.js 20 days.)

## Track × Stage coverage matrix (generated 2026-10-24)

| Track | Beginner (free) | Pro (paid) | Expert (paid) |
|---|---|---|---|
| HTML + CSS (html) | html: 30d · 32 lessons · 32 practice · 34 quiz | — not published | — not published |
| CSS (css) | css: 0d scheduled · 5 library lessons · 25 quiz | — not published | — not published |
| JavaScript (javascript) | javascript-1: 30d · 43 lessons · 48 quiz<br>javascript-2: 30d · 32 lessons · 38 quiz | javascript-pro: 14d · 14 lessons · 28 quiz | — not published |
| TypeScript (typescript) | typescript: 14d · 14 lessons · 31 quiz | — not published | — not published |
| React (react) | react: 60d (TS corpus) | — not published | — not published |
| Next.js (nextjs) | nextjs: 20d (TS module) | — not published | — not published |
| Python (python) | python: 30d · 30 lessons · 60 quiz | — not published | — not published |
| Algorithms (algorithms) | algorithms: 14d · 14 lessons · 42 quiz | — not published | — not published |
| C++ (cpp) | cpp: 30d · 37 lessons · 44 quiz | — not published | — not published |
| Java (java) | java: 2d | — not published | — not published |
| C# (csharp) | csharp: 2d | — not published | — not published |
| Go (go) | go: 2d | — not published | — not published |
| Rust (rust) | rust: 2d | — not published | — not published |
| PHP (php) | php: 2d | — not published | — not published |
| Ruby (ruby) | ruby: 2d | — not published | — not published |
| Backend (backend) | backend: 2d | backend-pro: 3d | — not published |
| Node.js (nodejs) | nodejs: 2d | — not published | — not published |
| SQL (sql) | sql: 2d | — not published | — not published |
| MongoDB (mongodb) | mongodb: 2d | — not published | — not published |
| Bash (bash) | bash: 2d | — not published | — not published |
| Git / GitHub (git) | git: 30d · 31 lessons · 34 quiz | — not published | — not published |
| Mobile (mobile) | mobile: 2d | — not published | — not published |
| Swift (swift) | swift: 2d | — not published | — not published |
| Kotlin (kotlin) | kotlin: 2d | — not published | — not published |
| AI Fundamentals (ai-fundamentals) | ai-fundamentals: 14d · 37 quiz | — not published | — not published |
| Context Engineering (context-engineering) | context-engineering: 14d · 42 quiz | — not published | — not published |
| Agent Harness (agent-harness) | agent-harness: 14d · 39 quiz | — not published | — not published |
| UX/UI Design (ux) | ux-design: 2d | ux-pro: 3d | — not published |
| Digital Marketing (digital-marketing) | digital-marketing: 2d | — not published | — not published |
| Data Analytics (data-analytics) | data-analytics: 2d | — not published | — not published |
| Business (business) | business-foundations: 2d | business-pro: 3d | — not published |
| Management (management) | management-foundations: 2d | — not published | — not published |
| Communication (communication) | communication: 2d | — not published | — not published |
| Content Creation (content-creation) | content-creation: 2d | — not published | — not published |
| English (english) | english-foundations: 2d | — not published | — not published |
| Digital Literacy (digital-literacy) | digital-literacy: 2d | — not published | — not published |
| Personal Productivity (personal-productivity) | personal-productivity: 2d | — not published | — not published |
| Software Architecture (architecture) | — not published | — not published | architecture-expert: 3d |

Total scheduled days across track stages: **404 (excl. React's own 60 → 464 with React)**. Baseline before this branch: 342.

## What this increment changed

**Architecture (Phase 1 + 7).** Learning tracks are a first-class registry: `LEARNING_TRACKS` in `catalog.ts` maps every course into exactly one track (38 tracks) with its stage derived from `accessTier` (beginner/free, pro, expert). Every course page shows the track's three stages — published stages link with real day counts; unpublished stages render as "not published yet" and are never faked as finished. The 30-day caps are gone: schema day limit raised to 120 with full validation, the course route validates the requested day against the course's actual `publishedDays`, and draft persistence uses the same bound. Existing IDs, URLs, progress and drafts unchanged; React's two-month structure untouched.

**Content (Phases 2/3/6 — partial by design).** +67 authored days this increment: Python Beginner 2→30 days (29 executable solutions verified with real Python 3.12), new free TypeScript course (14 days, 13 solutions verified with `tsc --strict` + esbuild + node), new free Algorithms course (14 days, 13 solutions executed with node; performance claims only from counters the programs compute), JavaScript Pro 3→14 days (12 executable solutions; event loop, cancellation, retries, generators, memory, performance, node:test, capstone). All fully trilingual RU/TG/EN with declared sources; ~155 new quiz questions.

**Design (Phase 10 — first pass).** Shared ambient aurora background system across pages (dark/light, reduced-motion safe), oversized landing typography (hero up to 88px), staged entrance animations, floating studio preview, rotating decorative ring, glassy app header, tactile card/button micro-interactions, animated progress bars, smoother AI-tutor drawer arrival, learning-track stage cards on course pages. Verified visually on desktop light/dark and 375px mobile via production server screenshots.

**Tests (Phase 13).** 373 passing / 0 failing / 10 skipped (baseline was 358 + 1 environment failure). New `tests/track-coverage.test.ts` locks: schema accepts days >30 with valid prerequisites; every course belongs to exactly one track; stage always matches access tier; published beginner stages stay free; current multi-stage tracks are pinned so coverage can only grow. Python execution tests now resolve a real interpreter cross-platform and pass locally for the first time.

## Honest remaining gaps (not hidden)

- 24 Starter introductory modules are still 2 days (java, csharp, go, rust, php, ruby, sql, bash, nodejs, mongodb, swift, kotlin, backend, mobile, ux-design, digital-marketing, data-analytics, business-foundations, management, communication, content-creation, english, digital-literacy, personal-productivity).
- Pro/Expert stages beyond JavaScript Pro, Backend Pro, UX Pro, Business Pro, Software Architecture Expert are not published; the CSS track has 5 unscheduled library lessons only.
- Full three-stage coverage of EVERY track (the recovery prompt's end goal) is architecture-supported but not yet content-filled: each remaining stage needs 30+ authored days of original trilingual material. At this increment's verified authoring rate (~67 days/session) this is multi-session work; the generator script reproduces the exact state at any time.
- AI Mentor is still a single-question tutor, not a persistent multi-conversation chat (Phase 9 of the recovery prompt).
- Payments remain intentionally unconfigured (fail-closed) pending a real provider.

## Verification commands

`npm run typecheck` ✅ · `npm run lint` ✅ · `npm run test` ✅ 373/373 (10 skips are environment-conditional runtimes) · `npm run build` ✅ · `node --experimental-strip-types scripts/track-coverage-report.mjs` regenerates the matrix.
