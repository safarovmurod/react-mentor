// Content-quality auditor (§18 of the self-learning master prompt).
// Measures every published course day from actual curriculum data and emits
// docs/SELF_LEARNING_CONTENT_AUDIT.md. Numbers only — pedagogical meaning is
// reviewed separately; this tool deliberately has no "words >= N = good" gate.
// Run: node --experimental-strip-types scripts/course-content-quality-report.mjs
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const { COURSE_CATALOG, LEARNING_TRACKS } = await import('../src/content/courses/catalog.ts');

const jsonDir = path.join(root, 'src/content/courses');
const files = new Set((await readdir(jsonDir)).filter(name => name.endsWith('.json')));
const wordCount = (text) => text.trim().split(/\s+/).filter(Boolean).length;
// Scope claims are stale only when the claimed size differs from the real one.
const CLAIMED_TOTAL = /(?:День|Day|рӯзи)\s+\d+\s+(?:из|of|аз)\s+(\d+)\b/g;
const SHORT_SCOPE = /(двухдневн|two introductory days|two-day course|two-day introductory|аз ду рӯз|из двух дней|Two-day introduction)/g;

function* walkLessons(course) {
  for (const lesson of course.lessons ?? []) yield lesson;
}

async function analyze(courseId) {
  if (!files.has(`${courseId}.json`)) return null; // react/nextjs TS modules
  const course = JSON.parse(await readFile(path.join(jsonDir, `${courseId}.json`), 'utf8'));
  const lessons = [...walkLessons(course)];
  const scheduled = lessons.filter(lesson => typeof lesson.day === 'number');
  const result = {
    courseId,
    publishedDays: scheduled.length,
    libraryLessons: lessons.length - scheduled.length,
    sources: course.sources?.length ?? 0,
    lessons: [],
  };
  const staleHits = [];
  for (const lesson of lessons) {
    const stat = {
      id: lesson.id,
      day: lesson.day ?? null,
      sections: lesson.sections?.length ?? 0,
      theoryWords: (lesson.sections ?? []).reduce((sum, s) => sum + wordCount(s.body?.ru ?? ''), 0),
      codeExamples: (lesson.sections ?? []).filter(s => (s.code ?? '').trim()).length,
      recordedOutputs: (lesson.sections ?? []).filter(s => s.output?.en).length,
      questions: lesson.questions?.length ?? 0,
      practiceKind: lesson.practice?.kind ?? 'none',
      practiceWords: wordCount(lesson.practice?.task?.ru ?? ''),
      hasReferenceAnswer: Boolean(lesson.practice?.referenceAnswer),
      sources: lesson.sourceIds?.length ?? 0,
      capstone: /проект|project|кейс|case|анализатор|TODO API|планировщик|scheduler/i.test(lesson.title?.ru ?? ''),
    };
    for (const loc of ['ru', 'en', 'tg']) {
      const texts = [lesson.summary?.[loc], ...(lesson.sections ?? []).map(s => s.body?.[loc]), lesson.practice?.task?.[loc], lesson.practice?.hint?.[loc]].filter(Boolean);
      for (const text of texts) {
        for (const match of text.matchAll(CLAIMED_TOTAL)) {
          const claimed = Number(match[1]);
          if (claimed !== result.publishedDays && result.publishedDays > 0) staleHits.push({ id: lesson.id, loc, sample: `claims ${claimed} days, actually ${result.publishedDays}` });
        }
        if (scheduled.length > 2) for (const match of text.matchAll(SHORT_SCOPE)) staleHits.push({ id: lesson.id, loc, sample: match[0] });
      }
    }
    result.lessons.push(stat);
  }
  result.staleHits = staleHits;
  const published = result.lessons.filter(l => l.day !== null);
  result.avgTheoryWords = published.length ? Math.round(published.reduce((s, l) => s + l.theoryWords, 0) / published.length) : 0;
  result.minTheoryWords = published.length ? Math.min(...published.map(l => l.theoryWords)) : 0;
  result.maxTheoryWords = published.length ? Math.max(...published.map(l => l.theoryWords)) : 0;
  result.totalQuestions = result.lessons.reduce((s, l) => s + l.questions, 0);
  result.questionsPerDay = published.length ? +(result.totalQuestions / published.length).toFixed(1) : 0;
  result.codeDays = published.filter(l => l.codeExamples > 0).length;
  result.writtenDays = published.filter(l => l.practiceKind === 'written').length;
  result.codePracticeDays = published.filter(l => l.practiceKind === 'code').length;
  result.projectDays = published.filter(l => l.capstone).length;
  result.missingSourceLessons = result.lessons.filter(l => l.sources === 0).length;
  result.flags = [];
  if (result.avgTheoryWords < 60) result.flags.push('thin-theory');
  if (result.questionsPerDay < 2) result.flags.push('few-questions');
  if (result.staleHits.length) result.flags.push('stale-copy');
  if (result.missingSourceLessons) result.flags.push('missing-sources');
  return result;
}

const rows = [];
for (const entry of COURSE_CATALOG) {
  const data = await analyze(entry.id);
  if (data) rows.push({ tier: entry.accessTier ?? 'starter', ...data });
}

const line = [];
line.push('# Self-learning content audit (generated)');
line.push('');
line.push(`Generated ${new Date().toISOString().slice(0, 10)} by \`scripts/course-content-quality-report.mjs\` from actual curriculum data. Numbers only: meaning, correctness and clarity need the separate editorial checklist — do not treat higher word counts as automatic quality.`);
line.push('');
line.push('| Course | Tier | Days | Avg/min/max theory words | Quiz/day | Code days | Written days | Project days | Library | Flags |');
line.push('|---|---|---:|---|---:|---:|---:|---:|---:|---|');
for (const r of rows) {
  line.push(`| ${r.courseId} | ${r.tier} | ${r.publishedDays} | ${r.avgTheoryWords}/${r.minTheoryWords}/${r.maxTheoryWords} | ${r.questionsPerDay} | ${r.codeDays} | ${r.writtenDays} | ${r.projectDays} | ${r.libraryLessons} | ${r.flags.join(', ') || '—'} |`);
}
line.push('');
const staleTotal = rows.reduce((s, r) => s + r.staleHits.length, 0);
line.push(`## Stale scope copy (§3.7): ${staleTotal} hits`);
line.push('');
for (const r of rows.filter(r => r.staleHits.length)) {
  line.push(`- ${r.courseId}: ${r.staleHits.map(h => `${h.id} [${h.loc}] “…${h.sample}…”`).join('; ')}`);
}
line.push('');
line.push('## Reading guide');
line.push('');
line.push('- `thin-theory`: average published-day explanation under 60 Russian words — a signal to deepen the day, not an automatic verdict.');
line.push('- `few-questions`: under 2 quiz questions per published day.');
line.push('- `stale-copy`: text still describing an old 2/3-day scope.');
line.push('- `written days` are self-reviewed assignments; `code days` carry recorded outputs that the test suite executes where a runtime exists.');
line.push(`- Totals: ${rows.reduce((s, r) => s + r.publishedDays, 0)} scheduled days, ${rows.reduce((s, r) => s + r.totalQuestions, 0)} quiz questions, ${rows.reduce((s, r) => s + r.projectDays, 0)} flagged project/case days.`);

await writeFile(path.join(root, 'docs/SELF_LEARNING_CONTENT_AUDIT.md'), line.join('\n') + '\n');
const flagged = rows.filter(r => r.flags.length);
console.log(`Audited ${rows.length} courses; ${flagged.length} flagged:`, flagged.map(r => `${r.courseId}(${r.flags.join('/')})`).join(', '));
