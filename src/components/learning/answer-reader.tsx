'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, NotebookPen, ArrowRight, BookOpen } from 'lucide-react';
import type { AnswerTopic, AnswerQuestion } from '@/content/answers';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import { tr } from '@/lib/translate';
import { PageHeading } from './page-heading';

function ReadingQuestion({ question, index, topic }: { question: AnswerQuestion; index: number; topic: AnswerTopic }) {
  const language = useLearningStore(state => state.language);
  const contentLanguage = useLearningStore(state => state.contentLanguage);
  const learned = useLearningStore(state => state.studied.includes(question.id));
  const noteExists = useLearningStore(state => state.notes.some(note => note.id === 'answer:' + question.id));
  const markStudied = useLearningStore(state => state.markStudied);
  const saveNote = useLearningStore(state => state.saveNote);
  const copy = COPY[language];
  const translate = (value: string) => tr(value, contentLanguage);
  function save() {
    const content = [question.answer, ...question.deeper, question.explanation, ...question.code, ...question.diagrams.map(diagram => diagram.steps.join(' → ')), ...topic.explanation.map(section => section.title + '\n' + section.text), topic.flow.join(' → '), ...topic.code, 'Источник: ' + topic.sources.join(' + ') + ' / ' + topic.sourceId + ' / ' + question.sourceId].filter(Boolean).join('\n\n');
    saveNote({ id: 'answer:' + question.id, title: question.question, content });
  }
  return <details className="answer-reading-question" id={question.id} open={index === 0}>
    <summary><span className="answer-number">{index + 1}</span><span lang={contentLanguage}>{translate(question.question)}</span>{learned && <CheckCircle2 size={17} aria-label={copy.learned}/>}</summary>
    <div className="answer-reading-body" lang={contentLanguage}>
      <h3>{copy.answer}</h3><p className="preserve-lines">{translate(question.answer)}</p>
      {question.deeper.length > 0 && <section className="answer-deeper"><h3>{translate(question.deeperTitle)}</h3><ul>{question.deeper.map((point, i) => <li key={i}>{translate(point)}</li>)}</ul></section>}
      {question.code.map((code, i) => <section key={i}><h3>{translate(question.codeLabel) || copy.code}</h3><pre><code>{code}</code></pre></section>)}
      {question.explanation && <section><h3>{language === 'ru' ? 'Что произошло и почему' : 'What happened and why'}</h3><p className="preserve-lines">{translate(question.explanation)}</p></section>}
      {question.diagrams.map((diagram, i) => <section key={i}><h3>{translate(diagram.title)}</h3><Flow steps={diagram.steps} language={contentLanguage}/></section>)}
      <div className="button-row"><button className="button primary" disabled={learned} onClick={() => markStudied(question.id)}><CheckCircle2 size={16}/>{learned ? copy.learned : copy.markLearned}</button><button className="button subtle" disabled={noteExists} onClick={save}><NotebookPen size={16}/>{noteExists ? copy.saved : language === 'ru' ? 'В заметки' : 'Save to notes'}</button></div>
    </div>
  </details>;
}
function Flow({ steps, language }: { steps: string[]; language: 'tg' | 'ru' | 'en' }) {
  return <ol className="flow-steps">{steps.map((step, index) => <li key={index}><span>{index + 1}</span><p lang={language}>{tr(step, language)}</p></li>)}</ol>;
}
export function AnswerReader({ topic }: { topic: AnswerTopic }) {
  const language = useLearningStore(state => state.language);
  const contentLanguage = useLearningStore(state => state.contentLanguage);
  const studied = useLearningStore(state => state.studied);
  const [query, setQuery] = useState('');
  const copy = COPY[language];
  const ru = language === 'ru';
  const translate = (value: string) => tr(value, contentLanguage);
  const count = topic.questions.filter(question => studied.includes(question.id)).length;
  const filtered = topic.questions.filter(question => [question.question, question.answer, question.explanation, ...question.deeper, ...question.code].some(value => translate(value).toLowerCase().includes(query.toLowerCase()) || value.toLowerCase().includes(query.toLowerCase())));
  return <>
    <PageHeading title={translate(topic.title)} subtitle={topic.chapter} back="/answers"><span className="badge"><BookOpen size={15}/>{topic.sources.includes('deep') ? copy.recommended : copy.interview} · {count}/{topic.questions.length} {copy.learned.toLowerCase()}</span></PageHeading>
    <div className={'answer-reader-grid ' + (!topic.flow.length ? 'without-flow' : '')}>
      <article className="panel lesson-article" lang={contentLanguage}>
        {topic.context && <section className="answer-context"><h2>{ru ? 'Контекст задачи' : 'Task context'}</h2><p className="preserve-lines">{translate(topic.context)}</p></section>}
        {topic.explanation.map((section, index) => <section key={index}><h2>{translate(section.title)}</h2><p className="preserve-lines">{translate(section.text)}</p></section>)}
        {topic.code.map((code, index) => <section key={index}><h2>{copy.code} {topic.code.length > 1 ? index + 1 : ''}</h2><pre><code>{code}</code></pre></section>)}
        <section><div className="section-heading"><h2>{copy.questions} · {topic.questions.length}</h2></div>
          {topic.questions.length > 5 && <input className="search-input" aria-label={copy.search} placeholder={copy.search} value={query} onChange={event => setQuery(event.target.value)}/>}
          <div className="answer-reading-list">{filtered.map(question => <ReadingQuestion key={question.id} question={question} topic={topic} index={topic.questions.indexOf(question)}/>)}</div>
          {!filtered.length && topic.questions.length > 0 && <p role="status">{copy.empty}</p>}
          {!topic.questions.length && <p>{ru ? 'Это пример проектирования приложения. В исходном файле у него нет отдельных вопросов.' : 'This is an application design example. The source has no separate questions for it.'}</p>}
        </section>
        <p className="source-line">{copy.source}: {topic.sources.map(source => source === 'deep' ? 'react_deep_understanding.html' : source === 'quiz' ? 'react_quiz.html' : 'react-interview.html').join(' + ')} · {topic.sourceId}</p>
      </article>
      <aside className="lesson-aside">{topic.flow.length > 0 && <section className="panel"><h2>{copy.flow}</h2><Flow steps={topic.flow} language={contentLanguage}/></section>}
        {topic.lessonId && <section className="panel answers-next-step"><h3>{ru ? 'Закрепить тему' : 'Practice this topic'}</h3><p>{ru ? 'После чтения попробуйте ответить без подсказки.' : 'After reading, try answering without a hint.'}</p><Link className="button primary full-width" href={(topic.sources.includes('interview') ? '/interview?topic=' : '/tests?topic=') + topic.lessonId}>{topic.sources.includes('interview') ? copy.interview : copy.tests}<ArrowRight size={16}/></Link><Link className="button subtle full-width" href={'/lesson/' + topic.lessonId}>{copy.openLesson}</Link></section>}
        <Link className="button subtle full-width" href="/answers">{ru ? 'Все ответы' : 'All answers'}</Link>
      </aside>
    </div>
  </>;
}
