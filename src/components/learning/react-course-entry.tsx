'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Code2, Layers } from 'lucide-react';
import { useLearningStore } from '@/stores/learning-store';
import { LEARNING_TOPICS } from '@/content/course';

const labels = {
  ru: { back:'Все курсы', title:'React · отдельный курс', intro:'Два месяца React. Сначала выберите месяц, затем день в учебном плане. Только после этого откроется «Мой день».', choose:'Выберите месяц', plan:'Перейти к учебному плану', month:'Месяц', first:'Основы React', firstDetail:'Компоненты, JSX, props, hooks, маршрутизация', second:'Состояние и приложения', secondDetail:'Context, Redux, Zustand, Jotai, формы и запросы', own:'Практика из вашего HTML', ownDetail:'Ваша исходная страница Practice-Local-Global: Redux, Zustand и Jotai. Для каждой библиотеки есть Local/Global, операции и код файлов.', all:'Открыть практику целиком', learn:'Практика уроков', note:'Next.js — отдельный курс. Его темы больше не входят в план React.' },
  en: { back:'All courses', title:'React · independent course', intro:'Two months of React. Pick a month, then choose a day in the study plan. My Day opens only for the selected day.', choose:'Choose a month', plan:'Open study plan', month:'Month', first:'React fundamentals', firstDetail:'Components, JSX, props, hooks, routing', second:'State and applications', secondDetail:'Context, Redux, Zustand, Jotai, forms and requests', own:'Practice from your HTML', ownDetail:'Your original Practice-Local-Global page: Redux, Zustand, Jotai, Local/Global workflows and source code.', all:'Open full practice', learn:'Lesson exercises', note:'Next.js has its own separate course, not React month 3.' },
  tg: { back:'Ҳамаи курсҳо', title:'React · курси алоҳида', intro:'Ду моҳи React. Аввал моҳро интихоб кунед, баъд аз нақшаи таълим рӯзро гиред. Танҳо рӯзи интихобшуда дар «Рӯзи ман» кушода мешавад.', choose:'Моҳро интихоб кунед', plan:'Кушодани нақшаи таълим', month:'Моҳ', first:'Асосҳои React', firstDetail:'Компонентҳо, JSX, props, hooks ва routing', second:'State ва барномаҳо', secondDetail:'Context, Redux, Zustand, Jotai, форма ва дархостҳо', own:'Амалия аз HTML-и шумо', ownDetail:'Файли аслии Practice-Local-Global: Redux, Zustand, Jotai, Local/Global ва кодҳои худатон.', all:'Кушодани тамоми амалия', learn:'Машқҳои дарсҳо', note:'Next.js курси алоҳида аст ва дар моҳи 3-и React нест.' },
  uk: { back:'Усі курси', title:'React · окремий курс', intro:'Два місяці React. Спочатку оберіть місяць, потім день у навчальному плані. Лише обраний день відкриється у «Мій день».', choose:'Оберіть місяць', plan:'Відкрити навчальний план', month:'Місяць', first:'Основи React', firstDetail:'Компоненти, JSX, props, hooks, маршрутизація', second:'Стан і застосунки', secondDetail:'Context, Redux, Zustand, Jotai, форми та запити', own:'Практика з вашого HTML', ownDetail:'Оригінальна Practice-Local-Global: Redux, Zustand, Jotai, Local/Global та ваш код.', all:'Відкрити всю практику', learn:'Вправи уроків', note:'Next.js — окремий курс, не третій місяць React.' },
} as const;

export function ReactPracticeLibrary({preview=false}:{preview?:boolean}) {
  const language=useLearningStore(state=>state.language);
  const month=useLearningStore(state=>state.activeMonth)===2?2:1;
  const course=useLearningStore(state=>state.selectedCourse);
  const chooseCourse=useLearningStore(state=>state.chooseCourse);
  useEffect(()=>{if(course!=='react')chooseCourse('react');},[course,chooseCourse]);
  const ui=labels[language];
  return <section className="react-library">
    <div className="section-heading"><div><h2>{ui.own}</h2><p>{ui.ownDetail}</p></div></div>
    <div className="button-row"><Link className="button subtle" href={`/practice?month=${month}`}><Code2 size={17}/>{ui.learn}</Link><a className="button subtle" href="/practice-local-global.html" target="_blank" rel="noopener noreferrer"><ArrowRight size={17}/>{ui.all}</a></div>
    <iframe className={preview?'state-practice-frame in-landing':'state-practice-frame'} title="Practice Local / Global · Redux, Zustand, Jotai" src="/practice-local-global.html" loading="lazy" sandbox="allow-scripts" allow="clipboard-write"/>
  </section>;
}

export function ReactCourseEntry() {
  const language=useLearningStore(state=>state.language),ui=labels[language];
  const completed=useLearningStore(state=>state.completedTopics);
  const setPreferences=useLearningStore(state=>state.setPreferences);
  const months=[
    {number:1,title:ui.first,detail:ui.firstDetail},
    {number:2,title:ui.second,detail:ui.secondDetail},
  ];
  return <section className="react-entry">
    <Link className="back-link" href="/courses"><ArrowLeft size={16}/>{ui.back}</Link>
    <div className="page-heading"><div><span className="eyebrow">React · 2 {ui.month.toLowerCase()}</span><h1>{ui.title}</h1><p>{ui.intro}</p></div></div>
    <h2 className="react-entry-title"><BookOpen size={21}/>{ui.choose}</h2>
    <div className="react-month-grid">{months.map(item=>{
      const topics=LEARNING_TOPICS.filter(topic=>topic.month===item.number);
      const done=topics.filter(topic=>completed.includes(topic.id)).length;
      return <Link href={`/plan/${item.number}`} key={item.number} className="panel react-month-option" onClick={()=>setPreferences({activeMonth:item.number})}>
        <span className="eyebrow">{ui.month} {item.number}</span>
        <h3>{item.title}</h3><p>{item.detail}</p>
        <div className="react-month-stat">{done} / {topics.length}</div>
        <div className="progress-track"><span style={{width:`${topics.length?done/topics.length*100:0}%`}}/></div>
        <strong>{ui.plan}<ArrowRight size={17}/></strong>
      </Link>;
    })}</div>
    <p className="react-next-note"><Layers size={17}/>{ui.note}</p>
    <ReactPracticeLibrary preview/>
  </section>;
}
