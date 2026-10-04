'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, CheckCircle2, CircleAlert, Eye, MessageSquareText, BookOpen } from 'lucide-react';
import { ALL_QUESTIONS, QUIZ_QUESTIONS, getTopic } from '@/content/course';
import { orderedOptions, dateKey, type StudyMode } from '@/lib/learning';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import { tr } from '@/lib/translate';
import { PageHeading } from './page-heading';
import { QuestionAnswer } from './question-answer';

export interface SessionConfig { mode:StudyMode; daily?:boolean; month?:number; topic?:string; group?:number; review?:boolean }
export function StudySession({config}:{config:SessionConfig}) {
  const state=useLearningStore();const copy=COPY[state.language];const today=dateKey();
  const {ready,ensureDailySet}=state;
  const month=config.month||state.activeMonth;
  const [index,setIndex]=useState(0);
  const [shown,setShown]=useState(config.mode==='learn');
  const [selection,setSelection]=useState('');
  const [draft,setDraft]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [finished,setFinished]=useState(false);
  useEffect(()=>{if(ready&&config.daily)ensureDailySet(month,today);},[ready,config.daily,ensureDailySet,month,today]);
  let questions=config.mode==='interview'?ALL_QUESTIONS:QUIZ_QUESTIONS;
  if(config.daily) {
    const ids=state.dailySets[`${today}-${month}`]||[];
    questions=ids.map(id=>ALL_QUESTIONS.find(question=>question.id===id)!).filter(Boolean);
  } else if(config.topic) questions=questions.filter(question=>question.topicId===config.topic);
  else if(config.group) questions=questions.filter(question=>question.group===config.group);
  if(config.review) questions=questions.filter(question=>state.reviews[question.id]?.due<=today);
  const question=questions[index];
  const record=question?state.answers[`${today}:${config.mode}:${question.id}`]:undefined;
  const back=config.topic?`/lesson/${config.topic}`:'/home';
  const title=config.mode==='test'?copy.tests:config.mode==='interview'?copy.interview:config.mode==='revision'?copy.revision:copy.learnStep;

  function move(nextIndex:number) {
    if(nextIndex>=questions.length){setFinished(true);return;}
    setIndex(nextIndex);setShown(config.mode==='learn');setSelection('');setDraft('');setError('');
  }
  async function handleCheck() {
    if(!question||!selection||record||busy)return;
    setBusy(true);setError('');
    try {
      const response=await fetch('/api/quiz/check',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({questionId:question.id,answer:selection})});
      if(!response.ok)throw new Error(state.language==='ru'?'Проверка недоступна. Попробуйте ещё раз.':'Check unavailable. Please retry.');
      const result=await response.json();
      state.recordAnswer(question,config.mode,result.correct,selection,today);
      setShown(true);
    } catch(caught) {setError(caught instanceof Error?caught.message:'Error');}
    finally {setBusy(false);}
  }
  function assess(correct:boolean) {
    if(!question||record)return;
    state.recordAnswer(question,config.mode,correct,draft,today);
  }
  if(!state.ready)return <p className="loading-state">{copy.loading}</p>;
  if(!question)return <><PageHeading title={title} back={back}/><div className="panel empty-state">{copy.empty}<Link className="button subtle" href="/plan">{copy.plan}</Link></div></>;
  if(finished) {
    const records=questions.map(item=>state.answers[`${today}:${config.mode}:${item.id}`]).filter(Boolean);
    const correct=records.filter(item=>item.correct).length;
    return <><PageHeading title={copy.sessionDone} back={back}/><section className="panel session-complete"><CheckCircle2 size={40}/><h2>{config.mode==='learn'?`${questions.filter(item=>state.studied.includes(item.id)).length} / ${questions.length} ${copy.learned.toLowerCase()}`:`${correct} / ${records.length} ${copy.correct.toLowerCase()}`}</h2><div className="button-row"><Link className="button primary" href={`/tests?daily=1&month=${month}`}>{copy.tests}<ArrowRight size={17}/></Link><Link className="button subtle" href={`/interview?daily=1&month=${month}`}>{copy.interview}</Link><button className="button subtle" onClick={()=>{setFinished(false);move(0);}}>{copy.retry}</button></div></section></>;
  }
  return <div className="session-width"><PageHeading title={title} back={back} subtitle={`${copy.question} ${index+1} / ${questions.length}`}><Link className="button subtle" href={`/lesson/${question.topicId}`}><BookOpen size={16}/>{copy.openLesson}</Link></PageHeading>
    <div className="session-progress"><div className="progress-track"><span style={{width:`${(index+1)/questions.length*100}%`}}/></div><span>{getTopic(question.topicId)?.[state.language==='ru'?'titleRu':'title']}</span></div>
    <section className="panel question-panel"><span className="eyebrow">{copy.question} {String(index+1).padStart(2,'0')}</span><h2 lang={state.contentLanguage}>{tr(question.question,state.contentLanguage)}</h2>
      {(config.mode==='test'||config.mode==='revision')&&<div className="answer-options">{orderedOptions(question).map((option,optionIndex)=>{
        const chosen=(record?.answer||selection)===option;
        let status='';if(record)status=option===question.answer?'correct':chosen?'incorrect':'';
        return <button key={option} className={`answer-option ${chosen?'selected':''} ${status}`} disabled={Boolean(record)||busy} onClick={()=>setSelection(option)}><span className="option-letter">{String.fromCharCode(65+optionIndex)}</span><span lang={state.contentLanguage}>{tr(option,state.contentLanguage)}</span></button>;
      })}</div>}
      {config.mode==='interview'&&<label className="answer-input"><span>{copy.yourAnswer}</span><textarea rows={5} value={record?.answer??draft} readOnly={Boolean(record)} onChange={event=>setDraft(event.target.value)} placeholder={state.contentLanguage==='ru'?'Объясни своими словами…':state.contentLanguage==='en'?'Explain in your own words…':'Бо суханҳои худат фаҳмон…'}/></label>}
      {config.mode==='interview'&&!shown&&!record&&<button className="button primary" disabled={!draft.trim()} onClick={()=>setShown(true)}><MessageSquareText size={17}/>{copy.compare}</button>}
      {config.mode==='learn'&&!shown&&<button className="button subtle" onClick={()=>setShown(true)}><Eye size={16}/>{copy.showAnswer}</button>}
      {(shown||record)&&<div className="revealed-answer">{record&&<div className={`result-label ${record.correct?'success-text':'warning-text'}`}>{record.correct?<CheckCircle2 size={19}/>:<CircleAlert size={19}/>} {record.correct?copy.correct:copy.incorrect}</div>}<QuestionAnswer question={question}/></div>}
      {config.mode==='interview'&&shown&&!record&&<div className="self-check"><p>{copy.selfCheck}</p><div className="button-row"><button className="button primary" onClick={()=>assess(true)}>{copy.remembered}</button><button className="button subtle" onClick={()=>assess(false)}>{copy.forgotten}</button></div></div>}
      {error&&<p className="error-message" role="alert">{error}</p>}
      <div className="session-actions"><button className="button subtle" disabled={index===0} onClick={()=>move(index-1)}><ArrowLeft size={17}/>{copy.previous}</button><div className="button-row">
        {config.mode==='learn'&&<button className="button primary" onClick={()=>{state.markStudied(question.id);move(index+1);}}>{state.studied.includes(question.id)?copy.next:copy.markLearned}<ArrowRight size={17}/></button>}
        {(config.mode==='test'||config.mode==='revision')&&!record&&<button className="button primary" disabled={!selection||busy} onClick={handleCheck}>{busy?copy.loading:copy.check}</button>}
        {config.mode!=='learn'&&record&&<button className="button primary" onClick={()=>move(index+1)}>{index+1===questions.length?copy.finish:copy.next}<ArrowRight size={17}/></button>}
      </div></div>
    </section>
  </div>;
}
