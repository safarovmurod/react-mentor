'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LearningQuestion } from '@/content/course';
import learningIndex from '@/content/learning-index.json';
import { chooseDailyQuestions, dateKey, nextReview, type StudyMode } from '@/lib/learning';
import { accountStorageKey, emptyProgress, emptyCourseProgress, progressSnapshot, type Progress } from '@/lib/account/progress';
import type { CourseId, ImportedCourseId } from '@/lib/courses/ids';
import { courseDayProgress, courseDayReady, type CoursePlanDay } from '@/lib/courses/plan';
import { contentLocaleFor, persistManualLocale, type InterfaceLocale } from '@/lib/locale';

const studyTimeFlushes = new Set<() => void>();

/** Flush the mounted timer before its account or course scope changes. */
export function registerStudyTimeFlush(flush: () => void) {
  studyTimeFlushes.add(flush);
  return () => { studyTimeFlushes.delete(flush); };
}

function flushPendingStudyTime() {
  for (const flush of [...studyTimeFlushes]) flush();
}

interface LearningState extends Progress {
  ready: boolean;
  storageError: string;
  setPreferences: (values: Partial<Pick<LearningState, 'language' | 'contentLanguage' | 'dailyLimit' | 'activeMonth' | 'theme'>>) => void;
  ensureDailySet: (month: number, today?: string) => string[];
  markStudied: (questionId: string) => void;
  recordAnswer: (question: LearningQuestion, mode: StudyMode, correct: boolean, answer: string, today?: string) => void;
  completeTopic: (topicId: string) => void;
  completePractice: (practiceId: string, verified: boolean) => void;
  confirmCourseDay: (courseId: ImportedCourseId, day: number, plan: CoursePlanDay[]) => boolean;
  confirmReactDay: (month: number, day: number) => boolean;
  saveDraft: (id: string, code: string) => void;
  saveNote: (note: {id:string;title:string;content:string}) => void;
  deleteNote: (id:string) => void;
  addStudySeconds: (seconds:number, courseId?:CourseId) => void;
  chooseCourse: (courseId:CourseId) => void;
  completeCourseLesson: (courseId:ImportedCourseId, lessonId:string) => void;
  recordCourseAnswer: (courseId:ImportedCourseId, question:{id:string;topicId:string}, mode:StudyMode, correct:boolean, answer:string) => void;
  saveCourseNote: (courseId:ImportedCourseId, note:{id:string;title:string;content:string}) => void;
  deleteCourseNote: (courseId:ImportedCourseId, id:string) => void;
  completeCoursePractice: (courseId:ImportedCourseId, lessonId:string, verified?:boolean) => void;
  saveCourseDraft: (courseId:ImportedCourseId, id:string, code:string) => void;
}

export const useLearningStore = create<LearningState>()(persist((set, get) => ({
  ...emptyProgress(), ready:false, storageError:'',
  setPreferences(values) {
    if (values.language) persistManualLocale(values.language);
    set({...values,preferenceClock:{...get().preferenceClock,...Object.fromEntries(Object.keys(values).map(key=>[key,Date.now()]))}});
  },
  ensureDailySet(month, today = dateKey()) {
    const key = `${today}-${month}`;
    const current = get();
    if (current.dailySets[key]) return current.dailySets[key];
    const ids = chooseDailyQuestions(learningIndex.questions, month, current.dailyLimit, current.studied, Object.values(current.reviews), today);
    set({dailySets:{...current.dailySets,[key]:ids}});
    return ids;
  },
  markStudied(questionId) {
    const current = get();
    if (current.studied.includes(questionId)) return;
    set({studied:[...current.studied,questionId], awards:{...current.awards,[`learn:${questionId}`]:2}});
  },
  recordAnswer(question, mode, correct, answer, today = dateKey()) {
    const current = get();
    const key = `${today}:${mode}:${question.id}`;
    if (current.answers[key]) return;
    const awards = {...current.awards};
    if (correct) awards[`${mode}:${question.id}`] = mode === 'test' ? 10 : 5;
    set({
      answers:{...current.answers,[key]:{questionId:question.id,topicId:question.topicId,mode,correct,answer,date:today}}, awards,
      reviews:{...current.reviews,[question.id]:nextReview(current.reviews[question.id],question.id,question.topicId,correct,today)},
      reviewClock:{...current.reviewClock,[question.id]:Date.now()},
    });
  },
  completeTopic(topicId) {
    const current = get();
    if (current.completedTopics.includes(topicId)) return;
    set({completedTopics:[...current.completedTopics,topicId],awards:{...current.awards,[`lesson:${topicId}`]:5}});
  },
  completePractice(practiceId, verified) {
    const current = get();
    const points=verified ? 20 : 4;
    if (current.completedPractice.includes(practiceId) && (current.awards[`practice:${practiceId}`] || 0)>=points) return;
    set({completedPractice:[...new Set([...current.completedPractice,practiceId])],awards:{...current.awards,[`practice:${practiceId}`]:Math.max(points,current.awards[`practice:${practiceId}`] || 0)}});
  },
  confirmCourseDay(courseId, day, plan) {
    const state = get(), progress = state.courses[courseId] || emptyCourseProgress();
    const current = courseDayProgress(plan, progress.completedTopics, progress.completedPractice, progress.confirmedDays).current;
    if (!current || current.day !== day || !courseDayReady(current, progress.completedTopics, progress.completedPractice)) return false;
    set({courses: {...state.courses, [courseId]: {...progress, confirmedDays: [...progress.confirmedDays, String(day)]}}});
    return true;
  },
  confirmReactDay(month, day) {
    if (month !== 1 && month !== 2) return false;
    const state = get();
    // Use the shared lightweight index, not the full React lesson corpus in this global store.
    const dayReady=(targetMonth:number, targetDay:number)=>{
      const topics=learningIndex.topics.filter(topic=>topic.month===targetMonth);
      const index=targetDay-1;
      const start=topics.length>=30?Math.floor(index*topics.length/30):index;
      const end=topics.length>=30?Math.floor((index+1)*topics.length/30):index+1;
      const learning=topics.slice(start,end);
      const selected=learning.length?learning:[topics[(index-topics.length)%topics.length]].filter(Boolean);
      return selected.length>0 && selected.every(topic=>(!learning.length || state.completedTopics.includes(topic.id)) && state.completedPractice.some(id=>id.startsWith(topic.id+'-exercise-') || (topic.id==='local-practice' && id.startsWith('local-project-'))));
    };
    if (!Number.isInteger(day)||day<1||day>30||!dayReady(month,day)||state.confirmedDays.includes(`${month}:${day}`)) return false;
    if (month===2 && Array.from({length:30},(_,index)=>index+1).some(previous=>!state.confirmedDays.includes(`1:${previous}`)||!dayReady(1,previous))) return false;
    if (Array.from({length:day-1},(_,index)=>index+1).some(previous=>!state.confirmedDays.includes(`${month}:${previous}`)||!dayReady(month,previous))) return false;
    set({confirmedDays: [...state.confirmedDays, `${month}:${day}`]});
    return true;
  },
  saveDraft(id, code) { set({drafts:{...get().drafts,[id]:code},draftClock:{...get().draftClock,[id]:Date.now()}}); },
  saveNote(note) { set({notes:[note,...get().notes.filter(item=>item.id!==note.id)],noteClock:{...get().noteClock,[note.id]:Date.now()}}); },
  deleteNote(id) { set({notes:get().notes.filter(item=>item.id!==id),deletedNotes:{...get().deletedNotes,[id]:Date.now()}}); },
  addStudySeconds(seconds, courseId) {
    const today=dateKey(), state=get(), course=courseId || state.selectedCourse, updates={studySeconds:{...state.studySeconds,[today]:(state.studySeconds[today] || 0)+seconds}};
    if (course==='react') set(updates);
    else {
      const progress=state.courses[course] || emptyCourseProgress();
      set({...updates,courses:{...state.courses,[course]:{...progress,studySeconds:{...progress.studySeconds,[today]:(progress.studySeconds[today] || 0)+seconds}}}});
    }
  },
  chooseCourse(selectedCourse) {
    if (selectedCourse !== get().selectedCourse) flushPendingStudyTime();
    set({selectedCourse,courseChosen:true,preferenceClock:{...get().preferenceClock,selectedCourse:Date.now(),courseChosen:Date.now()}});
  },
  saveCourseDraft(courseId,id,code) {
    const courses=get().courses,progress=courses[courseId] || emptyCourseProgress();
    set({courses:{...courses,[courseId]:{...progress,drafts:{...progress.drafts,[id]:code},draftClock:{...progress.draftClock,[id]:Date.now()}}}});
  },
  completeCourseLesson(courseId, lessonId) {
    const courses=get().courses, progress=courses[courseId] || emptyCourseProgress();
    if (progress.completedTopics.includes(lessonId)) return;
    set({courses:{...courses,[courseId]:{...progress,completedTopics:[...progress.completedTopics,lessonId],awards:{...progress.awards,['lesson:'+lessonId]:5}}}});
  },
  recordCourseAnswer(courseId, question, mode, correct, answer) {
    const courses=get().courses, progress=courses[courseId] || emptyCourseProgress(), today=dateKey(), key=`${today}:${mode}:${question.id}`;
    // A wrong answer never blocks a retry; once correct, the attempt is recorded.
    if (progress.answers[key]?.correct) return;
    set({courses:{...courses,[courseId]:{...progress,
      answers:{...progress.answers,[key]:{questionId:question.id,topicId:question.topicId,mode,correct,answer,date:today}},
      awards:correct ? {...progress.awards,[`${mode}:${question.id}`]:mode==='test'?10:5}:progress.awards,
      masteredQuestions:(mode==='test'&&correct&&!progress.masteredQuestions.includes(question.id)) ? [...progress.masteredQuestions,question.id] : progress.masteredQuestions,
      reviews:{...progress.reviews,[question.id]:nextReview(progress.reviews[question.id],question.id,question.topicId,correct,today)},
      reviewClock:{...progress.reviewClock,[question.id]:Date.now()},
    }}});
  },
  saveCourseNote(courseId, note) {
    const courses=get().courses, progress=courses[courseId] || emptyCourseProgress();
    set({courses:{...courses,[courseId]:{...progress,notes:[note,...progress.notes.filter(item=>item.id!==note.id)],noteClock:{...progress.noteClock,[note.id]:Date.now()}}}});
  },
  deleteCourseNote(courseId, id) {
    const courses=get().courses, progress=courses[courseId] || emptyCourseProgress();
    set({courses:{...courses,[courseId]:{...progress,notes:progress.notes.filter(item=>item.id!==id),deletedNotes:{...progress.deletedNotes,[id]:Date.now()}}}});
  },
  completeCoursePractice(courseId, lessonId, verified=false) {
    const courses=get().courses, progress=courses[courseId] || emptyCourseProgress();
    const points=verified ? 20 : 4;
    if (progress.completedPractice.includes(lessonId) && (progress.awards['practice:'+lessonId] || 0)>=points) return;
    set({courses:{...courses,[courseId]:{...progress,completedPractice:[...new Set([...progress.completedPractice,lessonId])],awards:{...progress.awards,['practice:'+lessonId]:Math.max(points,progress.awards['practice:'+lessonId] || 0)}}}});
  },
}), {
  name:'react-mentor-learning-v2', version:2, storage:createJSONStorage(()=>localStorage), skipHydration:true,
  partialize(state) {
    return progressSnapshot(state);
  },
  onRehydrateStorage: () => (_state, error) => {
    if (error) useLearningStore.setState({storageError:'Не удалось прочитать сохранённые данные. Не очищайте браузер.'});
  },
}));

// Flush the current scope, then read the target cache BEFORE resetting it.
// A reset must never overwrite another
// account's cache; guest data remains under its original key and is not imported.
export function switchLearningAccount(userId: string | null, initialLocale?: InterfaceLocale) {
  flushPendingStudyTime();
  const name=accountStorageKey(userId); let progress=emptyProgress(); let storageError=''; let hadSavedProgress=false;
  try {
    const cached=localStorage.getItem(name);
    if (cached) { progress=progressSnapshot(JSON.parse(cached).state);hadSavedProgress=true; }
  } catch { storageError='Не удалось прочитать сохранённые данные. Не очищайте браузер.'; }
  // Apply geo only to a genuinely new profile. Saved languages always win.
  if (!hadSavedProgress && !storageError) {
    const locale=initialLocale;
    if (locale) progress={...progress,language:locale,contentLanguage:contentLocaleFor(locale)};
  }
  useLearningStore.persist.setOptions({name,storage:storageError ? {getItem:()=>null,setItem:()=>{},removeItem:()=>{}} : createJSONStorage(()=>localStorage)});
  useLearningStore.setState({...progress,ready:true,storageError});
}
