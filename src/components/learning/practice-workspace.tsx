'use client';
import { useState } from 'react';
import { CheckCircle2, RotateCcw, Play, FileCode2 } from 'lucide-react';
import type { PracticeExercise } from '@/content/practice';
import { runFunction, type FunctionResult } from '@/lib/grading/function-runner';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import { tr } from '@/lib/translate';
import { CodeEditor } from './code-editor';
export function PracticeWorkspace({exercise}:{exercise:PracticeExercise}) {
 const state=useLearningStore();const copy=COPY[state.language];const lang=state.contentLanguage;
 const [checked,setChecked]=useState<string[]>([]);const [results,setResults]=useState<FunctionResult[]>([]);
 const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 const [taskOpen,setTaskOpen]=useState(true);
 const code=state.drafts[exercise.id]??exercise.starter;
 async function handleRun() {
  if(!exercise.functionName||!exercise.tests)return;
  const storageName=useLearningStore.persist.getOptions().name;
  const current=()=>useLearningStore.persist.getOptions().name===storageName&&(useLearningStore.getState().drafts[exercise.id]??exercise.starter)===code;
  setBusy(true);setError('');setResults([]);
  try {const result=await runFunction(code,exercise.functionName,exercise.tests);if(!current())return;setResults(result);if(result.length===exercise.tests.length&&result.every(item=>item.passed))state.completePractice(exercise.id,true);}
  catch(caught){if(current())setError(caught instanceof Error?caught.message:'Error');}
  finally{setBusy(false);}
 }
 return <><button className="button subtle practice-task-toggle" aria-expanded={taskOpen} onClick={()=>setTaskOpen(value=>!value)}>{copy.task} {taskOpen?'−':'+'}</button><div className="practice-workspace" style={taskOpen?undefined:{gridTemplateColumns:'minmax(0,1fr)'}}>{taskOpen&&<section className="panel task-spec"><span className="eyebrow">{copy.task}</span><h2>{tr(exercise.title,lang)}</h2><p lang={lang}>{tr(exercise.task,lang)}</p>
 <h3>{copy.files}</h3><ul className="file-list">{exercise.files.map(file=><li key={file}><FileCode2 size={15}/><code>{file}</code></li>)}</ul>
 <details className="hint-box"><summary>{copy.hint}</summary><p className="preserve-lines" lang={lang}>{tr(exercise.hint,lang)}</p></details>
 <h3>{copy.criteria}</h3><div className="checklist">{exercise.criteria.map(item=><label key={item}><input type="checkbox" checked={checked.includes(item)} onChange={event=>setChecked(event.target.checked?[...checked,item]:checked.filter(value=>value!==item))}/><span lang={lang}>{tr(item,lang)}</span></label>)}</div>
 {!exercise.tests&&<><p className="muted small">{copy.manualHint}</p><button className="button primary full-width" disabled={checked.length!==exercise.criteria.length||state.completedPractice.includes(exercise.id)} onClick={()=>state.completePractice(exercise.id,false)}><CheckCircle2 size={17}/>{state.completedPractice.includes(exercise.id)?copy.completed:copy.manual}</button></>}
 </section>}<section className="editor-panel"><div className="editor-header"><span><FileCode2 size={16}/>{exercise.files[0]}</span><button className="icon-button" aria-label={copy.reset} onClick={()=>{state.saveDraft(exercise.id,exercise.starter);setResults([]);setError('');}}><RotateCcw size={16}/></button></div><CodeEditor label={copy.code} path={exercise.id+'/'+exercise.files[0]} value={code} onChange={value=>{state.saveDraft(exercise.id,value);setResults([]);setError('');}}/>
 <div className="editor-footer"><span>{state.drafts[exercise.id]!==undefined?copy.saved:'TypeScript / React'}</span>{exercise.tests&&<button className="button primary" disabled={busy} onClick={handleRun}><Play size={16}/>{busy?copy.loading:copy.run}</button>}</div>
 {error&&<p className="error-message" role="alert">{error}</p>}
 {results.length>0&&<div className="test-results" aria-live="polite">{results.map((result,index)=><div className={result.passed?'success-text':'warning-text'} key={index}><strong>{result.passed?'✓':'×'} {result.name}</strong>{!result.passed&&<p>{result.error||'Expected: '+JSON.stringify(result.expected)+' · Actual: '+JSON.stringify(result.actual)}</p>}</div>)}</div>}
 <details className="solution"><summary>{copy.solution}</summary><pre><code>{exercise.solution}</code></pre></details></section></div></>;
}
