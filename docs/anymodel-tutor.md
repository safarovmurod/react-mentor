# AnyModel Tutor

The header's AI Tutor button opens the mentor. It first searches the same authored quiz, interview and deep lesson data used by the learning UI, including Russian/English translations. Known questions return the source answer locally with **zero provider tokens**, even when online AI is enabled or its key is missing. Deep explanations add the source's mechanism, flow, examples and related answers. Each result links back to its lesson and source ID.

The answer panel's “Чуқур фаҳмон” button opens the tutor with the exact question selected. Repeated follow-ups preserve that source. An unrelated new question is searched independently; the previous lesson or answer must not override it.

Only questions without a sufficiently relevant project match use `https://anymodel.org/v1/chat/completions`, if online AI is enabled. Retrieval uses exact matching plus multilingual keyword coverage, not a local language model; an unfamiliar paraphrase may fall through to AI. When AI is disabled, unmatched questions report that the answer was not found instead of fabricating an explanation. The browser never receives the provider key.

Set these server-side values in secure deployment/environment settings:

```env
AI_TUTOR_ENABLED=true
AI_PROVIDER_KEY=<enter your new key securely>
AI_MODEL=cx/gpt-6.1-sol
```

The model identifier and endpoint follow the supplied AnyModel example. Live provider compatibility requires a valid key and permitted outbound HTTPS to `anymodel.org`. Rotate the key exposed in the supplied screenshot. Never commit a real key, send it in browser requests, or use a `NEXT_PUBLIC_` prefix.

## Token economy

- Local sourced answers and deep explanations do not call the provider and are not limited by the AI output cap.
- For unmatched questions only, AI output is capped at 256 tokens per response; answers may be cut short at that limit.
- Send only the last four chat messages (600 characters each), a question of at most 1500 characters, and at most 1200 characters of relevant course context.
- The server uses a concise system prompt and never automatically retries paid calls.
- Successful responses display the provider's `usage.total_tokens` when supplied; the conversation total includes successful reported calls only. It is not the remaining account balance.
- A process-local single-request guard and a three-second cooldown discourage bursts. They reset on restart and are not an authentication system or a billing cap.
- Both input and output consume the provider balance. Set billing/usage limits in AnyModel for the 5000-token balance. Before exposing this paid endpoint publicly, add authenticated access and durable per-user quotas; the current learning app does not have those controls.
- Official grades and XP remain deterministic and do not use AI.

## Verification

`npm run test` checks the server API with a mocked provider, including authorization failures, quota errors, malformed responses, history bounds, and duplicate calls. It spends no real tokens.

`npm run test:e2e` checks desktop and mobile learning persistence, local fonts, the actual offline tutor, and simulated online chat/errors. It always starts an isolated local-mode server on port 3100 and never sends requests to AnyModel. The shared development server should be stopped before running this command because Next.js locks `.next/dev`.

The config uses `/usr/bin/chromium` when available. On machines without Chromium, run `npx playwright install chromium`, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to a supported installed browser. Screenshots, traces and test outputs go to `/tmp`, outside the checkout.

Real online answers have not been verified without a new secure API key. After entering it, restart the application and send one short question outside the course (for example, about Svelte runes); expect an `AI · AnyModel` source label and a meaningful answer. A course question must still show `Маводи лоиҳа · 0 токен`. Do not treat mocked tests as proof of provider availability.
