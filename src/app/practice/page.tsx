import { PracticeHub } from '@/components/learning/practice-hub';
import { getTopic } from '@/content/course';
import { redirect } from 'next/navigation';
export default async function PracticePage({searchParams}:{searchParams:Promise<{month?:string;topic?:string;day?:string}>}) {
 const params=await searchParams;const month=Number(params.month);
 if(month===3||getTopic(params.topic||'')?.month===3)redirect(`/courses/nextjs/practice${params.day?`?day=${params.day}`:''}`);
 return <PracticeHub initialMonth={[1,2,3].includes(month)?month:undefined} initialTopic={params.topic} initialDay={Number(params.day)||undefined}/>;
}
