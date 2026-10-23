# Learning platform: implementation brief

## English product prompt

Build a reliable, accessible full-stack education platform based on the existing course project, preserving useful existing functionality. Organize the catalog into programming, design, marketing, analytics, business and management, soft skills, content creation, foreign languages, children, and lifestyle. Programming has six subtracks: frontend, backend, mobile, programming languages, databases, and tools. The target is `safarovmurod/react-mentor`, cloned and enhanced in `/workspace/react-mentor`. `safarovmurod/react-practice` remains a separate reference repository.

Use Russian as the default editorial language and support Tajik, English, Japanese, and Korean. Select an initial locale from browser language preferences with a persistent manual override; use geographic detection only through an explicitly configured, privacy-respecting service. Do not silently equate language with nationality.

Teach beginners through short, clear lessons and practical assignments appropriate to the subject: real code for programming, research/prototypes for design, and written or project-based work for general subjects. Do not place every subject in a code editor. Start with Day 1 HTML/CSS, including an explanation of files, folders, editor controls, browser rendering, and step-by-step tasks. Unlock Day 2 only after the learner completes the required theory and practice and explicitly confirms completion. Use server-attested verification where it is actually implemented; label manually reviewed assignments as self-study and never imply that a checkbox is an automated test. Award XP exactly once per exercise. Keep lessons and a shared Practice page distinct; support frontend, backend, Python, mobile development, React, and C++. Treat React's two-month course as a learning path with exercises linked to the shared practice workspace.

Create a responsive, polished practice workspace with collapsible instructions and reference solution, a real editor with language-aware completion, syntax diagnostics, file tabs, run/submit controls, useful error messages, and safe previews. Validate intended behavior and requirements rather than requiring identical variable names or text. Distinguish syntax/type diagnostics from unmet exercise requirements. Do not mark valid alternative implementations as errors.

Implement authenticated accounts, persistent progress, authorization, safe discussion/chat for entitled subscribers, and presence with accurate expiry. Define Starter, Pro, and Expert access with distinct published content, not cosmetic plan names. Keep existing ordinary courses in Starter; publish three-day Pro modules for JavaScript, Backend, UX Design and Business, plus a three-day Expert architecture module. Protect premium course APIs, tutor answers and attachments before loading or returning paid material. Keep paid content out of unauthenticated HTML and React Server Component payloads. Prepare a payment provider boundary and server-controlled entitlements; enable checkout only after real verified webhook handling is integrated. Clearly identify unconfigured payments; never simulate a successful payment or grant paid access from a browser flag. A production payment integration requires the chosen provider, account, prices, supported currencies, and securely supplied credentials.

Use original lessons informed by authoritative documentation and suitably licensed open-source examples. Record source URLs and licenses; do not copy arbitrary repositories or represent unverified material as researched. Execute learner code only in an appropriate isolated runner, never in the application API process. Browser previews must be sandboxed. Python/C++/mobile execution requires an explicitly supported execution environment and realistic resource limits.

Protect user data with server-side authorization and validation, secure session handling, rate limits, secret management, safe rendering, and narrowly scoped execution. Optimize initial loading through route/editor lazy loading and measured production builds. Do not promise zero vulnerabilities or perfect translations without evidence.

Use ten distinct agent roles in staged waves when concurrent capacity is limited: seven implementation specialists, an independent security reviewer, a UX/design reviewer, and an independent release tester. Reviewers report concrete findings; implementers fix them and reviewers rerun affected checks. Report actual tests and remaining blockers honestly. Before pushing, verify the destination repository is private as requested; do not push if visibility cannot be verified. Do not change repository visibility based on an unrelated earlier preference.

## Delivery steps and gates

1. **Repository gate:** obtain the course platform's repository/branch or explicit confirmation to create it in this empty starter. Inspect instructions, source, history, package files, backend, existing deployment, and user changes.
2. **Baseline:** reproduce installation/build/tests and document current failures. Identify runtime, database, hosting, payment, and execution-service requirements without exposing secrets.
3. **Architecture and data:** implement migrations and server models for users, sessions, course paths, lessons, exercises, submissions, progress, XP ledger, subscriptions, chat, and presence. Make completion and XP transactional/idempotent.
4. **Learning experience:** implement localized dashboard, Day 1 tutorial, locked progression, course navigation, and shared Practice page. Keep interface text short and accessible.
5. **Editor and grading:** integrate an actual editor with completion/diagnostics and sandboxed HTML/CSS preview. Add behavioral exercise checks and alternate-solution tests. Integrate additional language execution only with verified isolation.
6. **Accounts and tiers:** add real persistent sessions and authorization. Add honest Beginner/Pro/Expert states, payment adapter and signed webhook verification, chat authorization, and bounded presence.
7. **Curriculum and localization:** add original, sourced material with subject-appropriate exercises. Publish only authored days; do not pad introductions with empty or generated repeat days. Declare real `publishedDays` and `accessTier` metadata, and validate category/subtrack mappings. Validate translation keys and layout for Russian, Tajik, English, Japanese and Korean plus retained Ukrainian support. Human editorial review remains a release gate for language quality.
8. **Verification:** exercise authentication, reload persistence, day unlock, failed/correct/alternative submissions, XP duplication, paid-access denial, chat permissions, preview isolation, and failure recovery. Test responsive/keyboard behavior and initial loading.
9. **Independent review loop:** security, UX, and QA agents review real implementation. Fix findings and rerun required checks; record pass/fail/unrun outcomes and production blockers.
10. **Delivery:** verify private remote, commit scoped changes, push only to the authorized destination when access and visibility permit. Provide setup/deployment instructions and precise external prerequisites. Publication is separate from local validation.

## Agent roles

1. Curriculum and source research.
2. Full-stack architecture and data model.
3. Frontend learning experience.
4. Editor and exercise grading.
5. Backend/authentication/progress.
6. Localization/content.
7. Subscriptions/chat/integration.
8. Independent security review.
9. Independent UX/design review.
10. Independent QA/release review.

## Implementation evidence

The target repository was resolved as `safarovmurod/react-mentor` and cloned at initial HEAD `262796ddf1aefe3ec3153e6255932f4e915aac4f`. Work is on `feat/devatlas-learning-platform`. The original React Practice checkout remains unchanged.

The final catalog contains 38 courses in 10 categories and six programming subtracks: 33 Starter courses, four Pro modules and one Expert module. All five premium modules have three authored days. The current content inventory is 240 scheduled non-React days from 265 non-React lesson records (including 25 library-only reference lessons), plus 60 React day-plan slots over 60 React topics: 300 total scheduled slots, not 300 distinct lesson records. All 265 non-React lesson records have practice, and contain 319 question records. CSS publishes five real days, Next.js twenty, HTML/JS1/JS2/Git/C++ thirty each, the 25 Starter introductions two each, and premium modules three each. Short curricula are no longer padded to thirty days.

Server-side membership checks protect premium course bodies, tutor references and premium-only attachments. Premium lesson bodies are omitted from initial page/RSC data and fetched through the guarded API; public catalog metadata remains available. The four Pro and one Expert curricula are implemented, but payment processing remains unconfigured and live membership/database deployment remains unverified. Manual study records are not presented as server-certified grades.

The repository owner canceled the earlier private-before-push gate and authorized public push, then merge. The DevAtlas commit was successfully pushed and fast-forwarded into main. Vercel reported deployment success; live metadata returned 38 courses and premium content denied an unauthenticated request with 401.

The practical computer/Supabase/Vercel launch procedure is in [LAUNCH-STEPS-RU.md](LAUNCH-STEPS-RU.md). The final React audit repaired 19 empty teaching topics with specific explanations, execution flows, TSX examples and RU/EN translations. Scheduled-topic completeness, translation coverage and TSX syntax checks pass; these checks do not replace human editorial review or execute every external-library example.

The platform enhancement, independent reviews, meaningful checks and remaining production prerequisites are documented in [DEVATLAS-DELIVERY.md](DEVATLAS-DELIVERY.md). This plan describes the full requested product; a listed future requirement is not a claim that it has been delivered. Payments, complete additional-language curricula/runners, live database deployment and human translation sign-off remain explicit release gates.
