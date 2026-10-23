'use client';
import Link from 'next/link';
import { useDeferredValue, useEffect, useState, useSyncExternalStore } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Layers } from 'lucide-react';
import { courseDisplayName } from '@/lib/catalog-copy';
import { courseAccessTier } from '@/lib/courses/access';
import { PREMIUM_COPY } from '@/lib/premium-copy';
import { courseDayCount } from '@/lib/course-copy';
import { courseContentSchema, courseText, type CourseContent, type CourseLesson } from '@/lib/courses/schema';
import type { ImportedCourseId } from '@/lib/courses/ids';
import { emptyCourseProgress } from '@/lib/account/progress';
import { dateKey } from '@/lib/learning';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import { LEARNING_UI_COPY, lessonTranslationNotice } from '@/lib/learning-ui-copy';
import { useAppStore } from '@/stores/app-store';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { PROGRESSION_COPY } from '@/lib/progression-copy';
import { CoursePractice } from './course-practice';
import { courseDayProgress, courseDayReady, courseMonthPlan } from '@/lib/courses/plan';

const empty = emptyCourseProgress();
const subscribeHash=(notify:()=>void)=>{window.addEventListener('hashchange',notify);return ()=>window.removeEventListener('hashchange',notify);};
const readHash=()=>{try{return decodeURIComponent(window.location.hash.slice(1));}catch{return '';}};
function hasEnglishFallback(content:CourseContent) {
  return content.lessons.some(lesson=>[
    lesson.title,lesson.summary,
    ...lesson.sections.flatMap(part=>[part.title,part.body]),
    ...lesson.questions.flatMap(question=>[question.question,question.answer,...question.options]),
    ...(lesson.practice?[lesson.practice.task,lesson.practice.hint,...lesson.practice.criteria]:[]),
  ].some(value=>!value.en));
}
export function CourseWorkspace({courseId,section,initialContent,day:requestedDay}:{courseId:ImportedCourseId;section:string;initialContent?:CourseContent;day?:number}) {
  const state=useLearningStore(), copy=COPY[state.language], ui=LEARNING_UI_COPY[state.language], gate=PROGRESSION_COPY[state.language];
  const progress=state.courses[courseId] || empty;
  const legacyId=useSyncExternalStore(subscribeHash,readHash,()=> '');
  const [content,setContent]=useState<CourseContent|null>(initialContent || null);
  const [confirming,setConfirming]=useState(false), [confirmationError,setConfirmationError]=useState('');
  const [accessStatus,setAccessStatus]=useState<number|null>(null);
  const requiredTier=courseAccessTier(courseId), premium=PREMIUM_COPY[state.language];
  const [error,setError]=useState(false), [retry,setRetry]=useState(0), [query,setQuery]=useState(''), [limit,setLimit]=useState(18);
  const deferredQuery=useDeferredValue(query.trim().toLowerCase());
  const {selectedCourse,courseChosen,chooseCourse}=state;
  useEffect(()=>{if(selectedCourse!==courseId||!courseChosen){chooseCourse(courseId);useAppStore.setState({sidebarOpen:false,tutorDrawerOpen:false,tutorQuestion:null});}},[courseId,selectedCourse,courseChosen,chooseCourse]);
  useEffect(()=>{
    if(initialContent) return;
    const controller=new AbortController();
    let sessionTimer:ReturnType<typeof setTimeout>|undefined;
    const signal=AbortSignal.any([controller.signal,AbortSignal.timeout(15000)]);
    async function load(){
      try{
        const headers:Record<string,string>={};
        if(requiredTier!=='starter'){
          const client=getSupabaseBrowserClient();
          if(client){
            const session=await Promise.race([client.auth.getSession(),new Promise<never>((_,reject)=>{sessionTimer=setTimeout(()=>reject(new Error('Session timeout')),12000);})]);
            clearTimeout(sessionTimer);
            if(session.data.session)headers.Authorization='Bearer '+session.data.session.access_token;
          }
        }
        const response=await fetch('/api/courses/'+courseId,{signal,headers});
        if(!response.ok){if([401,403,503].includes(response.status)&&requiredTier!=='starter'&&!controller.signal.aborted)setAccessStatus(response.status);throw Error('Unavailable');}
        const value=courseContentSchema.parse(await response.json());
        if(!controller.signal.aborted){setContent(value);setError(false);setAccessStatus(null);}
      }catch{if(!controller.signal.aborted)setError(true);}
      finally{clearTimeout(sessionTimer);}
    }
    void load();
    return ()=>controller.abort();
  },[courseId,retry,initialContent,requiredTier]);
  const plan=courseMonthPlan(content?.lessons || []);
  const statuses=courseDayProgress(plan,progress.completedTopics,progress.completedPractice,progress.confirmedDays);
  const selectedDayKey='selected-day-v3';
  const oldSelection=progress.drafts['selected-day-v2'];
  const remembered=Number(progress.drafts[selectedDayKey] ?? (courseId==='html'&&oldSelection!==undefined?Number(oldSelection)+1:progress.drafts['selected-day']));
  const rememberedEntry=statuses.days.find(entry=>entry.day===remembered&&entry.status!=='upcoming');
  const day=requestedDay ?? rememberedEntry?.day ?? statuses.current?.day ?? plan.at(-1)?.day ?? 1;
  const item=plan.find(item=>item.day===day);
  const requestedLesson=legacyId?content?.lessons.find(lesson=>lesson.id===legacyId):null;
  const lesson=requestedLesson || item?.lesson;
  const entry=statuses.days.find(item=>item.lesson.id===lesson?.id&&item.day===(requestedLesson?.day ?? day));
  const locked=!entry||entry.status==='upcoming';
  const canConfirm=!!entry&&!locked&&courseDayReady(entry,progress.completedTopics,progress.completedPractice);
  const text=(value:CourseLesson['title'])=>courseText(value,state.contentLanguage);
  const href=(target:string,targetDay=day)=>target==='practice'?`/practice?course=${courseId}&day=${targetDay}`:`/courses/${courseId}/${target}?day=${targetDay}`;
  const saveCourseDraft=state.saveCourseDraft;
  useEffect(()=>{if(day>=0&&day<=30&&progress.drafts[selectedDayKey]!==String(day))saveCourseDraft(courseId,selectedDayKey,String(day));},[courseId,day,progress.drafts,saveCourseDraft,selectedDayKey]);
  const availableLessons=new Set(statuses.days.filter(entry=>entry.status!=='upcoming').map(entry=>entry.lesson.id));
  const library=(content?.lessons || []).filter(item=>availableLessons.has(item.id)).filter(item=>!deferredQuery||[text(item.title),text(item.summary),...item.questions.flatMap(q=>[text(q.question),text(q.answer)]),...item.sections.map(s=>text(s.body))].join(' ').toLowerCase().includes(deferredQuery));
  const translationNotice=state.contentLanguage==='en'&&content&&hasEnglishFallback(content)?ui.contentFallback:lessonTranslationNotice(state.language);
  const titles:Record<string,string>={home:copy.home,plan:copy.plan,practice:copy.practice,tests:ui.testsInterview,interview:ui.testsInterview,answers:ui.answersInterview};
  async function confirmDay() {
    setConfirmationError('');
    setConfirming(true);
    try {
      // Guest study progress is local. Signed-in HTML day 1 requires the separate
      // server-attested ledger before this UI confirms its next step.
      if(courseId==='html'&&day===1){
        const client=getSupabaseBrowserClient();
        if(client){
          const {data,error}=await client.auth.getSession();
          if(error)throw error;
          if(data.session){
            const response=await fetch('/api/practice/confirm',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+data.session.access_token},body:JSON.stringify({courseId:'html',day:1}),signal:AbortSignal.timeout(15000)});
            if(!response.ok)throw new Error('Server confirmation failed');
          }
        }
      }
      state.confirmCourseDay(courseId,day,plan);
    }catch{
      const messages={ru:'Подтверждение сервера недоступно. Прогресс сохранён; повторите после настройки сервера.',tg:'Тасдиқи сервер дастрас нест. Пешрафт сабт шуд; баъди танзими сервер боз санҷед.',en:'Server confirmation is unavailable. Progress is saved; retry after server setup.',uk:'Підтвердження сервера недоступне. Прогрес збережено; повторіть після налаштування сервера.',ja:'サーバーで確認できません。学習記録は保存されています。サーバー設定後に再試行してください。',ko:'서버에서 확인할 수 없습니다. 학습 기록은 저장되었습니다. 서버 설정 후 다시 시도하세요.'};
      setConfirmationError(messages[state.language]);
    }finally{setConfirming(false);}
  }
  return <section className="course-workspace">
    <Link href="/courses" className="back-link"><Layers size={16}/>{ui.allCourses}</Link>
    <div className="page-heading"><div><span className="eyebrow">{courseDisplayName(courseId,state.language)} · {courseDayCount(plan.length,state.language)}</span><h1>{titles[section]}</h1><p>{section==='plan'?ui.planIntro:ui.dayIntro}</p></div></div>
    {translationNotice&&<p role="note">{translationNotice}</p>}
    {(courseId==='javascript-1'||courseId==='javascript-2')&&<nav className="course-months" aria-label={ui.jsMonths}>{(['javascript-1','javascript-2'] as const).map((id,index)=><Link key={id} href={`/courses/${id}/plan`} aria-current={id===courseId?'page':undefined}><strong>{ui.month} {index+1} · JS{index+1}</strong><span>{index===0?ui.jsBasics:ui.jsApps}</span></Link>)}</nav>}
    {error?<div className="panel course-access-gate"><p role="alert">{accessStatus===401?premium.login:accessStatus===403?premium.required+' '+(requiredTier==='expert'?'Expert':'Pro'):accessStatus===503?premium.unavailable:ui.courseUnavailable}</p>{requiredTier!=='starter'&&<p>{premium.protected}</p>}<div className="button-row">{accessStatus===401&&<Link className="button primary" href="/login">{premium.signIn}</Link>}{accessStatus&&<Link className="button subtle" href="/plans">{premium.plans}</Link>}<button className="button subtle" onClick={()=>{setError(false);setAccessStatus(null);setRetry(n=>n+1);}}>{ui.retry}</button></div></div>:!content?<p role="status">{copy.loading}</p>:<>
      {section==='plan'?<>
        <div className="panel learning-overview"><BookOpen size={22}/><div><h2>{ui.firstFile}</h2><p>{statuses.days.filter(d=>d.status==='done').length} / {plan.length} {ui.completedDays}</p><div className="progress-track"><span style={{width:`${statuses.days.filter(d=>d.status==='done').length/Math.max(1,plan.length)*100}%`}}/></div></div></div>
        <div className="day-card-grid">{statuses.days.map(entry=>entry.status==='upcoming'?<article key={entry.day} className="panel day-card is-locked" aria-label={`${gate.day} ${entry.day}: ${gate.locked}`}><span className="eyebrow">{gate.day} {entry.day}</span><h2>{text(entry.lesson.title)}</h2><p>{gate.locked}</p></article>:<Link prefetch={false} key={entry.day} href={href('home',entry.day)} className={'panel day-card '+(day===entry.day?'is-current':'')+(entry.status==='done'?' is-done':'')+(entry.status==='current'?' is-next':'')} aria-current={day===entry.day?'step':undefined}>
          <div className="between"><span className="eyebrow">{ui.day} {entry.day}</span>{entry.status==='done'?<CheckCircle2 size={18}/>:<span className="badge">{entry.status==='current'?ui.current:entry.day<15?ui.basics:ui.harder}</span>}</div><h2>{text(entry.lesson.title)}</h2><p>{text(entry.lesson.summary)}</p><span className="text-link">{ui.openDay} <ArrowRight size={15}/></span>
        </Link>)}</div>
      </>:section==='answers'?<><label className="course-search">{copy.search}<input value={query} onChange={e=>{setQuery(e.target.value);setLimit(18);}}/></label><div className="panel"><h2>{ui.answersFlow}</h2><p>{ui.answersIntro}</p></div>{library.slice(0,limit).map(item=><article className="panel course-lesson" id={item.id} key={item.id}><h2>{text(item.title)}</h2>{item.questions.map(question=><details key={question.id}><summary>{text(question.question)}</summary><p className="preserve-lines">{text(question.answer)}</p></details>)}<Link className="text-link" href={href('tests',item.day||1)}>{ui.checkYourself} <ArrowRight size={15}/></Link></article>)}{library.length>limit&&<button className="button subtle" onClick={()=>setLimit(n=>n+18)}>{ui.showMore}</button>}</>:<>
        <nav className="day-strip" aria-label={ui.chooseDay}>{statuses.days.map(entry=>entry.status==='upcoming'?<span key={entry.day} className="locked-day" aria-disabled="true" title={gate.locked}>{entry.day}</span>:<Link prefetch={false} key={entry.day} href={href(section,entry.day)} aria-current={day===entry.day?'step':undefined} aria-label={`${ui.day} ${entry.day}`}>{entry.day}</Link>)}</nav>
        <div className="between day-context"><span className="badge">{ui.day} {day}</span><Link className="text-link" href={href('plan')}>{ui.studyPlan} <ArrowRight size={15}/></Link></div>
        {locked?<article className="panel course-lesson" role="status"><h2>{gate.locked}</h2><Link className="button primary" href={href('home',statuses.current?.day ?? 1)}>{gate.open}</Link></article>:lesson?<article className="panel course-lesson" id={lesson.id} key={lesson.id}>
          <h2>{text(lesson.title)}</h2><p>{text(lesson.summary)}</p>
          {section==='home'&&<>{lesson.sections.map((part,index)=><section className="day-explanation" key={index}><h3>{text(part.title)}</h3><p className="preserve-lines">{text(part.body)}</p>{part.code&&<pre><code>{part.code}</code></pre>}</section>)}{lesson.prerequisiteDays?.length?<aside className="lesson-connections"><h3>{ui.connections}</h3><p>{ui.connectionsIntro}</p>{lesson.prerequisiteDays.map(previous=>{const p=plan.find(d=>d.day===previous);return p?<Link key={previous} href={href('home',previous)}>{ui.day} {previous} — {text(p.lesson.title)}</Link>:null;})}</aside>:null}<div className="button-row"><button className="button subtle" disabled={progress.completedTopics.includes(lesson.id)} onClick={()=>state.completeCourseLesson(courseId,lesson.id)}>{progress.completedTopics.includes(lesson.id)?copy.completed:copy.markLearned}</button><Link className="button primary" href={href('practice')}>{ui.dayPractice} <ArrowRight size={16}/></Link><Link className="text-link" href={href('tests')}>{ui.testsInterview}</Link></div></>}
          {section==='practice'&&lesson.practice&&<><Link className="text-link" href={href('home')}>{ui.backExplanation}</Link><CoursePractice courseId={courseId} lesson={lesson}/></>}
          {['tests','interview'].includes(section)&&<><section><h3>1. {ui.tests}</h3><p>{ui.testIntro}</p>{lesson.questions.map(question=><CourseQuestion key={'test'+question.id} courseId={courseId} lesson={lesson} question={question} mode="test"/>)}</section><section className="interview-block"><h3>2. {ui.interview}</h3><p>{ui.interviewIntro}</p>{lesson.questions.map(question=><CourseQuestion key={'interview'+question.id} courseId={courseId} lesson={lesson} question={question} mode="interview"/>)}</section></>}
          <section className="day-confirmation" aria-label={gate.confirm}><p role="status">{entry?.status==='done'?gate.confirmed:canConfirm?gate.ready:gate.missing}</p><div className="button-row"><button className="button primary" disabled={confirming||entry?.status==='done'||!canConfirm} onClick={confirmDay}>{entry?.status==='done'?gate.confirmed:gate.confirm}</button>{entry?.status==='done'&&plan.some(item=>item.day===day+1)&&<Link className="button subtle" href={href('home',day+1)}>{gate.next} {day+1}<ArrowRight size={16}/></Link>}</div>{confirmationError&&<p role="alert">{confirmationError}</p>}</section>
        </article>:<p role="alert">{ui.missingDay}</p>}
      </>}
    </>}
  </section>;
}
function CourseQuestion({courseId,lesson,question,mode}:{courseId:ImportedCourseId;lesson:CourseLesson;question:CourseLesson['questions'][number];mode:'test'|'interview'|'revision'}) {
  const state=useLearningStore(), copy=COPY[state.language], test=mode==='test';
  const saved=state.courses[courseId]?.answers[dateKey()+':'+mode+':'+question.id];
  const [choice,setChoice]=useState<number | null>(null), [answer,setAnswer]=useState('');
  const text=(value:CourseLesson['title'])=>courseText(value,state.contentLanguage);
  return <div className="course-question"><h3>{text(question.question)}</h3>
    {test ? <><div className="course-options">{question.options.map((option,index)=><label key={index}><input type="radio" name={courseId+mode+question.id} checked={saved?saved.answer===String(index):choice===index} disabled={!!saved} onChange={()=>setChoice(index)}/>{text(option)}</label>)}</div><button className="button primary" disabled={!!saved||choice===null} onClick={()=>state.recordCourseAnswer(courseId,{id:question.id,topicId:lesson.id},'test',choice===question.correctIndex,String(choice))}>{copy.check}</button></>
    : <><label>{copy.yourAnswer}<textarea rows={4} value={saved?.answer ?? answer} disabled={!!saved} onChange={event=>setAnswer(event.target.value)}/></label><details><summary>{copy.showAnswer}</summary><p className="preserve-lines">{text(question.answer)}</p><p>{copy.selfCheck}</p><div className="button-row">{[true,false].map(correct=><button key={String(correct)} className="button subtle" disabled={!!saved||!answer.trim()} onClick={()=>state.recordCourseAnswer(courseId,{id:question.id,topicId:lesson.id},mode,correct,answer.trim())}>{correct?copy.remembered:copy.forgotten}</button>)}</div></details></>}
    {saved && <p role="status">{saved.correct?copy.correct:copy.incorrect}</p>}
    {test && saved && <p className="preserve-lines">{text(question.answer)}</p>}
  </div>;
}
