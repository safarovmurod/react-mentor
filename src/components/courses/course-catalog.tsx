'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, CheckCircle2, Search, Terminal, Compass, Code2, Palette, Megaphone, ChartNoAxesCombined, BriefcaseBusiness, MessagesSquare, Clapperboard, Languages, Shapes, Heart, ChevronRight, Sparkles } from 'lucide-react';
import { PREMIUM_COPY } from '@/lib/premium-copy';
import type { CourseAccessTier } from '@/lib/courses/access';
import { courseTopicCount } from '@/lib/course-copy';
import { courseDisplayName, courseDescription } from '@/lib/catalog-copy';
import { COURSE_CATALOG } from '@/content/courses/catalog';
import { useLearningStore } from '@/stores/learning-store';
import { useAppStore } from '@/stores/app-store';
import { isCourseId, type CourseId } from '@/lib/courses/ids';
import type { InterfaceLocale } from '@/lib/locale';
import { COURSE_CATEGORIES, PROGRAMMING_SUBTRACKS, categoryLabel, subtrackLabel, type CourseCategoryId as CategoryId, type ProgrammingSubtrackId as SubtrackId } from '@/content/course-categories';

type CatalogCopy = {
  eyebrow:string;title:string;intro:string;route:string;routeNote:string;selected:string;recommended:string;
  jsDescription:string;after:string;alongside:string;fromZero:string;
  ready:(count:number)=>string;wait:string;unavailable:string;checking:string;choose:string;continue:string;
  descriptions:Record<string,string>;
};
const CATALOG_UI:Record<'ru'|'en'|'tg'|'uk'|'ja'|'ko',CatalogCopy>={
  ru:{
    eyebrow:'ОБРАЗОВАНИЕ ДЛЯ ВАШИХ ЦЕЛЕЙ',title:'Навыки начинаются с практики.',intro:'От первого интереса до нового навыка. Выберите направление и учитесь через понятные уроки и практику.',
    route:'Рекомендуемый путь для веб-разработки',routeNote:'Начните с HTML. Каждый следующий день открывается после завершения предыдущего.',selected:'Выбрано',recommended:'Рекомендуем начать',
    jsDescription:'Месяц 1 — JS1: массивы, объекты и задачи. Месяц 2 — JS2: API и запросы.',
    after:'После ',alongside:'Параллельно основному курсу',fromZero:'Можно начать с нуля',ready:count=>`${courseTopicCount(count,'ru')} · можно учиться`,
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
  ja:{
    eyebrow:'あなたの目標に合わせた学び',title:'実践からスキルを身につける。',intro:'学習分野を選びましょう。短いレッスンと実践的な課題で、毎日一歩ずつ進めます。',
    route:'ウェブ開発の学習ルート',routeNote:'HTMLから始めましょう。前の日を完了すると次の日に進めます。',selected:'選択中',recommended:'初めての方におすすめ',jsDescription:'1か月目：配列、オブジェクト、演習。2か月目：APIとリクエスト。',after:'前提：',alongside:'ほかのコースと並行して学習',fromZero:'初心者向け',ready:count=>`${count} トピック · 学習可能`,wait:'教材を準備中',unavailable:'教材の状態を取得できません',checking:'教材を確認中…',choose:'コースを選ぶ',continue:'学習を続ける',descriptions:{html:'基礎から学ぶHTML、CSS、レスポンシブなウェブサイト。',react:'コンポーネント、状態、実践的な演習。',git:'変更履歴とチームでの共同開発。',cpp:'C++の基礎とプログラミング演習。',python:'Pythonの基礎を、小さなプログラムで学習。',backend:'HTTP、検証、サーバー開発の入門。',mobile:'画面、状態、モバイルアプリの基礎。',nextjs:'App Router、サーバーコンポーネント、API。'}
  },
  ko:{
    eyebrow:'목표에 맞는 배움',title:'실습으로 실력을 쌓으세요.',intro:'학습 분야를 선택하세요. 짧은 수업과 실습 과제로 매일 한 단계씩 나아갑니다.',
    route:'웹 개발 추천 학습 경로',routeNote:'HTML부터 시작하세요. 이전 학습일을 완료하면 다음 날이 열립니다.',selected:'선택됨',recommended:'처음 시작하기 좋아요',jsDescription:'1개월 차: 배열, 객체, 연습 문제. 2개월 차: API와 요청.',after:'선수 과정: ',alongside:'다른 강좌와 함께 학습',fromZero:'기초부터 시작',ready:count=>`${count}개 주제 · 학습 가능`,wait:'학습 자료 준비 중',unavailable:'학습 자료 상태를 불러올 수 없습니다',checking:'학습 자료 확인 중…',choose:'강좌 선택',continue:'학습 계속하기',descriptions:{html:'기초부터 배우는 HTML, CSS, 반응형 웹사이트.',react:'컴포넌트, 상태, 실전 연습 문제.',git:'변경 이력 관리와 팀 협업.',cpp:'C++ 기초와 프로그래밍 연습.',python:'작은 프로그램으로 배우는 Python 기초.',backend:'HTTP, 검증, 서버 개발 입문.',mobile:'화면, 상태, 모바일 앱의 기초.',nextjs:'App Router, 서버 컴포넌트, API.'}
  },
  uk:{
    eyebrow:'ВАШЕ НАВЧАННЯ',title:'Що вивчатимемо?',intro:'Оберіть напрям. Можна перемикатися будь-коли — прогрес і нотатки кожного курсу зберігаються окремо.',
    route:'Рекомендований шлях веброзробки',routeNote:'Вивчайте Git паралельно. C++ — окремий напрям.',selected:'Обрано',recommended:'Радимо почати тут',
    jsDescription:'Місяць 1 — JS1: масиви, об’єкти й завдання. Місяць 2 — JS2: API й запити.',
    after:'Після ',alongside:'Паралельно з основним курсом',fromZero:'Можна почати з нуля',ready:count=>`${courseTopicCount(count,'uk')} · готово`,
    wait:'Матеріали очікуються',unavailable:'Стан матеріалів недоступний',checking:'Перевіряємо матеріали…',choose:'Обрати курс',continue:'Продовжити курс',
    descriptions:{html:'Один місяць із нуля: HTML, CSS й адаптивний вебсайт.',react:'Готовий курс: пояснення, практика, тести та докладні відповіді.',git:'Історія змін і командна робота. Вивчайте паралельно.',cpp:'Окремий напрям програмування з власними матеріалами.'}
  },
};

const CATEGORY_ICONS = {programming:Code2,ai:Sparkles,design:Palette,marketing:Megaphone,analytics:ChartNoAxesCombined,business:BriefcaseBusiness,'soft-skills':MessagesSquare,content:Clapperboard,languages:Languages,kids:Shapes,lifestyle:Heart};
const BROWSE_COPY = {
  ru:{categories:'Направления обучения',all:'Все направления',allTracks:'Все специализации',browse:'Каталог курсов',programming:'Специализации в программировании',results:'Найдено',reset:'Сбросить фильтры',empty:'В этом направлении пока нет подходящих курсов. Выберите другое или измените поиск.',step:'Начните с первого дня',intro:'Вводный модуль',search:'Название курса или навык'},
  en:{categories:'Explore learning paths',all:'All categories',allTracks:'All specializations',browse:'Course catalog',programming:'Programming specializations',results:'Found',reset:'Reset filters',empty:'No matching courses in this category yet. Choose another category or change your search.',step:'Start with day one',intro:'Introductory module',search:'Course name or skill'},
  tg:{categories:'Самтҳои омӯзиш',all:'Ҳамаи самтҳо',allTracks:'Ҳамаи ихтисосҳо',browse:'Феҳристи курсҳо',programming:'Ихтисосҳои барномасозӣ',results:'Ёфт шуд',reset:'Тоза кардани филтрҳо',empty:'Дар ин самт курси мувофиқ ҳоло нест. Самти дигар ё ҷустуҷӯи дигарро интихоб кунед.',step:'Аз рӯзи аввал оғоз кунед',intro:'Модули муқаддимавӣ',search:'Номи курс ё малака'},
  uk:{categories:'Напрями навчання',all:'Усі напрями',allTracks:'Усі спеціалізації',browse:'Каталог курсів',programming:'Спеціалізації у програмуванні',results:'Знайдено',reset:'Скинути фільтри',empty:'У цьому напрямі поки немає відповідних курсів. Оберіть інший напрям або змініть пошук.',step:'Почніть із першого дня',intro:'Вступний модуль',search:'Назва курсу або навичка'},
  ja:{categories:'学習分野を探す',all:'すべての分野',allTracks:'すべての専門分野',browse:'コース一覧',programming:'プログラミングの専門分野',results:'検索結果',reset:'絞り込みを解除',empty:'該当するコースはまだありません。別の分野や検索語をお試しください。',step:'1日目から始める',intro:'入門モジュール',search:'コース名またはスキル'},
  ko:{categories:'학습 분야 둘러보기',all:'모든 분야',allTracks:'모든 세부 분야',browse:'강좌 목록',programming:'프로그래밍 세부 분야',results:'검색 결과',reset:'필터 초기화',empty:'조건에 맞는 강좌가 아직 없습니다. 다른 분야나 검색어를 선택하세요.',step:'1일차부터 시작하세요',intro:'입문 모듈',search:'강좌 이름 또는 기술'},
};
function courseCountLabel(count:number,locale:InterfaceLocale) {
  const plural=new Intl.PluralRules(locale).select(count);
  if(locale==='ru')return `${count} ${plural==='one'?'курс':plural==='few'?'курса':'курсов'}`;
  if(locale==='uk')return `${count} ${plural==='one'?'курс':plural==='few'?'курси':'курсів'}`;
  if(locale==='tg')return `${count} курс`;
  if(locale==='ja')return `${count} コース`;
  if(locale==='ko')return `${count}개 강좌`;
  return `${count} ${count===1?'course':'courses'}`;
}

export function CourseCatalog() {
  const router = useRouter();
  const language = useLearningStore(state => state.language);
  const selected = useLearningStore(state => state.courseChosen ? state.selectedCourse : null);
  const [counts, setCounts] = useState<{id:CourseId;ready:boolean;lessons:number;files:number}[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryId|'all'>('all');
  const [subtrack, setSubtrack] = useState<SubtrackId|'all'>('all');
  const [access,setAccess]=useState<CourseAccessTier|'all'>('all');
  const premium=PREMIUM_COPY[language];
  const browse=BROWSE_COPY[language];
  const searchLabel=({ru:'Найти курс',en:'Find a course',tg:'Ҷустуҷӯи курс',uk:'Знайти курс',ja:'コースを検索',ko:'강좌 검색'})[language];
  const noResults=({ru:'Курс не найден. Попробуйте другое название.',en:'No courses found. Try another name.',tg:'Курс ёфт нашуд. Номи дигарро санҷед.',uk:'Курс не знайдено. Спробуйте іншу назву.',ja:'コースが見つかりません。別の名前で検索してください。',ko:'강좌를 찾을 수 없습니다. 다른 이름으로 검색해 보세요.'})[language];
  const labels=CATALOG_UI[language];
  // Old CSS-only selections remain readable; the combined HTML + CSS card is the visible course.
  const displaySelected = selected === 'css' ? 'html' : selected;
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/courses', {signal:AbortSignal.any([controller.signal,AbortSignal.timeout(15000)])}).then(async response => {
      if (!response.ok) throw new Error('Unavailable');
      const data:unknown = await response.json();
      if(!Array.isArray(data)||!data.every(item=>item&&isCourseId(item.id)&&typeof item.ready==='boolean'&&Number.isInteger(item.lessons)&&item.lessons>=0&&Number.isInteger(item.files)&&item.files>=0))throw new Error('Invalid course status');
      if (!controller.signal.aborted) setCounts(data);
    }).catch(() => {if (!controller.signal.aborted) setFailed(true);});
    return () => controller.abort();
  }, []);
  function choose(id:CourseId) {
    useLearningStore.getState().chooseCourse(id);
    useAppStore.setState({sidebarOpen:false,tutorDrawerOpen:false,tutorQuestion:null});
    router.push(id === 'react' ? '/courses/react' : `/courses/${id}/plan`);
  }
  const catalogCourses=COURSE_CATALOG.filter(course=>course.id!=='javascript-2'&&course.id!=='css');
  const categories=COURSE_CATEGORIES.map(entry=>entry.id as CategoryId);
  const tracks=PROGRAMMING_SUBTRACKS.map(entry=>entry.id as SubtrackId);
  const visibleCourses=catalogCourses.filter(course=>access==='all'||(course.accessTier??'starter')===access).filter(course=>category==='all'||course.category===category).filter(course=>subtrack==='all'||course.category!=='programming'||course.subtrack===subtrack).filter(course=>[course.name,courseDisplayName(course.id,language),course.ru,course.en,courseDescription(course.id,language),categoryLabel(course.category,language),course.subtrack?subtrackLabel(course.subtrack,language):''].join(' ').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const groups:{key:string;category:CategoryId;subtrack:SubtrackId|null;courses:typeof catalogCourses}[]=categories.flatMap<{key:string;category:CategoryId;subtrack:SubtrackId|null;courses:typeof catalogCourses}>(id=>id==='programming'?tracks.map(track=>({key:id+'-'+track,category:id,subtrack:track,courses:visibleCourses.filter(course=>course.category===id&&course.subtrack===track)})):[{key:id,category:id,subtrack:null,courses:visibleCourses.filter(course=>course.category===id)}]).filter(group=>group.courses.length>0);
  function resetFilters(){setCategory('all');setSubtrack('all');setAccess('all');setQuery('');}
  function selectCategory(id:CategoryId|'all'){setCategory(id);setSubtrack('all');}
  function renderCourse(course:typeof COURSE_CATALOG[number]) {
    const javascript=course.id==='javascript-1';
    const parts=counts?.filter(item=>javascript?item.id==='javascript-1'||item.id==='javascript-2':item.id===course.id);
    const count=parts?.length?{ready:parts.some(item=>item.ready),lessons:parts.reduce((sum,item)=>sum+item.lessons,0)}:undefined;
    const name=javascript?'JavaScript':courseDisplayName(course.id,language);
    const isSelected=displaySelected===course.id||(javascript&&displaySelected==='javascript-2');
    return <article key={course.id} className={'panel course-card '+(isSelected?'course-selected':'')} data-course={course.id} data-category={course.category} data-access-tier={course.accessTier??'starter'}>
      <div className="between"><span className="course-symbol">{course.symbol}</span><div className="course-badges"><span className={'course-tier tier-'+(course.accessTier??'starter')}>{course.accessTier==='expert'?'Expert':course.accessTier==='pro'?'Pro':premium.starter}</span>{isSelected?<span className="badge"><CheckCircle2 size={14}/>{labels.selected}</span>:course.id==='html'?<span className="badge">{labels.recommended}</span>:course.introductoryDays?<span className="badge intro-badge">{browse.intro}</span>:null}</div></div>
      <h3>{name}</h3><p>{javascript?labels.jsDescription:courseDescription(course.id,language)}</p>
      <span className="course-prerequisite">{course.prerequisite?labels.after+courseDisplayName(course.prerequisite,language):labels.fromZero}</span>
      <span className={'course-status '+(count?.ready?'course-ready':'')}>{count?(count.ready?labels.ready(count.lessons):labels.wait):failed?labels.unavailable:labels.checking}</span>
      <button className={'button '+(isSelected?'primary':'subtle')} aria-pressed={isSelected} onClick={()=>choose(javascript&&selected==='javascript-2'?'javascript-2':course.id)} aria-label={labels.choose+' '+name}>{isSelected?labels.continue:labels.choose}<ArrowRight size={17}/></button>
    </article>;
  }
  return <section className="course-catalog">
    <div className="course-intro"><span className="eyebrow"><Compass size={16}/>{labels.eyebrow}</span><h1>{labels.title}</h1><p>{labels.intro}</p></div>
    <section className="catalog-categories" aria-labelledby="catalog-categories-heading"><div className="catalog-section-heading"><h2 id="catalog-categories-heading">{browse.categories}</h2><button type="button" className={'category-reset '+(category==='all'?'is-active':'')} aria-pressed={category==='all'} onClick={()=>selectCategory('all')}>{browse.all}<ArrowRight size={15}/></button></div>
      <div className="category-grid">{categories.map(id=>{const Icon=CATEGORY_ICONS[id];const total=catalogCourses.filter(course=>course.category===id).length;return <button key={id} type="button" className={'category-card '+(category===id?'is-active':'')} data-category={id} aria-label={categoryLabel(id,language)+' · '+courseCountLabel(total,language)} aria-pressed={category===id} onClick={()=>selectCategory(id)}><span className="category-icon"><Icon size={23}/></span><span className="category-text"><strong>{categoryLabel(id,language)}</strong><small>{courseCountLabel(total,language)}</small></span><ChevronRight size={15} className="category-chevron"/></button>;})}</div>
    </section>
    {(category==='all'||category==='programming')&&<section className="programming-filters" aria-label={browse.programming}><span>{browse.programming}</span><div className="subtrack-filters"><button type="button" aria-pressed={subtrack==='all'} onClick={()=>setSubtrack('all')}>{browse.allTracks}</button>{tracks.map(track=><button key={track} type="button" aria-pressed={subtrack===track} onClick={()=>{setSubtrack(track);setCategory('programming');}}>{subtrackLabel(track,language)}</button>)}</div></section>}
    {category==='programming'&&subtrack==='frontend'&&<div className="course-route panel"><span className="route-icon"><Terminal size={23}/></span><div><strong>{labels.route}</strong><p className="learning-route-steps"><span>HTML + CSS</span><ArrowRight size={15}/><span>JavaScript</span><ArrowRight size={15}/><span>React</span><ArrowRight size={15}/><span>Next.js</span></p><span>{labels.routeNote}</span></div></div>}
    <nav className="course-access-filters" aria-label={premium.all}>{(['all','starter','pro','expert'] as const).map(tier=><button type="button" key={tier} aria-pressed={access===tier} onClick={()=>setAccess(tier)}>{tier==='all'?premium.all:tier==='starter'?premium.starter:tier==='pro'?'Pro':'Expert'}</button>)}</nav>
    <div className="catalog-toolbar"><div><h2><BookOpen size={19}/>{browse.browse}</h2><span className="catalog-result-count" aria-live="polite">{courseCountLabel(visibleCourses.length,language)}</span></div><label className="catalog-search"><Search size={17}/><input aria-label={searchLabel} placeholder={browse.search} value={query} onChange={event=>{setQuery(event.target.value);setCategory('all');setSubtrack('all');setAccess('all');}}/></label></div>
    <div className="catalog-groups">{groups.map(group=>{const Icon=CATEGORY_ICONS[group.category];return <section className="catalog-course-group" key={group.key} aria-labelledby={'catalog-group-'+group.key}><div className="catalog-group-heading"><span className="group-category-icon" data-category={group.category}><Icon size={18}/></span><div>{group.subtrack&&<span className="group-parent-category">{categoryLabel(group.category,language)}</span>}<h2 id={'catalog-group-'+group.key}>{group.subtrack?subtrackLabel(group.subtrack,language):categoryLabel(group.category,language)}</h2></div><span className="group-course-count">{courseCountLabel(group.courses.length,language)}</span></div><div className="course-grid">{group.courses.map(renderCourse)}</div></section>;})}</div>
    {visibleCourses.length===0&&<div role="status" className="catalog-empty"><Search size={25}/><p>{query?noResults:browse.empty}</p><button className="button subtle" onClick={resetFilters}>{browse.reset}</button></div>}
  </section>;
}
