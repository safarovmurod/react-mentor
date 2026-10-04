import { beforeEach, describe, expect, it } from 'vitest';
import { accountStorageKey, emptyProgress, mergeProgress, progressSnapshot } from '@/lib/account/progress';
import { switchLearningAccount, useLearningStore } from '@/stores/learning-store';

beforeEach(()=>{localStorage.clear();switchLearningAccount(null);});
describe('Private account progress',()=>{
  it('isolates accounts and restores guest data without importing it',()=>{
    useLearningStore.getState().saveNote({id:'guest-note',title:'Guest',content:'Guest content'});
    switchLearningAccount('account-a');expect(useLearningStore.getState().notes).toEqual([]);
    useLearningStore.getState().saveNote({id:'a-note',title:'A',content:'Private A'});
    useLearningStore.getState().setPreferences({language:'en'});
    switchLearningAccount('account-b');expect(useLearningStore.getState().notes).toEqual([]);expect(useLearningStore.getState().language).toBe('ru');
    useLearningStore.getState().saveDraft('practice','Private B code');
    switchLearningAccount('account-a');expect(useLearningStore.getState().notes[0].content).toBe('Private A');expect(useLearningStore.getState().drafts).toEqual({});expect(useLearningStore.getState().language).toBe('en');
    switchLearningAccount(null);expect(useLearningStore.getState().notes[0].id).toBe('guest-note');
    expect(JSON.parse(localStorage.getItem(accountStorageKey('account-b'))!).state.drafts.practice).toBe('Private B code');
  });
  it('preserves a corrupt cache instead of overwriting it',()=>{
    localStorage.setItem(accountStorageKey('broken'),'{broken');switchLearningAccount('broken');
    expect(useLearningStore.getState().storageError).toBeTruthy();expect(localStorage.getItem(accountStorageKey('broken'))).toBe('{broken');
  });
  it('deduplicates achievements across devices and preserves both sets of work',()=>{
    const a=progressSnapshot({...emptyProgress(),awards:{'test:q':10},studied:['q'],completedTopics:['a']});
    const b=progressSnapshot({...emptyProgress(),awards:{'test:q':10,'lesson:b':5},studied:['q','r'],completedTopics:['b']});
    const result=mergeProgress(a,b);expect(result.awards).toEqual({'test:q':10,'lesson:b':5});expect(result.studied).toEqual(['q','r']);expect(result.completedTopics).toEqual(['a','b']);
    expect(mergeProgress(result,result)).toEqual(result);
  });
  it('keeps deleted notes deleted when an offline device later reconnects',()=>{
    const remote=progressSnapshot({notes:[],deletedNotes:{note:200}});
    const stale=progressSnapshot({notes:[{id:'note',title:'Old',content:'Old'}],noteClock:{note:100}});
    expect(mergeProgress(remote,stale).notes).toEqual([]);
    const edited=progressSnapshot({...stale,noteClock:{note:300}});expect(mergeProgress(remote,edited).notes).toEqual(edited.notes);
  });
  it('resolves preferences, code edits and review outcomes by edit timestamp',()=>{
    const remote=progressSnapshot({language:'en',preferenceClock:{language:200},drafts:{p:'new'},draftClock:{p:200},reviews:{q:{questionId:'q',topicId:'t',due:'2026-10-05',repetitions:0}},reviewClock:{q:200}});
    const stale=progressSnapshot({language:'ru',preferenceClock:{language:100},drafts:{p:'old'},draftClock:{p:100},reviews:{q:{questionId:'q',topicId:'t',due:'2026-11-05',repetitions:5}},reviewClock:{q:100}});
    const result=mergeProgress(remote,stale);expect(result.language).toBe('en');expect(result.drafts.p).toBe('new');expect(result.reviews.q.repetitions).toBe(0);
  });
});
