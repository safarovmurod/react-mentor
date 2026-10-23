// @vitest-environment node
import {describe,expect,it} from 'vitest';
import {COURSE_CATEGORIES,PROGRAMMING_SUBTRACKS,categoryLabel,subtrackLabel} from '@/content/course-categories';
import {COURSE_CATALOG} from '@/content/courses/catalog';
import {COURSE_IDS} from '@/lib/courses/ids';
import {INTERFACE_LOCALES} from '@/lib/locale';

describe('published course taxonomy',()=>{
 it('declares one catalog entry per course ID with valid prerequisites and categories',()=>{
  expect(new Set(COURSE_CATALOG.map(course=>course.id)).size).toBe(COURSE_CATALOG.length);
  expect(new Set(COURSE_CATALOG.map(course=>course.id))).toEqual(new Set(COURSE_IDS));
  for(const course of COURSE_CATALOG){
   expect(COURSE_CATEGORIES.some(category=>category.id===course.category)).toBe(true);
   if(course.prerequisite)expect(COURSE_IDS).toContain(course.prerequisite);
   expect(course.publishedDays).toBeGreaterThan(0);
   expect(Number.isInteger(course.publishedDays)).toBe(true);
  }
 });
 it('provides every category and programming subtrack label in all supported interface languages',()=>{
  expect(COURSE_CATEGORIES).toHaveLength(10);expect(PROGRAMMING_SUBTRACKS).toHaveLength(6);
  for(const locale of INTERFACE_LOCALES){
   for(const category of COURSE_CATEGORIES)expect(categoryLabel(category.id,locale).trim().length).toBeGreaterThan(0);
   for(const subtrack of PROGRAMMING_SUBTRACKS)expect(subtrackLabel(subtrack.id,locale).trim().length).toBeGreaterThan(0);
  }
 });
 it('groups programming subjects by actual track instead of mixing languages and tools',()=>{
  const tracks={frontend:['html','css','javascript-1','javascript-2','react','nextjs','javascript-pro'],backend:['backend','nodejs','php','java','csharp','backend-pro','architecture-expert'],languages:['python','go','rust','ruby','cpp'],mobile:['mobile','swift','kotlin'],databases:['sql','mongodb'],tools:['bash','git']};
  for(const [subtrack,ids] of Object.entries(tracks))for(const id of ids)expect(COURSE_CATALOG.find(course=>course.id===id)).toMatchObject({category:'programming',subtrack});
 });
 it('keeps nonprogramming courses separate from runtime and code editor claims',()=>{
  for(const course of COURSE_CATALOG.filter(course=>course.category!=='programming')){
   expect(course.subtrack).toBeUndefined();expect(course.editorLanguage).toBeUndefined();expect(course.runtime).toBeUndefined();
  }
 });
 it('marks distinct Pro and Expert modules with their actual three-day scope',()=>{
  const tiers={'javascript-pro':'pro','backend-pro':'pro','architecture-expert':'expert','ux-pro':'pro','business-pro':'pro'};
  for(const [id,accessTier] of Object.entries(tiers))expect(COURSE_CATALOG.find(course=>course.id===id)).toMatchObject({accessTier,publishedDays:3});
  expect(COURSE_CATALOG.find(course=>course.id==='css')?.publishedDays).toBe(5);
  expect(COURSE_CATALOG.find(course=>course.id==='nextjs')?.publishedDays).toBe(20);
  expect(COURSE_CATALOG.find(course=>course.id==='mongodb')?.editorLanguage).toBe('javascript');
 });
});
