import { AssessmentHub } from '@/components/learning/assessment-hub';
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) { return <AssessmentHub params={await searchParams}/>; }
