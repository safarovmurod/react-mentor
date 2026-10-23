import { COURSE_CATALOG } from '@/content/courses/catalog';
import { loadCourseContent } from '@/lib/courses/content';
import { LEARNING_TOPICS } from '@/content/course';

export async function GET() {
  const courses = await Promise.all(COURSE_CATALOG.map(async course => {
    if (course.id === 'react') return {id:course.id, ready:true, lessons:LEARNING_TOPICS.filter(topic=>topic.month<=2).length, files:0};
    try{
    const content = await loadCourseContent(course.id);
    return {id:course.id, ready:content.lessons.length > 0, lessons:content.lessons.filter(lesson => lesson.day !== undefined).length || content.lessons.length, files:content.files.length,accessTier:course.accessTier??'starter'};
    }catch{return {id:course.id,ready:false,lessons:0,files:0,accessTier:course.accessTier??'starter'};}
  }));
  return Response.json(courses, {headers:{'Cache-Control':'public, max-age=60'}});
}
