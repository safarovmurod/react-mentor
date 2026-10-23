// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { COURSE_CATALOG } from '@/content/courses/catalog';
import { loadCourseContent } from '@/lib/courses/content';
import { courseMonthPlan } from '@/lib/courses/plan';
import { exercisesForTopic } from '@/content/practice';
import { reactMonthDays } from '@/lib/react-plan';

// A category/card is not evidence of a course: load every published module and
// inspect the actual scheduled lessons, tasks and references behind its count.
describe('every published day contains a lesson and practice',()=>{
 for(const course of COURSE_CATALOG.filter(course=>course.id!=='react')){
  it(course.id,async()=>{
   if(course.id==='react')return;
   const content=await loadCourseContent(course.id);
   const plan=courseMonthPlan(content.lessons);
   expect(plan.length).toBe(course.publishedDays);
   expect(plan.map(day=>day.day)).toEqual(Array.from({length:plan.length},(_,index)=>index+1));
   expect(new Set(plan.map(day=>day.lesson.id)).size).toBe(plan.length);
   for(const {lesson} of plan){
    expect(lesson.sections.length).toBeGreaterThan(0);
    for(const section of lesson.sections){expect(section.title.ru.trim()).not.toBe('');expect(section.body.ru.trim()).not.toBe('');expect(section.body.tg.trim()).not.toBe('');}
    expect(lesson.practice?.task.ru.trim()).toBeTruthy();
    expect(lesson.practice?.solution.trim()).toBeTruthy();
    expect(lesson.practice?.criteria.length).toBeGreaterThan(0);
    expect(lesson.questions.length).toBeGreaterThan(0);
   }
  });
 }
 it('React schedules both complete months without empty days',()=>{
  for(const month of [1,2]){
   const plan=reactMonthDays(month);
   expect(plan).toHaveLength(30);
   for(const day of plan){
    expect(day.topics.length).toBeGreaterThan(0);
    for(const topic of day.topics){
     expect(topic.explanation.some(part=>part.text.trim()), `React month ${month} day ${day.day}: ${topic.id}`).toBe(true);
     const exercises=exercisesForTopic(topic,'ru');
     expect(exercises.length).toBeGreaterThan(0);
     for(const exercise of exercises){
      expect(exercise.task.trim()).toBeTruthy();
      expect(exercise.solution.trim()).toBeTruthy();
      expect(exercise.criteria.length).toBeGreaterThan(0);
     }
    }
   }
  }
 });
});
