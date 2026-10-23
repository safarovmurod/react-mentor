// Computes the honest Track × Stage coverage matrix from actual catalog and
// curriculum data. Run: node --experimental-strip-types scripts/track-coverage-report.mjs
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const { LEARNING_TRACKS, coursePublishedDays } = await import('../src/content/courses/catalog.ts');

const jsonDir = path.join(root, 'src/content/courses');
const files = new Set((await readdir(jsonDir)).filter(name => name.endsWith('.json')));
const loadStats = async (id) => {
  if (id === 'react' || !files.has(`${id}.json`)) return null;
  const course = JSON.parse(await readFile(path.join(jsonDir, `${id}.json`), 'utf8'));
  return {
    days: (course.lessons || []).filter(lesson => typeof lesson.day === 'number').length,
    lessons: course.lessons.length,
    questions: course.lessons.reduce((sum, lesson) => sum + (lesson.questions?.length ?? 0), 0),
    practices: course.lessons.filter(lesson => lesson.practice).length,
  };
};

let totalDays = 0;
const lines = ['| Track | Beginner (free) | Pro (paid) | Expert (paid) |', '|---|---|---|---|'];
for (const track of LEARNING_TRACKS) {
  const stages = { beginner: [], pro: [], expert: [] };
  for (const entry of track.courses) stages[entry.stage].push(entry.course);
  const cell = async (stage) => {
    if (!stages[stage].length) return '— not published';
    const parts = [];
    for (const courseId of stages[stage]) {
      const stats = await loadStats(courseId);
      const days = stats?.days ?? coursePublishedDays(courseId);
      totalDays += days;
      parts.push(`${courseId}: ${days}d · ${stats ? `${stats.lessons} lessons · ${stats.practices} practice · ${stats.questions} quiz` : 'file missing'}`);
    }
    return parts.join('<br>');
  };
  lines.push(`| ${track.name} (${track.id}) | ${await cell('beginner')} | ${await cell('pro')} | ${await cell('expert')} |`);
}
console.log(lines.join('\n'));
console.log(`\nTotal scheduled days across track stages (excl. React's own 60): ${totalDays}`);
