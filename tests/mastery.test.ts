// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { useLearningStore } from '@/stores/learning-store';
import { progressSnapshot, emptyCourseProgress, mergeProgress } from '@/lib/account/progress';

const lesson = { id: 'python-day-01', questions: [
  { id: 'python-day-01-q1', topicId: 'python-day-01' },
  { id: 'python-day-01-q2', topicId: 'python-day-01' },
] };

function courseState(courseId: 'html') {
  return useLearningStore.getState().courses[courseId] ?? emptyCourseProgress();
}

describe('quiz mastery states (§8 self-learning)', () => {
  beforeEach(() => {
    useLearningStore.setState(useLearningStore.getState(), true);
    useLearningStore.setState({ courses: { ...useLearningStore.getState().courses, html: emptyCourseProgress() } });
  });

  it('records mastery only for correct test answers', () => {
    const store = useLearningStore.getState();
    store.recordCourseAnswer('html', { id: lesson.questions[0].id, topicId: lesson.id }, 'test', false, 'wrong');
    expect(courseState('html').masteredQuestions).not.toContain(lesson.questions[0].id);
    store.recordCourseAnswer('html', { id: lesson.questions[0].id, topicId: lesson.id }, 'test', true, 'right');
    expect(courseState('html').masteredQuestions).toContain(lesson.questions[0].id);
  });

  it('lets a wrong answer be retried the same day and blocks re-answering a correct one', () => {
    const store = useLearningStore.getState();
    store.recordCourseAnswer('html', { id: lesson.questions[0].id, topicId: lesson.id }, 'test', false, 'wrong');
    const afterWrong = courseState('html');
    const key = Object.keys(afterWrong.answers)[0];
    expect(afterWrong.answers[key].correct).toBe(false);
    store.recordCourseAnswer('html', { id: lesson.questions[0].id, topicId: lesson.id }, 'test', true, 'right');
    const afterRight = courseState('html');
    expect(Object.keys(afterRight.answers)).toHaveLength(1);
    expect(afterRight.answers[key].correct).toBe(true);
    const attempts = { ...afterRight };
    useLearningStore.setState({ courses: { ...useLearningStore.getState().courses, html: attempts } });
    const before = courseState('html').answers[key];
    useLearningStore.getState().recordCourseAnswer('html', { id: lesson.questions[0].id, topicId: lesson.id }, 'test', false, 'changed mind');
    expect(courseState('html').answers[key]).toBe(before);
  });

  it('merges mastery across devices without losing records', () => {
    const remote = progressSnapshot({});
    remote.courses.html = emptyCourseProgress();
    remote.courses.html.masteredQuestions = ['q1'];
    const local = progressSnapshot({});
    local.courses.html = emptyCourseProgress();
    local.courses.html.masteredQuestions = ['q2'];
    const merged = mergeProgress(remote, local);
    const html = merged.courses['html'];
    expect(html?.masteredQuestions.sort()).toEqual(['q1', 'q2']);
  });
});
