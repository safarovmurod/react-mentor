import data from './imported/answers.json';
import { tr } from '@/lib/translate';

export interface SourceAnswerQuestion {
  id: string; sourceId: string; question: string; answer: string;
  deeperTitle: string; deeper: string[]; tags: string[]; code: string[];
  codeLabel: string; explanation: string; diagrams: { title: string; steps: string[] }[];
}
export interface AnswerVariant extends SourceAnswerQuestion {
  topicId: string; topicTitle: string; topicSources: string[]; topicSourceId: string;
  context: string; flow: string[]; topicExplanation: { title: string; text: string }[]; topicCode: string[];
}
export interface AnswerQuestion extends SourceAnswerQuestion {
  aliases: string[]; variants: AnswerVariant[];
}
export interface AnswerReference {
  id: string; question: string; topicId: string; topicTitle: string; questionId: string;
}
export interface AnswerTopic {
  id: string; sourceId: string; title: string; chapter: string; sources: string[];
  group: number; lessonId: string | null; context: string; flow: string[];
  explanation: { title: string; text: string }[]; code: string[]; questions: AnswerQuestion[]; relatedQuestions: AnswerReference[];
}
export type AnswerSource = 'all' | 'deep' | 'quiz' | 'interview';
export const SOURCE_ANSWER_TOPICS: (Omit<AnswerTopic, 'questions' | 'relatedQuestions'> & { questions: SourceAnswerQuestion[] })[] = data.topics;
// Keep the imported evidence intact. One reading entry owns every exact title;
// additional source answers become contextual variants, never separate questions.
export const ANSWER_TOPICS: AnswerTopic[] = SOURCE_ANSWER_TOPICS.map(topic => ({ ...topic, questions: [], relatedQuestions: [] }));
const questionByText = new Map<string, { question: AnswerQuestion; topic: AnswerTopic }>();
const questionById = new Map<string, AnswerQuestion>();
for (const [index, originalTopic] of SOURCE_ANSWER_TOPICS.entries()) {
  const topic = ANSWER_TOPICS[index];
  for (const original of originalTopic.questions) {
    const key = original.question.trim();
    const existing = questionByText.get(key);
    if (existing) {
      existing.question.aliases.push(original.id);
      existing.question.variants.push({ ...original, topicId: topic.id, topicTitle: topic.title, topicSources: topic.sources, topicSourceId: topic.sourceId, context: topic.context, flow: topic.flow, topicExplanation: topic.explanation, topicCode: topic.code });
      topic.relatedQuestions.push({ id: original.id, question: original.question, topicId: existing.topic.id, topicTitle: existing.topic.title, questionId: existing.question.id });
      questionById.set(original.id, existing.question);
    } else {
      const question: AnswerQuestion = { ...original, aliases: [original.id], variants: [] };
      topic.questions.push(question);
      questionByText.set(key, { question, topic });
      questionById.set(question.id, question);
    }
  }
}
export const ANSWER_SOURCES = data.sources;
export const ANSWER_COUNT = ANSWER_TOPICS.reduce((sum, topic) => sum + topic.questions.length, 0);
export const ANSWER_PROGRESS_IDS = ANSWER_TOPICS.flatMap(topic => topic.questions.map(question => question.aliases));
export function getAnswerQuestion(id: string) { return questionById.get(id); }
export function getAnswerTopic(id: string) { return ANSWER_TOPICS.find(topic => topic.id === id); }
export function filterAnswerTopics(source: AnswerSource, group: number, query: string) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return ANSWER_TOPICS.filter(topic => {
    if (source !== 'all' && !topic.sources.includes(source)) return false;
    if (group && topic.group !== group) return false;
    if (!words.length) return true;
    const text = [topic.title, topic.chapter, topic.context, ...topic.flow, ...topic.code,
      ...topic.explanation.flatMap(section => [section.title, section.text]),
      ...topic.questions.flatMap(question => [question.question, ...questionText(question), ...question.variants.flatMap(variant => [variant.topicTitle, variant.context, ...variant.flow, ...variant.topicCode, ...variant.topicExplanation.map(section => section.text), ...questionText(variant)])]),
      ...topic.relatedQuestions.flatMap(reference => [reference.question, reference.topicTitle, ...questionText(questionById.get(reference.questionId)!)])];
    const searchable = text.flatMap(value => [value, tr(value, 'ru'), tr(value, 'en')]).join('\n').toLocaleLowerCase();
    return words.every(word => searchable.includes(word));
  });
}
function questionText(question: SourceAnswerQuestion) { return [question.answer, question.explanation, ...question.deeper, ...question.code, ...question.diagrams.flatMap(diagram => diagram.steps)]; }
export type AnswerSummary = Pick<AnswerTopic, 'id' | 'title' | 'chapter' | 'sources' | 'group'> & { count: number; relatedCount: number; preview: string };
export function answerSummary(topic: AnswerTopic): AnswerSummary {
  return { id: topic.id, title: topic.title, chapter: topic.chapter, sources: topic.sources, group: topic.group, count: topic.questions.length, relatedCount: topic.relatedQuestions.length, preview: topic.questions[0]?.question || topic.relatedQuestions[0]?.question || topic.explanation[0]?.text || '' };
}
