import { notFound, redirect } from 'next/navigation';
import { getTopic } from '@/content/course';
import { LessonView } from '@/components/learning/lesson-view';
export default async function LessonPage({params}:{params:Promise<{topicId:string}>}) {
 const {topicId}=await params;
 const topic=getTopic(topicId);
 if(!topic)notFound();
 if(topic.month===3)redirect('/courses/nextjs/plan');
 return <LessonView topicId={topicId}/>;
}
