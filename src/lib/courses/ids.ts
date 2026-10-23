export const COURSE_IDS = ['html', 'css', 'git', 'cpp', 'javascript-1', 'javascript-2', 'react', 'nextjs', 'python', 'backend', 'mobile', 'java', 'csharp', 'go', 'rust', 'php', 'ruby', 'sql', 'bash', 'nodejs', 'mongodb', 'swift', 'kotlin', 'ux-design', 'digital-marketing', 'data-analytics', 'business-foundations', 'communication', 'content-creation', 'english-foundations', 'digital-literacy', 'personal-productivity', 'management-foundations', 'javascript-pro', 'backend-pro', 'architecture-expert', 'ux-pro', 'business-pro'] as const;
export type CourseId = typeof COURSE_IDS[number];
export type ImportedCourseId = Exclude<CourseId, 'react'>;
export function isCourseId(value: string): value is CourseId {
  return COURSE_IDS.some(id => id === value);
}
