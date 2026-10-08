import { COURSE_CATALOG } from '@/content/courses/catalog';
import { loadCourseContent } from '@/lib/courses/content';
import { LEARNING_TOPICS } from '@/content/course';

export async function GET() {
  const courses = await Promise.all(COURSE_CATALOG.map(async course => {
    if (course.id === 'react') return {id:course.id, ready:true, lessons:LEARNING_TOPICS.length, files:0};
    const content = await loadCourseContent(course.id);
    return {id:course.id, ready:content.lessons.length > 0, lessons:content.lessons.filter(lesson => lesson.day !== undefined).length || content.lessons.length, files:content.files.length};
  }));
  return Response.json(courses, {headers:{'Cache-Control':'public, max-age=60'}});
}
