# Startup application draft — not submitted

Prepared on 8 October 2026 (Asia/Dushanbe) from inspected product capabilities. This document is a draft, not a claim of program eligibility or an application receipt.

## Product description

React Mentor is a multilingual programming learning platform for beginners and self-directed learners. It brings structured courses, step-by-step lessons, coding exercises, quizzes, notes and progress tracking into one learning workflow on desktop and mobile. Its course catalog includes HTML/CSS, JavaScript, React, Git and C++. Learners can start as guests with progress stored in their browser. Account-based synchronization and profiles are implemented with Supabase and require a configured backend. The tutor retrieves answers from authored course material first; external AI assistance is optional and requires authenticated access and provider configuration.

## Problem

Beginning programmers often learn from scattered resources without a clear sequence, enough practice or feedback they can understand. This makes it difficult to see what they have learned and what they should study next, especially when accessible learning resources in their preferred language are limited.

## Solution and audience

The product connects a study plan with lessons, hands-on exercises, self-checks and quizzes, then records learning progress and review needs. It is designed for first-time programmers, students and independent learners. The interface supports Tajik, Russian, English and Ukrainian; lesson translations vary, and a complete Ukrainian lesson catalog is not claimed. Tajik-speaking learners are an important intended audience alongside international beginners.

## Intended use of Claude

We would evaluate Claude for explanations, exercise hints, code feedback and learning guidance when authored material does not answer a learner's question. We plan to keep deterministic grading and progress calculations independent of AI output, prefer course-grounded answers, and validate tutoring accuracy, language quality, latency and cost before expanding provider use. Claude is not currently integrated: the existing optional external tutor targets AnyModel. Durable per-user usage quotas and billing controls would be required before increasing paid AI exposure.

## Current stage

Existing software MVP with passing local checks and GitHub CI. PR #3 was merged, and GitHub's Vercel integration reports a successful Production deployment for merge commit `9124d8d439136bebd8b09407b284058782897d7c`. Production reachability, live authentication and commercial launch readiness have not been confirmed in this environment because page requests are blocked by its proxy and live bindings are unavailable. No user-count, revenue, funding, incorporation, accelerator membership or Claude adoption figures have been verified.

## Fields requiring verification before submission

| Field | State |
|---|---|
| Final startup name | React Mentor is current; CodeRavon is a provisional candidate awaiting collision/domain checks. |
| Owned public website | Pending. Provider-reported deployment: `https://react-mentor-2vgvaokcz-safarovmurods-projects.vercel.app`; HTTP/browser access is unverified. The documented `https://react-mentor-opal.vercel.app` alias and an owned domain remain unconfirmed. |
| Verified business email | Pending; no domain mailbox exists based on available evidence. |
| Founder contact | Use the contact supplied privately by the founder when filling the real form; verify ownership if required. |
| Founder name and residence | Await founder confirmation; do not infer legal identity from a GitHub username. |
| Legal company name, jurisdiction, registration/date | Await confirmation; an unregistered project must be described honestly. |
| Founding date, funding, team size, traction | Await founder confirmation/evidence. |
| Claude Console/account identity | No authenticated session inspected. |
| Program eligibility, benefits and payment terms | Official sources blocked; no current terms confirmed. |
| Application form and owner attestations | Not opened, filled or signed. |

## Submission gate

Submit only after reviewing the current official program conditions, confirming eligibility and required truthful fields, validating the real public site and corporate email, and obtaining any owner-only login/email/legal confirmations. The user authorizes a free application once these conditions hold. Domain purchases, paid subscriptions and bank-card commitments require explicit price approval. Do not claim credits or Team seats until the account shows activation.

## Domain and mail preparation

If CodeRavon and `coderavon.com` are verified and selected, the proposed founder address is `founder@coderavon.com`. It is a proposal, not an active address. Cloudflare Email Routing can forward incoming mail to the founder's chosen Gmail inbox; forwarding is not an SMTP mailbox. Outbound mail requires a supported sending provider and its actual SPF/DKIM/DMARC records. Verify a test message arriving in Gmail, a message sent with the business From/Reply-To identity, and receipt of an ownership-verification code before using the address in the application.

DNS records and registration/renewal prices must come from the real registrar, Vercel and mail provider account. No price, IP address or free-domain availability has been assumed.
