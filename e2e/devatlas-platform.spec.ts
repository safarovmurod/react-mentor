import { expect, test, type Page } from '@playwright/test';
import { COURSE_CATALOG } from '../src/content/courses/catalog';

const storageKey='react-mentor-learning-v2';
const alternateHtml='<!doctype html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Моя мастерская</title><style>main{max-width:40rem;margin:auto;padding:1rem}h1{color:#2459b9}</style></head><body><main><h1>Учусь создавать сайты</h1><p>Это мой собственный текст и оформление.</p><a href="https://developer.mozilla.org/ru/">Читать документацию</a></main></body></html>';

async function seed(page:Page,language='ru') {
  await page.addInitScript(({key,language})=>{
    if(window.self!==window.top)return;
    if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({version:2,state:{language,contentLanguage:language==='tg'?'tg':language==='ru'?'ru':'en'}}));
  },{key:storageKey,language});
}

async function enterCode(page:Page,value:string) {
  await expect(page.locator('.monaco-editor')).toBeVisible({timeout:30000});
  // Replace the document through Monaco's model API, so HTML auto-closing does
  // not synthesize trailing characters during Playwright's bulk text insertion.
  await page.evaluate(code=>{
    const monaco=(window as unknown as {monaco:{editor:{getModels:()=>{uri:{path:string};setValue:(code:string)=>void}[]}}}).monaco;
    const model=monaco.editor.getModels().find(model=>model.uri.path.includes('html-day-01'));
    if(!model)throw new Error('HTML exercise model not mounted');
    model.setValue(code);
  },value);
  await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).state.courses.html.drafts['html-day-01'],storageKey)).toBe(value);
}

test('day 1 has a real editor, accepts alternate HTML, confirms and unlocks exactly day 2',async({page},testInfo)=>{
  test.setTimeout(60000);
  await seed(page);
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/courses/html/home?day=1');
  await expect(page.getByRole('button',{name:'Подтвердить завершение дня',exact:true})).toBeDisabled();
  await page.getByRole('button',{name:'Прочитал и понял',exact:true}).click();
  await page.getByRole('link',{name:'Практика этого дня',exact:true}).click();
  await expect(page).toHaveURL(/\/practice\?course=html&day=1$/);
  await expect(page.locator('.practice-selector')).toBeVisible();
  await enterCode(page,'<h1>Ещё не готово</h1>');
  await page.getByRole('button',{name:'Проверить решение',exact:true}).click();
  await expect(page.locator('.practice-validation [role=status]')).toContainText('Исправьте');
  await expect(page.getByRole('button',{name:'Подтвердить завершение дня',exact:true})).toBeDisabled();
  await enterCode(page,alternateHtml);
  await page.getByRole('button',{name:'Проверить решение',exact:true}).click();
  await expect(page.locator('.practice-validation [role=status]')).toContainText('Все проверки пройдены');
  await expect(page.frameLocator('.html-preview').getByRole('heading',{name:'Учусь создавать сайты'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Подтвердить завершение дня',exact:true})).toBeEnabled();
  await page.screenshot({path:`/tmp/devatlas-${testInfo.project.name}-verified-practice.png`,fullPage:true});
  await page.getByRole('button',{name:'Подтвердить завершение дня',exact:true}).click();
  await expect(page.getByRole('button',{name:'День подтверждён',exact:true})).toBeDisabled();
  const before=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).state.courses.html,storageKey);
  expect(before.confirmedDays).toEqual(['1']);
  expect(before.awards['practice:html-day-01']).toBe(20);
  await page.getByRole('button',{name:'Проверить решение',exact:true}).click();
  await page.reload();
  await expect(page.locator('.monaco-editor')).toBeVisible();
  const after=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).state.courses.html,storageKey);
  expect(after.awards).toEqual(before.awards);
  expect(after.drafts['html-day-01']).toBe(alternateHtml);
  await page.goto('/courses/html/plan');
  await expect(page.locator('.day-card.is-done')).toHaveCount(1);
  await expect(page.locator('.day-card.is-next')).toHaveCount(1);
  await expect(page.getByRole('link',{name:/День 2 /})).toBeVisible();
  await expect(page.getByRole('link',{name:/День 3 /})).toHaveCount(0);
  await page.screenshot({path:`/tmp/devatlas-${testInfo.project.name}-progress.png`,fullPage:true});
  expect(errors).toEqual([]);
});

test('future day is locked through direct lesson and shared practice URLs',async({page})=>{
  await seed(page);
  for(const path of ['/courses/html/home?day=2','/practice?course=html&day=2']) {
    await page.goto(path);
    await expect(page.getByRole('heading',{name:'Сначала завершите и подтвердите предыдущий день.'})).toBeVisible();
    await expect(page.locator('.monaco-editor')).toHaveCount(0);
  }
  await page.goto('/practice?course=unknown');
  await expect(page.getByText('This page could not be found.')).toBeVisible();
  await expect(page.locator('.monaco-editor')).toHaveCount(0);
});

test('all learning tracks have one shared practice catalog and responsive layouts',async({page},testInfo)=>{
  await seed(page);
  await page.goto('/practice');
  await expect(page.getByRole('heading',{name:'Лаборатория практики',exact:true})).toBeVisible();
  for(const track of ['html','react','python','backend','mobile','cpp'])await expect(page.locator(`.practice-course-tabs a[href="/practice?course=${track}"]`)).toBeVisible();
  await page.goto('/courses');
  for(const track of ['html','react','python','backend','mobile','cpp'])await expect(page.locator(`[data-course="${track}"]`)).toBeVisible();
  for(const path of ['/','/courses','/practice','/practice?course=html&day=1']){
    await page.goto(path);
    for(const width of [360,768,1440]){
      await page.setViewportSize({width,height:900});
      await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
  }
  await page.setViewportSize({width:360,height:800});
  await page.screenshot({path:`/tmp/devatlas-${testInfo.project.name}-practice-mobile.png`,fullPage:true});
});

for(const [locale,title] of [['ru','Лаборатория практики'],['tg','Озмоишгоҳи машқ'],['en','Practice lab'],['ja','演習ラボ'],['ko','실습실']] as const){
  test(`shared practice navigation works in ${locale}`,async({page})=>{
    await seed(page,locale);
    await page.goto('/practice');
    await expect(page.locator('html')).toHaveAttribute('lang',locale);
    await expect(page.getByRole('heading',{name:title,exact:true})).toBeVisible();
    await expect(page.locator('.practice-course-tabs a')).toHaveCount(COURSE_CATALOG.length);
  });
}

test('unconfigured paid plans cannot activate subscriptions and guest chat has no fake presence',async({page})=>{
  await seed(page);
  const checkoutRequests:string[]=[];
  page.on('request',request=>{if(request.url().includes('/api/billing/checkout'))checkoutRequests.push(request.url());});
  await page.goto('/plans');
  await expect(page.getByRole('heading',{name:'Ваш путь в разработку',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Оплата ещё не подключена',exact:true})).toHaveCount(2);
  for(const button of await page.getByRole('button',{name:'Оплата ещё не подключена',exact:true}).all())await expect(button).toBeDisabled();
  await expect(page.getByText('Сейчас платежи и подписки не создаются.',{exact:false})).toBeVisible();
  expect(checkoutRequests).toEqual([]);
  await page.goto('/community');
  await expect(page.getByRole('status').filter({hasText:'Войдите в аккаунт, чтобы открыть сообщество.'})).toBeVisible();
  await expect(page.getByLabel('Ваше сообщение',{exact:true})).toHaveCount(0);
  await expect(page.getByRole('link',{name:'Войти',exact:true})).toHaveAttribute('href','/login');
  expect((await page.request.get('/api/community')).status()).toBe(401);
});
