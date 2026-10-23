import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { COURSE_IDS } from '@/lib/courses/ids';
import { loadCourseContent } from '@/lib/courses/content';
import { courseAccessTier } from '@/lib/courses/access';
import { authorizeCourseContent } from '@/lib/courses/access-server';

export const runtime = 'nodejs';
export async function GET(request:Request, {params}:{params:Promise<{filename:string}>}) {
  const {filename}=await params;
  if (!/^[a-f0-9]{64}\.[a-z0-9]+$/.test(filename)) return new Response(null,{status:404});
  const courses=await Promise.all(COURSE_IDS.filter(id=>id!=='react').map(async id=>({id,content:await loadCourseContent(id)})));
  const owners=courses.flatMap(course=>course.content.files.filter(file=>file.url==='/course-files/'+filename).map(file=>({id:course.id,file})));
  // A file shared by an ordinary course remains public. Otherwise choose the
  // least restrictive owning tier (Expert includes Pro), not catalog ordering.
  const owner=owners.find(course=>courseAccessTier(course.id)==='starter')
    || owners.find(course=>courseAccessTier(course.id)==='pro') || owners[0];
  if (!owner) return new Response(null,{status:404});
  const requiredTier=courseAccessTier(owner.id);
  if(requiredTier!=='starter') {
    const access=await authorizeCourseContent(request,owner.id);
    if(!access.allowed)return access.response;
  }
  const {file}=owner;
  try {
    const bytes=await readFile(path.join(process.cwd(),'content/course-files',filename));
    if (bytes.length!==file.bytes || createHash('sha256').update(bytes).digest('hex')!==file.sha256) return new Response(null,{status:404});
    return new Response(bytes,{headers:{'Content-Type':'application/octet-stream','Content-Disposition':"attachment; filename*=UTF-8''"+encodeURIComponent(file.title),'X-Content-Type-Options':'nosniff','Content-Security-Policy':"sandbox; default-src 'none'",'Cache-Control':requiredTier==='starter'?'public, max-age=60':'private, no-store'}});
  } catch { return new Response(null,{status:404}); }
}
