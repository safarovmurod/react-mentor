export const COURSE_IDS = ['html', 'css', 'git', 'cpp', 'javascript-1', 'javascript-2', 'react'] as const;
export type CourseId = typeof COURSE_IDS[number];
export type ImportedCourseId = Exclude<CourseId, 'react'>;
export function isCourseId(value: string): value is CourseId {
  return COURSE_IDS.some(id => id === value);
}
