'use client';
import Link from 'next/link';
import { ArrowUpRight, Code2, Layers3, Globe2 } from 'lucide-react';
import { MONTHS, LEARNING_TOPICS } from '@/content/course';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
const icons=[Code2,Layers3,Globe2];
export function MonthCards({compact=false}:{compact?:boolean}) {
  const language=useLearningStore(state=>state.language);
  const completed=useLearningStore(state=>state.completedTopics);
  const activeMonth=useLearningStore(state=>state.activeMonth);
  const setPreferences=useLearningStore(state=>state.setPreferences);
  const copy=COPY[language];
  return <div className={compact?'month-stack':'month-grid'}>{MONTHS.filter(month=>month.id<=2).map((month,index)=>{
    const topics=LEARNING_TOPICS.filter(topic=>topic.month===month.id);
    const count=topics.filter(topic=>completed.includes(topic.id)).length;
    const Icon=icons[index];
    return <Link key={month.id} href={`/plan/${month.id}`} onClick={()=>setPreferences({activeMonth:month.id})} className={`month-card month-${month.id} ${activeMonth===month.id?'selected':''}`}>
      <div className="between"><span className="month-icon"><Icon size={21}/></span><span className="eyebrow">{copy.month} 0{month.id}</span><ArrowUpRight size={18}/></div>
      <h3>{language==='ru'?month.titleRu:month.title}</h3><p>{language==='ru'?month.descriptionRu:month.description}</p>
      <div className="month-footer"><span>{count} / {topics.length} {copy.topics.toLowerCase()}</span><span>{Math.round(count/topics.length*100)}%</span></div><div className="progress-track"><span style={{width:`${count/topics.length*100}%`}}/></div>
    </Link>;
  })}</div>;
}
