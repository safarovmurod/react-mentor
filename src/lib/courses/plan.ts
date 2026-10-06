import type { CourseLesson } from './schema';

// Every day uses an actual published topic; review days do not invent new lessons.
export function courseMonthPlan(lessons: CourseLesson[]) {
  if (!lessons.length) return [];
  return Array.from({length:30},(_,index)=>{
    const learning=index<lessons.length;
    const offset=index-lessons.length;
    const lesson=lessons[learning?index:Math.floor(offset/2)%lessons.length];
    const section=learning?'answers':offset%2===0&&lesson.practice?'practice':'tests';
    return {day:index+1,lesson,section};
  });
}
