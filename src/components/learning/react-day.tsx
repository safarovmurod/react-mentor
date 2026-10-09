'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { ArrowRight, BookOpen, ListChecks, Sparkles } from 'lucide-react';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import { awardedXP } from '@/lib/learning';
import { LEARNING_TOPICS, topicTitle } from '@/content/course';
import { tr } from '@/lib/translate';
import { reactMonthDays } from '@/lib/react-plan';
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
  const month=requestedMonth || (state.activeMonth===2?2:1);
  // Never invent a selected day on first course entry; plan selection is authoritative.
  const stored=state.drafts['react-selected-day']?.split(':').map(Number);
  const remembered=stored?.[0]===month&&Number.isInteger(stored[1])&&stored[1]>=0&&stored[1]<=30?stored[1]:undefined;
  const day=requestedDay ?? remembered;
  const entry=day===undefined?undefined:reactMonthDays(month).find(d=>d.day===day);
  const reactTopics=LEARNING_TOPICS.filter(topic=>topic.month<=2);
  const learned=reactTopics.filter(topic=>state.completedTopics.includes(topic.id)).length;
  const saveDraft=state.saveDraft,setPreferences=state.setPreferences;
  useEffect(()=>{
    if(day!==undefined&&state.drafts['react-selected-day']!==`${month}:${day}`)saveDraft('react-selected-day',`${month}:${day}`);
    if(state.activeMonth!==month)setPreferences({activeMonth:month});
  },[day,month,state.drafts,state.activeMonth,saveDraft,setPreferences]);
  return <div className="dashboard"><div className="dashboard-heading"><div><span className="eyebrow">React · {copy.month} {month}{day===undefined?'':' · '+labels.day+' '+day}</span><h1>{labels.title}</h1><p>{account.profile?.displayName?account.profile.displayName+', ':''}{labels.intro}</p></div><Link className="button subtle" href={`/plan/${month}`}>{copy.plan} <ArrowRight size={17}/></Link></div>
    <div className="stats-grid"><div className="stat"><BookOpen size={19}/><span>{copy.progress}</span><strong>{learned}<small> / {reactTopics.length}</small></strong></div><div className="stat"><ListChecks size={19}/><span>{copy.readCount}</span><strong>{state.studied.length}</strong></div><div className="stat"><Sparkles size={19}/><span>{copy.totalXP}</span><strong>{awardedXP(state.awards)}<small> XP</small></strong></div></div>
    <div className="react-day-content">{day===undefined?<article className="panel course-lesson"><h2>{labels.selectDay}</h2><p>{labels.intro}</p><Link className="button primary" href={`/plan/${month}`}>{copy.plan}<ArrowRight size={16}/></Link></article>:day===0?<article className="panel course-lesson"><h2>{labels.prepTitle}</h2><p>{labels.prepText}</p><Link className="button primary" href={`/plan/${month}`}>{copy.plan} <ArrowRight size={16}/></Link></article>:entry?<>
      <div className="section-heading"><h2>{labels.day} {day} · {entry.title}</h2><span className="badge">{entry.practiceOnly?labels.apply:labels.study}</span></div>
      {entry.topics.map(topic=><article className="panel course-lesson" key={topic.id}><h2>{topicTitle(topic,state.language)}</h2>{topic.explanation.map((part,index)=><section className="day-explanation" key={index}><h3>{tr(part.title,state.contentLanguage)}</h3><p className="preserve-lines">{tr(part.text,state.contentLanguage)}</p></section>)}{topic.code[0]&&<pre><code>{topic.code[0]}</code></pre>}<aside className="lesson-connections"><h3>{labels.steps}</h3><ol>{topic.flow.map((step,index)=><li key={index}>{tr(step,state.contentLanguage)}</li>)}</ol></aside><p className="source-line"><a href="https://react.dev/learn" target="_blank" rel="noreferrer">{labels.guide}</a></p><div className="button-row"><button className="button subtle" disabled={state.completedTopics.includes(topic.id)} onClick={()=>state.completeTopic(topic.id)}>{state.completedTopics.includes(topic.id)?copy.completed:copy.markLearned}</button><Link className="button primary" href={`/practice?month=${month}&topic=${topic.id}&day=${day}`}>{labels.practice} <ArrowRight size={16}/></Link><Link className="text-link" href={`/tests?topic=${topic.id}`}>{labels.tests}</Link></div></article>)}
    </>:null}</div>
  </div>;
}
