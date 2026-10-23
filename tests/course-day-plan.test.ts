// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { courseDayProgress, courseMonthPlan } from '@/lib/courses/plan';
import type { CourseLesson } from '@/lib/courses/schema';

const text = (value: string) => ({ tg: value, ru: value });
function lesson(id: string, level: 'beginner' | 'intermediate' = 'beginner'): CourseLesson {
  return {
    id, title: text('Урок ' + id), summary: text('Описание ' + id), level, sourceIds: ['s'],
    sections: [{ title: text('Шаги'), body: text('Тело урока ' + id) }],
    questions: [{ id: 'q-' + id, question: text('Вопрос ' + id), answer: text('Ответ ' + id), options: [text('а'), text('б')], correctIndex: 0 }],
    practice: { task: text('Задача ' + id), hint: text('Подсказка ' + id), solution: '// решение', criteria: [text('Критерий')] },
  };
}
const lessons = [lesson('a'), lesson('b', 'intermediate')];

describe('courseMonthPlan', () => {
  it('publishes each actual unscheduled lesson once without padded review days', () => {
    const plan = courseMonthPlan(lessons);
    expect(plan).toHaveLength(2);
    expect(plan.map(item=>[item.day,item.lesson.id,item.section])).toEqual([[1,'a','answers'],[2,'b','answers']]);
  });
  it('keeps an explicit schedule in order and reference-only lessons outside that schedule',()=>{
    const scheduled=[{...lesson('second'),day:2},lesson('reference'),{...lesson('first'),day:1}];
    expect(courseMonthPlan(scheduled).map(item=>[item.day,item.lesson.id])).toEqual([[1,'first'],[2,'second']]);
  });
  it('does not create a day for an empty course or duplicate a one-lesson module',()=>{
    expect(courseMonthPlan([])).toEqual([]);
    expect(courseMonthPlan([lesson('single')]).map(item=>item.day)).toEqual([1]);
  });
});

describe('courseDayProgress', () => {
  it('requires practice as well as theory for unscheduled lessons', () => {
    const plan=courseMonthPlan(lessons);
    expect(courseDayProgress(plan,['a'],[]).current?.day).toBe(1);
    const {days,current}=courseDayProgress(plan,['a'],['a']);
    expect(days[0].status).toBe('done');
    expect(days[1]).toMatchObject({status:'current',day:2,section:'answers'});
    expect(current?.day).toBe(2);
  });
  it('requires explicit confirmation before opening the next real published day',()=>{
    const plan=courseMonthPlan(lessons);
    expect(courseDayProgress(plan,['a'],['a'],[]).days.map(item=>item.status)).toEqual(['current','upcoming']);
    expect(courseDayProgress(plan,['a'],['a'],['1']).days.map(item=>item.status)).toEqual(['done','current']);
  });
  it('does not inherit completion for a missing practical requirement',()=>{
    const plan=courseMonthPlan(lessons);
    expect(courseDayProgress(plan,['a','b'],['a']).current?.day).toBe(2);
  });
  it('has no current or extra day once all real lessons are completed',()=>{
    const {current,days}=courseDayProgress(courseMonthPlan(lessons),['a','b'],['a','b'],['1','2']);
    expect(current).toBeNull();expect(days).toHaveLength(2);expect(days.every(day=>day.status==='done')).toBe(true);
  });
  it('returns an empty progress list for an empty plan',()=>{
    expect(courseDayProgress([],[],[],[])).toEqual({days:[],current:null});
  });
});
