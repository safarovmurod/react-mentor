# Answer library

`/answers` is a public, free reading library from the three supplied HTML documents. It does not call an AI provider. The imported archive preserves 367 deep/quiz pairs and 106 interview records. The reading library and offline export combine the 11 repeated question titles into **462 unique question entries** across 119 sections: 79 deep sections (including the application-design example without questions) and 40 interview topics.

Each title is displayed as a question once. Additional authored answers, code, explanations and topic context appear inside that entry as source variants. The other topic links to the shared answer. Exact title matching preserves punctuation and code syntax, so questions about different dependency arrays remain separate. All original source records and hashes stay in the import archive; reimporting builds the same deduplicated view.

The original content is Tajik. Existing Russian/English translations are used when available; code is preserved verbatim. Quiz task contexts, deep explanations and deeper-answer lists, interview walkthroughs and 11 diagrams are retained. Each desktop/mobile diagram pair becomes one accessible sequence.

The directory filters and searches on the server, returning at most 18 topic summaries. A reader receives only its selected topic. Each merged answer recognizes all of its original question IDs for reading marks and saved notes; old achievements remain valid and the library counts them once. New reading marks and notes use the first question's stable ID. Both use the existing account progress snapshot and synchronization when accounts are configured; guests keep browser progress. No additional database migration is required. Tests/interviews retain their original IDs and authored topic-specific questions.

Quiz-to-lesson mapping also uses the source group order. Repeated question titles in different topics now retain the correct topic, code and deeper explanation in tests and local Tutor replies. Existing question IDs and saved results remain valid.

## Reimport

```sh
node scripts/import-answers.mjs /path/react_deep_understanding.html /path/react_quiz.html /path/react-interview.html
```

This writes `src/content/imported/answers.json`, with original filenames, byte lengths and SHA-256 hashes. Source scripts are parsed as syntax to obtain literal quiz JSON, never executed. HTML is parsed without resource loading or script execution. The importer validates all deep/quiz pairs before assigning the existing question IDs; matching by position within a topic preserves repeated question titles in different contexts.

`/answers/export` builds one standalone `react-answers.html` with all content, grouped table of contents, code and flow sequences. Source text is escaped, and the download contains no scripts or remote assets. It can be read offline or printed.

## Validation

```sh
npm test
npm run test:e2e
npm run lint
npm run typecheck
npm run build
```

The browser plugin is unavailable in this cloud session, so browser checks use Playwright with the installed Chromium. Supabase/Google OAuth and paid AI still require deployment configuration documented in `accounts-setup.md`; this library works independently of those credentials.
