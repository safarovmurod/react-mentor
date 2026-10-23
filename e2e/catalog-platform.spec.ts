import {expect,test} from '@playwright/test';
import {COURSE_CATALOG} from '../src/content/courses/catalog';
import {COURSE_CATEGORIES,PROGRAMMING_SUBTRACKS} from '../src/content/course-categories';
import premiumCourse from '../src/content/courses/javascript-pro.json';

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>{
    if(window.self!==window.top)return;
    const key='react-mentor-learning-v2';
    if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({version:2,state:{language:'ru',contentLanguage:'ru'}}));
  });
});

const catalog=COURSE_CATALOG.filter(course=>course.id!=='css'&&course.id!=='javascript-2');

test('catalog groups all learning categories and separates frontend from backend with filters and search',async({page},testInfo)=>{
  await page.goto('/courses');
  await expect(page.locator('.course-card')).toHaveCount(catalog.length);
  for(const category of COURSE_CATEGORIES)await expect(page.locator(`.category-card[data-category="${category.id}"]`)).toBeVisible();
  await page.locator('.category-card[data-category="programming"]').click();
  for(const track of PROGRAMMING_SUBTRACKS)await expect(page.locator('.subtrack-filters').getByRole('button',{name:track.labels.ru,exact:true})).toBeVisible();
  await page.locator('.subtrack-filters').getByRole('button',{name:'Фронтенд',exact:true}).click();
  await expect(page.locator('.course-card')).toHaveCount(catalog.filter(course=>course.subtrack==='frontend').length);
  await expect(page.locator('[data-course="react"]')).toBeVisible();
  await expect(page.locator('[data-course="backend"]')).toHaveCount(0);
  await page.locator('.subtrack-filters').getByRole('button',{name:'Бэкенд',exact:true}).click();
  await expect(page.locator('.course-card')).toHaveCount(catalog.filter(course=>course.subtrack==='backend').length);
  await expect(page.locator('[data-course="backend"]')).toBeVisible();
  await expect(page.locator('[data-course="react"]')).toHaveCount(0);
  await page.getByRole('textbox',{name:'Найти курс',exact:true}).fill('Python');
  await expect(page.locator('.course-card')).toHaveCount(1);
  await expect(page.locator('[data-course="python"]')).toBeVisible();
  await page.getByRole('textbox',{name:'Найти курс',exact:true}).fill('');
  await page.locator('.category-card[data-category="design"]').click();
  await expect(page.locator('[data-course="ux-design"]')).toBeVisible();
  await expect(page.locator('.course-card')).toHaveCount(catalog.filter(course=>course.category==='design').length);
  await page.screenshot({path:`/tmp/devatlas-${testInfo.project.name}-design-catalog.png`,fullPage:true});
});

test('plan filters show real premium cards while guest requests cannot read paid lessons or SSR answers',async({page})=>{
  await page.goto('/courses');
  await page.locator('.course-access-filters').getByRole('button',{name:'Pro',exact:true}).click();
  await expect(page.locator('.course-card')).toHaveCount(catalog.filter(course=>course.accessTier==='pro').length);
  for(const card of await page.locator('.course-card').all())await expect(card).toHaveAttribute('data-access-tier','pro');
  await page.locator('.course-access-filters').getByRole('button',{name:'Expert',exact:true}).click();
  await expect(page.locator('.course-card')).toHaveCount(catalog.filter(course=>course.accessTier==='expert').length);
  await expect(page.locator('[data-course="architecture-expert"] .course-tier')).toHaveText('Expert');
  await page.goto('/courses/javascript-pro/home?day=1');
  await expect(page.getByText('Войдите в аккаунт, чтобы открыть этот курс.',{exact:true})).toBeVisible();
  await expect(page.locator('.monaco-editor')).toHaveCount(0);
  for(const url of ['/courses/javascript-pro/plan','/courses/javascript-pro/home?day=1','/practice?course=javascript-pro&day=1']){
    const response=await page.request.get(url);const html=await response.text();
    expect(html).not.toContain(premiumCourse.lessons[0].id);
    expect(html).not.toContain('Контракт: массив задач с owner и done');
  }
  const denied=await page.request.get('/api/courses/javascript-pro');
  expect(denied.status()).toBe(401);
  expect(denied.headers()['cache-control']).toContain('no-store');
  expect(await denied.json()).toEqual({error:'authentication_required'});
  await page.goto('/practice?course=architecture-expert');
  await expect(page.getByText('Войдите в аккаунт, чтобы открыть этот курс.',{exact:true})).toBeVisible();
});

test('written business practice saves a real response without Monaco and confirms the next day',async({page})=>{
  await page.goto('/courses/business-foundations/home?day=1');
  await page.getByRole('button',{name:'Прочитал и понял',exact:true}).click();
  await page.getByRole('link',{name:'Практика этого дня',exact:true}).click();
  await expect(page).toHaveURL('/practice?course=business-foundations&day=1');
  await expect(page.locator('.monaco-editor')).toHaveCount(0);
  await expect(page.locator('.learning-code-editor')).toHaveCount(0);
  const response='Клиент: владелец небольшой кофейни. Задача: заранее учитывать остатки молока. Предложение: простой ежедневный список. Предположение: список уменьшит срочные закупки. Проверка: сравнить записи двух рабочих дней без сбора персональных данных.';
  await page.getByLabel('Ваш ответ',{exact:true}).fill(response);
  await page.reload();
  await expect(page.getByLabel('Ваш ответ',{exact:true})).toHaveValue(response);
  for(const criterion of await page.locator('.course-criterion input').all())await criterion.check();
  await page.getByRole('button',{name:'Самопроверка проекта',exact:true}).click();
  await page.getByRole('button',{name:'Подтвердить завершение дня',exact:true}).click();
  await expect(page.getByRole('button',{name:'День подтверждён',exact:true})).toBeDisabled();
  const progress=await page.evaluate(()=>JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses['business-foundations']);
  expect(progress.drafts['business-foundations-day-01']).toBe(response);
  expect(progress.awards['practice:business-foundations-day-01']).toBe(4);
  expect(progress.confirmedDays).toEqual(['1']);
  await page.reload();
  await expect(page.getByLabel('Ваш ответ',{exact:true})).toHaveValue(response);
  const next=await page.evaluate(()=>JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses['business-foundations']);
  expect(next.awards).toEqual(progress.awards);
  await page.getByRole('link',{name:/Следующий день 2/}).click();
  await expect(page).toHaveURL('/courses/business-foundations/home?day=2');
  await expect(page.locator('.course-lesson h2')).toBeVisible();
});
