'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { ArrowRight, BookOpen, ListChecks, Sparkles } from 'lucide-react';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import { awardedXP } from '@/lib/learning';
import { LEARNING_TOPICS, topicTitle } from '@/content/course';
import { tr } from '@/lib/translate';
import { reactMonthDays, reactDayComplete } from '@/lib/react-plan';
import { MonthCards } from './month-cards';
import { useAccount } from '@/components/account/account-provider';
const DAY_UI = {
  ru:{title:'Время разобраться в React.',intro:'Изучаем выбранный день, затем применяем в коде.',day:'День',selectDay:'Выбор дня',prepTitle:'Подготовка к React',prepText:'Сначала пройдите HTML + CSS и два месяца JavaScript. Здесь понадобится Node.js и редактор. На каждом шаге изменяйте свой накопительный проект.',start:'Начать день',apply:'Применяем',study:'Изучаем',steps:'Шаг за шагом',previous:'Используем результат дня',guide:'React · официальное руководство',practice:'Практика этого дня',tests:'Тесты и интервью',next:'Следующий день'},
  en:{title:'Time to understand React.',intro:'Study the selected day, then apply it in code.',day:'Day',selectDay:'Select day',prepTitle:'Getting ready for React',prepText:'Complete HTML + CSS and two months of JavaScript first. You will need Node.js and a code editor. Continue building on your project each day.',start:'Start day',apply:'Apply it',study:'Learning',steps:'Step by step',previous:'Use the result from day',guide:'React · official guide',practice:'Practice for this day',tests:'Tests and interview',next:'Next day'},
  tg:{title:'Вақти омӯхтани React расид.',intro:'Мавзӯи рӯзи интихобшударо меомӯзем ва баъд дар код истифода мебарем.',day:'Рӯз',selectDay:'Интихоби рӯз',prepTitle:'Омодагӣ ба React',prepText:'Аввал HTML + CSS ва ду моҳи JavaScript-ро гузаред. Node.js ва муҳаррири код лозим мешаванд. Ҳар рӯз лоиҳаи худро такмил диҳед.',start:'Оғози рӯзи',apply:'Амалия',study:'Омӯзиш',steps:'Қадам ба қадам',previous:'Аз натиҷаи рӯзи гузашта истифода баред:',guide:'React · дастури расмӣ',practice:'Машқи ҳамин рӯз',tests:'Санҷиш ва мусоҳиба',next:'Рӯзи баъдӣ'},
  uk:{title:'Час розібратися з React.',intro:'Вивчаємо тему обраного дня, а потім застосовуємо її в коді.',day:'День',selectDay:'Вибір дня',prepTitle:'Підготовка до React',prepText:'Спочатку пройдіть HTML + CSS і два місяці JavaScript. Вам знадобляться Node.js і редактор коду. Щодня вдосконалюйте свій проєкт.',start:'Почати день',apply:'Застосовуємо',study:'Вивчаємо',steps:'Крок за кроком',previous:'Використовуємо результат дня',guide:'React · офіційний посібник',practice:'Практика цього дня',tests:'Тести та співбесіда',next:'Наступний день'}
};

export function ReactDay({requestedDay,requestedMonth}:{requestedDay?:number;requestedMonth?:number}) {
  const state=useLearningStore(),copy=COPY[state.language],labels=DAY_UI[state.language];
  const account=useAccount();
  const month=requestedMonth || state.activeMonth;
  const stored=state.drafts['react-selected-day']?.split(':').map(Number);
  const day=requestedDay ?? (stored?.[0]===month?stored[1]:reactMonthDays(month).find(d=>!reactDayComplete(d,state.completedTopics,state.completedPractice))?.day || 1);
  const days=reactMonthDays(month), entry=days.find(d=>d.day===day);
  const saveDraft=state.saveDraft,setPreferences=state.setPreferences;
  useEffect(()=>{if(state.drafts['react-selected-day']!==`${month}:${day}`)saveDraft('react-selected-day',`${month}:${day}`);if(state.activeMonth!==month)setPreferences({activeMonth:month});},[day,month,state.drafts,state.activeMonth,saveDraft,setPreferences]);
  return <div className="dashboard"><div className="dashboard-heading"><div><span className="eyebrow">React · {copy.month} {month} · {labels.day} {day}</span><h1>{labels.title}</h1><p>{account.profile?.displayName?account.profile.displayName+', ':''}{labels.intro}</p></div><Link className="button subtle" href={`/plan/${month}`}>{copy.plan} <ArrowRight size={17}/></Link></div>
    <div className="stats-grid"><div className="stat"><BookOpen size={19}/><span>{copy.progress}</span><strong>{state.completedTopics.length}<small> / {LEARNING_TOPICS.length}</small></strong></div><div className="stat"><ListChecks size={19}/><span>{copy.readCount}</span><strong>{state.studied.length}</strong></div><div className="stat"><Sparkles size={19}/><span>{copy.totalXP}</span><strong>{awardedXP(state.awards)}<small> XP</small></strong></div></div>
    <nav className="day-strip" aria-label={labels.selectDay}><Link href={`/home?month=${month}&day=0`} aria-current={day===0?'step':undefined}>0</Link>{days.map(d=><Link prefetch={false} key={d.day} href={`/home?month=${month}&day=${d.day}`} aria-label={labels.day+' '+d.day} aria-current={day===d.day?'step':undefined}>{d.day}</Link>)}</nav>
    <div className="dashboard-grid"><div className="dashboard-main">{day===0?<article className="panel course-lesson"><h2>{labels.prepTitle}</h2><p>{labels.prepText}</p><Link className="button primary" href={`/home?month=${month}&day=1`}>{labels.start} 1 <ArrowRight size={16}/></Link></article>:entry?<>
      <div className="section-heading"><h2>{labels.day} {day} · {entry.title}</h2><span className="badge">{entry.practiceOnly?labels.apply:labels.study}</span></div>
      {entry.topics.map(topic=><article className="panel course-lesson" key={topic.id}><h2>{topicTitle(topic,state.language)}</h2>{topic.explanation.map((part,index)=><section className="day-explanation" key={index}><h3>{tr(part.title,state.contentLanguage)}</h3><p className="preserve-lines">{tr(part.text,state.contentLanguage)}</p></section>)}{topic.code[0]&&<pre><code>{topic.code[0]}</code></pre>}<aside className="lesson-connections"><h3>{labels.steps}</h3><ol>{topic.flow.map((step,index)=><li key={index}>{tr(step,state.contentLanguage)}</li>)}</ol>{day>1&&<Link href={`/home?month=${month}&day=${day-1}`}>{labels.previous} {day-1}</Link>}</aside><p className="source-line"><a href="https://react.dev/learn" target="_blank" rel="noreferrer">{labels.guide}</a></p><div className="button-row"><button className="button subtle" disabled={state.completedTopics.includes(topic.id)} onClick={()=>state.completeTopic(topic.id)}>{state.completedTopics.includes(topic.id)?copy.completed:copy.markLearned}</button><Link className="button primary" href={`/practice?month=${month}&topic=${topic.id}&day=${day}`}>{labels.practice} <ArrowRight size={16}/></Link><Link className="text-link" href={`/tests?topic=${topic.id}`}>{labels.tests}</Link></div></article>)}
      {day<30&&<Link className="button subtle" href={`/home?month=${month}&day=${day+1}`}>{labels.next} {day+1} <ArrowRight size={17}/></Link>}
    </>:null}</div><aside className="course-column"><div className="section-heading"><h2>{copy.course}</h2></div><MonthCards compact/></aside></div>
  </div>;
}
