import { describe, expect, it } from 'vitest';
import quiz from '@/content/imported/quiz.json';
import deep from '@/content/imported/deep.json';
import interview from '@/content/imported/interview.json';
import manifest from '@/content/imported/manifest.json';
import { ANSWER_COUNT, ANSWER_PROGRESS_IDS, ANSWER_SOURCES, ANSWER_TOPICS, filterAnswerTopics, getAnswerQuestion, getAnswerTopic } from '@/content/answers';
import { QUIZ_QUESTIONS } from '@/content/course';
import { escapeHtml, exportAnswersHtml } from '@/lib/answers-export';

describe('source-backed answer library', () => {
  it('preserves every source answer, code example, explanation and quiz context', () => {
    expect(ANSWER_COUNT).toBe(462);
    expect(new Set(ANSWER_TOPICS.flatMap(topic => topic.questions.map(question => question.question.trim()))).size).toBe(462);
    expect(new Set(ANSWER_PROGRESS_IDS.flat()).size).toBe(473);
    for (const source of ANSWER_SOURCES) expect(manifest.some(original => original.sha256 === source.sha256 && original.bytes === source.bytes)).toBe(true);
    for (const [index, group] of quiz.groups.entries()) {
      const topic = ANSWER_TOPICS.find(topic => topic.sourceId === deep[index].id)!;
      expect(topic.context).toBe(group.context);
      expect(topic.sources).toEqual(['deep', 'quiz']);
      expect(topic.flow).toEqual(deep[index].flow);
      expect(topic.explanation).toEqual(deep[index].explanation);
      expect(topic.code).toEqual(deep[index].code);
      for (const [position, question] of group.items.entries()) {
        const canonical = getAnswerQuestion('quiz-' + question.id)!;
        const saved = canonical.id === 'quiz-' + question.id ? canonical : canonical.variants.find(variant => variant.id === 'quiz-' + question.id)!;
        expect(saved.question).toBe(question.question);
        expect(saved.answer).toBe(question.correctAnswer);
        expect(saved.id).toBe('quiz-' + question.id);
        expect(saved.deeperTitle + saved.deeper.join('')).toBe(deep[index].questions[position].deeper);
        expect(QUIZ_QUESTIONS.find(item => item.id === saved.id)?.topicId).toBe(topic.lessonId);
      }
    }
    for (const [index, group] of interview.entries()) {
      const saved = getAnswerTopic('interview-' + (index + 1))!;
      expect(saved.questions.length + saved.relatedQuestions.length).toBe(group.questions.length);
      for (const question of group.questions) {
        const canonical = getAnswerQuestion(question.id)!;
        const preserved = canonical.id === question.id ? canonical : canonical.variants.find(variant => variant.id === question.id)!;
        expect(preserved).toMatchObject({ id: question.id, question: question.question, answer: question.answer, code: question.code, codeLabel: question.codeLabel, explanation: question.explanation });
      }
    }
  });
  it('merges repeated titles with source context and routes old question IDs to one entry', () => {
    const selector = getAnswerQuestion('quiz-q196')!;
    expect(getAnswerQuestion('quiz-q212')).toBe(selector);
    expect(selector.aliases).toEqual(['quiz-q196', 'quiz-q212']);
    expect(selector.variants[0]).toMatchObject({ topicTitle: '40. Redux Architecture', answer: 'Function-е, ки аз Redux state қисми даркориро мехонад.' });
    const batching = getAnswerQuestion('interview-q13')!;
    expect(batching.id).toBe('quiz-q060');
    expect(batching.variants[0].code.length).toBeGreaterThan(0);
    const reference = getAnswerTopic('interview-5')!.relatedQuestions[0];
    expect(reference).toMatchObject({ questionId: batching.id, topicId: 'deep-12' });
    expect(ANSWER_TOPICS.flatMap(topic => topic.questions).flatMap(question => question.variants)).toHaveLength(11);
  });
  it('includes the omitted architecture section and accessible interview diagrams', () => {
    expect(filterAnswerTopics('deep', 0, '')).toHaveLength(79);
    expect(getAnswerTopic('deep-71')).toMatchObject({ title: '76. Спроектируй React Application', questions: [], flow: ['User', 'Router', 'Page', 'Query / Store / Local state', 'API', 'Cache', 'UI update'] });
    expect(getAnswerTopic('deep-71')?.code.join('')).toContain('// Route: /products/:id');
    expect(ANSWER_TOPICS.flatMap(topic => topic.questions).flatMap(question => question.diagrams)).toHaveLength(11);
    expect(ANSWER_TOPICS.flatMap(topic => topic.questions).flatMap(question => question.diagrams).some(diagram => diagram.steps.join(' → ') === 'Тағйири state → Render: ҳисоб → Commit: DOM → Paint: намоиш')).toBe(true);
  });
  it('keeps all three quiz groups and searches answers, code and translations', () => {
    for (const [index, count] of [120,114,129].entries()) expect(filterAnswerTopics('quiz', index + 1, '').reduce((sum, topic) => sum + topic.questions.length, 0)).toBe(count);
    expect(filterAnswerTopics('interview', 0, '')).toHaveLength(40);
    expect(filterAnswerTopics('all', 0, '/products/:id').map(topic => topic.id)).toContain('deep-71');
    expect(filterAnswerTopics('deep', 0, 'prev =>')).not.toHaveLength(0);
    expect(filterAnswerTopics('all', 0, 'zxnomatchinganswer')).toEqual([]);
  });
  it('exports every reading section without scripts, raw markup or remote assets', () => {
    const doc = new DOMParser().parseFromString(exportAnswersHtml(), 'text/html');
    expect(doc.querySelectorAll('article')).toHaveLength(119);
    expect(doc.querySelectorAll('.question')).toHaveLength(462);
    expect(doc.querySelectorAll('.answer-variant')).toHaveLength(11);
    const headings = [...doc.querySelectorAll('.question > h3')].map(node => node.textContent!.replace(/^\d+\.\s*/, ''));
    expect(new Set(headings).size).toBe(462);
    expect(doc.querySelectorAll('script,iframe,object,img,link')).toHaveLength(0);
    for (const topic of ANSWER_TOPICS) {
      const section = doc.getElementById(topic.id)!;
      for (const block of topic.code) expect(section.textContent).toContain(block);
      for (const question of topic.questions) {
        const content = doc.getElementById(question.id)?.textContent;
        expect(content).toContain(question.answer);
        for (const variant of question.variants) {
          expect(content).toContain(variant.answer);
          for (const block of variant.code) expect(content).toContain(block);
          expect(doc.getElementById(variant.id)?.getAttribute('href')).toBe('#' + question.id);
        }
      }
    }
    expect(escapeHtml('<script>alert("x")</script>')).toBe('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
  });
});
