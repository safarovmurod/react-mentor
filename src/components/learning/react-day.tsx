'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { ArrowRight, BookOpen, ListChecks, Sparkles } from 'lucide-react';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import { awardedXP } from '@/lib/learning';
import { LEARNING_TOPICS, topicTitle } from '@/content/course';
import { tr } from '@/lib/translate';
import { reactMonthDays, reactDayComplete } from '@/lib/react-plan';
import { MonthCards } from './month-cards';
import { useAccount } from '@/components/account/account-provider';
export function ReactDay({requestedDay,requestedMonth}:{requestedDay?:number;requestedMonth?:number}) {
  const state=useLearningStore(),copy=COPY[state.language],ru=state.language==='ru';
  const account=useAccount();
  const month=requestedMonth || state.activeMonth;
  const stored=state.drafts['react-selected-day']?.split(':').map(Number);
  const day=requestedDay ?? (stored?.[0]===month?stored[1]:reactMonthDays(month).find(d=>!reactDayComplete(d,state.completedTopics,state.completedPractice))?.day || 1);
  const days=reactMonthDays(month), entry=days.find(d=>d.day===day);
  const saveDraft=state.saveDraft,setPreferences=state.setPreferences;
  useEffect(()=>{if(state.drafts['react-selected-day']!==`${month}:${day}`)saveDraft('react-selected-day',`${month}:${day}`);if(state.activeMonth!==month)setPreferences({activeMonth:month});},[day,month,state.drafts,state.activeMonth,saveDraft,setPreferences]);
  return <div className="dashboard"><div className="dashboard-heading"><div><span className="eyebrow">React · Месяц {month} · День {day}</span><h1>{ru?'Время разобраться в React.':'Time to understand React.'}</h1><p>{account.profile?.displayName?account.profile.displayName+', ':''}{ru?'Изучаем выбранный день, затем применяем в коде.':'Study the selected day, then apply it in code.'}</p></div><Link className="button subtle" href={`/plan/${month}`}>{copy.plan} <ArrowRight size={17}/></Link></div>
    <div className="stats-grid"><div className="stat"><BookOpen size={19}/><span>{copy.progress}</span><strong>{state.completedTopics.length}<small> / {LEARNING_TOPICS.length}</small></strong></div><div className="stat"><ListChecks size={19}/><span>{copy.readCount}</span><strong>{state.studied.length}</strong></div><div className="stat"><Sparkles size={19}/><span>{copy.totalXP}</span><strong>{awardedXP(state.awards)}<small> XP</small></strong></div></div>
    <nav className="day-strip" aria-label="Выбор дня"><Link href={`/home?month=${month}&day=0`} aria-current={day===0?'step':undefined}>0</Link>{days.map(d=><Link prefetch={false} key={d.day} href={`/home?month=${month}&day=${d.day}`} aria-label={`День ${d.day}`} aria-current={day===d.day?'step':undefined}>{d.day}</Link>)}</nav>
    <div className="dashboard-grid"><div className="dashboard-main">{day===0?<article className="panel course-lesson"><h2>Подготовка к React</h2><p>Сначала пройдите HTML + CSS и два месяца JavaScript. Здесь понадобится Node.js и редактор. На каждом шаге изменяйте свой накопительный проект.</p><Link className="button primary" href={`/home?month=${month}&day=1`}>Начать день 1 <ArrowRight size={16}/></Link></article>:entry?<>
      <div className="section-heading"><h2>День {day} · {entry.title}</h2><span className="badge">{entry.practiceOnly?'Применяем':'Изучаем'}</span></div>
      {entry.topics.map(topic=><article className="panel course-lesson" key={topic.id}><h2>{topicTitle(topic,state.language)}</h2>{topic.explanation.map((part,index)=><section className="day-explanation" key={index}><h3>{tr(part.title,state.contentLanguage)}</h3><p className="preserve-lines">{tr(part.text,state.contentLanguage)}</p></section>)}{topic.code[0]&&<pre><code>{topic.code[0]}</code></pre>}<aside className="lesson-connections"><h3>Шаг за шагом</h3><ol>{topic.flow.map((step,index)=><li key={index}>{tr(step,state.contentLanguage)}</li>)}</ol>{day>1&&<Link href={`/home?month=${month}&day=${day-1}`}>Используем результат дня {day-1}</Link>}</aside><p className="source-line"><a href="https://react.dev/learn" target="_blank" rel="noreferrer">React · официальное руководство</a></p><div className="button-row"><button className="button subtle" disabled={state.completedTopics.includes(topic.id)} onClick={()=>state.completeTopic(topic.id)}>{state.completedTopics.includes(topic.id)?copy.completed:copy.markLearned}</button><Link className="button primary" href={`/practice?month=${month}&topic=${topic.id}&day=${day}`}>Практика этого дня <ArrowRight size={16}/></Link><Link className="text-link" href={`/tests?topic=${topic.id}`}>Тесты и интервью</Link></div></article>)}
      {day<30&&<Link className="button subtle" href={`/home?month=${month}&day=${day+1}`}>Следующий день {day+1} <ArrowRight size={17}/></Link>}
    </>:null}</div><aside className="course-column"><div className="section-heading"><h2>{copy.course}</h2></div><MonthCards compact/></aside></div>
  </div>;
}
