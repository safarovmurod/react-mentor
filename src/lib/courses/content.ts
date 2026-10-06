import { courseContentSchema } from './schema';
import type { ImportedCourseId } from './ids';

// Server-side loaders keep the six future course libraries out of the shared UI bundle.
const loaders = {
  html: () => import('@/content/courses/html.json'),
  css: () => import('@/content/courses/css.json'),
  git: () => import('@/content/courses/git.json'),
  cpp: () => import('@/content/courses/cpp.json'),
  'javascript-1': () => import('@/content/courses/javascript-1.json'),
  'javascript-2': () => import('@/content/courses/javascript-2.json'),
};
export async function loadCourseContent(id: ImportedCourseId) {
  return courseContentSchema.parse((await loaders[id]()).default);
}
