import { notFound, redirect } from 'next/navigation';
import { ReactDay } from '@/components/learning/react-day';
export default async function HomePage({searchParams}:{searchParams:Promise<{day?:string;month?:string}>}) {
 const query=await searchParams,day=query.day===undefined?undefined:Number(query.day),month=query.month===undefined?undefined:Number(query.month);
 if(day!==undefined&&(!Number.isInteger(day)||day<0||day>30)||month!==undefined&&![1,2,3].includes(month))notFound();
 if(month===3)redirect(`/courses/nextjs/${day===undefined?'plan':`home?day=${day}`}`);
 return <ReactDay requestedDay={day} requestedMonth={month}/>;
}
