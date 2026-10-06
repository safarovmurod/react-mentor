// @vitest-environment node
import { runInNewContext } from 'node:vm';
import { expect, it } from 'vitest';
import { loadCourseContent } from '@/lib/courses/content';
import { courseMonthPlan } from '@/lib/courses/plan';

async function example(id:string,expression:string) {
  const content=await loadCourseContent('javascript-1');
  const code=content.lessons.find(lesson=>lesson.id===id)!.sections[0].code!;
  return runInNewContext(code+'\n'+expression,{console:{log:()=>{}}},{timeout:500});
}
it('reviewed exercises handle missing nested values, zero prices and empty scores',async ()=>{
  expect(await example('js-deep-property','deepProperty({a:{b:0}},"a.b")')).toBe(0);
  expect(await example('js-deep-property','deepProperty({a:false},"a")')).toBe(false);
  expect(await example('js-deep-property','deepProperty({},"a.b")')).toBeUndefined();
  expect(await example('js-category-stats','categoryStats([{category:"a",price:0}],"a")')).toEqual({count:1,totalPrice:0,avgPrice:0});
  expect(await example('js-average-score','averageScores([{name:"A",scores:[]},{name:"B",scores:[0]}])')).toEqual([{name:'A',avg:null},{name:'B',avg:0}]);
  expect(await example('js-gcd-lcm','[gcd(32,8),lcm(0,6),lcm(4,6)]')).toEqual([8,0,12]);
});
it('date exercises distinguish birthdays and handle unsorted duplicate days',async ()=>{
  expect(await example('js-age-birthday','[ageOn("2000-03-01","2026-02-28"),ageOn("2000-03-01","2026-03-01")]')).toEqual([25,26]);
  expect(await example('js-date-range','dateRangeInfo(["2025-01-15T12:00:00Z","2024-12-31"])')).toEqual({earliest:'2024-12-31',latest:'2025-01-15',daysBetween:15});
  expect(await example('js-date-range','dateRangeInfo([])')).toBeNull();
  expect(await example('js-longest-streak','longestStreak(["2025-03-31","2025-03-30","2025-03-30","2025-03-29"])')).toBe(3);
  expect(await example('js-longest-streak','longestStreak([])')).toBe(0);
});
it('daily plans point to available topics and include practice and quizzes',async ()=>{
  for (const id of ['javascript-1','javascript-2'] as const) {
    const content=await loadCourseContent(id),plan=courseMonthPlan(content.lessons);
    expect(plan).toHaveLength(30);
    expect(plan.some(day=>day.section==='practice')).toBe(true);
    expect(plan.some(day=>day.section==='tests')).toBe(true);
    for (const day of plan) expect(content.lessons).toContain(day.lesson);
  }
  expect(courseMonthPlan([])).toEqual([]);
});
