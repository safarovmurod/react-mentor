import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CoursePractice } from '@/components/courses/course-practice';
import { emptyProgress } from '@/lib/account/progress';
import type { CourseLesson } from '@/lib/courses/schema';
import { COPY } from '@/lib/i18n';
import { useLearningStore } from '@/stores/learning-store';

vi.mock('@/components/learning/code-editor',()=>({CodeEditor:()=>{throw new Error('Written assignments must not mount a code editor');}}));
const text=(ru:string)=>({ru,tg:ru,en:ru});
const lesson:CourseLesson={id:'communication-day-01',day:1,title:text('Понятное сообщение'),summary:text('Напишите сообщение по учебному сценарию.'),level:'beginner',sourceIds:['source'],sections:[{title:text('Контекст'),body:text('Используйте вымышленные имена.')}],questions:[],practice:{kind:'written',task:text('Объясните проблему и предложите следующий шаг.'),hint:text('Факт, вопрос, действие.'),solution:'Пример ответа',referenceAnswer:text('Пример без личных данных'),criteria:[text('Есть конкретный следующий шаг')]}};
beforeEach(()=>{useLearningStore.setState({...emptyProgress(),ready:true,language:'ru',contentLanguage:'ru'});});

describe('written learning assignments',()=>{
 it('requires an answer, persists it and records an honest manual result once',()=>{
  render(<CoursePractice courseId="communication" lesson={lesson}/>);
  const submit=screen.getByRole('button',{name:COPY.ru.manual});
  fireEvent.click(screen.getByRole('checkbox'));
  expect(submit).toBeDisabled();
  fireEvent.change(screen.getByLabelText(COPY.ru.yourAnswer),{target:{value:'Предлагаю уточнить сроки и согласовать один следующий шаг.'}});
  expect(submit).toBeEnabled();fireEvent.click(submit);
  const progress=useLearningStore.getState().courses.communication!;
  expect(progress.drafts[lesson.id]).toContain('согласовать');
  expect(progress.completedPractice).toEqual([lesson.id]);
  expect(progress.awards['practice:'+lesson.id]).toBe(4);
  expect(screen.getByRole('button',{name:COPY.ru.completed})).toBeDisabled();
 });
 it('renders a text reference answer as text, never executable markup',()=>{
  render(<CoursePractice courseId="communication" lesson={{...lesson,practice:{...lesson.practice!,referenceAnswer:text('<script>window.attack=true</script>')}}}/>);
  expect(screen.getByText('<script>window.attack=true</script>')).toBeInTheDocument();
  expect(document.querySelector('script')).toBeNull();
  expect(screen.queryByText('solution.ts')).not.toBeInTheDocument();
 });
});
