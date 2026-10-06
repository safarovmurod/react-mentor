import { beforeEach, expect, it } from 'vitest';
import { emptyProgress, emptyCourseProgress, mergeProgress, progressSnapshot } from '@/lib/account/progress';
import { switchLearningAccount, useLearningStore } from '@/stores/learning-store';
import { courseContentSchema } from '@/lib/courses/schema';

beforeEach(()=>{localStorage.clear();switchLearningAccount(null);});
it('keeps old React data and its cache key while remembering an independent course choice',()=>{
  localStorage.setItem('react-mentor-learning-v2',JSON.stringify({version:2,state:{studied:['quiz-q001'],notes:[{id:'legacy',title:'React',content:'My note'}]}}));
  switchLearningAccount(null);
  const state=useLearningStore.getState();expect(state.studied).toEqual(['quiz-q001']);expect(state.courses).toEqual({});
  state.chooseCourse('html');state.completeCourseLesson('html','intro');state.saveCourseNote('html',{id:'same',title:'HTML',content:'HTML note'});
  switchLearningAccount(null);expect(useLearningStore.getState()).toMatchObject({selectedCourse:'html',courseChosen:true,studied:['quiz-q001'],courses:{html:{completedTopics:['intro']}}});
  expect(useLearningStore.getState().notes[0].id).toBe('legacy');
});
it('isolates identically named lessons, drafts and notes between courses and accounts',()=>{
  switchLearningAccount('a');const state=useLearningStore.getState();
  state.completeCourseLesson('html','intro');state.saveCourseNote('html',{id:'n',title:'HTML',content:'private A'});
  state.chooseCourse('css');expect(useLearningStore.getState().courses.css).toBeUndefined();
  state.completeCourseLesson('css','intro');state.saveCourseNote('css',{id:'n',title:'CSS',content:'other subject'});
  switchLearningAccount('b');expect(useLearningStore.getState().courses).toEqual({});expect(useLearningStore.getState().courseChosen).toBe(false);
  switchLearningAccount('a');expect(useLearningStore.getState().courses.html?.notes[0].content).toBe('private A');
  expect(useLearningStore.getState().courses.css?.notes[0].content).toBe('other subject');
  switchLearningAccount(null);expect(useLearningStore.getState().courses).toEqual({});
});
it('merges concurrent course work without doubling XP and honors note deletion and course-choice timestamps',()=>{
  const remote=progressSnapshot({selectedCourse:'css',courseChosen:true,preferenceClock:{selectedCourse:200,courseChosen:200},courses:{html:{completedTopics:['one'],awards:{'lesson:one':5},deletedNotes:{n:200}},css:{notes:[{id:'c',title:'CSS',content:'C'}]}}});
  const local=progressSnapshot({selectedCourse:'html',courseChosen:true,preferenceClock:{selectedCourse:100,courseChosen:100},courses:{html:{completedTopics:['one','two'],awards:{'lesson:one':5,'lesson:two':5},notes:[{id:'n',title:'Old',content:'Old'}],noteClock:{n:100}}}});
  const merged=mergeProgress(remote,local);
  expect(merged.selectedCourse).toBe('css');expect(merged.courses.html?.completedTopics).toEqual(['one','two']);
  expect(merged.courses.html?.notes).toEqual([]);expect(merged.courses.css?.notes).toHaveLength(1);
  expect(merged.courses.html?.awards).toEqual({'lesson:one':5,'lesson:two':5});
  expect(mergeProgress(merged,merged)).toEqual(merged);
  expect(merged.studied).toEqual(emptyProgress().studied);
});
it('records attempts only once per course/day and keeps React awards separate',()=>{
  const state=useLearningStore.getState(), question={id:'same-question',topicId:'intro'};
  state.recordCourseAnswer('html',question,'test',true,'0');state.recordCourseAnswer('html',question,'test',true,'0');
  state.recordCourseAnswer('css',question,'test',false,'1');
  const result=useLearningStore.getState();
  expect(Object.keys(result.courses.html!.answers)).toHaveLength(1);
  expect(result.courses.html!.awards['test:same-question']).toBe(10);
  expect(result.courses.css!.awards).toEqual({});expect(result.awards).toEqual({});
  expect(emptyCourseProgress().notes).toEqual([]);
});
it('rejects nonexistent course keys and incomplete source references',()=>{
  expect(()=>progressSnapshot({courses:{unknown:{}}})).toThrow();
  expect(()=>courseContentSchema.parse({courseId:'html',sources:[],files:[{id:'f',title:'x',url:'/course-files/'+ 'a'.repeat(64)+'.pdf',bytes:1,sha256:'a'.repeat(64),sourceIds:['missing']}],lessons:[]})).toThrow();
});
