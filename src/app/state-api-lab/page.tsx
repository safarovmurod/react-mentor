import { StateApiLab, type LocalGlobalData } from '@/components/learning/state-api-lab';
import data from '@/content/imported/local-global.json';
export default function Page(){return <StateApiLab data={data as LocalGlobalData}/>;}
