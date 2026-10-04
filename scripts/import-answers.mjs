// Read source documents as data. Never execute their scripts or load resources.
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [deepPath, quizPath, interviewPath] = process.argv.slice(2);
if (!interviewPath) throw new Error('Usage: node scripts/import-answers.mjs deep.html quiz.html interview.html');
function source(file, id) {
  const html = fs.readFileSync(file, 'utf8');
  return { document: new JSDOM(html).window.document, meta: { id, name: path.basename(file), sha256: crypto.createHash('sha256').update(html).digest('hex'), bytes: Buffer.byteLength(html) } };
}
const deep = source(deepPath, 'deep'), quiz = source(quizPath, 'quiz'), interview = source(interviewPath, 'interview');
const text = (node, selector) => (selector ? node.querySelector(selector) : node)?.textContent?.trim() || '';
const many = (node, selector) => [...node.querySelectorAll(selector)];
const ast = ts.createSourceFile('quiz.js', text(quiz.document, 'script'), ts.ScriptTarget.Latest, true);
let quizData;
for (const statement of ast.statements) {
  if (!ts.isVariableStatement(statement)) continue;
  for (const declaration of statement.declarationList.declarations) {
    if (declaration.name.getText(ast) === 'DATA') quizData = JSON.parse(declaration.initializer.getText(ast));
  }
}
if (!quizData || quizData.groups.flatMap(group => group.items).length !== 367) throw new Error('Invalid quiz source');
let groupIndex = 0;
const topics = many(deep.document, 'section.topic').map((section, index) => {
  const questions = many(section, 'details.qa');
  const group = questions.length ? quizData.groups[groupIndex++] : null;
  if (group && (text(section, 'h2') !== group.topic || questions.length !== group.items.length)) throw new Error('Deep/quiz group mismatch');
  return {
    id: `deep-${index + 1}`, sourceId: section.id, title: text(section, 'h2'), chapter: text(section, '.chapter'), sources: group ? ['deep', 'quiz'] : ['deep'],
    group: group?.page || 3, lessonId: group ? `topic-${groupIndex}` : null, context: group?.context || '',
    flow: many(section, '.flow-step').map(step => text(step).replace(/^\d+/, '')),
    explanation: many(section, '.deep-box').map(box => ({ title: text(box, 'b'), text: text(box, 'p') })),
    code: many(section, '.codebox pre').map(pre => pre.textContent),
    questions: questions.map((question, position) => {
      const original = group.items[position];
      const answer = text(question, '.answer-main p');
      if (text(question, '.qtext') !== original.question || answer !== original.correctAnswer) throw new Error('Deep/quiz answer mismatch');
      return {
        id: `quiz-${original.id}`, sourceId: original.id, question: original.question, answer,
        deeperTitle: text(question, '.answer-deeper b'), deeper: many(question, '.answer-deeper li').map(li => text(li)),
        tags: many(question, '.tag').map(tag => text(tag)), code: [], codeLabel: '', explanation: '', diagrams: [],
      };
    }),
  };
});
if (groupIndex !== quizData.groups.length) throw new Error('Missing quiz groups');
const interviewTopicNumbers = [4,6,7,8,12,13,14,15,16,16,17,18,19,21,22,23,26,27,29,28,30,45,47,40,24,36,37,38,41,42,43,44,32,33,34,35,51,53,54,56];
many(interview.document, 'details.topic').forEach((topic, index) => {
  const lesson = interviewTopicNumbers[index];
  topics.push({
    id: `interview-${index + 1}`, sourceId: topic.id, title: text(topic, '.topic-title'), chapter: text(topic, '.eyebrow'), sources: ['interview'],
    group: lesson <= 35 ? 1 : lesson <= 50 ? 2 : 3, lessonId: `topic-${lesson}`, context: '', flow: [], explanation: [], code: [],
    questions: many(topic, 'details.question').map(question => ({
      id: `interview-${question.id}`, sourceId: question.id, question: text(question, '.question-name'), answer: text(question, '.rule'),
      deeperTitle: '', deeper: [], tags: [], code: many(question, 'pre').map(pre => pre.textContent), codeLabel: text(question, '.snippet-label'), explanation: text(question, '.walkthrough'),
      // Desktop and mobile SVGs depict the same sequence; retain it once as accessible data.
      diagrams: many(question, 'figure.flow').map(figure => ({ title: text(figure, 'figcaption'), steps: many(figure, 'svg.desktop-flow text').map(step => text(step)) })),
    })),
  });
});
const data = { sources: [deep.meta, quiz.meta, interview.meta], topics };
const count = topics.reduce((sum, topic) => sum + topic.questions.length, 0);
if (count !== 473 || topics.length !== 119) throw new Error('Incomplete answer library');
fs.writeFileSync(path.join(root, 'src/content/imported/answers.json'), JSON.stringify(data, null, 2) + '\n');
console.log(JSON.stringify({ topics: topics.length, questions: count, diagrams: topics.flatMap(topic => topic.questions).flatMap(question => question.diagrams).length }));
