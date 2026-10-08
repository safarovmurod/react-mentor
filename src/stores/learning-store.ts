'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LearningQuestion } from '@/content/course';
import learningIndex from '@/content/learning-index.json';
import { chooseDailyQuestions, dateKey, nextReview, type StudyMode } from '@/lib/learning';
import { accountStorageKey, emptyProgress, emptyCourseProgress, progressSnapshot, type Progress } from '@/lib/account/progress';
import type { CourseId, ImportedCourseId } from '@/lib/courses/ids';

interface LearningState extends Progress {
  ready: boolean;
  storageError: string;
  setPreferences: (values: Partial<Pick<LearningState, 'language' | 'contentLanguage' | 'dailyLimit' | 'activeMonth' | 'theme'>>) => void;
  ensureDailySet: (month: number, today?: string) => string[];
  markStudied: (questionId: string) => void;
  recordAnswer: (question: LearningQuestion, mode: StudyMode, correct: boolean, answer: string, today?: string) => void;
  completeTopic: (topicId: string) => void;
  completePractice: (practiceId: string, verified: boolean) => void;
  saveDraft: (id: string, code: string) => void;
  saveNote: (note: {id:string;title:string;content:string}) => void;
  deleteNote: (id:string) => void;
  addStudySeconds: (seconds:number) => void;
  chooseCourse: (courseId:CourseId) => void;
  completeCourseLesson: (courseId:ImportedCourseId, lessonId:string) => void;
  recordCourseAnswer: (courseId:ImportedCourseId, question:{id:string;topicId:string}, mode:StudyMode, correct:boolean, answer:string) => void;
  saveCourseNote: (courseId:ImportedCourseId, note:{id:string;title:string;content:string}) => void;
  deleteCourseNote: (courseId:ImportedCourseId, id:string) => void;
  completeCoursePractice: (courseId:ImportedCourseId, lessonId:string) => void;
  saveCourseDraft: (courseId:ImportedCourseId, id:string, code:string) => void;
}

export const useLearningStore = create<LearningState>()(persist((set, get) => ({
  ...emptyProgress(), ready:false, storageError:'',
  setPreferences(values) { set({...values,preferenceClock:{...get().preferenceClock,...Object.fromEntries(Object.keys(values).map(key=>[key,Date.now()]))}}); },
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
    if (current.completedPractice.includes(practiceId)) return;
    set({completedPractice:[...current.completedPractice,practiceId],awards:{...current.awards,[`practice:${practiceId}`]:verified ? 20 : 4}});
  },
  saveDraft(id, code) { set({drafts:{...get().drafts,[id]:code},draftClock:{...get().draftClock,[id]:Date.now()}}); },
  saveNote(note) { set({notes:[note,...get().notes.filter(item=>item.id!==note.id)],noteClock:{...get().noteClock,[note.id]:Date.now()}}); },
  deleteNote(id) { set({notes:get().notes.filter(item=>item.id!==id),deletedNotes:{...get().deletedNotes,[id]:Date.now()}}); },
  addStudySeconds(seconds) {
    const today=dateKey(), state=get(), course=state.selectedCourse, updates={studySeconds:{...state.studySeconds,[today]:(state.studySeconds[today] || 0)+seconds}};
    if (course==='react') set(updates);
    else {
      const progress=state.courses[course] || emptyCourseProgress();
      set({...updates,courses:{...state.courses,[course]:{...progress,studySeconds:{...progress.studySeconds,[today]:(progress.studySeconds[today] || 0)+seconds}}}});
    }
  },
  chooseCourse(selectedCourse) {
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
    if (progress.answers[key]) return;
    set({courses:{...courses,[courseId]:{...progress,
      answers:{...progress.answers,[key]:{questionId:question.id,topicId:question.topicId,mode,correct,answer,date:today}},
      awards:correct ? {...progress.awards,[`${mode}:${question.id}`]:mode==='test'?10:5}:progress.awards,
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
  completeCoursePractice(courseId, lessonId) {
    const courses=get().courses, progress=courses[courseId] || emptyCourseProgress();
    if (progress.completedPractice.includes(lessonId)) return;
    set({courses:{...courses,[courseId]:{...progress,completedPractice:[...progress.completedPractice,lessonId],awards:{...progress.awards,['practice:'+lessonId]:4}}}});
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

// Read the target cache BEFORE writing. A reset must never overwrite another
// account's cache; guest data remains under its original key and is not imported.
export function switchLearningAccount(userId: string | null) {
  const name=accountStorageKey(userId); let progress=emptyProgress(); let storageError='';
  try {
    const cached=localStorage.getItem(name);
    if (cached) progress=progressSnapshot(JSON.parse(cached).state);
  } catch { storageError='Не удалось прочитать сохранённые данные. Не очищайте браузер.'; }
  useLearningStore.persist.setOptions({name,storage:storageError ? {getItem:()=>null,setItem:()=>{},removeItem:()=>{}} : createJSONStorage(()=>localStorage)});
  useLearningStore.setState({...progress,ready:true,storageError});
}
