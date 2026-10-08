'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, CheckCircle2, Layers } from 'lucide-react';
import { COURSE_CATALOG, courseName } from '@/content/courses/catalog';
import { useLearningStore } from '@/stores/learning-store';
import { useAppStore } from '@/stores/app-store';
import type { CourseId } from '@/lib/courses/ids';

export function CourseCatalog() {
  const router = useRouter();
  const language = useLearningStore(state => state.language);
  const selected = useLearningStore(state => state.courseChosen ? state.selectedCourse : null);
  const [counts, setCounts] = useState<{id:CourseId;ready:boolean;lessons:number;files:number}[] | null>(null);
  const [failed, setFailed] = useState(false);
  const ru = language === 'ru';
  // Old CSS-only selections remain readable; the combined HTML + CSS card is the visible course.
  const displaySelected = selected === 'css' ? 'html' : selected;
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/courses', {signal:controller.signal}).then(async response => {
      if (!response.ok) throw new Error('Unavailable');
      const data = await response.json();
      if (!controller.signal.aborted) setCounts(data);
    }).catch(() => {if (!controller.signal.aborted) setFailed(true);});
    return () => controller.abort();
  }, []);
  function choose(id:CourseId) {
    useLearningStore.getState().chooseCourse(id);
    useAppStore.setState({sidebarOpen:false,tutorDrawerOpen:false,tutorQuestion:null});
    router.push(id === 'react' ? '/home' : `/courses/${id}/home?day=${id === 'html' ? 0 : 1}`);
  }
  return <section className="course-catalog">
    <div className="course-intro"><span className="eyebrow"><Layers size={16}/>{ru?'ВАШЕ ОБУЧЕНИЕ':'YOUR LEARNING'}</span><h1>{ru?'Что будем изучать?':'What would you like to learn?'}</h1><p>{ru?'Выберите направление. Переключайтесь в любой момент — прогресс и заметки каждого курса сохраняются отдельно.':'Choose a path. Switch anytime; each course keeps its own progress and notes.'}</p></div>
    <div className="course-route panel"><BookOpen size={21}/><div><strong>{ru?'Рекомендуемый путь для веб-разработки':'Recommended web development path'}</strong><p>HTML + CSS → JavaScript 1 → JavaScript 2 → React</p><span>{ru?'Git изучайте параллельно. C++ — отдельное направление.':'Study Git alongside this path. C++ is a separate path.'}</span></div></div>
    <div className="course-grid">{COURSE_CATALOG.filter(course=>course.id!=='javascript-2'&&course.id!=='css').map(course => {
      const javascript=course.id==='javascript-1';
      const parts=counts?.filter(item=>javascript?item.id==='javascript-1'||item.id==='javascript-2':item.id===course.id);
      const count=parts?.length?{ready:parts.some(item=>item.ready),lessons:parts.reduce((sum,item)=>sum+item.lessons,0)}:undefined;
      const name=javascript?'JavaScript':course.name;
      const isSelected=displaySelected===course.id||(javascript&&displaySelected==='javascript-2');
      return <article key={course.id} className={'panel course-card '+(isSelected?'course-selected':'')} data-course={course.id}>
        <div className="between"><span className="course-symbol">{course.symbol}</span>{isSelected?<span className="badge"><CheckCircle2 size={14}/>{ru?'Выбрано':'Selected'}</span>:course.id==='html'?<span className="badge">{ru?'Рекомендуем начать':'Recommended start'}</span>:null}</div>
        <h2>{name}</h2><p>{javascript?(ru?'Месяц 1 — JS1: массивы, объекты и задачи. Месяц 2 — JS2: API и запросы.':'Month 1 — JS1: arrays, objects and exercises. Month 2 — JS2: APIs and requests.'):(ru?course.ru:course.en)}</p>
        <span className="course-prerequisite">{course.prerequisite?(ru?'После ':'After ')+courseName(course.prerequisite):course.route==='tools'?(ru?'Параллельно основному курсу':'Alongside your main course'):(ru?'Можно начать с нуля':'Start from scratch')}</span>
        <span className={'course-status '+(count?.ready?'course-ready':'')}>{count?(count.ready?(ru?`${count.lessons} тем · можно учиться`:`${count.lessons} topics · ready`):(ru?'Материалы ожидаются':'Waiting for materials')):failed?(ru?'Статус материалов недоступен':'Material status unavailable'):(ru?'Проверяем материалы…':'Checking materials…')}</span>
        <button className={'button '+(isSelected?'primary':'subtle')} aria-pressed={isSelected} onClick={()=>choose(javascript&&selected==='javascript-2'?'javascript-2':course.id)} aria-label={(ru?'Выбрать ':'Choose ')+name}>{isSelected?(ru?'Продолжить курс':'Continue course'):(ru?'Выбрать курс':'Choose course')}<ArrowRight size={17}/></button>
      </article>;
    })}</div>
  </section>;
}
