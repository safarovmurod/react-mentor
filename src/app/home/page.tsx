'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, ListChecks, MessagesSquare, Sparkles, CheckCircle2, ArrowUpRight, RotateCcw } from 'lucide-react';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import { awardedXP, dateKey } from '@/lib/learning';
import { LEARNING_TOPICS, QUIZ_QUESTIONS } from '@/content/course';
import { tr } from '@/lib/translate';
import { MonthCards } from '@/components/learning/month-cards';
import { useAccount } from '@/components/account/account-provider';

export default function HomePage() {
  const state=useLearningStore();
  const account=useAccount();
  const name=account.profile?.displayName;
  const {ready,activeMonth,ensureDailySet}=state;
  const copy=COPY[state.language];
  const today=dateKey();
  useEffect(()=>{if(ready)ensureDailySet(activeMonth,today);},[ready,activeMonth,ensureDailySet,today]);
  const ids=state.dailySets[today+'-'+state.activeMonth]||[];
  const read=ids.filter(id=>state.studied.includes(id)).length;
  const answered=ids.filter(id=>state.answers[today+':test:'+id]).length;
  const interviewed=ids.filter(id=>state.answers[today+':interview:'+id]).length;
  const due=Object.values(state.reviews).filter(item=>item.due<=today);
  const first=QUIZ_QUESTIONS.find(question=>question.id===ids[0]);
  return <div className="dashboard">
    <div className="dashboard-heading"><div><span className="eyebrow">{copy.today} · {new Intl.DateTimeFormat(state.language,{day:'numeric',month:'long',timeZone:'Asia/Dushanbe'}).format(new Date())}</span><h1>{state.language==='ru'?'Время разобраться в React.':'Time to understand React.'}</h1><p>{state.language==='ru'?(name?name+', продолжим с небольшого шага.':'Продолжим с небольшого шага.'):(name?name+', let’s take the next small step.':'Let’s take the next small step.')}</p></div><Link className="button subtle" href="/plan">{copy.plan}<ArrowUpRight size={17}/></Link></div>
    <div className="stats-grid"><div className="stat"><BookOpen size={19}/><span>{copy.progress}</span><strong>{state.completedTopics.length}<small> / {LEARNING_TOPICS.length}</small></strong></div><div className="stat"><ListChecks size={19}/><span>{copy.readCount}</span><strong>{state.studied.length}</strong></div><div className="stat"><Sparkles size={19}/><span>{copy.totalXP}</span><strong>{awardedXP(state.awards)}<small> XP</small></strong></div></div>
    <div className="dashboard-grid"><div className="dashboard-main"><section className="daily-card"><div className="between"><span className="eyebrow">{copy.month} {state.activeMonth}</span><span className="badge">{ids.length || state.dailyLimit} {copy.questionsOf}</span></div><h2>{copy.daily}</h2><p>{copy.dailyText}</p><div className="daily-progress"><div className="progress-track"><span style={{width:ids.length?read/ids.length*100+'%':'0%'}}/></div><span>{read} / {ids.length}</span></div>
      <div className="learning-steps">{[{icon:BookOpen,label:copy.learnStep,path:'/study',count:read},{icon:ListChecks,label:copy.testStep,path:'/tests',count:answered},{icon:MessagesSquare,label:copy.interviewStep,path:'/interview',count:interviewed}].map((step,index)=>{const Icon=step.icon;return <Link key={step.path} href={step.path+'?daily=1&month='+state.activeMonth} className="learning-step"><span className="step-icon">{step.count===ids.length&&ids.length>0?<CheckCircle2 size={20}/>:<Icon size={20}/>}</span><div><strong>{step.label}</strong><span>{step.count} / {ids.length} {copy.questionsOf}{index===2?' · '+copy.recommended:''}</span></div><ArrowRight size={17}/></Link>;})}</div><Link className="button primary daily-start" href={'/study?daily=1&month='+state.activeMonth}>{read>0?copy.continue:copy.start}<ArrowRight size={17}/></Link></section>
      {first&&<section className="panel next-question"><span className="eyebrow">{copy.question} 01</span><h3 lang={state.contentLanguage}>{tr(first.question,state.contentLanguage)}</h3><Link className="text-link" href={'/study?daily=1&month='+state.activeMonth}>{copy.learnStep}<ArrowRight size={16}/></Link></section>}
      <section className="panel review-shortcut"><RotateCcw size={22}/><div><h3>{copy.revision}</h3><p>{due.length} {copy.reviewDue.toLowerCase()}</p></div><Link className="icon-button" href="/revision" aria-label={copy.revision}><ArrowRight size={19}/></Link></section>
    </div><aside className="course-column"><div className="section-heading"><h2>{copy.course}</h2></div><MonthCards compact/></aside></div>
  </div>;
}
