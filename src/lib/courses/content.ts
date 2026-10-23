import { courseContentSchema, type CourseContent } from './schema';
import type { ImportedCourseId } from './ids';

// Server-side lazy imports keep authored lessons and paid solutions out of shared UI bundles.
const loaders:Record<ImportedCourseId,()=>Promise<{default:unknown}>> = {
  'html': () => import('@/content/courses/html.json'),
  'css': () => import('@/content/courses/css.json'),
  'git': () => import('@/content/courses/git.json'),
  'cpp': () => import('@/content/courses/cpp.json'),
  'javascript-1': () => import('@/content/courses/javascript-1.json'),
  'javascript-2': () => import('@/content/courses/javascript-2.json'),
  'nextjs': () => import('@/content/courses/nextjs'),
  'python': () => import('@/content/courses/python.json'),
  'backend': () => import('@/content/courses/backend.json'),
  'mobile': () => import('@/content/courses/mobile.json'),
  'java': () => import('@/content/courses/java.json'),
  'csharp': () => import('@/content/courses/csharp.json'),
  'go': () => import('@/content/courses/go.json'),
  'rust': () => import('@/content/courses/rust.json'),
  'php': () => import('@/content/courses/php.json'),
  'ruby': () => import('@/content/courses/ruby.json'),
  'sql': () => import('@/content/courses/sql.json'),
  'bash': () => import('@/content/courses/bash.json'),
  'nodejs': () => import('@/content/courses/nodejs.json'),
  'mongodb': () => import('@/content/courses/mongodb.json'),
  'swift': () => import('@/content/courses/swift.json'),
  'kotlin': () => import('@/content/courses/kotlin.json'),
  'ux-design': () => import('@/content/courses/ux-design.json'),
  'digital-marketing': () => import('@/content/courses/digital-marketing.json'),
  'data-analytics': () => import('@/content/courses/data-analytics.json'),
  'business-foundations': () => import('@/content/courses/business-foundations.json'),
  'communication': () => import('@/content/courses/communication.json'),
  'content-creation': () => import('@/content/courses/content-creation.json'),
  'english-foundations': () => import('@/content/courses/english-foundations.json'),
  'digital-literacy': () => import('@/content/courses/digital-literacy.json'),
  'personal-productivity': () => import('@/content/courses/personal-productivity.json'),
  'management-foundations': () => import('@/content/courses/management-foundations.json'),
  'ai-fundamentals': () => import('@/content/courses/ai-fundamentals.json'),
  'context-engineering': () => import('@/content/courses/context-engineering.json'),
  'agent-harness': () => import('@/content/courses/agent-harness.json'),
  'javascript-pro': () => import('@/content/courses/javascript-pro.json'),
  'backend-pro': () => import('@/content/courses/backend-pro.json'),
  'architecture-expert': () => import('@/content/courses/architecture-expert.json'),
  'ux-pro': () => import('@/content/courses/ux-pro.json'),
  'business-pro': () => import('@/content/courses/business-pro.json'),
};
const contentCache=new Map<ImportedCourseId,Promise<CourseContent>>();
export function loadCourseContent(id:ImportedCourseId):Promise<CourseContent>{
  let pending=contentCache.get(id);
  if(!pending){pending=loaders[id]().then(module=>courseContentSchema.parse(module.default)).catch(error=>{contentCache.delete(id);throw error;});contentCache.set(id,pending);}
  return pending;
}
