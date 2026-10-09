'use client';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { reactMonthDays, reactDayComplete } from '@/lib/react-plan';
import { useLearningStore } from '@/stores/learning-store';
import { PageHeading } from './page-heading';
export function MonthPlan({month}:{month:number}) {
 const state=useLearningStore(),days=reactMonthDays(month),selected=state.drafts['react-selected-day'];
 return <><PageHeading back="/courses/react" title={`Учебный план · Месяц ${month}`} subtitle="Выберите день → изучите тему → откройте практику → проверьте себя."/><div className="month-tabs">{[1,2].map(n=><Link key={n} href={`/plan/${n}`} className={month===n?'active':''} onClick={()=>state.setPreferences({activeMonth:n})}>Месяц {n}</Link>)}</div><div className="day-card-grid"><Link href={`/home?month=${month}&day=0`} className="panel day-card"><span className="eyebrow">День 0</span><h2>Подготовка</h2><p>Инструменты и исходный проект.</p></Link>{days.map(day=>{
 const done=reactDayComplete(day,state.completedTopics,state.completedPractice);
 return <Link prefetch={false} href={`/home?month=${month}&day=${day.day}`} key={day.day} className={'panel day-card '+(selected===`${month}:${day.day}`?'is-current':'')+(done?' is-done':'')} onClick={()=>state.setPreferences({activeMonth:month})}><div className="between"><span className="eyebrow">День {day.day}</span>{done&&<CheckCircle2 size={18}/>}</div><h2>{day.title}</h2><p>{day.practiceOnly?'Соединяем знания в проекте.':'Объяснение, пример и практика этого дня.'}</p><span className="text-link">Открыть мой день <ArrowRight size={15}/></span></Link>;
 })}</div></>;
}
