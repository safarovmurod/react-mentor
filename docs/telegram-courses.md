# Courses and Telegram sources

The existing React library remains published. On 2026-10-06 the public channel
preview became reachable. Ten preview pages were collected back to the first
visible message: 151 message widgets, 100 document references, 24 photo widgets
and 33 video widgets. This is the public preview, not proof of the complete
authenticated history. The original PDF, ZIP, image and video bytes remain unread.

Four readable messages (#77 Sass, #84 Git fetch, #191 JSON Server, #192 Axios)
now provide 8 reviewed lessons, 37 questions and 8 manual practice tasks in CSS,
Git and JavaScript 2. The examples, expanded explanations and corrections are
explicit editorial additions. Sass @import deprecation and JSON Server 0.17.4
CLI syntax were checked against official sources. HTML, JavaScript 1 and C++
remain empty; no PDF-based lessons have been invented. Published source files
still total zero.

/courses/materials lists original Telegram message links, search and type
filters. 61 filename/size groups preserve all 100 document links: the 39 matching
metadata entries are possible reposts, **not confirmed byte duplicates**. There
are 32 PDF metadata groups, about 151 MB at the displayed sizes. Larger videos
and ZIPs account for much of the multi-gigabyte export. Do not demand a full
5–10 GB export as the only way to begin analysis.

## Supply the sources

Telegram Web can download individual attachments: open the channel, click its
name, open Files and use each download control. Attach the downloaded PDF/ZIP
files to the task. Keep the associated message text or message links when possible.
Web has no complete history export. For a complete import, Telegram Desktop:
channel → menu → Export chat history → JSON → include photos/files → full history.
Archive the exported directory. This task's download tool accepts files up to
32 MiB; split larger exports into archives below 30 MiB. Never export unrelated chats.

The Browser plugin is unavailable in this session. An open user Telegram tab
does not grant shell/Playwright access to its authenticated browser profile.
The public t.me preview now returns 200. Document buttons and embedded message
pages contain Telegram message URLs rather than original download URLs.
cdn4.telesco.pe photos and Stepik/Tailwind/Canva/YouTube links returned proxy
CONNECT 403. Their observed hosts were added to the configuration draft,
preserving prior rules; saving does not activate the current runtime network.
Do not copy Telegram cookies or sessions or request passwords/OTP in chat.

Collect accessible text and metadata automatically, without authentication:

    python3 scripts/collect-telegram-public.py --output /tmp/NEW-public-review

The output directory must be new. The collector bounds page size/count, restricts
pagination to this channel on HTTPS t.me, preserves albums, ignores Sass @mention
auto-links, and stops at the end of backward pagination. No originals are
downloaded, no linked scripts executed and no lessons automatically published.
Public links can change; keep reviewed message text in the index for provenance.

## Stage and review

Run from /workspace/react-mentor:

    python3 scripts/import-telegram.py /path/to/export-or-download --output /tmp/telegram-review --ocr

Output must be a new directory outside the input. Supports directories, files and
nested ZIPs, Telegram JSON and HTML exports, PDFs, images and source code.
SHA-256 identifies exact file duplicates and retains their source paths.
Resource bounds, traversal/symlink checks and archive-depth limits protect extraction.
Source code, scripts and macros are never executed.

PDF text extraction uses pdftotext. Sparse pages use pdftoppm + tesseract with
--ocr. Source images and all PDFs still require visual review for diagrams and
OCR mistakes. Available OCR languages are recorded, not assumed. Run
python3 scripts/setup-ocr.py to verify/install pinned eng/rus/tgk data; the importer
automatically uses this task cache or the explicit --tessdata directory.
Unsupported formats, unread pages
and encoding errors remain visible in the manifest. Linked resources are listed
as not-visited until actually opened and checked. No automatic network fetches.

Review every staged source, its classification, unclear images and links.
Classification is only a suggestion; JavaScript 1/2 is not inferred from generic
JavaScript syntax. Read all source content, then author simple Tajik and Russian
explanations, examples, mistakes, answers and practical tasks. Preserve source/page
references. Clearly distinguish editorial additions from source content. Extracted
text is not a complete educational analysis and is never automatically published.

## Publish reviewed content

Each file in src/content/courses/{courseId}.json is validated by
src/lib/courses/schema.ts. Every lesson/file must reference an existing source.
Question IDs must be unique within a course and correctIndex must point to an option.
Use beginner/intermediate levels. English falls back to Russian when absent.

Reviewed original files belong in content/course-files/{sha256}.{extension}.
Only files referenced by a published course manifest can be downloaded. The
download endpoint validates size/digest and forces attachment/octet-stream with
nosniff and sandbox headers; it never executes uploaded HTML/SVG/JS.
File tracing includes that directory for Vercel deployment. Check the actual
deployment/storage size before committing large source bundles; do not enable a
paid storage plan without owner approval. No source binaries are included yet.

Course modules load separately through /api/courses/{courseId}; the shared
selector receives counts only. Ready status follows actual lesson counts.

## Progress and Tutor

React keeps its original fields and storage keys. Other courses live in a
namespaced courses object in the same account's existing progress JSON, with
independent notes, completions, attempts, reviews and awards. Course choice uses
timestamped preference merging. No Supabase migration or other-app changes.
The existing owner/MFA RLS and revision/CAS synchronization apply. Progress JSON
retains the existing 2 MiB server limit; files stay outside progress.
Reload older open browser tabs once after deployment so every device uses the
updated progress schema. Existing old-schema clients cannot preserve new fields.

New guest home visitors and new account learners choose a course once; existing
React learners and public deep links remain accessible. Direct course URLs select that course. Settings and account
login remain shared; notebooks are scoped by course. Practice completion is
explicit manual self-check, not execution/grading of C++ or untrusted code.
Tutor searches only the selected course; other courses cannot return React
answers by accidental question ID collision. Unknown questions retain the
existing authenticated paid-AI flow and token cap. No paid test calls required.

## Checks

    python3 -m unittest discover -s tests -p telegram_import_test.py
    python3 -m unittest discover -s tests -p telegram_public_test.py
    npm run typecheck
    npm run lint
    npm run test
    npm run test:e2e
    npm run test:auth
    npm run build

Run the two browser suites sequentially. Browser plugin not available; regular
Playwright/system Chromium is used for desktop and mobile checks. Mocked source,
Supabase or PDF fixtures are test evidence, not imported channel material.

Current content checks: seven SCSS examples compiled with Sass 1.105.1; a local
fixture verified Git fetch refspec updates task-1 without switching main; a
temporary JSON Server 0.17.4 returned the documented /users and /users/1 data.
These are authored example checks, not claims of reading inaccessible files.
