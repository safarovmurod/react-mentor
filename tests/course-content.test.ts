// @vitest-environment node
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, it, vi } from 'vitest';
import { COURSE_IDS } from '@/lib/courses/ids';
import { loadCourseContent } from '@/lib/courses/content';

it('every published course has valid provenance and every download has matching bytes and digest',async ()=>{
  for (const id of COURSE_IDS) {
    if (id==='react') continue;
    const content=await loadCourseContent(id);expect(content.courseId).toBe(id);
    for (const file of content.files) {
      const bytes=await readFile(path.join(process.cwd(),'content/course-files',file.url.split('/').at(-1)!));
      expect(bytes.length).toBe(file.bytes);expect(createHash('sha256').update(bytes).digest('hex')).toBe(file.sha256);
    }
  }
});

it('a course search does not fall back to unrelated React answers',async ()=>{
  const {courseAnswer}=await import('@/lib/courses/tutor');
  const value=await courseAnswer('cpp','useState чиба даркорай?',{questionId:'quiz-q001',deep:true,language:'tg'});
  expect(value).toBeNull();
});

it('a reviewed question and deep explanation keep their course-specific source (synthetic fixture)',async ()=>{
  const module=await import('@/lib/courses/content');
  const text=(value:string)=>({tg:value,ru:value});
  const mock=vi.spyOn(module,'loadCourseContent').mockResolvedValue({courseId:'html',sources:[{id:'fixture',title:'Test source',url:'https://example.com/source'}],files:[],lessons:[{
    id:'heading',title:text('HTML h1 heading'),summary:text('Fixture explanation.'),level:'beginner',sourceIds:['fixture'],
    sections:[{title:text('Steps'),body:text('Write a heading.'),code:'<h1>Hello</h1>'}],
    questions:[{id:'q',question:text('What is the h1 heading?'),answer:text('The main page heading.'),options:[text('Heading'),text('Image')],correctIndex:0}],
  }]});
  try {
    const {courseAnswer}=await import('@/lib/courses/tutor');
    const local=await courseAnswer('html','h1 heading',{deep:false,language:'ru'});
    expect(local?.reply).toBe('The main page heading.');expect(local?.source.href).toBe('/courses/html/answers#heading');
    const deep=await courseAnswer('html','h1 heading',{questionId:'q',deep:true,language:'tg'});
    expect(deep?.reply).toContain('<h1>Hello</h1>');expect(deep?.source.file).toBe('Test source');
    expect(await courseAnswer('html','background image css',{deep:false,language:'ru'})).toBeNull();
  } finally {mock.mockRestore();}
});
