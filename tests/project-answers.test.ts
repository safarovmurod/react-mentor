import { describe, expect, it } from 'vitest';
import { ALL_QUESTIONS, LEARNING_TOPICS } from '@/content/course';
import { projectAnswer } from '@/lib/tutor/project-answers';
import { tr } from '@/lib/translate';

describe('project-first tutor retrieval', () => {
  it('preserves every authored quiz/interview answer when addressed by its ID', () => {
    for (const question of ALL_QUESTIONS) {
      const result = projectAnswer(question.question, { questionId: question.id, deep: true });
      expect(result?.source.questionId).toBe(question.id);
      expect(result?.reply).toContain(question.answer);
      if (question.explanation) expect(result?.reply).toContain(question.explanation);
      for (const code of question.code) expect(result?.reply).toContain(code);
    }
  });

  it('finds every question in the authored deep lesson bank', () => {
    for (const topic of LEARNING_TOPICS) {
      for (const question of topic.questions) {
        const result = projectAnswer(question.question);
        expect(result?.source.questionId).toBeDefined();
        expect(result?.reply).toContain(question.question);
      }
    }
  });

  it('uses the same Russian/English translations as the test UI', () => {
    const question = ALL_QUESTIONS[0];
    for (const language of ['ru', 'en'] as const) {
      const result = projectAnswer(tr(question.question, language), { language, questionId: question.id });
      expect(result?.reply).toContain(tr(question.answer, language));
    }
  });

  it('recognizes normal Tajik, Russian and English topic phrasing', () => {
    for (const query of ['useState чияй барои чихе кор мекна', 'Что такое props?', 'How does useEffect work?', 'Объясни useState простыми словами', 'useState чотка сода фахмон']) {
      expect(projectAnswer(query)?.source).toBeDefined();
    }
  });

  it('adds actual flow, source explanation and related answers when deepening', () => {
    const question = ALL_QUESTIONS[0], topic = LEARNING_TOPICS.find(item => item.id === question.topicId)!;
    const result = projectAnswer(question.question, { questionId: question.id, deep: true })!;
    for (const step of topic.flow) expect(result.reply).toContain(step);
    for (const explanation of topic.explanation) expect(result.reply).toContain(explanation.text);
    expect(result.source.sourceId).toBe(question.sourceId);
    expect(result.reply.length).toBeGreaterThan(projectAnswer(question.question)!.reply.length);
  });

  it('does not invent a local answer for an unknown subject or a new specific question', () => {
    for (const query of ['Svelte runes чияй?', 'useState quantum entanglement algorithm', 'zxquantumwidget', 'Чуқур фаҳмон']) {
      expect(projectAnswer(query)).toBeNull();
    }
  });

  it('does not let an old question ID override an unrelated new question', () => {
    expect(projectAnswer('Svelte runes чияй?', { questionId: 'quiz-q001' })).toBeNull();
  });

  it('keeps different useEffect dependency arrays as different exact questions', () => {
    const questions = ALL_QUESTIONS.filter(question => /^`useEffect\(\(\) =>/.test(question.question));
    expect(questions.length).toBeGreaterThanOrEqual(3);
    for (const question of questions) {
      const result = projectAnswer(question.question)!;
      expect(result.reply).toContain(question.answer);
      expect(result.source.questionId).toBe(question.id);
    }
  });
});
