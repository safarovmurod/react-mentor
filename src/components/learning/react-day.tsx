'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { ArrowRight, BookOpen, ListChecks, Sparkles } from 'lucide-react';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import { awardedXP } from '@/lib/learning';
import { LEARNING_TOPICS, topicTitle } from '@/content/course';
import { tr } from '@/lib/translate';
import { reactDayProgress, reactDayReady } from '@/lib/react-plan';
import { lessonTranslationNotice } from '@/lib/learning-ui-copy';
import { PROGRESSION_COPY } from '@/lib/progression-copy';
import { useAccount } from '@/components/account/account-provider';
const DAY_UI = {
  ja:{title:'React を理解しよう',intro:'その日のテーマを学び、コードで実践します。',day:'日目',selectDay:'学習日を選択',prepTitle:'React の準備',prepText:'先に HTML、CSS、JavaScript を学びましょう。Node.js とコードエディターを使い、毎日プロジェクトを改善します。',start:'学習を開始',apply:'実践',study:'学習',steps:'手順',previous:'前日の成果を活用',guide:'React 公式ガイド',practice:'この日の演習',tests:'テストと面接対策',next:'次の日'},
  ko:{title:'React 이해하기',intro:'오늘의 주제를 학습한 뒤 코드로 실습합니다.',day:'일차',selectDay:'학습 일차 선택',prepTitle:'React 준비',prepText:'먼저 HTML, CSS, JavaScript를 학습하세요. Node.js와 코드 편집기를 사용하여 매일 프로젝트를 개선합니다.',start:'학습 시작',apply:'실습',study:'학습',steps:'단계별 안내',previous:'이전 일차의 결과 활용',guide:'React 공식 가이드',practice:'오늘의 실습',tests:'테스트 및 면접',next:'다음 일차'},
  ru:{title:'Время разобраться в React.',intro:'Изучаем выбранный день, затем применяем в коде.',day:'День',selectDay:'Выбор дня',prepTitle:'Подготовка к React',prepText:'Сначала пройдите HTML + CSS и два месяца JavaScript. Здесь понадобится Node.js и редактор. На каждом шаге изменяйте свой накопительный проект.',start:'Начать день',apply:'Применяем',study:'Изучаем',steps:'Шаг за шагом',previous:'Используем результат дня',guide:'React · официальное руководство',practice:'Практика этого дня',tests:'Тесты и интервью',next:'Следующий день'},
  en:{title:'Time to understand React.',intro:'Study the selected day, then apply it in code.',day:'Day',selectDay:'Select day',prepTitle:'Getting ready for React',prepText:'Complete HTML + CSS and two months of JavaScript first. You will need Node.js and a code editor. Continue building on your project each day.',start:'Start day',apply:'Apply it',study:'Learning',steps:'Step by step',previous:'Use the result from day',guide:'React · official guide',practice:'Practice for this day',tests:'Tests and interview',next:'Next day'},
  tg:{title:'Вақти омӯхтани React расид.',intro:'Мавзӯи рӯзи интихобшударо меомӯзем ва баъд дар код истифода мебарем.',day:'Рӯз',selectDay:'Интихоби рӯз',prepTitle:'Омодагӣ ба React',prepText:'Аввал HTML + CSS ва ду моҳи JavaScript-ро гузаред. Node.js ва муҳаррири код лозим мешаванд. Ҳар рӯз лоиҳаи худро такмил диҳед.',start:'Оғози рӯзи',apply:'Амалия',study:'Омӯзиш',steps:'Қадам ба қадам',previous:'Аз натиҷаи рӯзи гузашта истифода баред:',guide:'React · дастури расмӣ',practice:'Машқи ҳамин рӯз',tests:'Санҷиш ва мусоҳиба',next:'Рӯзи баъдӣ'},
  uk:{title:'Час розібратися з React.',intro:'Вивчаємо тему обраного дня, а потім застосовуємо її в коді.',day:'День',selectDay:'Вибір дня',prepTitle:'Підготовка до React',prepText:'Спочатку пройдіть HTML + CSS і два місяці JavaScript. Вам знадобляться Node.js і редактор коду. Щодня вдосконалюйте свій проєкт.',start:'Почати день',apply:'Застосовуємо',study:'Вивчаємо',steps:'Крок за кроком',previous:'Використовуємо результат дня',guide:'React · офіційний посібник',practice:'Практика цього дня',tests:'Тести та співбесіда',next:'Наступний день'}
};

export function ReactDay({requestedDay,requestedMonth}:{requestedDay?:number;requestedMonth?:number}) {
  const state=useLearningStore(),copy=COPY[state.language],labels=DAY_UI[state.language as keyof typeof DAY_UI] || DAY_UI.en, progression=PROGRESSION_COPY[state.language] || PROGRESSION_COPY.en;
  const account=useAccount();
  const month=requestedMonth || (state.activeMonth===2?2:1);
  // Never invent a selected day on first course entry; plan selection is authoritative.
  const stored=state.drafts['react-selected-day']?.split(':').map(Number);
  const remembered=stored?.[0]===month&&Number.isInteger(stored[1])&&stored[1]>=0&&stored[1]<=30?stored[1]:undefined;
  const days=reactDayProgress(month,state.completedTopics,state.completedPractice,state.confirmedDays);
  const rememberedAvailable=days.find(item=>item.day===remembered && item.status!=='upcoming');
  const day=requestedDay ?? rememberedAvailable?.day ?? days.find(item=>item.status==='current')?.day ?? (days.every(item=>item.status==='done')?days.at(-1)?.day:1) ?? 1;
  const entry=days.find(item=>item.day===day);
  const locked=entry?.status==='upcoming';
  const canConfirm=!!entry && !locked && reactDayReady(entry,state.completedTopics,state.completedPractice);
  const reactTopics=LEARNING_TOPICS.filter(topic=>topic.month<=2);
  const learned=reactTopics.filter(topic=>state.completedTopics.includes(topic.id)).length;
  const saveDraft=state.saveDraft,setPreferences=state.setPreferences;
  useEffect(()=>{
    if(day!==undefined&&state.drafts['react-selected-day']!==`${month}:${day}`)saveDraft('react-selected-day',`${month}:${day}`);
    if(state.activeMonth!==month)setPreferences({activeMonth:month});
  },[day,month,state.drafts,state.activeMonth,saveDraft,setPreferences]);
  return <div className="dashboard"><div className="dashboard-heading"><div><span className="eyebrow">React · {copy.month} {month}{day===undefined?'':' · '+labels.day+' '+day}</span><h1>{labels.title}</h1><p>{account.profile?.displayName?account.profile.displayName+', ':''}{labels.intro}</p></div><Link className="button subtle" href={`/plan/${month}`}>{copy.plan} <ArrowRight size={17}/></Link></div>
    <div className="stats-grid"><div className="stat"><BookOpen size={19}/><span>{copy.progress}</span><strong>{learned}<small> / {reactTopics.length}</small></strong></div><div className="stat"><ListChecks size={19}/><span>{copy.readCount}</span><strong>{state.studied.length}</strong></div><div className="stat"><Sparkles size={19}/><span>{copy.totalXP}</span><strong>{awardedXP(state.awards)}<small> XP</small></strong></div></div>
    <div className="react-day-content">{lessonTranslationNotice(state.language)&&<p role="note">{lessonTranslationNotice(state.language)}</p>}{locked?<article className="panel course-lesson"><h2>{progression.locked}</h2><Link className="button primary" href={`/plan/${month}`}>{progression.plan}</Link></article>:day===undefined?<article className="panel course-lesson"><h2>{labels.selectDay}</h2><p>{labels.intro}</p><Link className="button primary" href={`/plan/${month}`}>{copy.plan}<ArrowRight size={16}/></Link></article>:day===0?<article className="panel course-lesson"><h2>{labels.prepTitle}</h2><p>{labels.prepText}</p><Link className="button primary" href={`/plan/${month}`}>{copy.plan} <ArrowRight size={16}/></Link></article>:entry?<>
      <div className="section-heading"><h2>{labels.day} {day} · {entry.title}</h2><span className="badge">{entry.practiceOnly?labels.apply:labels.study}</span></div>
      {entry.topics.map(topic=><article className="panel course-lesson" key={topic.id}><h2>{topicTitle(topic,state.language)}</h2>{topic.explanation.map((part,index)=><section className="day-explanation" key={index}><h3>{tr(part.title,state.contentLanguage)}</h3><p className="preserve-lines">{tr(part.text,state.contentLanguage)}</p></section>)}{topic.code[0]&&<pre><code>{topic.code[0]}</code></pre>}<aside className="lesson-connections"><h3>{labels.steps}</h3><ol>{topic.flow.map((step,index)=><li key={index}>{tr(step,state.contentLanguage)}</li>)}</ol></aside><p className="source-line"><a href="https://react.dev/learn" target="_blank" rel="noreferrer">{labels.guide}</a></p><div className="button-row"><button className="button subtle" disabled={state.completedTopics.includes(topic.id)} onClick={()=>state.completeTopic(topic.id)}>{state.completedTopics.includes(topic.id)?copy.completed:copy.markLearned}</button><Link className="button primary" href={`/practice?month=${month}&topic=${topic.id}&day=${day}`}>{labels.practice} <ArrowRight size={16}/></Link><Link className="text-link" href={`/tests?topic=${topic.id}`}>{labels.tests}</Link></div></article>)}
      <section className="panel" aria-label={progression.confirm}>
        <p>{entry.status==='done'?progression.confirmed:canConfirm?progression.ready:progression.missing}</p>
        <div className="button-row"><button className="button primary" disabled={entry.status==='done'||!canConfirm} onClick={()=>state.confirmReactDay(month,day)}>{entry.status==='done'?progression.confirmed:progression.confirm}</button>
        {entry.status==='done'&&days.some(item=>item.day===day+1)&&<Link className="button subtle" href={`/home?month=${month}&day=${day+1}`}>{progression.next}<ArrowRight size={16}/></Link>}</div>
      </section>
    </>:null}</div>
  </div>;
}
