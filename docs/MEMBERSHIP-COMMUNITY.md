# Membership and community integration

The `/plans` page distinguishes the free Starter experience from Pro/Expert access. Existing ordinary courses stay free; separately published premium courses require an active database membership. Checkout remains unconfigured: paid access can currently be provisioned only by a trusted administrator, never by choosing a plan in the browser.

`POST /api/billing/checkout` accepts an authenticated request with `{"tier":"pro"}` or `{"tier":"expert"}` and returns HTTP 503 `billing_not_configured`. A payment provider, prices, webhook credentials and production callback URLs have not been selected. This endpoint never grants access. Future checkout integration must create provider checkout sessions server-side and grant membership only after a verified, replay-safe paid webhook; never trust a browser redirect or plan in user metadata.

## Database prerequisites

Review and apply `supabase/migrations/20261022010000_memberships_chat.sql` after the account migrations in a test Supabase project first. The migration was not applied to any remote database during development. It adds:

- `react_mentor_memberships`: users can read their own membership; no browser insert/update/delete grants or policies exist. Only a trusted administrator or future verified billing service provisions `pro` or `expert` with an explicit future `expires_at`.
- `react_mentor_chat_messages`: paid, MFA-verified members read messages. Users cannot directly write messages. The `react_mentor_send_message` RPC derives author/time/profile name on the server, validates 1–2000 characters, serializes submissions and enforces a 2-second gap and 20 messages per minute per account.
- `react_mentor_chat_presence`: the heartbeat RPC derives caller/time. Updates are coalesced to at most one per 15 seconds; rows older than 90 seconds are excluded from reads. Recently expired members may remain counted within the 90-second freshness window. Old rows do not imply active users; they can be periodically pruned operationally.

The API uses the caller's JWT, verifies the authenticated user and current MFA requirement, reads membership from the database and fails closed when storage is unavailable. Message JSON is bounded at 9000 bytes and bodies are plaintext. The UI renders text using React escaping, not HTML. Message history is limited to the latest 50 messages. Network polling is every 15 seconds while the page is visible; heartbeat is every 30 seconds. There are no invented messages or online users. An account switch remounts and clears the private chat state.

## Validation boundaries

Focused tests validate membership expiry/fail-closed behavior, authentication requirements, unavailable checkout, rejected forged author/time fields, payload limits and database RPC error mapping. These API tests mock the database. Separately, tests/database-migrations.test.ts executes the migrations in PGlite and checks role grants, RLS, posting limits, expiry and presence with simulated Supabase identity helpers. Neither suite demonstrates a deployed Supabase instance or payment integration.

Before production, test with real accounts A/B and expired memberships: unauthorized direct REST writes must fail; only active paid accounts can read/send; unenforced MFA must deny access; concurrent message bursts must hit DB rate limits; presence must expire after disconnection; script-looking text must remain literal. Also select the payment provider, configure signed webhooks and monitoring, define moderation/retention/support policies, run deployment load/security tests and set operational database retention limits.

## Premium course content boundaries

Course catalog `accessTier` metadata defaults existing ordinary courses to Starter. `javascript-pro`, `backend-pro`, `ux-pro` and `business-pro` require Pro; `architecture-expert` requires Expert. Expert includes Pro. Unknown catalog IDs do not default to free.

`GET /api/courses/:courseId` checks verified Bearer authentication and protected membership expiry before loading premium content. Missing authentication returns 401 `authentication_required`; insufficient membership returns 403 `membership_required` with `requiredTier`; unavailable storage returns 503 `service_unavailable`. Denials contain no lesson or solution data. Premium success and denial responses are `private, no-store`.

The local tutor applies the same guard before looking up premium reference answers. Attachments are authorized before reading bytes unless the same verified hash is also published by an ordinary course. A file shared between Pro and Expert is accessible to Pro. Clients downloading future premium attachments must use authenticated Bearer fetch rather than a bare anchor URL; no browser-cookie authorization fallback is implemented.

Focused mocked tests cover hierarchy, expiry, fail-closed storage, body non-disclosure, unauthenticated tutor reference attempts and premium-only attachment checks. Actual live Supabase account and membership tests remain a deployment prerequisite.
