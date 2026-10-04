import data from './imported/answers.json';
import { tr } from '@/lib/translate';

export interface AnswerQuestion {
  id: string; sourceId: string; question: string; answer: string;
  deeperTitle: string; deeper: string[]; tags: string[]; code: string[];
  codeLabel: string; explanation: string; diagrams: { title: string; steps: string[] }[];
}
export interface AnswerTopic {
  id: string; sourceId: string; title: string; chapter: string; sources: string[];
  group: number; lessonId: string | null; context: string; flow: string[];
  explanation: { title: string; text: string }[]; code: string[]; questions: AnswerQuestion[];
}
export type AnswerSource = 'all' | 'deep' | 'quiz' | 'interview';
export const ANSWER_TOPICS: AnswerTopic[] = data.topics;
export const ANSWER_SOURCES = data.sources;
export const ANSWER_COUNT = ANSWER_TOPICS.reduce((sum, topic) => sum + topic.questions.length, 0);
export function getAnswerTopic(id: string) { return ANSWER_TOPICS.find(topic => topic.id === id); }
export function filterAnswerTopics(source: AnswerSource, group: number, query: string) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return ANSWER_TOPICS.filter(topic => {
    if (source !== 'all' && !topic.sources.includes(source)) return false;
    if (group && topic.group !== group) return false;
    if (!words.length) return true;
    const text = [topic.title, topic.chapter, topic.context, ...topic.flow, ...topic.code,
      ...topic.explanation.flatMap(section => [section.title, section.text]),
      ...topic.questions.flatMap(question => [question.question, question.answer, question.explanation, ...question.deeper, ...question.code, ...question.diagrams.flatMap(diagram => diagram.steps)])];
    const searchable = text.flatMap(value => [value, tr(value, 'ru'), tr(value, 'en')]).join('\n').toLocaleLowerCase();
    return words.every(word => searchable.includes(word));
  });
}
export type AnswerSummary = Pick<AnswerTopic, 'id' | 'title' | 'chapter' | 'sources' | 'group'> & { count: number; preview: string };
export function answerSummary(topic: AnswerTopic): AnswerSummary {
  return { id: topic.id, title: topic.title, chapter: topic.chapter, sources: topic.sources, group: topic.group, count: topic.questions.length, preview: topic.questions[0]?.question || topic.explanation[0]?.text || '' };
}
