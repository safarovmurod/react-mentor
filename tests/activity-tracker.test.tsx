import { createElement } from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ActivityTracker } from '@/components/providers/activity-tracker';
import { accountStorageKey } from '@/lib/account/progress';
import { dateKey } from '@/lib/learning';
import { switchLearningAccount, useLearningStore } from '@/stores/learning-store';
import { useAppStore } from '@/stores/app-store';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-08T07:00:00Z'));
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  localStorage.clear();
  switchLearningAccount(null);
  useAppStore.setState({ activeSecondsToday: 0, isIdle: false });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

function studyFor(seconds: number) {
  act(() => vi.advanceTimersByTime(seconds * 1000));
}

it.each([7, 22])('persists all %i seconds when the tracker unmounts, including its unfinished batch', seconds => {
  const tracker = render(createElement(ActivityTracker));
  studyFor(seconds);
  tracker.unmount();
  expect(useLearningStore.getState().studySeconds[dateKey()]).toBe(seconds);
});

it('preserves the previous course tail while a new course starts its own timer', () => {
  useLearningStore.getState().chooseCourse('html');
  const tracker = render(createElement(ActivityTracker, { key: 'html' }));
  studyFor(7);
  act(() => useLearningStore.getState().chooseCourse('css'));
  tracker.rerender(createElement(ActivityTracker, { key: 'css' }));
  studyFor(5);
  tracker.unmount();
  const progress = useLearningStore.getState();
  expect(progress.studySeconds[dateKey()]).toBe(12);
  expect(progress.courses.html?.studySeconds[dateKey()]).toBe(7);
  expect(progress.courses.css?.studySeconds[dateKey()]).toBe(5);
});

it('flushes the old account before its cache switches and never transfers its seconds to the next account', () => {
  switchLearningAccount('account-a');
  const tracker = render(createElement(ActivityTracker, { key: 'account-a' }));
  studyFor(7);
  act(() => switchLearningAccount('account-b'));
  tracker.rerender(createElement(ActivityTracker, { key: 'account-b' }));
  studyFor(3);
  tracker.unmount();
  const savedA = JSON.parse(localStorage.getItem(accountStorageKey('account-a'))!).state;
  expect(savedA.studySeconds[dateKey()]).toBe(7);
  expect(useLearningStore.getState().studySeconds[dateKey()]).toBe(3);
});

it('attributes cleanup time to the original course when cloud sync changes the selection directly', () => {
  useLearningStore.getState().chooseCourse('html');
  const tracker = render(createElement(ActivityTracker, { key: 'html' }));
  studyFor(7);
  act(() => useLearningStore.setState({ selectedCourse: 'css' }));
  tracker.rerender(createElement(ActivityTracker, { key: 'css' }));
  tracker.unmount();
  expect(useLearningStore.getState().courses.html?.studySeconds[dateKey()]).toBe(7);
  expect(useLearningStore.getState().courses.css?.studySeconds[dateKey()]).toBeUndefined();
});

it('flushes hidden and departing pages without counting the same tail twice', () => {
  const tracker = render(createElement(ActivityTracker));
  studyFor(7);
  act(() => window.dispatchEvent(new Event('pagehide')));
  expect(useLearningStore.getState().studySeconds[dateKey()]).toBe(7);
  studyFor(5);
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
  act(() => document.dispatchEvent(new Event('visibilitychange')));
  studyFor(3);
  act(() => window.dispatchEvent(new Event('pagehide')));
  tracker.unmount();
  expect(useLearningStore.getState().studySeconds[dateKey()]).toBe(12);
});
