# Curriculum sources and verification

The introductory lessons and exercises added in this change are original teaching content, not a copied commercial course. Russian, Tajik and English content is supplied for the new modules; native-speaker review remains necessary. Browser course grading must not be described as execution of Python, native mobile code or arbitrary backend servers.

## Source actually examined

- Repository: https://github.com/mdn/beginner-html-site-styled
- Commit: `6c7a360ddb4a0d75be06044bf8a914f260ff10c7`
- Inspected through a read-only shallow Git clone: `README.md`, `LICENSE`, `index.html`, `styles/style.css`.
- License in that commit: **CC0 1.0 Universal**.
- Relevant ideas: a complete HTML document, separate stylesheet, headings, paragraphs, meaningful links, and a small visible styling change. The first HTML lesson uses an original profile-style page and original explanations. Mozilla text, logo, images and site design were not copied into this project.
- Deliberate changes from the old reference: system fonts instead of an HTTP Google Fonts dependency; responsive viewport; no fixed-width 600px layout; a main landmark; HTTPS documentation link.

This is research provenance, not a claim that all content in the external repository is current best practice.

## Linked authoritative documentation

The course content links to these official references. Direct web-document retrieval was denied by the execution proxy (`403 Forbidden`), so their current remote text was not inspected during this change:

- HTML: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content
- CSS: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics
- Python: https://docs.python.org/3/tutorial/
- Node.js HTTP: https://nodejs.org/api/http.html
- React Native: https://reactnative.dev/docs/components-and-apis
- Expo setup: https://docs.expo.dev/get-started/create-a-project/

The new Python, backend and mobile entries are explicitly two-day introductions. They must not be sold or described as complete professional tracks. Python samples require local Python 3; backend samples require local Node.js; React Native samples require a prepared Expo project and device or emulator. Future in-platform execution requires language-specific isolated runners, resource limits and security review.

## General education and applied Pro modules

Ten general introductions each contain **two authored days**: UX design, digital marketing, data analytics, business foundations, communication, content creation, English foundations, digital literacy, personal productivity and management foundations. Two separate applied Pro case studies each contain **three authored days**: `ux-pro` and `business-pro`. Every day includes Russian, Tajik and English teaching text, an original worked example, a knowledge question, a written assignment and a concrete review rubric. They are not full professional qualifications, CEFR assessments or MBA degrees. The digital-literacy exercises require fictional profiles and ask for no real child accounts, passwords, contacts, school names or identity documents.

Written exercises are **self-reviewed written work**, not automatically verified professional competence. A complete rubric and substantive answer support learner reflection; they do not imply a teacher reviewed the submission. Sample cases, participant labels, campaign counts and prices are explicitly fictional. No real research sessions, experiments, revenue or usability improvements are claimed.

### Additional source actually examined

- Repository: https://github.com/18F/methods
- Commit: `6628c6f090ff20ad32ae81e25f2743d33e82292d`
- Retrieved with a read-only shallow native Git clone; inspected `LICENSE.md`, `_methods/design-hypothesis.md`, `_methods/heuristic-evaluation.md`, `_methods/cognitive-walkthrough.md` and `_methods/usability-testing.md`.
- License: United States public-domain government work with worldwide **CC0 1.0 Universal** dedication, as stated in the inspected license. No endorsement by 18F or the U.S. Government is implied.
- Applied ideas: distinguish a measurable hypothesis from a shipped feature; consider possible harm; use non-leading task instructions; document consent; distinguish an expert walkthrough from actual user testing; record issues and retest changes.
- The platform's community-center examples, business calculations, explanations, questions and assignments are original. The external website, assets, logos and full method text were not copied into the product.

### General-course reference links, not fetched or currently verified

These are reference URLs for further study, not claims of external text retrieval or copied instruction:

- W3C WAI, involving users: https://www.w3.org/WAI/planning/involving-users/
- Google Analytics Help: https://support.google.com/analytics/
- UK Government Analysis Function: https://analysisfunction.civilservice.gov.uk/
- U.S. SBA, business planning: https://www.sba.gov/business-guide/plan-your-business/write-your-business-plan
- U.S. SBA, business management: https://www.sba.gov/business-guide/manage-your-business
- University of Minnesota open communication textbook: https://open.lib.umn.edu/communication/
- Creative Commons, license explanation: https://creativecommons.org/share-your-work/cclicenses/
- British Council, beginner speaking: https://learnenglish.britishcouncil.org/skills/speaking/a1-speaking
- U.S. FTC, protecting kids online: https://consumer.ftc.gov/identity-theft-and-online-security/protecting-kids-online
- Open University OpenLearn: https://www.open.edu/openlearn/

No content was copied from the linked textbook or commercial language-learning pages. Links do not grant a license to copy those sites. Further expansion should inspect exact source licenses and verify contemporary references before attributing particular external claims. Native-speaker review of translations remains necessary before promising error-free localization.

## Repair of previously empty React teaching sections

An audit of the first two scheduled React months found nineteen original topic records with questions but no explanation, flow or code sample: `topic-5`, `topic-9`, `topic-15`, `topic-19`, `topic-20`, `topic-21`, `topic-23`, `topic-25`, `topic-27`, `topic-28`, `topic-29`, `topic-30`, `topic-31`, `topic-33`, `topic-37`, `topic-39`, `topic-45`, `topic-46`, and `topic-49`.

These records now include original, topic-specific Tajik instruction and corresponding Russian/English dictionary translations, concrete execution steps and TSX examples. Existing source questions, answers, identifiers and progress associations are preserved. The duplicate teaching arrays in `imported/answers.json` are synchronized with the corrected topic records. Source-manifest hashes still identify the original external HTML inputs; they do not claim that the newly authored material appeared in those original files.

Examples distinguish runtime behavior from development Strict Mode checks, optimization from correctness, client state from authorization, and local fixtures from real API services. Official further reading: https://react.dev/learn and https://react.dev/reference/react . No new remote React documentation retrieval is claimed. Syntax transpilation checks TSX parse validity; it is not a claim that every external library integration was executed in a browser.
