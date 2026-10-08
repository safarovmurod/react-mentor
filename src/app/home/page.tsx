import { notFound } from 'next/navigation';
import { ReactDay } from '@/components/learning/react-day';
export default async function HomePage({searchParams}:{searchParams:Promise<{day?:string;month?:string}>}) {
 const query=await searchParams,day=query.day===undefined?undefined:Number(query.day),month=query.month===undefined?undefined:Number(query.month);
 if(day!==undefined&&(!Number.isInteger(day)||day<0||day>30)||month!==undefined&&![1,2,3].includes(month))notFound();
 return <ReactDay requestedDay={day} requestedMonth={month}/>;
}
