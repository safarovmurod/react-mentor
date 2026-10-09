'use client';
import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowRight, CheckCircle2, Copy, Layers, Code2, Search } from 'lucide-react';
import { LEARNING_TOPICS, getTopic, topicTitle } from '@/content/course';
import { exercisesForTopic, createProjectPrompt, FUNCTION_LABS } from '@/content/practice';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import { tr } from '@/lib/translate';
import { PageHeading } from './page-heading';
import { PracticeWorkspace } from './practice-workspace';
const SourcePractice=dynamic(()=>import('./source-practice').then(module=>module.SourcePractice));
export function PracticeHub({initialMonth,initialTopic,initialDay}:{initialMonth?:number;initialTopic?:string;initialDay?:number}) {
 const state=useLearningStore();const copy=COPY[state.language];const [month,setMonth]=useState(initialMonth===2||getTopic(initialTopic||'')?.month===2||state.activeMonth===2&&!initialMonth?2:1);
 const [topicId,setTopicId]=useState(initialTopic||'');const [exerciseIndex,setExerciseIndex]=useState(0);
 const [selected,setSelected]=useState<string[]>([]);const [query,setQuery]=useState('');const [tab,setTab]=useState('topics');
 const [prompt,setPrompt]=useState('');const [copied,setCopied]=useState(false);const [copyError,setCopyError]=useState('');
 const topic=getTopic(topicId);const exercises=topic?exercisesForTopic(topic,state.contentLanguage):[];const topics=LEARNING_TOPICS.filter(item=>item.month===month&&topicTitle(item,state.language).toLowerCase().includes(query.toLowerCase()));
 function changeMonth(value:number){setMonth(value);state.setPreferences({activeMonth:value});setTopicId('');setExerciseIndex(0);setSelected([]);setPrompt('');setTab('topics');}
 function selectTopic(id:string){setTopicId(id);setExerciseIndex(0);setTab('topics');}
 async function copyPrompt(){try{await navigator.clipboard.writeText(prompt);setCopied(true);setCopyError('');}catch{setCopyError(state.language==='ru'?'Выделите текст и скопируйте вручную.':'Select the text and copy it manually.');}}
 return <><PageHeading title={copy.practice} back={initialDay?`/home?month=${month}&day=${initialDay}`:topic?'/lesson/'+topic.id:'/plan/'+month} subtitle={copy.month+' '+month+(initialDay?' · День '+initialDay:'')}/>
 <div className="month-tabs">{[1,2].map(value=><button className={value===month?'active':''} key={value} onClick={()=>changeMonth(value)}>{copy.month} {value}</button>)}</div>
 <div className="tabs" role="tablist" aria-label={copy.practice}><button role="tab" aria-selected={tab==='topics'} onClick={()=>setTab('topics')}><Code2 size={17}/>{copy.topics}</button><button role="tab" aria-selected={tab==='project'} onClick={()=>setTab('project')}><Layers size={17}/>{copy.project}</button>{month===1&&<button role="tab" aria-selected={tab==='functions'} onClick={()=>{setTab('functions');setExerciseIndex(0);}}>{state.language==='ru'?'Функции: тесты':'Functions: tests'}</button>}{month===2&&<button role="tab" aria-selected={tab==='source'} onClick={()=>setTab('source')}>{state.language==='ru'?'Код из вашего HTML':'Code from your HTML'}</button>}</div>
 {tab==='source'&&month===2&&<SourcePractice/>}
 {tab==='functions'&&month===1&&<><div className="exercise-tabs">{FUNCTION_LABS.map((exercise,index)=><button key={exercise.id} className={index===exerciseIndex?'active':''} onClick={()=>setExerciseIndex(index)}>{index+1}. {tr(exercise.title,state.contentLanguage)}</button>)}</div><PracticeWorkspace key={FUNCTION_LABS[exerciseIndex].id} exercise={FUNCTION_LABS[exerciseIndex]}/></>}
 {tab==='topics'&&(topic?<><div className="section-heading"><h2>{topicTitle(topic,state.language)}</h2><button className="text-button" onClick={()=>setTopicId('')}>{copy.selectTopic}</button></div><div className="exercise-tabs">{exercises.map((exercise,index)=><button key={exercise.id} className={index===exerciseIndex?'active':''} onClick={()=>setExerciseIndex(index)}>{state.completedPractice.includes(exercise.id)?<CheckCircle2 size={16}/>:<span>{index+1}</span>}{tr(exercise.title,state.contentLanguage)}</button>)}</div><PracticeWorkspace key={exercises[exerciseIndex].id} exercise={exercises[exerciseIndex]}/><Link className="text-link" href={'/lesson/'+topic.id}>{copy.openLesson}<ArrowRight size={16}/></Link></>:
 <section className="panel"><div className="search-field"><Search size={17}/><input aria-label={copy.search} value={query} onChange={event=>setQuery(event.target.value)} placeholder={copy.search}/></div><div className="topic-grid">{topics.map(item=><button className="topic-card" key={item.id} onClick={()=>selectTopic(item.id)}><Code2 size={20}/><strong>{topicTitle(item,state.language)}</strong><span>{copy.practiceCount}<ArrowRight size={16}/></span></button>)}</div></section>)}
 {tab==='project'&&<><section className="panel"><div className="section-heading"><div><h2>{copy.project}</h2><p>{copy.selectFive}</p></div><span className="badge">{selected.length} / 5</span></div><div className="topic-picks">{topics.map(item=><label key={item.id}><input type="checkbox" disabled={selected.length===5&&!selected.includes(item.id)} checked={selected.includes(item.id)} onChange={event=>{setSelected(event.target.checked?[...selected,item.id]:selected.filter(id=>id!==item.id));setPrompt('');setCopied(false);}}/>{topicTitle(item,state.language)}</label>)}</div><button className="button primary" disabled={selected.length===0} onClick={()=>{setPrompt(createProjectPrompt(selected,state.language));setCopied(false);}}>{copy.generate}<ArrowRight size={17}/></button></section>{prompt&&<section className="panel"><div className="section-heading"><h2>{copy.prompt}</h2><button className="button subtle" onClick={copyPrompt}><Copy size={16}/>{copied?copy.copied:copy.copy}</button></div><textarea className="prompt-output" aria-label={copy.prompt} readOnly value={prompt} rows={18}/>{copyError&&<p role="alert">{copyError}</p>}</section>}</>}
 </>;
}
