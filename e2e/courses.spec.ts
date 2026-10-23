import { expect, test, type Page } from '@playwright/test';
// Legacy regressions exercise accounts that already saved Tajik lesson text with
// Russian UI. Geo detection must not rewrite an existing learner's choice.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    // addInitScript runs in sandboxed learner-preview iframes as well.
    // Never access their blocked storage or weaken iframe sandboxing.
    if (window.self !== window.top) return;
    if (!localStorage.getItem('react-mentor-learning-v2')) {
      localStorage.setItem('react-mentor-learning-v2', JSON.stringify({
        version: 2, state: { language: 'ru', contentLanguage: 'tg' },
      }));
    }
  });
});

import html from '../src/content/courses/html.json';
import { COURSE_CATALOG } from '../src/content/courses/catalog';
async function replaceDocument(page:Page,code:string){await expect(page.locator('.monaco-editor')).toBeVisible({timeout:30000});await page.evaluate(value=>{const monaco=(window as unknown as {monaco:{editor:{getModels:()=>{setValue:(code:string)=>void}[]}}}).monaco;monaco.editor.getModels()[0].setValue(value);},code);}

test('course choice has one persistent active card and preserves isolated course notes',async({page},testInfo)=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/home');await expect(page.getByRole('heading',{name:'Навыки начинаются с практики.'})).toBeVisible();
 await expect(page.locator('.course-card')).toHaveCount(COURSE_CATALOG.filter(course=>course.id!=='css'&&course.id!=='javascript-2').length);
 await page.locator('[data-course=html]').getByRole('button').click();
 await expect(page).toHaveURL('/courses/html/plan');await page.locator('.day-card-grid .day-card').first().click();await expect(page).toHaveURL('/courses/html/home?day=1');await expect(page.locator('.course-lesson h2')).toContainText('саҳифаи аввал');
 await page.goto('/courses');await expect(page.locator('.course-selected')).toHaveCount(1);await expect(page.locator('[data-course=html] button')).toHaveAttribute('aria-pressed','true');
 await page.reload();await expect(page.locator('[data-course=html]')).toHaveClass(/course-selected/);
 await page.screenshot({path:`/tmp/react-mentor-${testInfo.project.name}-courses.png`});
 await page.goto('/notes');await page.getByRole('button',{name:'Новая заметка',exact:true}).click();await page.getByLabel('Название',{exact:true}).fill('Моя HTML заметка');await page.getByLabel('Текст',{exact:true}).fill('Структура страницы');await page.getByRole('button',{name:'Сохранить',exact:true}).click();
 await page.goto('/courses');await page.locator('[data-course=javascript-1]').getByRole('button').click();await page.goto('/notes');await expect(page.getByText('Моя HTML заметка',{exact:true})).toHaveCount(0);
 await page.goto('/courses');await page.locator('[data-course=html]').getByRole('button').click();await page.goto('/notes');await expect(page.getByText('Моя HTML заметка',{exact:true})).toBeVisible();
 await page.goto('/courses');await page.locator('[data-course=react]').getByRole('button').click();await expect(page).toHaveURL('/courses/react');await expect(page.getByRole('heading',{name:'React · отдельный курс'})).toBeVisible();expect(errors).toEqual([]);
});

test('HTML day 1 replaces old day 0 URLs and has usable narrow-screen editor',async({page})=>{
  await page.setViewportSize({width:320,height:740});
  await page.goto('/courses/html/plan?day=0');
  await expect(page).toHaveURL('/courses/html/plan?day=1');
  await expect(page.locator('.day-card')).toHaveCount(30);
  await page.locator('a.day-card').first().click();
  await expect(page).toHaveURL('/courses/html/home?day=1');
  await expect(page.locator('.course-lesson h2')).toContainText('саҳифаи аввал');
  await expect(page.locator('.day-explanation')).toHaveCount(html.lessons[0].sections.length);
  await page.getByRole('link',{name:'Практика этого дня',exact:true}).click();
  await expect(page).toHaveURL('/practice?course=html&day=1');
  await replaceDocument(page,'<h1>Day 1 draft</h1>');
  await page.reload();
  await expect(page.locator('.monaco-editor')).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses.html.drafts['html-day-01'])).toContain('Day 1 draft');
  for(const width of [320,360,375,430]){
    await page.setViewportSize({width,height:740});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('returning learner opens only the current lesson, preserves manual practice and quiz XP',async({page},testInfo)=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 const prior=html.lessons.filter(lesson=>lesson.day!==undefined&&lesson.day<15).map(lesson=>lesson.id);
 await page.addInitScript(({ids})=>{
   if(window.self!==window.top)return;
   const key='react-mentor-learning-v2',saved=JSON.parse(localStorage.getItem(key)!);
   if(!saved.state.courses?.html){saved.state.courses={html:{completedTopics:ids,completedPractice:ids,confirmedDays:Array.from({length:14},(_,i)=>String(i+1))}};localStorage.setItem(key,JSON.stringify(saved));}
 },{ids:prior});
 await page.goto('/courses/html/plan');await expect(page.locator('.day-card')).toHaveCount(30);
 await page.getByRole('link',{name:/День 15.*Flexbox/}).click();await expect(page).toHaveURL('/courses/html/home?day=15');
 await expect(page.locator('.course-lesson')).toHaveCount(1);await expect(page.locator('.course-lesson h2')).toHaveText('Flexbox: меню из прошлых уроков');await expect(page.locator('.lesson-connections')).toContainText('День 3');
 await page.getByRole('button',{name:'Прочитал и понял',exact:true}).click();
 await page.getByRole('link',{name:'Практика этого дня',exact:true}).click();await expect(page).toHaveURL('/practice?course=html&day=15');
 await replaceDocument(page,'<h1>Мой результат</h1><style>h1{color:purple}</style>');await page.getByRole('button',{name:'Показать HTML + CSS'}).click();await expect(page.frameLocator('.html-preview').getByRole('heading',{name:'Мой результат'})).toBeVisible();
 await page.reload();await expect(page.locator('.monaco-editor')).toBeVisible();
 for(const checkbox of await page.locator('.course-criterion input').all())await checkbox.check();await page.getByRole('button',{name:'Самопроверка проекта',exact:true}).click();
 await page.getByRole('button',{name:'Подтвердить завершение дня',exact:true}).click();
 await page.goto('/courses/html/tests?day=15');const lesson=html.lessons.find(l=>l.id==='html-day-15')!;const tests=page.locator('.course-question').first();await tests.getByRole('radio',{name:lesson.questions[0].options[lesson.questions[0].correctIndex].tg,exact:true}).check();await tests.getByRole('button',{name:'Проверить',exact:true}).click();await expect(tests.getByRole('status')).toHaveText('Верно');
 await expect(page.getByRole('heading',{name:'1. Тесты'})).toBeVisible();await expect(page.getByRole('heading',{name:'2. Интервью'})).toBeVisible();await page.reload();await expect(page.locator('.course-question').first().getByRole('status')).toHaveText('Верно');
 const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state);expect(state.courses.html.awards).toMatchObject({'lesson:html-day-15':5,'practice:html-day-15':4,'test:html-day-15-q':10});expect(state.awards).toEqual({});
 await page.goto('/courses/html/plan?day=15');await expect(page.locator('.day-card.is-done')).toHaveCount(15);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`/tmp/react-mentor-${testInfo.project.name}-plan.png`});expect(errors).toEqual([]);
});
test('legacy CSS lessons remain readable, but course navigation has no materials or Lab pages',async ({page})=>{
  await page.goto('/courses');
  await expect(page.locator('[data-course=css]')).toHaveCount(0);
  await expect(page.getByRole('link',{name:/Материалы Telegram-канала/})).toHaveCount(0);
  const materials=await page.request.get('/courses/materials');
  expect(materials.status()).toBe(404);
  const lab=await page.request.get('/state-api-lab');
  expect(lab.status()).toBe(404);
  await page.goto('/courses/css/answers');
  await expect(page.getByRole('heading',{name:'Sass: variable ва nesting',exact:true})).toBeVisible();
  await page.getByLabel('Найти тему или вопрос',{exact:true}).fill('$brand');
  await expect(page.locator('.course-lesson')).toHaveCount(1);
  await expect(page.locator('.course-sources')).toHaveCount(0);
  const response=await page.request.post('/api/tutor',{data:{action:'ask',courseId:'css',userText:'Sass чист?',language:'tg'}});
  const tutor=await response.json();
  expect(tutor).toMatchObject({mode:'local',usage:{totalTokens:0}});
  expect(tutor.reply).toContain('preprocessor');
  await page.goto('/courses/css/tests');
  const question=page.locator('.course-question').filter({has:page.getByRole('heading',{name:'Чӣ тавр variable менависем?',exact:true})}).first();
  await question.getByRole('radio',{name:'Бо $',exact:true}).check();
  await question.getByRole('button',{name:'Проверить',exact:true}).click();
  await expect(question.getByRole('status')).toHaveText('Верно');
});

test('JavaScript stages have 30 distinct days and legacy practice links remain usable',async({page})=>{
 await page.goto('/courses');await expect(page.getByRole('heading',{name:'JavaScript',exact:true})).toHaveCount(1);await page.locator('[data-course=javascript-1]').getByRole('button').click();await expect(page).toHaveURL('/courses/javascript-1/plan');
 await page.goto('/courses/javascript-1/plan');await expect(page.locator('.day-card')).toHaveCount(30);
 await page.getByRole('link',{name:'Месяц 2 · JS2 API и приложения',exact:true}).click();await expect(page).toHaveURL('/courses/javascript-2/plan');await page.locator('.day-card-grid a.day-card').first().click();await expect(page).toHaveURL('/courses/javascript-2/home?day=1');await expect(page.locator('.course-lesson h2')).toHaveText('Клиент, сервер и HTTP');
 await page.goto('/courses/javascript-1/practice?day=1');const practice=page.locator('#javascript-1-day-01');await practice.getByText('Пример решения',{exact:true}).click();await expect(practice.locator('pre')).toContainText('const name');
 const response=await page.request.post('/api/tutor',{data:{action:'ask',courseId:'javascript-1',questionId:'js-average-score-q1',userText:'Миёнаи [80,90,100] чанд аст?',language:'tg',isDeep:true}});expect(await response.json()).toMatchObject({mode:'local',usage:{totalTokens:0}});
});

test('React day and practice match and retired routes lead to the learning plan',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('react-mentor-learning-v2',JSON.stringify({version:2,state:{selectedCourse:'react',courseChosen:true}})));
 await page.goto('/plan/1');await page.getByRole('link',{name:/День 1 /}).click();await expect(page).toHaveURL('/home?month=1&day=1');
 const title=await page.locator('.course-lesson h2').first().textContent();await page.getByRole('link',{name:'Практика этого дня',exact:true}).first().click();await expect(page).toHaveURL(/\/practice\?month=1&topic=.+&day=1/);await expect(page.locator('.section-heading h2').first()).toHaveText(title!);
 await page.goto('/revision');await expect(page).toHaveURL('/plan');await page.goto('/weak-topics');await expect(page).toHaveURL('/plan');await expect(page.locator('.sidebar')).not.toContainText('Повторение');await expect(page.locator('.sidebar')).not.toContainText('Сложные темы');
 const labels=await page.locator('.sidebar nav .nav-item span').allTextContents();expect(labels.indexOf('Учебный план')).toBeLessThan(labels.indexOf('Мой день'));
});

test('React course keeps lessons separate from shared practice and month 2 is locked', async ({page}) => {
 await page.goto('/courses');
 await page.locator('[data-course=react]').getByRole('button').click();
 await expect(page).toHaveURL('/courses/react');
 await expect(page.locator('.react-month-option')).toHaveCount(2);
 await expect(page.getByText('Next.js — отдельный курс. Его темы больше не входят в план React.')).toBeVisible();
 await expect(page.locator('.state-practice-frame')).toHaveCount(0);
 await page.goto('/plan/2');
 await expect(page.locator('.day-card')).toHaveCount(30);
 await expect(page.locator('a.day-card')).toHaveCount(0);
 await page.goto('/home?month=2&day=1');
 await expect(page.getByRole('heading',{name:'Сначала завершите и подтвердите предыдущий день.'})).toBeVisible();
 await page.goto('/practice?course=react');
 await expect(page.locator('.practice-selector')).toBeVisible();
 await expect(page.locator('.month-tabs')).toBeVisible();
 await page.goto('/courses/react/practice-library');
 await expect(page.frameLocator('.state-practice-frame').locator('#mgr-redux')).toBeVisible();
});

test('Next.js has its own course, 20 real published days, and old React month 3 links redirect',async({page})=>{
 await page.goto('/courses');
 await page.locator('[data-course=nextjs]').getByRole('button').click();
 await expect(page).toHaveURL('/courses/nextjs/plan');
 await expect(page.getByRole('heading',{name:'Учебный план'})).toBeVisible();
 await expect(page.locator('.day-card-grid .day-card')).toHaveCount(20);
 await page.locator('.day-card-grid a.day-card').first().click();
 await expect(page).toHaveURL('/courses/nextjs/home?day=1');
 await expect(page.locator('.course-lesson h2')).toContainText('Next.js');
 await page.goto('/plan/3'); await expect(page).toHaveURL('/courses/nextjs/plan');
 await page.goto('/home?month=3&day=1'); await expect(page).toHaveURL('/courses/nextjs/home?day=1');
 await page.goto('/practice?month=3&day=1'); await expect(page).toHaveURL('/courses/nextjs/practice?day=1');
});

test('React starts with day 1 and future day URLs stay locked',async({page})=>{
 await page.addInitScript(()=>{if(window.self!==window.top)return;const key='react-mentor-learning-v2';const saved=JSON.parse(localStorage.getItem(key)!);if(!saved.state.courseChosen){Object.assign(saved.state,{selectedCourse:'react',courseChosen:true,language:'ru',contentLanguage:'tg',activeMonth:1});localStorage.setItem(key,JSON.stringify(saved));}});
 await page.goto('/home');
 await expect(page.locator('.react-day-content .section-heading h2')).toContainText('День 1');
 await expect(page.locator('.react-day-content .course-lesson')).toHaveCount(1);
 await page.goto('/home?month=1&day=7');
 await expect(page.getByRole('heading',{name:'Сначала завершите и подтвердите предыдущий день.'})).toBeVisible();
 await page.goto('/plan/1');
 await expect(page.locator('a.day-card')).toHaveCount(1);
 await page.locator('a.day-card').first().click();
 await expect(page).toHaveURL('/home?month=1&day=1');
});
