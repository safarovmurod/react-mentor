import { beforeEach, describe, expect, it } from 'vitest';
import { emptyProgress, mergeProgress, progressSnapshot } from '@/lib/account/progress';
import { courseDayProgress, courseMonthPlan } from '@/lib/courses/plan';
import { reactDayProgress, reactMonthDays } from '@/lib/react-plan';
import type { CourseLesson } from '@/lib/courses/schema';
import { switchLearningAccount, useLearningStore } from '@/stores/learning-store';

const text=(value:string)=>({ru:value,tg:value});
const lessons:CourseLesson[]=[1,2,3].map(day=>({id:`lesson-${day}`,day,title:text('Lesson'),summary:text('Summary'),level:'beginner',sourceIds:['official'],sections:[{title:text('Step'),body:text('Body')}],questions:[],practice:{task:text('Build'),hint:text('Try'),solution:'<h1>Hello</h1>',criteria:[text('Works')]}}));
const plan=courseMonthPlan(lessons);
beforeEach(()=>{localStorage.clear();switchLearningAccount(null);});

describe('learner-confirmed sequential progression',()=>{
 it('exposes only day one initially and never unlocks from a theory or practice checkbox alone',()=>{
  expect(courseDayProgress(plan,[],[],[]).days.map(item=>item.status)).toEqual(['current','upcoming','upcoming']);
  expect(courseDayProgress(plan,['lesson-1'],['lesson-1'],[]).current?.day).toBe(1);
  const state=useLearningStore.getState();state.completeCourseLesson('html','lesson-1');state.completeCoursePractice('html','lesson-1');
  expect(useLearningStore.getState().courses.html?.confirmedDays).toEqual([]);
  expect(state.confirmCourseDay('html',2,plan)).toBe(false);
  expect(state.confirmCourseDay('html',1,plan)).toBe(true);
  const progress=useLearningStore.getState().courses.html!;
  expect(courseDayProgress(plan,progress.completedTopics,progress.completedPractice,progress.confirmedDays).days.map(item=>item.status)).toEqual(['done','current','upcoming']);
 });
 it('requires both learning and practice before confirmation and awards practice XP only once',()=>{
  const state=useLearningStore.getState();
  expect(state.confirmCourseDay('html',1,plan)).toBe(false);
  state.completeCourseLesson('html','lesson-1');expect(state.confirmCourseDay('html',1,plan)).toBe(false);
  state.completeCoursePractice('html','lesson-1');expect(state.confirmCourseDay('html',1,plan)).toBe(true);
  expect(state.confirmCourseDay('html',1,plan)).toBe(false);
  state.completeCoursePractice('html','lesson-1');
  expect(useLearningStore.getState().courses.html!.awards['practice:lesson-1']).toBe(4);
  expect(useLearningStore.getState().courses.html!.confirmedDays).toEqual(['1']);
 });
 it('does not accept a later completion imported from another device as a bypass',()=>{
  const statuses=courseDayProgress(plan,['lesson-1','lesson-2','lesson-3'],['lesson-1','lesson-2','lesson-3'],['3']);
  expect(statuses.days.map(item=>item.status)).toEqual(['current','upcoming','upcoming']);
 });
 it('preserves day confirmations in account sync and keeps guest/account/course scopes separate',()=>{
  const state=useLearningStore.getState();state.completeCourseLesson('html','lesson-1');state.completeCoursePractice('html','lesson-1');state.confirmCourseDay('html',1,plan);
  switchLearningAccount('other');expect(useLearningStore.getState().courses.html).toBeUndefined();
  switchLearningAccount(null);expect(useLearningStore.getState().courses.html!.confirmedDays).toEqual(['1']);
  expect(useLearningStore.getState().courses.css).toBeUndefined();
  const merged=mergeProgress(progressSnapshot({confirmedDays:['1:1'],courses:{html:{confirmedDays:['1']}}}),progressSnapshot({confirmedDays:['1:1','1:2'],courses:{html:{confirmedDays:['1','2']}}}));
  expect(merged.confirmedDays).toEqual(['1:1','1:2']);expect(merged.courses.html!.confirmedDays).toEqual(['1','2']);
  expect(mergeProgress(merged,merged)).toEqual(merged);
 });
 it('upgrades manually reviewed practice to a real passed check without duplicate XP',()=>{
  const state=useLearningStore.getState();state.completeCoursePractice('html','lesson-1');state.completeCoursePractice('html','lesson-1',true);state.completeCoursePractice('html','lesson-1',true);
  state.completePractice('exercise',false);state.completePractice('exercise',true);state.completePractice('exercise',false);
  expect(useLearningStore.getState().courses.html!.completedPractice).toEqual(['lesson-1']);
  expect(useLearningStore.getState().courses.html!.awards['practice:lesson-1']).toBe(20);
  expect(useLearningStore.getState().awards['practice:exercise']).toBe(20);
 });
 it('migrates old progress without silently claiming old days were confirmed',()=>{
  expect(progressSnapshot({completedTopics:['old'],completedPractice:['old']}).confirmedDays).toEqual([]);
  expect(emptyProgress().confirmedDays).toEqual([]);
 });
 it('requires React practice and explicit confirmation, and rejects skipping days',()=>{
  const state=useLearningStore.getState(),first=reactMonthDays(1)[0];
  expect(state.confirmReactDay(1,2)).toBe(false);
  for(const topic of first.topics) state.completeTopic(topic.id);
  expect(state.confirmReactDay(1,1)).toBe(false);
  for(const topic of first.topics) state.completePractice(topic.id+'-exercise-1',false);
  expect(state.confirmReactDay(1,1)).toBe(true);
  const updated=useLearningStore.getState();
  expect(reactDayProgress(1,updated.completedTopics,updated.completedPractice,updated.confirmedDays).slice(0,3).map(item=>item.status)).toEqual(['done','current','upcoming']);
  expect(state.confirmReactDay(1,1)).toBe(false);
  expect(state.confirmReactDay(0,1)).toBe(false);
  expect(reactDayProgress(2,updated.completedTopics,updated.completedPractice,updated.confirmedDays)[0].status).toBe('upcoming');
  const monthOne=reactMonthDays(1);
  expect(reactDayProgress(2,monthOne.flatMap(day=>day.topics.map(topic=>topic.id)),monthOne.flatMap(day=>day.topics.map(topic=>topic.id+'-exercise-1')),monthOne.map(day=>'1:'+day.day))[0].status).toBe('current');
 });
});
