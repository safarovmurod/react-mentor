'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, CheckCircle2, Layers } from 'lucide-react';
import { COURSE_CATALOG, courseName } from '@/content/courses/catalog';
import { useLearningStore } from '@/stores/learning-store';
import { useAppStore } from '@/stores/app-store';
import type { CourseId } from '@/lib/courses/ids';

type CatalogCopy = {
  eyebrow:string;title:string;intro:string;route:string;routeNote:string;selected:string;recommended:string;
  jsDescription:string;after:string;alongside:string;fromZero:string;
  ready:(count:number)=>string;wait:string;unavailable:string;checking:string;choose:string;continue:string;
  descriptions:Record<string,string>;
};
const CATALOG_UI:Record<'ru'|'en'|'tg'|'uk',CatalogCopy>={
  ru:{
    eyebrow:'ВАШЕ ОБУЧЕНИЕ',title:'Что будем изучать?',intro:'Выберите направление. Переключайтесь в любой момент — прогресс и заметки каждого курса сохраняются отдельно.',
    route:'Рекомендуемый путь для веб-разработки',routeNote:'Git изучайте параллельно. C++ — отдельное направление.',selected:'Выбрано',recommended:'Рекомендуем начать',
    jsDescription:'Месяц 1 — JS1: массивы, объекты и задачи. Месяц 2 — JS2: API и запросы.',
    after:'После ',alongside:'Параллельно основному курсу',fromZero:'Можно начать с нуля',ready:count=>`${count} тем · можно учиться`,
    wait:'Материалы ожидаются',unavailable:'Статус материалов недоступен',checking:'Проверяем материалы…',choose:'Выбрать',continue:'Продолжить курс',descriptions:{}
  },
  en:{
    eyebrow:'YOUR LEARNING',title:'What would you like to learn?',intro:'Choose a path. Switch anytime; each course keeps its own progress and notes.',
    route:'Recommended web development path',routeNote:'Study Git alongside this path. C++ is a separate path.',selected:'Selected',recommended:'Recommended start',
    jsDescription:'Month 1 — JS1: arrays, objects and exercises. Month 2 — JS2: APIs and requests.',
    after:'After ',alongside:'Alongside your main course',fromZero:'Start from scratch',ready:count=>`${count} topics · ready`,
    wait:'Waiting for materials',unavailable:'Material status unavailable',checking:'Checking materials…',choose:'Choose course',continue:'Continue course',descriptions:{}
  },
  tg:{
    eyebrow:'ОМӮЗИШИ ШУМО',title:'Чиро меомӯзем?',intro:'Самтро интихоб кунед. Ҳар вақт курсро иваз кунед — пешрафт ва ёддоштҳои ҳар курс алоҳида мемонанд.',
    route:'Роҳи тавсияшавандаи веб-барномасозӣ',routeNote:'Git-ро ҳамзамон омӯзед. C++ самти алоҳида аст.',selected:'Интихоб шудааст',recommended:'Аз ин ҷо оғоз кунед',
    jsDescription:'Моҳи 1 — JS1: массивҳо, объектҳо ва машқҳо. Моҳи 2 — JS2: API ва дархостҳо.',
    after:'Баъд аз ',alongside:'Ҳамзамон бо курси асосӣ',fromZero:'Аз сифр оғоз кардан мумкин',ready:count=>`${count} мавзӯъ · омода`,
    wait:'Мавод ҳоло омода нест',unavailable:'Ҳолати мавод дастрас нест',checking:'Мавод санҷида мешавад…',choose:'Интихоби курс',continue:'Идома додани курс',
    descriptions:{html:'Як моҳ аз сифр: HTML, CSS ва сомонаи мутобиқшаванда.',react:'Курси тайёр: дарс, машқ, санҷиш ва ҷавобҳои муфассал.',git:'Таърихи тағйирот ва кори дастаҷамъона. Ҳамзамон омӯзед.',cpp:'Самти алоҳидаи барномасозӣ бо маводи худ.'}
  },
  uk:{
    eyebrow:'ВАШЕ НАВЧАННЯ',title:'Що вивчатимемо?',intro:'Оберіть напрям. Можна перемикатися будь-коли — прогрес і нотатки кожного курсу зберігаються окремо.',
    route:'Рекомендований шлях веброзробки',routeNote:'Вивчайте Git паралельно. C++ — окремий напрям.',selected:'Обрано',recommended:'Радимо почати тут',
    jsDescription:'Місяць 1 — JS1: масиви, об’єкти й завдання. Місяць 2 — JS2: API й запити.',
    after:'Після ',alongside:'Паралельно з основним курсом',fromZero:'Можна почати з нуля',ready:count=>`${count} тем · готово`,
    wait:'Матеріали очікуються',unavailable:'Стан матеріалів недоступний',checking:'Перевіряємо матеріали…',choose:'Обрати курс',continue:'Продовжити курс',
    descriptions:{html:'Один місяць із нуля: HTML, CSS й адаптивний вебсайт.',react:'Готовий курс: пояснення, практика, тести та докладні відповіді.',git:'Історія змін і командна робота. Вивчайте паралельно.',cpp:'Окремий напрям програмування з власними матеріалами.'}
  },
};

export function CourseCatalog() {
  const router = useRouter();
  const language = useLearningStore(state => state.language);
  const selected = useLearningStore(state => state.courseChosen ? state.selectedCourse : null);
  const [counts, setCounts] = useState<{id:CourseId;ready:boolean;lessons:number;files:number}[] | null>(null);
  const [failed, setFailed] = useState(false);
  const labels=CATALOG_UI[language];
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
    <div className="course-intro"><span className="eyebrow"><Layers size={16}/>{labels.eyebrow}</span><h1>{labels.title}</h1><p>{labels.intro}</p></div>
    <div className="course-route panel"><BookOpen size={21}/><div><strong>{labels.route}</strong><p>HTML + CSS → JavaScript 1 → JavaScript 2 → React</p><span>{labels.routeNote}</span></div></div>
    <div className="course-grid">{COURSE_CATALOG.filter(course=>course.id!=='javascript-2'&&course.id!=='css').map(course => {
      const javascript=course.id==='javascript-1';
      const parts=counts?.filter(item=>javascript?item.id==='javascript-1'||item.id==='javascript-2':item.id===course.id);
      const count=parts?.length?{ready:parts.some(item=>item.ready),lessons:parts.reduce((sum,item)=>sum+item.lessons,0)}:undefined;
      const name=javascript?'JavaScript':course.name;
      const isSelected=displaySelected===course.id||(javascript&&displaySelected==='javascript-2');
      return <article key={course.id} className={'panel course-card '+(isSelected?'course-selected':'')} data-course={course.id}>
        <div className="between"><span className="course-symbol">{course.symbol}</span>{isSelected?<span className="badge"><CheckCircle2 size={14}/>{labels.selected}</span>:course.id==='html'?<span className="badge">{labels.recommended}</span>:null}</div>
        <h2>{name}</h2><p>{javascript?labels.jsDescription:(labels.descriptions[course.id] || (language==='ru'?course.ru:course.en))}</p>
        <span className="course-prerequisite">{course.prerequisite?labels.after+courseName(course.prerequisite):course.route==='tools'?labels.alongside:labels.fromZero}</span>
        <span className={'course-status '+(count?.ready?'course-ready':'')}>{count?(count.ready?labels.ready(count.lessons):labels.wait):failed?labels.unavailable:labels.checking}</span>
        <button className={'button '+(isSelected?'primary':'subtle')} aria-pressed={isSelected} onClick={()=>choose(javascript&&selected==='javascript-2'?'javascript-2':course.id)} aria-label={labels.choose+' '+name}>{isSelected?labels.continue:labels.choose}<ArrowRight size={17}/></button>
      </article>;
    })}</div>
  </section>;
}
