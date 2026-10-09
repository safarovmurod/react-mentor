import { courseContentSchema } from './schema';
import type { ImportedCourseId } from './ids';
import type { CourseContent } from './schema';

// Server-side loaders keep the six future course libraries out of the shared UI bundle.
const loaders = {
  html: () => import('@/content/courses/html.json'),
  css: () => import('@/content/courses/css.json'),
  git: () => import('@/content/courses/git.json'),
  cpp: () => import('@/content/courses/cpp.json'),
  'javascript-1': () => import('@/content/courses/javascript-1.json'),
  'javascript-2': () => import('@/content/courses/javascript-2.json'),
  nextjs: () => import('@/content/courses/nextjs'),
};
const contentCache=new Map<ImportedCourseId,Promise<CourseContent>>();
export function loadCourseContent(id: ImportedCourseId) {
  let pending=contentCache.get(id);
  if(!pending){pending=loaders[id]().then(module=>courseContentSchema.parse(module.default)).catch(error=>{contentCache.delete(id);throw error;});contentCache.set(id,pending);}
  return pending;
}
