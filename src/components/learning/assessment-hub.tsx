import Link from 'next/link';
import { StudySession } from './study-session';
import { SessionHub } from './session-hub';
import { sessionConfig } from '@/lib/session-config';
export function AssessmentHub({params}:{params:Record<string,string|string[]|undefined>}) {
 const test=sessionConfig('test',params),interview=sessionConfig('interview',params);
 const scoped=!!(test.daily||test.topic||test.group||test.review);
 return <><div className="page-heading"><div><h1>Тесты и интервью</h1><p>Сначала проверьте знания, затем объясните решение своими словами.</p></div><Link href="/answers" className="button subtle">Ответы и интервью</Link></div><section className="assessment-block" aria-label="Тесты"><h2>1. Тесты</h2>{scoped?<StudySession key={'test'+JSON.stringify(test)} config={test}/>:<SessionHub mode="test" embedded/>}</section><section id="interview" className="assessment-block interview-block" aria-label="Интервью"><h2>2. Интервью</h2>{scoped?<StudySession key={'interview'+JSON.stringify(interview)} config={interview}/>:<SessionHub mode="interview" embedded/>}</section></>;
}
