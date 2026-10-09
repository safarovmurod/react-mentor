// @vitest-environment node
import {expect,it} from 'vitest';
import {loadCourseContent} from '@/lib/courses/content';
import {courseMonthPlan,courseDayProgress} from '@/lib/courses/plan';
import {reactMonthDays,reactDayComplete} from '@/lib/react-plan';
import {LEARNING_TOPICS,QUIZ_QUESTIONS} from '@/content/course';
import index from '@/content/learning-index.json';
it('each new curriculum has 30 different lessons, exercises, questions and earlier prerequisite links',async()=>{
 for(const id of ['html','javascript-1','javascript-2','git','cpp'] as const){
  const content=await loadCourseContent(id),plan=courseMonthPlan(content.lessons);
  expect(plan.map(d=>d.day)).toEqual(Array.from({length:30},(_,i)=>i+(id==='html'?0:1)));
  expect(new Set(plan.map(d=>d.lesson.id)).size).toBe(30);
  for(const {day,lesson} of plan){expect(lesson.practice?.criteria.length).toBeGreaterThan(0);expect(lesson.questions.length).toBeGreaterThan(0);for(const previous of lesson.prerequisiteDays || [])expect(previous).toBeLessThan(day);}
  const first=plan[0].lesson;
  expect(courseDayProgress(plan,[first.id],[]).days[0].status).toBe('current');
  expect(courseDayProgress(plan,[first.id],[first.id]).days[0].status).toBe('done');
 }
});
it('React daily plans cover every existing topic without starting with a project before teaching its foundation',()=>{
 for(const month of [1,2]){
  const days=reactMonthDays(month);expect(days).toHaveLength(30);expect(days[0].practiceOnly).toBe(false);
  const covered=new Set(days.flatMap(d=>d.topics.map(t=>t.id)));
  expect(covered).toEqual(new Set(LEARNING_TOPICS.filter(t=>t.month===month).map(t=>t.id)));
 }
});
it('small shared navigation index preserves the daily question selection pool and topic counts',()=>{
 expect(index.topics).toEqual(LEARNING_TOPICS.map(({id,month})=>({id,month})));
 expect(index.questions.map(q=>[q.id,q.month,q.options.length>0])).toEqual(QUIZ_QUESTIONS.map(q=>[q.id,q.month,q.options.length>0]));
});

it('React project days need a completed exercise rather than inheriting a theory-only completion',()=>{
 const day=reactMonthDays(2).find(day=>day.practiceOnly)!;
 const learned=day.topics.map(topic=>topic.id);
 expect(reactDayComplete(day,learned,[])).toBe(false);
 expect(reactDayComplete(day,learned,learned.map(id=>id+'-exercise-1'))).toBe(true);
});

it('Next.js has its own validated twenty-day curriculum with real explanations, exercises and sources',async()=>{
 const course=await loadCourseContent('nextjs');
 const plan=courseMonthPlan(course.lessons);
 expect(course.courseId).toBe('nextjs');
 expect(plan.map(item=>item.day)).toEqual(Array.from({length:20},(_,index)=>index+1));
 expect(new Set(plan.map(item=>item.lesson.id)).size).toBe(20);
 expect(plan[0].lesson.title.ru).toContain('Next.js');
 expect(plan.every(item=>item.lesson.sections.length>0&&!!item.lesson.practice?.criteria.length)).toBe(true);
 expect(plan.every(item=>(item.lesson.prerequisiteDays||[]).every(previous=>previous<item.day))).toBe(true);
 const first=plan[0].lesson;
 expect(courseDayProgress(plan,[first.id],[first.id]).days[0].status).toBe('done');
});
