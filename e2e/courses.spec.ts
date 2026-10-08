import { expect, test } from '@playwright/test';
// Legacy regressions exercise accounts that already saved Tajik lesson text with
// Russian UI. Geo detection must not rewrite an existing learner's choice.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('react-mentor-learning-v2')) {
      localStorage.setItem('react-mentor-learning-v2', JSON.stringify({
        version: 2, state: { language: 'ru', contentLanguage: 'tg' },
      }));
    }
  });
});

import html from '../src/content/courses/html.json';

test('course choice has one persistent active card and preserves isolated course notes',async({page},testInfo)=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/home');await expect(page.getByRole('heading',{name:'Что будем изучать?'})).toBeVisible();
 await expect(page.locator('.course-card')).toHaveCount(5);
 await page.getByRole('button',{name:'Выбрать HTML + CSS',exact:true}).click();
 await expect(page).toHaveURL('/courses/html/home?day=0');await expect(page.locator('.course-lesson h2')).toContainText('HTML + CSS');
 await page.goto('/courses');await expect(page.locator('.course-selected')).toHaveCount(1);await expect(page.locator('[data-course=html] button')).toHaveAttribute('aria-pressed','true');
 await page.reload();await expect(page.locator('[data-course=html]')).toHaveClass(/course-selected/);
 await page.screenshot({path:`/tmp/react-mentor-${testInfo.project.name}-courses.png`});
 await page.goto('/notes');await page.getByRole('button',{name:'Новая заметка',exact:true}).click();await page.getByLabel('Название',{exact:true}).fill('Моя HTML заметка');await page.getByLabel('Текст',{exact:true}).fill('Структура страницы');await page.getByRole('button',{name:'Сохранить',exact:true}).click();
 await page.goto('/courses');await page.getByRole('button',{name:'Выбрать JavaScript',exact:true}).click();await page.goto('/notes');await expect(page.getByText('Моя HTML заметка',{exact:true})).toHaveCount(0);
 await page.goto('/courses');await page.getByRole('button',{name:'Выбрать HTML + CSS',exact:true}).click();await page.goto('/notes');await expect(page.getByText('Моя HTML заметка',{exact:true})).toBeVisible();
 await page.goto('/courses');await page.getByRole('button',{name:'Выбрать React',exact:true}).click();await expect(page.getByRole('heading',{name:'Время разобраться в React.'})).toBeVisible();expect(errors).toEqual([]);
});

test('HTML + CSS Day 0 works on 320px, 360px and after refresh',async({page})=>{
  await page.setViewportSize({width:320,height:740});
  await page.goto('/courses/html/plan?day=0');
  await expect(page.locator('.day-card')).toHaveCount(30);
  await page.locator('.day-card').first().click();
  await expect(page).toHaveURL('/courses/html/home?day=0');
  await expect(page.locator('.course-lesson h2')).toContainText('HTML + CSS');
  await expect(page.locator('.day-explanation')).toHaveCount(4);
  await page.getByRole('link',{name:'Практика этого дня',exact:true}).click();
  await expect(page).toHaveURL('/courses/html/practice?day=0');
  await page.getByLabel('Ваш код',{exact:true}).fill('<h1>Day 0</h1><style>h1{color:blue}</style>');
  await page.reload();
  await expect(page.getByLabel('Ваш код',{exact:true})).toHaveValue(/Day 0/);
  for(const width of [320,360,375,430]){
    await page.setViewportSize({width,height:740});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('plan day selects only its lesson and practice, preserves code and awards XP once',async({page},testInfo)=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/courses/html/plan');await expect(page.locator('.day-card')).toHaveCount(30);
 await page.getByRole('link',{name:/День 14.*Flexbox: меню/}).click();await expect(page).toHaveURL('/courses/html/home?day=14');
 await expect(page.locator('.course-lesson')).toHaveCount(1);await expect(page.locator('.course-lesson h2')).toHaveText('Flexbox: меню из прошлых уроков');await expect(page.locator('.lesson-connections')).toContainText('День 2');
 await page.getByRole('link',{name:'Практика этого дня',exact:true}).click();await expect(page).toHaveURL('/courses/html/practice?day=14');await expect(page.locator('.course-lesson')).toHaveCount(1);
 await page.getByLabel('Ваш код',{exact:true}).fill('<h1>Мой результат</h1><style>h1{color:purple}</style>');await page.getByRole('button',{name:'Показать HTML + CSS'}).click();await expect(page.frameLocator('iframe').getByRole('heading',{name:'Мой результат'})).toBeVisible();
 await page.reload();await expect(page.getByLabel('Ваш код',{exact:true})).toHaveValue(/Мой результат/);
 for(const checkbox of await page.locator('.course-criterion input').all())await checkbox.check();await page.getByRole('button',{name:'Самопроверка проекта',exact:true}).click();
 await page.goto('/courses/html/home?day=14');await page.getByRole('button',{name:'Прочитал и понял',exact:true}).click();
 await page.goto('/courses/html/tests?day=14');const lesson=html.lessons.find(l=>l.id==='html-day-15')!;const tests=page.locator('.course-question').first();await tests.getByRole('radio',{name:lesson.questions[0].options[lesson.questions[0].correctIndex].tg,exact:true}).check();await tests.getByRole('button',{name:'Проверить',exact:true}).click();await expect(tests.getByRole('status')).toHaveText('Верно');
 await expect(page.getByRole('heading',{name:'1. Тесты'})).toBeVisible();await expect(page.getByRole('heading',{name:'2. Интервью'})).toBeVisible();await page.reload();await expect(page.locator('.course-question').first().getByRole('status')).toHaveText('Верно');
 const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state);expect(state.courses.html.awards).toMatchObject({'lesson:html-day-15':5,'practice:html-day-15':4,'test:html-day-15-q':10});expect(state.awards).toEqual({});
 await page.goto('/courses/html/plan?day=14');await expect(page.locator('.day-card.is-done')).toHaveCount(1);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`/tmp/react-mentor-${testInfo.project.name}-plan.png`});expect(errors).toEqual([]);
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
  await page.getByLabel('Найти тему или вопрос',{exact:true}).fill('@include');
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
 await page.goto('/courses');await expect(page.getByRole('heading',{name:'JavaScript',exact:true})).toHaveCount(1);await page.getByRole('button',{name:'Выбрать JavaScript',exact:true}).click();await expect(page).toHaveURL('/courses/javascript-1/home?day=1');
 await page.goto('/courses/javascript-1/plan');await expect(page.locator('.day-card')).toHaveCount(31);
 await page.getByRole('link',{name:'Месяц 2 · JS2 API и приложения',exact:true}).click();await expect(page).toHaveURL('/courses/javascript-2/home?day=1');await expect(page.locator('.course-lesson h2')).toHaveText('Клиент, сервер и HTTP');
 await page.goto('/courses/javascript-1/practice#js-average-score');const practice=page.locator('#js-average-score');await practice.getByText('Пример решения',{exact:true}).click();await expect(practice.locator('pre')).toContainText('scores.reduce');
 const response=await page.request.post('/api/tutor',{data:{action:'ask',courseId:'javascript-1',questionId:'js-average-score-q1',userText:'Миёнаи [80,90,100] чанд аст?',language:'tg',isDeep:true}});expect(await response.json()).toMatchObject({mode:'local',usage:{totalTokens:0}});
});

test('React day and practice match and retired routes lead to the learning plan',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('react-mentor-learning-v2',JSON.stringify({version:2,state:{selectedCourse:'react',courseChosen:true}})));
 await page.goto('/plan/1');await page.getByRole('link',{name:/День 7 /}).click();await expect(page).toHaveURL('/home?month=1&day=7');
 const title=await page.locator('.course-lesson h2').first().textContent();await page.getByRole('link',{name:'Практика этого дня',exact:true}).first().click();await expect(page).toHaveURL(/\/practice\?month=1&topic=.+&day=7/);await expect(page.locator('.section-heading h2').first()).toHaveText(title!);
 await page.goto('/revision');await expect(page).toHaveURL('/plan');await page.goto('/weak-topics');await expect(page).toHaveURL('/plan');await expect(page.locator('.sidebar')).not.toContainText('Повторение');await expect(page.locator('.sidebar')).not.toContainText('Сложные темы');
 const labels=await page.locator('.sidebar nav .nav-item span').allTextContents();expect(labels.indexOf('Учебный план')).toBeLessThan(labels.indexOf('Мой день'));
});
