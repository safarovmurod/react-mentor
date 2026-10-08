'use client';
import Link from 'next/link';
import { ArrowRight, BookOpen, Layers3, Workflow, ListChecks } from 'lucide-react';
import { COPY } from '@/lib/i18n';
import { useLearningStore } from '@/stores/learning-store';
import { ALL_QUESTIONS, QUIZ_QUESTIONS } from '@/content/course';
import { PageHeading } from './page-heading';
export function SessionHub({mode,embedded=false}:{mode:'test'|'interview'|'learn';embedded?:boolean}) {
  const state=useLearningStore();const copy=COPY[state.language];
  const path=mode==='test'?'/tests':mode==='interview'?'/tests':'/study';
  const title=mode==='test'?copy.tests:mode==='interview'?copy.interview:copy.learn;
  const bank=mode==='interview'?ALL_QUESTIONS:QUIZ_QUESTIONS;
  const icons=[BookOpen,Layers3,Workflow];
  return <>{!embedded&&<PageHeading title={title}/>}<Link className="session-daily panel" href={`${path}?daily=1&month=${state.activeMonth}${mode==='interview'?'#interview':''}`}><ListChecks size={30}/><div><span className="badge">{copy.recommended}</span><h2>{copy.daily}</h2><p>{copy.dailyText}</p></div><ArrowRight size={22}/></Link><div className="section-heading"><h2>{state.language==='ru'?'Банк вопросов':'Question bank'}</h2><span>{bank.length} {copy.questionsOf}</span></div><div className="month-grid">{[1,2,3].map((group,index)=>{const Icon=icons[index];return <Link className="panel group-card" href={`${path}?group=${group}${mode==='interview'?'#interview':''}`} key={group}><Icon size={25}/><span className="eyebrow">{copy.group} {group}</span><h2>{[copy.group1,copy.group2,copy.group3][index]}</h2><p>{bank.filter(question=>question.group===group).length} {copy.questionsOf}</p><span className="text-link">{copy.open}<ArrowRight size={16}/></span></Link>;})}</div></>;
}
