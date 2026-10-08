import type { CourseLesson } from './schema';

export interface CoursePlanDay { day: number; lesson: CourseLesson; section: 'answers' | 'practice' | 'tests'; }

// Every day uses an actual published topic; review days do not invent new lessons.
export function courseMonthPlan(lessons: CourseLesson[]): CoursePlanDay[] {
  if (!lessons.length) return [];
  const scheduled = lessons.filter(lesson => lesson.day !== undefined).sort((a,b) => a.day! - b.day!);
  if (scheduled.length) return scheduled.map(lesson => ({day:lesson.day!,lesson,section:'answers'}));
  return Array.from({length:30},(_,index)=>{
    const learning=index<lessons.length;
    const offset=index-lessons.length;
    const lesson=lessons[learning?index:Math.floor(offset/2)%lessons.length];
    const section=learning?'answers':offset%2===0&&lesson.practice?'practice':'tests';
    return {day:index+1,lesson,section};
  });
}

export type CourseDayStatus = 'done' | 'current' | 'upcoming';
export interface CourseDayItem {
  day: number;
  lesson: CourseLesson;
  section: 'answers' | 'practice' | 'tests';
  status: CourseDayStatus;
}

// День «answers» завершён, когда урок отмечен изученным; «practice» — когда сдана практика.
// День «tests» повторению не мешает: вопросы доступны в любой момент.
export function courseDayProgress(
  plan: ReturnType<typeof courseMonthPlan>,
  completedTopics: readonly string[],
  completedPractice: readonly string[],
): { days: CourseDayItem[]; current: CourseDayItem | null } {
  let current: CourseDayItem | null = null;
  const days = plan.map(item => {
    const done = item.section === 'answers'
      ? completedTopics.includes(item.lesson.id) && (!item.lesson.day || !item.lesson.practice || completedPractice.includes(item.lesson.id))
      : item.section === 'practice'
        ? completedPractice.includes(item.lesson.id)
        : true;
    let status: CourseDayStatus = 'upcoming';
    if (done) status = 'done';
    else if (!current) { status = 'current'; current = { ...item, status }; }
    return { ...item, status };
  });
  return { days, current };
}
