import { LEARNING_TOPICS, type LearningTopic } from '@/content/course';
export interface ReactDay { day:number; title:string; topics:LearningTopic[]; practiceOnly:boolean; }
export function reactDayComplete(day:ReactDay,completedTopics:readonly string[],completedPractice:readonly string[]) {
  return day.practiceOnly?day.topics.every(topic=>completedPractice.some(id=>id.startsWith(topic.id+'-exercise-'))):day.topics.every(topic=>completedTopics.includes(topic.id));
}
const projectSteps=['Собираем интерфейс','Работа с формой','Обработка ошибок','Связываем компоненты','Данные и загрузка','Проверяем крайние случаи','Адаптируем телефон','Проверяем регрессии','Объясняем проект'];
export function reactMonthDays(month:number):ReactDay[] {
  const topics=LEARNING_TOPICS.filter(topic=>topic.month===month);
  return Array.from({length:30},(_,index)=>{
    const start=topics.length>=30?Math.floor(index*topics.length/30):index;
    const end=topics.length>=30?Math.floor((index+1)*topics.length/30):index+1;
    const learning=topics.slice(start,end);
    const practiceOnly=learning.length===0;
    const selected=learning.length?learning:[topics[(index-topics.length)%topics.length]].filter(Boolean);
    const projectIndex=Math.max(0,index-topics.length);
    return {day:index+1,title:practiceOnly?projectSteps[projectIndex%projectSteps.length]+': '+selected[0]?.titleRu:selected.map(t=>t.titleRu).join(' · '),topics:selected,practiceOnly};
  });
}
