'use client';

import Link from 'next/link';
import { useDeferredValue, useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Download, FileText, Layers } from 'lucide-react';
import { courseName } from '@/content/courses/catalog';
import { courseContentSchema, courseText, type CourseContent, type CourseLesson } from '@/lib/courses/schema';
import type { ImportedCourseId } from '@/lib/courses/ids';
import { emptyCourseProgress } from '@/lib/account/progress';
import { dateKey } from '@/lib/learning';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import { useAppStore } from '@/stores/app-store';

const empty = emptyCourseProgress();
export function CourseWorkspace({courseId, section}:{courseId:ImportedCourseId;section:string}) {
  const state = useLearningStore();
  const {selectedCourse,courseChosen,chooseCourse}=state;
  const progress = state.courses[courseId] || empty;
  const copy = COPY[state.language], ru = state.language === 'ru';
  const [content, setContent] = useState<CourseContent | null>(null);
  const [error, setError] = useState(false), [retry, setRetry] = useState(0);
  const [query, setQuery] = useState(''), [level, setLevel] = useState('all'), [limit, setLimit] = useState(24);
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase());
  useEffect(() => {
    if (selectedCourse !== courseId || !courseChosen) {
      useAppStore.setState({tutorDrawerOpen:false,tutorQuestion:null,sidebarOpen:false});
      chooseCourse(courseId);
    }
  }, [courseId, selectedCourse, courseChosen, chooseCourse]);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/courses/' + courseId, {signal:controller.signal}).then(async response => {
      if (!response.ok) throw new Error('Unavailable');
      const data = courseContentSchema.parse(await response.json());
      if (!controller.signal.aborted) {setContent(data);setError(false);}
    }).catch(() => {if (!controller.signal.aborted) setError(true);});
    return () => controller.abort();
  }, [courseId, retry]);
  const titles:Record<string,string> = {home:copy.home,plan:copy.plan,answers:copy.answers,practice:copy.practice,tests:copy.tests,interview:copy.interview,revision:copy.revision,'weak-topics':copy.weak};
  let lessons = (content?.lessons || []).filter(lesson =>
    (level === 'all' || lesson.level === level) &&
    (!deferredQuery || [lesson.title,lesson.summary,...lesson.questions.flatMap(question=>[question.question,question.answer])]
      .some(text=>courseText(text,state.contentLanguage).toLocaleLowerCase().includes(deferredQuery))));
  if (section === 'practice') lessons = lessons.filter(lesson=>lesson.practice);
  if (section === 'weak-topics') lessons = lessons.filter(lesson=>Object.values(progress.answers).some(answer=>answer.topicId===lesson.id&&!answer.correct));
  if (section === 'revision') lessons = lessons.filter(lesson=>Object.values(progress.reviews).some(review=>review.topicId===lesson.id&&review.due<=dateKey()));
  const dailyLessons = lessons.filter(lesson=>!progress.completedTopics.includes(lesson.id)).slice(0,state.dailyLimit);
  const visible = (section === 'home' ? dailyLessons : lessons).slice(0,limit);
  return <section className="course-workspace">
    <Link href="/courses" className="back-link"><Layers size={16}/>{ru?'Все курсы':'All courses'}</Link>
    <div className="page-heading"><div><span className="eyebrow">{courseName(courseId)}</span><h1>{titles[section]}</h1><p>{ru?'Материалы, практика и прогресс этого курса.':'This course’s materials, practice and progress.'}</p></div></div>
    <p className="course-material-link"><Link href="/courses/materials" className="text-link">{ru?'Исходные материалы канала':'Original channel materials'}<ArrowRight size={16}/></Link></p>
    {error ? <div className="panel empty-state"><p role="alert">{ru?'Не удалось загрузить материалы. Проверьте интернет.':'Could not load materials. Check your connection.'}</p><button className="button subtle" onClick={()=>{setError(false);setRetry(value=>value+1);}}>{ru?'Повторить':'Retry'}</button></div>
    : !content ? <p role="status">{copy.loading}</p>
    : !content.lessons.length ? <div className="panel course-waiting"><FileText size={32}/><h2>{ru?'Материалы ожидаются':'Waiting for materials'}</h2><p>{ru?'Уроки этого курса ещё не добавлены. После обработки материалов канала здесь появятся разборы, ответы, тесты и практика.':'Lessons have not been added yet. Channel materials will provide explanations, answers, quizzes and practice.'}</p><Link href="/courses" className="button primary">{ru?'Выбрать доступный курс':'Choose an available course'}<ArrowRight size={17}/></Link><Link href="/notes" className="text-link">{ru?'Открыть заметки этого курса':'Open this course’s notes'}</Link></div>
    : <>
      {section==='home' && <div className="course-route panel"><BookOpen size={22}/><div><strong>{progress.completedTopics.length} / {content.lessons.length} {copy.topics.toLowerCase()}</strong><p>{ru?'Сначала изучите разбор и ответы, затем переходите к тестам и практике.':'Study the explanation and answers, then take quizzes and practice.'}</p></div></div>}
      <div className="course-filters"><label>{copy.search}<input value={query} onChange={event=>{setQuery(event.target.value);setLimit(24);}}/></label><label>{ru?'Сложность':'Level'}<select value={level} onChange={event=>{setLevel(event.target.value);setLimit(24);}}><option value="all">{copy.all}</option><option value="beginner">{ru?'Начальный':'Beginner'}</option><option value="intermediate">{ru?'Продолжение':'Intermediate'}</option></select></label></div>
      {!visible.length && <div className="panel empty-state"><p>{section==='revision'?(ru?'Повторение пока не требуется.':'No reviews due yet.'):section==='weak-topics'?(ru?'Пока нет ответов, которые нужно разобрать повторно.':'No answers to revisit yet.'):section==='home'?(ru?'Все темы отмечены изученными. Можно перейти к повторению.':'All topics are marked as studied. Continue with review.'):copy.empty}</p></div>}
      <div className="course-lessons">{visible.map(lesson=><article className="panel course-lesson" id={lesson.id} key={lesson.id}>
        <h2>{courseText(lesson.title,state.contentLanguage)}</h2><p>{courseText(lesson.summary,state.contentLanguage)}</p>
        {['home','plan','answers'].includes(section) && <>
          {lesson.sections.map((part,index)=><details key={index} open={index===0}><summary>{courseText(part.title,state.contentLanguage)}</summary><p className="preserve-lines">{courseText(part.body,state.contentLanguage)}</p>{part.code && <pre><code>{part.code}</code></pre>}{part.output && <p className="preserve-lines"><strong>{ru?'Результат: ':'Result: '}</strong>{courseText(part.output,state.contentLanguage)}</p>}</details>)}
          {lesson.questions.map(question=><details key={question.id}><summary>{courseText(question.question,state.contentLanguage)}</summary><p className="preserve-lines">{courseText(question.answer,state.contentLanguage)}</p></details>)}
          <button className="button subtle" disabled={progress.completedTopics.includes(lesson.id)} onClick={()=>state.completeCourseLesson(courseId,lesson.id)}>{progress.completedTopics.includes(lesson.id)?copy.completed:copy.markLearned}</button>
        </>}
        {['tests','interview','revision','weak-topics'].includes(section) && lesson.questions.map(question=><CourseQuestion key={question.id} courseId={courseId} lesson={lesson} question={question} mode={section==='tests'?'test':section==='interview'?'interview':'revision'}/>)}
        {section==='practice' && lesson.practice && <CoursePractice courseId={courseId} lesson={lesson}/>}
        <div className="course-sources">{lesson.sourceIds.map(id=>{const source=content.sources.find(item=>item.id===id)!;return <a key={id} href={source.url} target="_blank" rel="noreferrer">{copy.source}: {source.title}{source.page?' · '+source.page:''}</a>;})}</div>
      </article>)}</div>
      {lessons.length>limit && section!=='home' && <button className="button subtle" onClick={()=>setLimit(value=>value+24)}>{ru?'Показать ещё':'Show more'}</button>}
    </>}
    {content && content.files.length>0 && <section className="panel course-files"><h2>{copy.files}</h2>{content.files.map(file=><a className="text-link" key={file.id} href={file.url} download={file.title}><Download size={17}/>{file.title}<small>{(file.bytes/1024/1024).toFixed(1)} MB</small></a>)}</section>}
  </section>;
}

function CourseQuestion({courseId,lesson,question,mode}:{courseId:ImportedCourseId;lesson:CourseLesson;question:CourseLesson['questions'][number];mode:'test'|'interview'|'revision'}) {
  const state=useLearningStore(), copy=COPY[state.language], test=mode==='test';
  const saved=state.courses[courseId]?.answers[dateKey()+':'+mode+':'+question.id];
  const [choice,setChoice]=useState<number | null>(null), [answer,setAnswer]=useState('');
  const text=(value:CourseLesson['title'])=>courseText(value,state.contentLanguage);
  return <div className="course-question"><h3>{text(question.question)}</h3>
    {test ? <><div className="course-options">{question.options.map((option,index)=><label key={index}><input type="radio" name={courseId+question.id} checked={saved?saved.answer===String(index):choice===index} disabled={!!saved} onChange={()=>setChoice(index)}/>{text(option)}</label>)}</div><button className="button primary" disabled={!!saved||choice===null} onClick={()=>state.recordCourseAnswer(courseId,{id:question.id,topicId:lesson.id},'test',choice===question.correctIndex,String(choice))}>{copy.check}</button></>
    : <><label>{copy.yourAnswer}<textarea rows={4} value={saved?.answer ?? answer} disabled={!!saved} onChange={event=>setAnswer(event.target.value)}/></label><details><summary>{copy.showAnswer}</summary><p className="preserve-lines">{text(question.answer)}</p><p>{copy.selfCheck}</p><div className="button-row">{[true,false].map(correct=><button key={String(correct)} className="button subtle" disabled={!!saved||!answer.trim()} onClick={()=>state.recordCourseAnswer(courseId,{id:question.id,topicId:lesson.id},mode,correct,answer.trim())}>{correct?copy.remembered:copy.forgotten}</button>)}</div></details></>}
    {saved && <p role="status">{saved.correct?copy.correct:copy.incorrect}</p>}
    {test && saved && <p className="preserve-lines">{text(question.answer)}</p>}
  </div>;
}

function CoursePractice({courseId,lesson}:{courseId:ImportedCourseId;lesson:CourseLesson}) {
  const state=useLearningStore(), copy=COPY[state.language], practice=lesson.practice!;
  const [checks,setChecks]=useState<number[]>([]);
  const completed=state.courses[courseId]?.completedPractice.includes(lesson.id);
  return <div className="course-question"><p className="preserve-lines">{courseText(practice.task,state.contentLanguage)}</p><details><summary>{copy.hint}</summary><p>{courseText(practice.hint,state.contentLanguage)}</p></details><details><summary>{copy.solution}</summary><pre><code>{practice.solution}</code></pre></details><p>{copy.manualHint}</p>{practice.criteria.map((criterion,index)=><label className="course-criterion" key={index}><input type="checkbox" checked={!!completed||checks.includes(index)} disabled={completed} onChange={event=>setChecks(event.target.checked?[...checks,index]:checks.filter(value=>value!==index))}/>{courseText(criterion,state.contentLanguage)}</label>)}<button className="button subtle" disabled={completed||checks.length!==practice.criteria.length} onClick={()=>state.completeCoursePractice(courseId,lesson.id)}>{completed?copy.completed:copy.manual}</button></div>;
}
