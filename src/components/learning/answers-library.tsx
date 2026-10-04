'use client';
import Link from 'next/link';
import { ArrowRight, BookOpen, Download, Search, CheckCircle2 } from 'lucide-react';
import type { AnswerSource, AnswerSummary } from '@/content/answers';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import { tr } from '@/lib/translate';
import { PageHeading } from './page-heading';

type Props = { topics: AnswerSummary[]; source: AnswerSource; group: number; query: string; page: number; pageCount: number; totalTopics: number; totalAnswers: number; groups: { id: number; count: number }[] };
export function AnswersLibrary(props: Props) {
  const { topics, source, group, query, page, pageCount, totalTopics, totalAnswers, groups } = props;
  const language = useLearningStore(state => state.language);
  const contentLanguage = useLearningStore(state => state.contentLanguage);
  const studied = useLearningStore(state => state.studied);
  const copy = COPY[language];
  const ru = language === 'ru';
  function href(values: { source?: AnswerSource; group?: number; page?: number; q?: string }) {
    const params = new URLSearchParams();
    const selectedSource = values.source ?? source;
    const selectedGroup = values.group ?? group;
    const selectedQuery = values.q ?? query;
    if (selectedSource !== 'all') params.set('source', selectedSource);
    if (selectedGroup) params.set('group', String(selectedGroup));
    if (selectedQuery) params.set('q', selectedQuery);
    if (values.page && values.page > 1) params.set('page', String(values.page));
    return '/answers' + (params.size ? '?' + params.toString() : '');
  }
  return <>
    <PageHeading title={copy.answers} subtitle={ru ? 'Все ответы из трёх файлов: объяснения, примеры и механика React.' : 'Answers from all three files: explanations, examples and React mechanics.'}>
      <a className="button subtle" href="/answers/export" download><Download size={17}/>{ru ? 'Скачать общий HTML' : 'Download combined HTML'}</a>
    </PageHeading>
    <section className="panel answers-recommendation">
      <div><span className="badge"><BookOpen size={14}/>{copy.recommended}</span><h2>React · Deep understanding</h2><p>{ru ? 'Начните с глубокого разбора: сначала поймите механизм, затем прочитайте ответ и проверьте себя в тесте.' : 'Start with the deep explanation: understand the mechanism, read the answer, then check yourself in a test.'}</p><span className="source-line">react_deep_understanding.html · 79 {ru ? 'тем' : 'topics'} · 367 {copy.questionsOf}</span></div>
      <Link className="button primary" href="/answers/deep-1">{ru ? 'Начать читать' : 'Start reading'}<ArrowRight size={17}/></Link>
    </section>
    <div className="answers-intro"><span>{totalAnswers} {ru ? 'вопроса с ответами' : 'questions and answers'} · 3 {ru ? 'источника' : 'sources'}</span><span><CheckCircle2 size={15}/>{studied.length} {copy.learned.toLowerCase()} · 0 {ru ? 'токенов' : 'tokens'}</span></div>
    <nav className="answers-source-filters" aria-label={copy.source}>
      {(['all','deep','quiz','interview'] as const).map(value => <Link key={value} href={href({ source: value, group: 0 })} className={'button ' + (source === value ? 'primary' : 'subtle')} aria-current={source === value ? 'page' : undefined}>{value === 'all' ? copy.all : value === 'deep' ? (ru ? 'Deep · рекомендуется' : 'Deep · recommended') : value === 'quiz' ? copy.tests : copy.interview}</Link>)}
    </nav>
    <div className="month-grid answers-groups">{groups.map(item => <Link key={item.id} href={href({ group: group === item.id ? 0 : item.id })} className={'panel answer-group ' + (group === item.id ? 'selected' : '')} aria-current={group === item.id ? 'page' : undefined}><span className="eyebrow">{copy.group} {item.id}</span><h3>{copy[('group' + item.id) as 'group1' | 'group2' | 'group3']}</h3><span>{item.count} {copy.questionsOf}</span></Link>)}</div>
    <section className="panel answers-directory">
      <form action="/answers" className="answers-search" key={query + source + group}>
        <label className="sr-only" htmlFor="answers-query">{copy.search}</label>
        <input id="answers-query" name="q" type="search" defaultValue={query} placeholder={ru ? 'Поиск по вопросу, ответу или коду…' : 'Search questions, answers or code…'} maxLength={200}/>
        <input type="hidden" name="source" value={source}/><input type="hidden" name="group" value={group}/>
        <button className="button primary" type="submit"><Search size={16}/>{ru ? 'Найти' : 'Search'}</button>
      </form>
      <div className="section-heading"><h2>{copy.topics} <span className="count">{totalTopics}</span></h2>{(group > 0 || query) && <Link href={href({ group: 0, q: '' })}>{ru ? 'Сбросить фильтры' : 'Reset filters'}</Link>}</div>
      <div className="answers-topic-grid">{topics.map(topic => <Link className="answer-topic-card" key={topic.id} href={'/answers/' + topic.id} prefetch={false}><span className="eyebrow">{topic.sources.includes('quiz') ? 'Deep + quiz' : topic.sources.includes('deep') ? 'Deep' : 'Interview'} · {copy.group} {topic.group}</span><h3>{tr(topic.title, contentLanguage)}</h3><p lang={contentLanguage}>{tr(topic.preview, contentLanguage)}</p><span>{topic.count ? topic.count + ' ' + copy.questionsOf : (ru ? 'Пример архитектуры' : 'Architecture example')}<ArrowRight size={16}/></span></Link>)}</div>
      {!topics.length && <p role="status">{copy.empty}</p>}
      <nav className="answers-pagination" aria-label={ru ? 'Страницы ответов' : 'Answer pages'}>{page > 1 && <Link className="button subtle" href={href({ page: page - 1 })}>{copy.previous}</Link>}<span>{page} / {pageCount}</span>{page < pageCount && <Link className="button subtle" href={href({ page: page + 1 })}>{copy.next}</Link>}</nav>
    </section>
  </>;
}
