import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { COURSE_IDS } from '@/lib/courses/ids';
import { loadCourseContent } from '@/lib/courses/content';

export const runtime = 'nodejs';
export async function GET(_request:Request, {params}:{params:Promise<{filename:string}>}) {
  const {filename}=await params;
  if (!/^[a-f0-9]{64}\.[a-z0-9]+$/.test(filename)) return new Response(null,{status:404});
  const courses=await Promise.all(COURSE_IDS.filter(id=>id!=='react').map(loadCourseContent));
  const file=courses.flatMap(course=>course.files).find(file=>file.url==='/course-files/'+filename);
  if (!file) return new Response(null,{status:404});
  try {
    const bytes=await readFile(path.join(process.cwd(),'content/course-files',filename));
    if (bytes.length!==file.bytes || createHash('sha256').update(bytes).digest('hex')!==file.sha256) return new Response(null,{status:404});
    return new Response(bytes,{headers:{'Content-Type':'application/octet-stream','Content-Disposition':"attachment; filename*=UTF-8''"+encodeURIComponent(file.title),'X-Content-Type-Options':'nosniff','Content-Security-Policy':"sandbox; default-src 'none'"}});
  } catch { return new Response(null,{status:404}); }
}
