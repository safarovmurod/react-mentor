'use client';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, LockKeyhole } from 'lucide-react';
import { reactDayProgress } from '@/lib/react-plan';
import { useLearningStore } from '@/stores/learning-store';
import { PageHeading } from './page-heading';
import { PROGRESSION_COPY } from '@/lib/progression-copy';

export function MonthPlan({month}:{month:number}) {
 const state=useLearningStore(), days=reactDayProgress(month,state.completedTopics,state.completedPractice,state.confirmedDays);
 const copy=PROGRESSION_COPY[state.language] || PROGRESSION_COPY.en;
 const selected=state.drafts['react-selected-day'];
 return <><PageHeading back="/courses/react" title={`${copy.plan} · ${copy.month} ${month}`} subtitle={copy.flow}/><div className="month-tabs">{[1,2].map(n=><Link key={n} href={`/plan/${n}`} className={month===n?'active':''} onClick={()=>state.setPreferences({activeMonth:n})}>{copy.month} {n}</Link>)}</div><div className="day-card-grid">{days.map(day=>{
  const locked=day.status==='upcoming';
  const contents=<><div className="between"><span className="eyebrow">{copy.day} {day.day}</span>{day.status==='done'?<CheckCircle2 size={18}/>:locked?<LockKeyhole size={18}/>:null}</div><h2>{day.title}</h2><p>{locked?copy.locked:copy.flow}</p>{!locked&&<span className="text-link">{copy.open} <ArrowRight size={15}/></span>}</>;
  return locked?<article key={day.day} className="panel day-card is-locked" aria-label={`${copy.day} ${day.day}: ${copy.locked}`}>{contents}</article>:<Link prefetch={false} href={`/home?month=${month}&day=${day.day}`} key={day.day} className={'panel day-card '+(selected===`${month}:${day.day}`?'is-current':'')+(day.status==='done'?' is-done':'')} onClick={()=>state.setPreferences({activeMonth:month})}>{contents}</Link>;
 })}</div></>;
}
