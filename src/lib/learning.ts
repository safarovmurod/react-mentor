import type { LearningQuestion } from '@/content/course';

export type StudyMode = 'learn' | 'test' | 'interview' | 'revision';
export interface AnswerRecord { questionId: string; topicId: string; mode: StudyMode; correct: boolean; answer: string; date: string }
export interface ReviewRecord { questionId: string; topicId: string; due: string; repetitions: number }

export function dateKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dushanbe', year:'numeric',month:'2-digit',day:'2-digit' }).format(date);
}

export function nextReview(record: ReviewRecord | undefined, questionId: string, topicId: string, correct: boolean, today: string): ReviewRecord {
  const repetitions = correct ? (record?.repetitions || 0) + 1 : 0;
  const intervals = [1, 1, 3, 7, 14, 30];
  const date = new Date(`${today}T12:00:00+05:00`);
  date.setUTCDate(date.getUTCDate() + intervals[Math.min(repetitions, intervals.length - 1)]);
  return { questionId, topicId, repetitions, due: dateKey(date) };
}

export function chooseDailyQuestions(questions: (Pick<LearningQuestion, 'id' | 'month'> & {options:readonly unknown[]})[], month: number, limit: number, studied: string[], reviews: ReviewRecord[], today: string) {
  const available = questions.filter(question => question.month === month && question.options.length > 0);
  const dueIds = reviews.filter(item => item.due <= today).map(item => item.questionId);
  const due = available.filter(question => dueIds.includes(question.id));
  const fresh = available.filter(question => !studied.includes(question.id) && !dueIds.includes(question.id));
  const remaining = available.filter(question => !dueIds.includes(question.id) && studied.includes(question.id));
  return [...due, ...fresh, ...remaining].slice(0, limit).map(question => question.id);
}

export function orderedOptions(question: LearningQuestion) {
  // Stable rotation keeps answers in different positions and survives refresh.
  const offset = [...question.id].reduce((sum, character) => sum + character.charCodeAt(0), 0) % question.options.length;
  return [...question.options.slice(offset), ...question.options.slice(0, offset)];
}

export function awardedXP(awards: Record<string, number>) { return Object.values(awards).reduce((sum, value) => sum + value, 0); }
