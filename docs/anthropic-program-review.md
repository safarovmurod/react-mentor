# Claude for Startups, CodeRavon and domain review

Checked: 8 October 2026, approximately 15:23 Asia/Dushanbe (10:23 UTC).

## Verified observations

All HTTPS requests used the inherited proxy and normal TLS verification. No destination policy or authentication was bypassed.

| Request | Result | Meaning |
|---|---|---|
| https://claude.com/programs/startups | curl exit 56; proxy CONNECT HTTP 403; upstream HTTP status `000` | The environment could not open the official program page. The program's current availability and conditions were not retrieved. |
| https://www.anthropic.com/supported-countries | curl exit 56; proxy CONNECT HTTP 403; upstream HTTP status `000` | Supported-country status, including Tajikistan, was not retrieved. This is not evidence that Tajikistan is ineligible. |
| https://rdap.verisign.com/com/v1/domain/coderavon.com | curl exit 56; proxy CONNECT HTTP 403; upstream HTTP status `000` | Registry availability/registration data was not retrieved. |
| https://github.com/search?q=CodeRavon&type=repositories | HTTP 200; public search payload `result_count: 0`, `errors: []` | No matching public GitHub repositories were returned for this query at the time of the check. This is a narrow search, not a trademark or company check. |
| https://github.com/safarovmurod/coderavon | HTTP 404; unauthenticated (`logged_in: false`) | No public repository was visible at this path. A private repository could still exist, so name availability for this account is unconfirmed. |

Safe runtime metadata reported a running, connected cloud environment with a restricted network policy; `effective_allowed_hosts` comprised the package-manager preset destinations, and the policy state was `unknown`. No custom allowed hosts, secret bindings, runtime variables or outbound identities were listed. Actual CONNECT denials establish that the attempted destinations were inaccessible; metadata alone did not establish enforcement/readiness.

## Official-program questions

| Question | Current verified result |
|---|---|
| Is the program currently accepting applications? | UNKNOWN — official page was inaccessible. |
| Are startups based in Tajikistan eligible? | UNKNOWN — program conditions and supported-country page were inaccessible. |
| Is a registered legal entity required? | UNKNOWN. Do not invent a legal entity. |
| Can a bootstrapped startup without investment apply? | UNKNOWN. |
| What company-age/funding-age restrictions apply? | UNKNOWN. |
| Is an owned domain required? | UNKNOWN. Independently, the user's launch requirements require a real domain before this application. |
| Is corporate email mandatory? | UNKNOWN. Independently, the user requires a real, tested corporate address before submission. |
| Is an existing product/MVP required? | UNKNOWN. |
| What benefits are offered? | UNKNOWN. |
| What is the Claude Team term? | UNKNOWN. |
| How many Team seats are included, and of what type? | UNKNOWN. |
| How much API credit is offered? | UNKNOWN. |
| When do API credits expire? | UNKNOWN. |
| Are a card, payment, minimum seat purchase or automatic renewal required? | UNKNOWN. Do not activate paid commitments without price authorization. |
| How are application and approval status checked? | UNKNOWN — no official form or authenticated account was opened. |
| What owner actions are required? | Known task boundaries: the owner must handle any login, CAPTCHA, 2FA, email ownership confirmation and necessary legal attestations. Which of these the current program requires is unverified. |

## Statements copied from X screenshots

None of these statements was confirmed or refuted by current official sources in this run. They must remain claims from the user's description, not program promises:

- 12 months of Claude Team, up to five premium seats, and up to $625/month of Team value.
- $1,000 in Claude API credits, expiring after six months.
- Up to $45,000 in partner offers and Anthropic office hours.
- Eligibility for companies founded within five years or funded within two years.
- Acceptance of bootstrapped startups.
- Gmail exclusion, mandatory corporate email/domain.
- A `verified` status, `Skip`, `Gift`, `Claim`, or `Offers` workflow.
- Instant approval or a 2–3 business-day manual review.

No application was filled or sent. No program approval, Team subscription, API credit balance, payment waiver or activation was observed.

## CodeRavon and coderavon.com

`CodeRavon` is the user's provisional candidate. The only verified collision search was the public GitHub repository query above. Broad product/company searches and official trademark databases were not checked. The domain's registration state, owner, nameservers, current DNS, registrar price and renewal price are unconfirmed. No domain was purchased; no corporate address was created; incoming/outgoing mail were not tested.

The available evidence does not justify declaring the brand legally clear or `coderavon.com` available. Keep the existing product/service names until the user's required brand and domain checks are complete.

## Concrete next actions

1. Review/add these network destinations through environment settings: `claude.com`, `www.anthropic.com`, `rdap.verisign.com`. Keep the existing package-manager destinations. Any official redirect or form destination must be observed and added through the same supported workflow if required.
2. Retry the official program and supported-country requests after policy propagation; read the live FAQ, application form and terms, and identify which supported-country rules apply to the program, Claude Team and API.
3. Retry registry RDAP; a registry `404` means no registry record was found at that moment, not guaranteed registrar purchase availability. Obtain a live price and renewal quote in the owner's chosen registrar account.
4. Check broad product/company use and relevant trademark registries before declaring a final brand.
5. Request domain purchase authorization only after a concrete registrar quote. Configure the actual domain/email and verify production before submitting the authorized free application with genuine company facts.

## Evidence files

- `startups-headers.txt`, `supported-countries-headers.txt`, `coderavon-rdap-headers.txt`: proxy denial response headers. No upstream page content was received.
- `coderavon-github-search-headers.txt`, `coderavon-github-search.html`: public repository search response.
- `coderavon-github-name-headers.txt`, `coderavon-github-name.html`: public repository-path response.

No repository configuration or tracked source file was modified by this review.
