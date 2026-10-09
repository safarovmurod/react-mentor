import { notFound, redirect } from 'next/navigation';
import { MonthPlan } from '@/components/learning/month-plan';
export default async function MonthPage({params}:{params:Promise<{month:string}>}) {
  const {month}=await params;
  if(month==='3') redirect('/courses/nextjs/plan');
  if(!['1','2'].includes(month)) notFound();
  return <MonthPlan month={Number(month)}/>;
}
