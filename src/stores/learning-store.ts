'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { QUIZ_QUESTIONS, type LearningQuestion } from '@/content/course';
import { chooseDailyQuestions, dateKey, nextReview, type StudyMode } from '@/lib/learning';
import { accountStorageKey, emptyProgress, progressSnapshot, type Progress } from '@/lib/account/progress';

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
}

export const useLearningStore = create<LearningState>()(persist((set, get) => ({
  ...emptyProgress(), ready:false, storageError:'',
  setPreferences(values) { set({...values,preferenceClock:{...get().preferenceClock,...Object.fromEntries(Object.keys(values).map(key=>[key,Date.now()]))}}); },
  ensureDailySet(month, today = dateKey()) {
    const key = `${today}-${month}`;
    const current = get();
    if (current.dailySets[key]) return current.dailySets[key];
    const ids = chooseDailyQuestions(QUIZ_QUESTIONS, month, current.dailyLimit, current.studied, Object.values(current.reviews), today);
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
  addStudySeconds(seconds) { const today=dateKey();set({studySeconds:{...get().studySeconds,[today]:(get().studySeconds[today] || 0)+seconds}}); },
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
