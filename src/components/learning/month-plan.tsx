'use client';
import Link from 'next/link';
import { CheckCircle2, ChevronRight, Circle, Code2, BookOpen } from 'lucide-react';
import { CURRICULUM, LEARNING_TOPICS, MONTHS, getTopic, topicTitle } from '@/content/course';
import { COPY } from '@/lib/i18n';
import { useLearningStore } from '@/stores/learning-store';
import { PageHeading } from './page-heading';

const weekTitles:Record<string,string>={'Core React':'Основа React','Tooling & Effects':'Инструменты и эффекты','React Router':'React Router','Advanced Hooks':'Продвинутые хуки','State Management':'Управление state','Forms · TypeScript · Data':'Формы, TypeScript и данные','Architecture Setup':'Структура приложения','Next.js Foundations':'Основа Next.js','Advanced Next.js + Backend':'Next.js и сервер','Portfolio Prep':'Подготовка портфолио','Final Capstone':'Финальный проект'};
export function MonthPlan({month}:{month:number}) {
  const language=useLearningStore(state=>state.language);
  const completed=useLearningStore(state=>state.completedTopics);
  const copy=COPY[language];
  const info=MONTHS.find(item=>item.id===month)!;
  const curriculum=CURRICULUM.find(item=>item.month===month)!;
  const extraTopics=LEARNING_TOPICS.filter(topic=>topic.month===month&&!curriculum.weeks.some(week=>week.days.some(day=>day.topicIds.includes(topic.id))));
  const firstOpenDayId=curriculum.weeks.flatMap(week=>week.days).find(day=>!day.topicIds.every(id=>completed.includes(id)))?.id;
  return <><PageHeading back="/plan" title={`${copy.month} ${month} · ${language==='ru'?info.titleRu:info.title}`} subtitle={language==='ru'?info.descriptionRu:info.description}><Link className="button primary" href={`/study?daily=1&month=${month}`}><BookOpen size={17}/>{copy.daily}</Link></PageHeading>
    <div className="month-tabs">{MONTHS.map(item=><Link key={item.id} href={`/plan/${item.id}`} className={item.id===month?'active':''}>{copy.month} {item.id}</Link>)}</div>
    <div className="weeks-grid">{curriculum.weeks.map(week=><section className="panel week-panel" key={week.week}><div className="week-heading"><span className="eyebrow">{copy.week} {week.week}</span><h2>{language==='ru'?weekTitles[week.title]||week.title:week.title}</h2></div>{week.days.map((day,index)=>{
      const done=day.topicIds.every(id=>completed.includes(id));
      const isCurrent=day.id===firstOpenDayId;
      const nextTopic=day.topicIds.find(id=>!completed.includes(id));
      return <details className={'day-row'+(isCurrent?' is-current':'')} key={day.id} open={isCurrent}><summary>{done?<CheckCircle2 size={18} className="success-text"/>:<Circle size={18}/>}{isCurrent&&!done&&<span className="badge">Сейчас</span>}<span className="day-number">{index+1}</span><span>{language==='ru'?day.titleRu:day.title}</span><ChevronRight size={15}/></summary><div className="day-topics">{day.topicIds.map(id=>{const topic=getTopic(id);if(!topic)return null;return <Link key={id} href={`/lesson/${id}`}><BookOpen size={14}/>{topicTitle(topic,language)}<ChevronRight size={14}/></Link>;})}{isCurrent&&nextTopic&&<Link className="text-link" href={`/lesson/${nextTopic}`}>{language==='ru'?'Продолжить':'Continue'}<ChevronRight size={14}/></Link>}</div></details>;
    })}</section>)}</div>
    {curriculum.ai.length>0&&<section className="panel supplemental"><div className="section-heading"><h2>{language==='ru'?'AI-инструменты · 5 занятий':'AI tools · 5 sessions'}</h2><Link href="/lesson/ai-workflow">{copy.open}<ChevronRight size={16}/></Link></div><div className="compact-grid">{curriculum.ai.map((day,index)=><details key={day.id}><summary>{index+1}. {language==='ru'?['Зачем AI-инструменты','Промпты для кода','Работа с проектом','Рабочий процесс агента','Функция от начала до конца'][index]:day.title}</summary><ul>{day.tasks.map(task=><li key={task}>{task}</li>)}</ul></details>)}</div></section>}
    {curriculum.projects.map((project,index)=><section className="panel supplemental" key={project.id}><div className="section-heading"><h2><Code2 size={20}/>{language==='ru'?(month===3?'Итоговый проект':index===0?'Проект: интернет-магазин':'Проект: управление задачами'):project.title}</h2><Link href={`/practice?month=${month}`}>{copy.practice}<ChevronRight size={16}/></Link></div><ul className="project-features">{project.tasks.map(task=><li key={task}>{task}</li>)}</ul></section>)}
    {curriculum.wrapup.length>0&&<section className="panel supplemental"><h2>{language==='ru'?'Завершение месяца · 2 занятия':'Month wrap-up · 2 sessions'}</h2><p>{language==='ru'?'Ревью кода, свои хуки, props и структура файлов. Затем разберите трудности месяца и подготовьтесь к Next.js.':'Review code, custom hooks, props and file structure. Reflect on the month and prepare for Next.js.'}</p><Link className="text-link" href="/lesson/ai-workflow">{copy.openLesson}<ChevronRight size={16}/></Link></section>}
    {extraTopics.length>0&&<section className="panel supplemental"><h2>{language==='ru'?'Дополнительный разбор и повторение':'More explanations & review'}</h2><div className="topic-chips">{extraTopics.map(topic=><Link key={topic.id} href={`/lesson/${topic.id}`}>{topicTitle(topic,language)}</Link>)}</div></section>}
  </>;
}
