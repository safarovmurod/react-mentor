'use client';

import Link from 'next/link';
import { Code2, ArrowUpRight } from 'lucide-react';
import { COURSE_CATEGORIES, PROGRAMMING_SUBTRACKS } from '@/content/course-categories';
import { courseDisplayName } from '@/lib/catalog-copy';
import { PREMIUM_COPY } from '@/lib/premium-copy';
import { COURSE_CATALOG } from '@/content/courses/catalog';
import { useLearningStore } from '@/stores/learning-store';
import type { CourseId } from '@/lib/courses/ids';

const LABELS = {
  ru: {title:'Лаборатория практики',description:'Один рабочий стол для всех направлений. Выберите курс и продолжите с доступного дня.',choose:'Выбрать направление'},
  tg: {title:'Озмоишгоҳи машқ',description:'Як муҳити корӣ барои ҳамаи самтҳо. Курсро интихоб карда, аз рӯзи дастрас идома диҳед.',choose:'Интихоби самт'},
  en: {title:'Practice lab',description:'One workspace for every learning path. Choose a course and continue from an available day.',choose:'Choose a learning path'},
  uk: {title:'Лабораторія практики',description:'Один робочий простір для всіх напрямів. Оберіть курс і продовжуйте з доступного дня.',choose:'Обрати напрям'},
  ja: {title:'演習ラボ',description:'すべての学習コースに対応した演習スペース。コースを選び、学習可能な日から続けましょう。',choose:'学習コースを選択'},
  ko: {title:'실습실',description:'모든 학습 과정을 위한 작업 공간입니다. 과정을 선택하고 학습 가능한 일차부터 이어가세요.',choose:'학습 과정 선택'},
};

export function PracticeSelector({selected}:{selected?:CourseId}) {
  const state=useLearningStore(),copy=LABELS[state.language];
  return <section className={'practice-selector'+(selected?' is-compact':'')} aria-label={copy.choose}>
    {!selected&&<div className="page-heading"><div><span className="eyebrow"><Code2 size={16}/> DEVATLAS / LAB</span><h1>{copy.title}</h1><p>{copy.description}</p></div></div>}
    <details className="practice-course-picker" open={selected?undefined:true} key={selected??'catalog'}><summary><Code2 size={16}/>{copy.choose}{selected&&<strong>{courseDisplayName(selected,state.language)}</strong>}</summary><nav className="practice-course-tabs" aria-label={copy.choose}>
      {COURSE_CATEGORIES.map(category=>{
        const courses=COURSE_CATALOG.filter(course=>course.category===category.id);
        const link=(course:typeof COURSE_CATALOG[number])=><Link key={course.id} href={`/practice?course=${course.id}`} aria-current={selected===course.id?'page':undefined}><span>{course.symbol}</span>{courseDisplayName(course.id,state.language)}{course.accessTier&&course.accessTier!=='starter'?<small className="practice-tier">{course.accessTier==='pro'?'Pro':'Expert'}</small>:<small className="practice-tier">{PREMIUM_COPY[state.language].starter}</small>}<ArrowUpRight size={14}/></Link>;
        return <section key={category.id} className="practice-course-group" aria-label={category.labels[state.language]}><h2>{category.labels[state.language]}</h2>{category.id==='programming'?PROGRAMMING_SUBTRACKS.map(track=><div className="practice-subgroup" key={track.id}><h3>{track.labels[state.language]}</h3><div>{courses.filter(course=>course.subtrack===track.id).map(link)}</div></div>):<div>{courses.map(link)}</div>}</section>;
      })}
    </nav></details>
  </section>;
}
