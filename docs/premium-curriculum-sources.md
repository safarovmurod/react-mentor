# Premium curriculum provenance and execution evidence

Three original, separately published modules are provided: `javascript-pro`
(Pro), `backend-pro` (Pro), and `architecture-expert` (Expert). Each publishes
exactly three lessons, each with its own explanation, runnable example,
expected output, quiz and practice. No unseen future day is represented as a
published lesson. Expert practice is a written decision record with a localized
reference answer and criteria, not fictitious automatic grading.

## GitHub references actually inspected

Native read-only Git access was used to acquire these references. Their files
were read locally; this is distinct from merely knowing a documentation URL.

- Repository: `trekhleb/javascript-algorithms`
- Exact reviewed commit: `85293e3e2b88f4d2ce330d956b139cf628aa1e82`
- License read: root `LICENSE`, MIT, copyright 2018 Oleksii Trekhleb.
- Files read:
  - `src/algorithms/sets/power-set/caPowerSet.js`
  - `src/algorithms/sets/power-set/__test__/caPowerSet.test.js`
  - `src/algorithms/sets/power-set/README.md`
- [Pinned source directory](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sets/power-set)
- Reuse: the idea of reviewing a contract through concrete input/output cases
  informed the original task-summary exercise and its tests. We did not copy
  the powerset algorithm, its prose, tests, or repository structure into lessons.
  A courtesy copy of the reviewed MIT notice is retained in
  `docs/licenses/javascript-algorithms-MIT.txt`.

The already acquired `mdn/beginner-html-site-styled` checkout was also inspected:
commit `6c7a360ddb4a0d75be06044bf8a914f260ff10c7`, root `LICENSE` (CC0 1.0) and
`index.html`. This is an HTML teaching reference, not a source of advanced
backend or payment implementation. Its older external HTTP font link was not
copied into the platform.

## Documentation URLs versus verified downloads

Node.js API documentation (`https://nodejs.org/api/`) is cited for standard APIs
such as `node:assert/strict`, `node:http`, `node:crypto`, `Response` and
`AbortSignal`. The current remote documentation pages were not downloaded and
reviewed during this curriculum change. These URLs are further-reading links;
they do not establish source retrieval or a current external audit.

The new Russian, Tajik and English explanations, examples, tasks and reference
answers were authored for this project. No copied third-party algorithm is
present in the new premium lessons. Translation editorial review remains
separate from structural key checks.

## What the examples demonstrate

`tests/premium-curriculum.test.ts` executes the reviewed, repository-owned Node
examples, checks the stated output and verifies selected deliberately broken
implementations fail. The HTTP lesson opens an ephemeral loopback server,
performs real HTTP requests, and closes the server even on assertion failure.
Other lessons use explicit fixtures and dependency injection; they do not
pretend to contact a production API, payment provider, database or live user.

These tests are not a submission execution service. Learner-controlled source
must not be passed to these test subprocess helpers. Server authorization for
premium curriculum is a separate platform concern; published lesson fixtures
must not be mistaken for verified subscriptions or production release approval.
