'use client';
import Link from 'next/link';
import { StudySession } from './study-session';
import { SessionHub } from './session-hub';
import { sessionConfig } from '@/lib/session-config';
import { useLearningStore } from '@/stores/learning-store';
import { LEARNING_UI_COPY } from '@/lib/learning-ui-copy';
export function AssessmentHub({params}:{params:Record<string,string|string[]|undefined>}) {
 const ui=LEARNING_UI_COPY[useLearningStore(state=>state.language)];
 const test=sessionConfig('test',params),interview=sessionConfig('interview',params);
 const scoped=!!(test.daily||test.topic||test.group||test.review);
 return <><div className="page-heading"><div><h1>{ui.testsInterview}</h1><p>{ui.assessmentIntro}</p></div><Link href="/answers" className="button subtle">{ui.answersInterview}</Link></div><section className="assessment-block" aria-label={ui.tests}><h2>1. {ui.tests}</h2>{scoped?<StudySession key={'test'+JSON.stringify(test)} config={test}/>:<SessionHub mode="test" embedded/>}</section><section id="interview" className="assessment-block interview-block" aria-label={ui.interview}><h2>2. {ui.interview}</h2>{scoped?<StudySession key={'interview'+JSON.stringify(interview)} config={interview}/>:<SessionHub mode="interview" embedded/>}</section></>;
}
