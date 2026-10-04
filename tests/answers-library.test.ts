import { describe, expect, it } from 'vitest';
import quiz from '@/content/imported/quiz.json';
import deep from '@/content/imported/deep.json';
import interview from '@/content/imported/interview.json';
import manifest from '@/content/imported/manifest.json';
import { ANSWER_COUNT, ANSWER_SOURCES, ANSWER_TOPICS, filterAnswerTopics, getAnswerTopic } from '@/content/answers';
import { QUIZ_QUESTIONS } from '@/content/course';
import { escapeHtml, exportAnswersHtml } from '@/lib/answers-export';

describe('source-backed answer library', () => {
  it('preserves every source answer, code example, explanation and quiz context', () => {
    expect(ANSWER_COUNT).toBe(473);
    expect(new Set(ANSWER_TOPICS.flatMap(topic => topic.questions.map(question => question.id))).size).toBe(473);
    for (const source of ANSWER_SOURCES) expect(manifest.some(original => original.sha256 === source.sha256 && original.bytes === source.bytes)).toBe(true);
    for (const [index, group] of quiz.groups.entries()) {
      const topic = ANSWER_TOPICS.find(topic => topic.sourceId === deep[index].id)!;
      expect(topic.context).toBe(group.context);
      expect(topic.sources).toEqual(['deep', 'quiz']);
      expect(topic.flow).toEqual(deep[index].flow);
      expect(topic.explanation).toEqual(deep[index].explanation);
      expect(topic.code).toEqual(deep[index].code);
      for (const [position, question] of group.items.entries()) {
        const saved = topic.questions[position];
        expect(saved.question).toBe(question.question);
        expect(saved.answer).toBe(question.correctAnswer);
        expect(saved.id).toBe('quiz-' + question.id);
        expect(saved.deeperTitle + saved.deeper.join('')).toBe(deep[index].questions[position].deeper);
        expect(QUIZ_QUESTIONS.find(item => item.id === saved.id)?.topicId).toBe(topic.lessonId);
      }
    }
    for (const [index, group] of interview.entries()) {
      const saved = getAnswerTopic('interview-' + (index + 1))!;
      expect(saved.questions).toHaveLength(group.questions.length);
      for (const [position, question] of group.questions.entries()) {
        expect(saved.questions[position]).toMatchObject({ id: question.id, question: question.question, answer: question.answer, code: question.code, codeLabel: question.codeLabel, explanation: question.explanation });
      }
    }
  });
  it('includes the omitted architecture section and accessible interview diagrams', () => {
    expect(filterAnswerTopics('deep', 0, '')).toHaveLength(79);
    expect(getAnswerTopic('deep-71')).toMatchObject({ title: '76. Спроектируй React Application', questions: [], flow: ['User', 'Router', 'Page', 'Query / Store / Local state', 'API', 'Cache', 'UI update'] });
    expect(getAnswerTopic('deep-71')?.code.join('')).toContain('// Route: /products/:id');
    expect(ANSWER_TOPICS.flatMap(topic => topic.questions).flatMap(question => question.diagrams)).toHaveLength(11);
    expect(ANSWER_TOPICS.flatMap(topic => topic.questions).flatMap(question => question.diagrams).some(diagram => diagram.steps.join(' → ') === 'Тағйири state → Render: ҳисоб → Commit: DOM → Paint: намоиш')).toBe(true);
  });
  it('keeps all three quiz groups and searches answers, code and translations', () => {
    for (const [index, count] of [121,115,131].entries()) expect(filterAnswerTopics('quiz', index + 1, '').reduce((sum, topic) => sum + topic.questions.length, 0)).toBe(count);
    expect(filterAnswerTopics('interview', 0, '')).toHaveLength(40);
    expect(filterAnswerTopics('all', 0, '/products/:id').map(topic => topic.id)).toContain('deep-71');
    expect(filterAnswerTopics('deep', 0, 'prev =>')).not.toHaveLength(0);
    expect(filterAnswerTopics('all', 0, 'zxnomatchinganswer')).toEqual([]);
  });
  it('exports every reading section without scripts, raw markup or remote assets', () => {
    const doc = new DOMParser().parseFromString(exportAnswersHtml(), 'text/html');
    expect(doc.querySelectorAll('article')).toHaveLength(119);
    expect(doc.querySelectorAll('.question')).toHaveLength(473);
    expect(doc.querySelectorAll('script,iframe,object,img,link')).toHaveLength(0);
    for (const topic of ANSWER_TOPICS) {
      const section = doc.getElementById(topic.id)!;
      for (const block of topic.code) expect(section.textContent).toContain(block);
      for (const question of topic.questions) expect(doc.getElementById(question.id)?.textContent).toContain(question.answer);
    }
    expect(escapeHtml('<script>alert("x")</script>')).toBe('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
  });
});
