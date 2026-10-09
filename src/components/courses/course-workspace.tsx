'use client';
import Link from 'next/link';
import { useDeferredValue, useEffect, useState, useSyncExternalStore } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Layers } from 'lucide-react';
import { courseName } from '@/content/courses/catalog';
import { courseContentSchema, courseText, type CourseContent, type CourseLesson } from '@/lib/courses/schema';
import type { ImportedCourseId } from '@/lib/courses/ids';
import { emptyCourseProgress } from '@/lib/account/progress';
import { dateKey } from '@/lib/learning';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import { LEARNING_UI_COPY } from '@/lib/learning-ui-copy';
import { useAppStore } from '@/stores/app-store';
import { courseDayProgress, courseMonthPlan } from '@/lib/courses/plan';

const empty = emptyCourseProgress();
const PREPARATION:Record<ImportedCourseId,{title:string;description:string;example:string;steps:string[]}> = {
  html:{title:'HTML + CSS',description:'Этот курс начинается с настоящего первого урока.',example:'',steps:[]},
  css:{title:'Введение в CSS',description:'CSS меняет вид HTML: цвет, размер, отступы и расположение.',example:'h1 { color: #4338ca; }',steps:['Создайте отдельный index.html.', 'Подключите styles.css через link.', 'Напишите одно CSS-правило и обновите страницу.']},
  'javascript-1':{title:'JavaScript с нуля: Day 0',description:'JavaScript добавляет странице поведение. В отличие от HTML (содержание) и CSS (оформление), JavaScript выполняет команды и реагирует на события.',example:'// script.js\nconsole.log("Привет, JavaScript!");',steps:['Создайте папку с index.html и script.js.', 'Подключите script.js через <script type="module" src="script.js"></script>.', 'Откройте DevTools → Console, обновите страницу и найдите сообщение.', 'Объясните разницу между HTML, CSS и JavaScript.']},
  'javascript-2':{title:'Клиент, сервер и API: Day 0',description:'Браузер отправляет запрос серверу. Сервер отвечает статусом и данными. До CRUD повторим async/await, Promise и HTTP.',example:'async function loadCourses() {\n  const response = await fetch("/api/courses");\n  if (!response.ok) throw new Error("HTTP " + response.status);\n  return response.json();\n}',steps:['Откройте уже работающий учебный сайт.', 'Вспомните Promise и async/await из JS1.', 'Откройте DevTools → Network и посмотрите запрос к /api/courses.', 'Сравните HTTP status и реальные поля response. Не придумывайте адреса API.']},
  nextjs:{title:'Подготовка к Next.js',description:'Это самостоятельный курс. Перед началом освойте React: компоненты, props, hooks, роутинг и запросы.',example:'// app/page.tsx\nexport default function Home() {\n  return <h1>Next.js</h1>;\n}',steps:['Повторите React и маршрутизацию.', 'Создайте отдельный учебный проект Next.js.', 'Разберите папку app, page.tsx и layout.tsx.', 'Перейдите к первому дню учебного плана.']},
  git:{title:'Git и GitHub: Day 0',description:'Git хранит историю версий на компьютере; GitHub позволяет хранить репозиторий онлайн и работать вместе.',example:'git init\ngit status',steps:['Создайте отдельную учебную папку. Не используйте production-репозиторий для эксперимента.', 'Откройте терминал в этой папке.', 'Выполните git init и git status.', 'Объясните, что изменилось, и зачем нужен commit.']},
  cpp:{title:'C++ с нуля: Day 0',description:'C++ — компилируемый язык. В отличие от JavaScript, сначала нужна компиляция, а потом запуск программы.',example:'#include <iostream>\nint main() {\n  std::cout << "Hello!\\n";\n}',steps:['Создайте отдельную папку и файл main.cpp.', 'Проверьте наличие компилятора C++.', 'Скомпилируйте исходный файл и запустите программу.', 'Найдите в примере точку входа main и объясните cout.']}
};
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
  const state=useLearningStore(), copy=COPY[state.language], ui=LEARNING_UI_COPY[state.language];
  const progress=state.courses[courseId] || empty;
  const preparation=PREPARATION[courseId];
  const legacyId=useSyncExternalStore(subscribeHash,readHash,()=> '');
  const [content,setContent]=useState<CourseContent|null>(initialContent || null);
  const [error,setError]=useState(false), [retry,setRetry]=useState(0), [query,setQuery]=useState(''), [limit,setLimit]=useState(18);
  const deferredQuery=useDeferredValue(query.trim().toLowerCase());
  const {selectedCourse,courseChosen,chooseCourse}=state;
  useEffect(()=>{if(selectedCourse!==courseId||!courseChosen){chooseCourse(courseId);useAppStore.setState({sidebarOpen:false,tutorDrawerOpen:false,tutorQuestion:null});}},[courseId,selectedCourse,courseChosen,chooseCourse]);
  useEffect(()=>{
    if(initialContent) return;
    const controller=new AbortController();
    fetch('/api/courses/'+courseId,{signal:controller.signal}).then(async response=>{if(!response.ok)throw Error('Unavailable'); const value=courseContentSchema.parse(await response.json());if(!controller.signal.aborted){setContent(value);setError(false);}}).catch(()=>{if(!controller.signal.aborted)setError(true);});
    return ()=>controller.abort();
  },[courseId,retry,initialContent]);
  const plan=courseMonthPlan(content?.lessons || []);
  const statuses=courseDayProgress(plan,progress.completedTopics,progress.completedPractice);
  // The HTML+CSS plan changed from 1..30 to 0..29. Keep old draft selections intact.
  const selectedDayKey=courseId==='html'?'selected-day-v2':'selected-day';
  const savedDay=progress.drafts[selectedDayKey];
  const legacyDay=progress.drafts['selected-day'];
  const remembered=savedDay!==undefined?Number(savedDay):courseId==='html'&&legacyDay!==undefined?Math.max(0,Number(legacyDay)-1):Number(legacyDay);
  const validRemembered=courseId==='html'?(Number.isInteger(remembered)&&remembered>=0&&remembered<=29):(Number.isInteger(remembered)&&remembered>=1&&remembered<=30);
  const day=requestedDay!==undefined?requestedDay:(validRemembered?remembered:(statuses.current?.day ?? (courseId==='html'?0:1)));
  const item=plan.find(item=>item.day===day), lesson=(legacyId?content?.lessons.find(lesson=>lesson.id===legacyId):null)||item?.lesson;
  const text=(value:CourseLesson['title'])=>courseText(value,state.contentLanguage);
  const href=(target:string,targetDay=day)=>`/courses/${courseId}/${target}?day=${targetDay}`;
  const saveCourseDraft=state.saveCourseDraft;
  useEffect(()=>{if(day>=0&&day<=30&&progress.drafts[selectedDayKey]!==String(day))saveCourseDraft(courseId,selectedDayKey,String(day));},[courseId,day,progress.drafts,saveCourseDraft,selectedDayKey]);
  const library=(content?.lessons || []).filter(item=>!deferredQuery||[text(item.title),text(item.summary),...item.questions.flatMap(q=>[text(q.question),text(q.answer)]),...item.sections.map(s=>text(s.body))].join(' ').toLowerCase().includes(deferredQuery));
  const titles:Record<string,string>={home:copy.home,plan:copy.plan,practice:copy.practice,tests:ui.testsInterview,interview:ui.testsInterview,answers:ui.answersInterview};
  return <section className="course-workspace">
    <Link href="/courses" className="back-link"><Layers size={16}/>{ui.allCourses}</Link>
    <div className="page-heading"><div><span className="eyebrow">{courseName(courseId)} · {ui.oneMonth}</span><h1>{titles[section]}</h1><p>{section==='plan'?ui.planIntro:ui.dayIntro}</p></div></div>
    {(courseId==='javascript-1'||courseId==='javascript-2')&&<nav className="course-months" aria-label={ui.jsMonths}>{(['javascript-1','javascript-2'] as const).map((id,index)=><Link key={id} href={`/courses/${id}/plan`} aria-current={id===courseId?'page':undefined}><strong>{ui.month} {index+1} · JS{index+1}</strong><span>{index===0?ui.jsBasics:ui.jsApps}</span></Link>)}</nav>}
    {error?<div className="panel"><p role="alert">{ui.courseUnavailable}</p><button className="button subtle" onClick={()=>{setError(false);setRetry(n=>n+1);}}>{ui.retry}</button></div>:!content?<p role="status">{copy.loading}</p>:<>
      {state.contentLanguage!=='ru'&&courseId!=='html'&&(section==='plan'||day===0&&section!=='answers')
        ?<p role="note">{ui.preparationFallback}</p>
        :state.contentLanguage==='en'&&hasEnglishFallback(content)?<p role="note">{ui.contentFallback}</p>:null}
      {section==='plan'?<>
        <div className="panel learning-overview"><BookOpen size={22}/><div><h2>{ui.firstFile}</h2><p>{statuses.days.filter(d=>d.status==='done').length} / {plan.length} {ui.completedDays}</p><div className="progress-track"><span style={{width:`${statuses.days.filter(d=>d.status==='done').length/Math.max(1,plan.length)*100}%`}}/></div></div></div>
        <div className="day-card-grid">{courseId!=='html'&&<Link href={href('home',0)} className={'panel day-card '+(day===0?'is-current':'')}><span className="eyebrow">{ui.day} 0</span><h2 lang="ru">{preparation.title}</h2><p lang="ru">{preparation.description}</p><span className="text-link">{ui.startZero} <ArrowRight size={15}/></span></Link>}{statuses.days.map(entry=><Link prefetch={false} key={entry.day} href={href('home',entry.day)} className={'panel day-card '+(day===entry.day?'is-current':'')+(entry.status==='done'?' is-done':'')+(entry.status==='current'?' is-next':'')} aria-current={day===entry.day?'step':undefined}>
          <div className="between"><span className="eyebrow">{ui.day} {entry.day}</span>{entry.status==='done'?<CheckCircle2 size={18}/>:<span className="badge">{entry.status==='current'?ui.current:entry.day<15?ui.basics:ui.harder}</span>}</div><h2>{text(entry.lesson.title)}</h2><p>{text(entry.lesson.summary)}</p><span className="text-link">{ui.openDay} <ArrowRight size={15}/></span>
        </Link>)}</div>
      </>:section==='answers'?<><label className="course-search">{copy.search}<input value={query} onChange={e=>{setQuery(e.target.value);setLimit(18);}}/></label><div className="panel"><h2>{ui.answersFlow}</h2><p>{ui.answersIntro}</p></div>{library.slice(0,limit).map(item=><article className="panel course-lesson" id={item.id} key={item.id}><h2>{text(item.title)}</h2>{item.questions.map(question=><details key={question.id}><summary>{text(question.question)}</summary><p className="preserve-lines">{text(question.answer)}</p></details>)}<Link className="text-link" href={href('tests',item.day||1)}>{ui.checkYourself} <ArrowRight size={15}/></Link></article>)}{library.length>limit&&<button className="button subtle" onClick={()=>setLimit(n=>n+18)}>{ui.showMore}</button>}</>:<>
        <nav className="day-strip" aria-label={ui.chooseDay}>{courseId!=='html'&&<Link href={href(section,0)} aria-current={day===0?'step':undefined}>0</Link>}{plan.map(entry=><Link prefetch={false} key={entry.day} href={href(section,entry.day)} aria-current={day===entry.day?'step':undefined} aria-label={`${ui.day} ${entry.day}`}>{entry.day}</Link>)}</nav>
        <div className="between day-context"><span className="badge">{ui.day} {day} · {lesson?text(lesson.title):ui.preparation}</span><Link className="text-link" href={href('plan')}>{ui.studyPlan} <ArrowRight size={15}/></Link></div>
        {day===0&&courseId!=='html'?<article className="panel course-lesson"><h2 lang="ru">{preparation.title}</h2><p lang="ru">{preparation.description}</p><pre><code>{preparation.example}</code></pre><ol className="lesson-checklist" lang="ru">{preparation.steps.map(step=><li key={step}>{step}</li>)}</ol><Link className="button primary" href={href('home',1)}>{ui.goDayOne} <ArrowRight size={16}/></Link></article>:lesson?<article className="panel course-lesson" id={lesson.id} key={lesson.id}>
          <h2>{text(lesson.title)}</h2><p>{text(lesson.summary)}</p>
          {section==='home'&&<>{lesson.sections.map((part,index)=><section className="day-explanation" key={index}><h3>{text(part.title)}</h3><p className="preserve-lines">{text(part.body)}</p>{part.code&&<pre><code>{part.code}</code></pre>}</section>)}{lesson.prerequisiteDays?.length?<aside className="lesson-connections"><h3>{ui.connections}</h3><p>{ui.connectionsIntro}</p>{lesson.prerequisiteDays.map(previous=>{const p=plan.find(d=>d.day===previous);return p?<Link key={previous} href={href('home',previous)}>{ui.day} {previous} — {text(p.lesson.title)}</Link>:null;})}</aside>:null}<div className="button-row"><button className="button subtle" disabled={progress.completedTopics.includes(lesson.id)} onClick={()=>state.completeCourseLesson(courseId,lesson.id)}>{progress.completedTopics.includes(lesson.id)?copy.completed:copy.markLearned}</button><Link className="button primary" href={href('practice')}>{ui.dayPractice} <ArrowRight size={16}/></Link><Link className="text-link" href={href('tests')}>{ui.testsInterview}</Link></div></>}
          {section==='practice'&&lesson.practice&&<><Link className="text-link" href={href('home')}>{ui.backExplanation}</Link><CoursePractice courseId={courseId} lesson={lesson}/></>}
          {['tests','interview'].includes(section)&&<><section><h3>1. {ui.tests}</h3><p>{ui.testIntro}</p>{lesson.questions.map(question=><CourseQuestion key={'test'+question.id} courseId={courseId} lesson={lesson} question={question} mode="test"/>)}</section><section className="interview-block"><h3>2. {ui.interview}</h3><p>{ui.interviewIntro}</p>{lesson.questions.map(question=><CourseQuestion key={'interview'+question.id} courseId={courseId} lesson={lesson} question={question} mode="interview"/>)}</section></>}
          {plan.some(entry=>entry.day===day+1)&&<Link className="text-link next-day" href={href('home',day+1)}>{ui.nextDay} {day+1} <ArrowRight size={16}/></Link>}
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

function CoursePractice({courseId,lesson}:{courseId:ImportedCourseId;lesson:CourseLesson}) {
  const state=useLearningStore(), copy=COPY[state.language], ui=LEARNING_UI_COPY[state.language], practice=lesson.practice!;
  const [checks,setChecks]=useState<number[]>([]);
  const code=state.courses[courseId]?.drafts[lesson.id] ?? '';
  const [preview,setPreview]=useState<string | null>(null);
  const completed=state.courses[courseId]?.completedPractice.includes(lesson.id);
  return <div className="course-question"><p className="preserve-lines">{courseText(practice.task,state.contentLanguage)}</p><details><summary>{copy.hint}</summary><p>{courseText(practice.hint,state.contentLanguage)}</p></details><details><summary>{copy.solution}</summary><pre><code>{practice.solution}</code></pre></details><label htmlFor={lesson.id+'-code'}>{ui.yourCode}</label><textarea id={lesson.id+'-code'} className="practice-editor" rows={12} value={code} onChange={event=>state.saveCourseDraft(courseId,lesson.id,event.target.value)} spellCheck={false}/>{courseId==='html'&&<><button className="button subtle" disabled={!code.trim()} onClick={()=>setPreview(code)}>{ui.showHtml}</button>{preview!==null&&<iframe title={ui.htmlResult} className="html-preview" sandbox="" srcDoc={preview}/>}</>}<p>{copy.manualHint}</p>{practice.criteria.map((criterion,index)=><label className="course-criterion" key={index}><input type="checkbox" checked={!!completed||checks.includes(index)} disabled={completed} onChange={event=>setChecks(event.target.checked?[...checks,index]:checks.filter(value=>value!==index))}/>{courseText(criterion,state.contentLanguage)}</label>)}<button className="button subtle" disabled={completed||checks.length!==practice.criteria.length} onClick={()=>state.completeCoursePractice(courseId,lesson.id)}>{completed?copy.completed:copy.manual}</button></div>;
}
