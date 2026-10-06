import { loadCourseContent } from './content';
import { courseText, type CourseText } from './schema';
import type { ImportedCourseId } from './ids';
import type { TutorSource } from '@/lib/tutor/shared';

const noise = new Set('what is a an the how why explain about does are can for to it это что как зачем для нужен нужна работает объясни чи чияй чиба барои даркорай фаҳмон фахмон'.split(' '));
function tokens(text:string) { return text.toLocaleLowerCase().match(/[\p{L}\p{N}_+]+/gu)?.filter(word=>word.length>1&&!noise.has(word)) || []; }
export async function courseAnswer(courseId:ImportedCourseId, query:string, options:{questionId?:string;deep:boolean;language:'tg'|'ru'|'en'}) {
  const content=await loadCourseContent(courseId), wanted=tokens(query);
  let best:{score:number;lesson:typeof content.lessons[number];question?:typeof content.lessons[number]['questions'][number]} | undefined;
  const score=(text:CourseText)=>Math.max(...Object.values(text).filter((value):value is string=>!!value).map(value=>{
    const found=new Set(tokens(value));
    return wanted.filter(word=>found.has(word)).length;
  }));
  for (const lesson of content.lessons) {
    for (const question of lesson.questions) {
      const points=options.questionId===question.id?1000:score(question.question);
      if (points && (!best||points>best.score)) best={score:points,lesson,question};
    }
    const points=score(lesson.title);
    if (points && (!best||points>best.score)) best={score:points,lesson};
  }
  if (!best || (best.score<1000 && best.score<Math.max(1,Math.ceil(wanted.length*.6)))) return null;
  const {lesson,question}=best, language=options.language;
  const reply=question && !options.deep ? courseText(question.answer,language) : [
    courseText(lesson.title,language), question?courseText(question.answer,language):courseText(lesson.summary,language),
    ...lesson.sections.map(section=>[courseText(section.title,language),courseText(section.body,language),section.code,section.output?courseText(section.output,language):''].filter(Boolean).join('\n')),
  ].join('\n\n');
  const source=content.sources.find(source=>source.id===lesson.sourceIds[0])!;
  const metadata:TutorSource={questionId:question?.id || lesson.id,topicId:lesson.id,title:courseText(lesson.title,language),file:source.title,sourceId:source.id,href:'/courses/'+courseId+'/answers#'+lesson.id};
  return {reply,source:metadata};
}
