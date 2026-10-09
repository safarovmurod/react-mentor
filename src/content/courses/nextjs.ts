import { CURRICULUM, getTopic, questionsForTopic, type LearningTopic } from '@/content/course';
import type { CourseContent } from '@/lib/courses/schema';

// This is the 20-day Next.js/portfolio curriculum already authored for month 3.
// Reuse its actual explanations and exercises; do not invent ten filler days.
const curriculum = CURRICULUM.find(month => month.month === 3);
if (!curriculum) throw new Error('The Next.js curriculum is missing.');
const days = curriculum.weeks.flatMap(week => week.days);
const localized = (value: string) => ({ ru: value, tg: value });

const lessons: CourseContent['lessons'] = days.map((day, index) => {
  const dayNumber = index + 1;
  const topics = day.topicIds.map(getTopic).filter((topic): topic is LearningTopic => Boolean(topic));
  const sections: CourseContent['lessons'][number]['sections'] = topics.flatMap(topic =>
    topic.explanation.map((part, partIndex) => ({
      title: localized(part.title || topic.titleRu),
      body: localized(part.text || topic.title),
      ...(partIndex === 0 && topic.code[0] ? { code: topic.code[0], language: 'tsx' } : {}),
    })),
  );
  if (!sections.length) {
    sections.push({
      title: localized(day.titleRu),
      body: localized(day.tags.join(' · ') || day.title),
    });
  }
  const selectedQuestions = new Map(
    topics.flatMap(topic => questionsForTopic(topic.id))
      .filter(question => question.options.length >= 2)
      .map(question => [question.id, question]),
  );
  const questions = [...selectedQuestions.values()].slice(0, 3).map(question => ({
    id: `nextjs-day-${String(dayNumber).padStart(2, '0')}-${question.id}`,
    question: localized(question.question),
    answer: localized(question.answer),
    options: question.options.map(localized),
    correctIndex: Math.max(0, question.options.indexOf(question.answer)),
  }));
  const practiceSteps = topics.flatMap(topic => topic.flow).slice(0, 8);
  const solution = topics.map(topic => topic.code[0]).filter(Boolean).join('\n\n');
  return {
    id: `nextjs-day-${String(dayNumber).padStart(2, '0')}`,
    day: dayNumber,
    prerequisiteDays: index === 0 ? [] : [index],
    title: localized(day.titleRu),
    summary: localized(day.tags.join(' · ') || day.title),
    level: index < 10 ? 'beginner' : 'intermediate',
    sourceIds: topics.some(topic => topic.id.startsWith('topic-'))
      ? ['nextjs-docs', 'react-docs'] : ['nextjs-docs'],
    sections,
    questions,
    practice: {
      task: localized(`${day.titleRu}\n\n${practiceSteps.map((step, stepIndex) => `${stepIndex + 1}. ${step}`).join('\n')}`),
      hint: localized(topics[0]?.explanation[0]?.text || day.title),
      solution: solution || '// Follow the steps and apply them in your Next.js project.',
      criteria: [
        localized('Мисоли ҳамин рӯзро иҷро ва натиҷаро санҷед.'),
        localized('Фарқи коди пешина ва коди имрӯзаро фаҳмонед.'),
        localized('Хато, loading ва ҳолати холиро агар лозим бошад, тафтиш кунед.'),
      ],
    },
  };
});

const content: CourseContent = {
  courseId: 'nextjs',
  sources: [
    { id: 'nextjs-docs', title: 'Next.js Documentation', url: 'https://nextjs.org/docs' },
    { id: 'react-docs', title: 'React Documentation', url: 'https://react.dev/learn' },
  ],
  files: [],
  lessons,
};
export default content;
