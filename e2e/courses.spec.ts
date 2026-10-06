import { expect, test } from '@playwright/test';

test('new learner chooses a course, preserves separate notes and returns to the existing React course',async ({page},testInfo)=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/home');
  await expect(page.getByRole('heading',{name:'Что будем изучать?'})).toBeVisible();
  await expect(page.locator('[data-course=html]')).toContainText('можно учиться');
  await expect(page.locator('[data-course=react]')).toContainText('можно учиться');
  await expect(page.locator('.course-card')).toHaveCount(6);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'/tmp/react-mentor-'+testInfo.project.name+'-courses.png',fullPage:false});
  await page.getByRole('button',{name:'Выбрать HTML',exact:true}).click();
  await expect(page).toHaveURL('/courses/html/home');await expect(page.getByRole('heading',{name:'HTML: ҷустуҷӯ, select ва ҷадвал'})).toBeVisible();
  await page.goto('/notes');await page.getByRole('button',{name:'Новая заметка',exact:true}).click();
  await page.getByLabel('Название',{exact:true}).fill('Моя HTML заметка');await page.getByLabel('Текст',{exact:true}).fill('Структура страницы');
  await page.getByRole('button',{name:'Сохранить',exact:true}).click();await expect(page.getByText('Структура страницы',{exact:true})).toBeVisible();
  await page.goto('/courses');await page.getByRole('button',{name:'Выбрать CSS',exact:true}).click();
  await page.goto('/notes');await expect(page.getByText('Моя HTML заметка',{exact:true})).toHaveCount(0);
  await page.goto('/courses');await page.getByRole('button',{name:'Выбрать HTML',exact:true}).click();
  await expect(page).toHaveURL('/courses/html/home');
  await page.reload();await expect(page.getByRole('heading',{name:'HTML: ҷустуҷӯ, select ва ҷадвал'})).toBeVisible();
  await page.goto('/notes');await expect(page.getByText('Моя HTML заметка',{exact:true})).toBeVisible();
  await page.goto('/courses');await page.getByRole('button',{name:'Выбрать React',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Время разобраться в React.'})).toBeVisible();
  await page.reload();await expect(page.getByRole('heading',{name:'Время разобраться в React.'})).toBeVisible();
  await page.goto('/notes');await expect(page.getByText('Моя HTML заметка',{exact:true})).toHaveCount(0);
  const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state);
  expect(state.courses.html.notes[0].title).toBe('Моя HTML заметка');expect(state.selectedCourse).toBe('react');
  await page.goto('/courses/cpp/tests');await expect(page.getByRole('heading',{name:'C++: барномаи аввал ва cout'})).toBeVisible();
  const response=await page.request.post('/api/tutor',{data:{action:'ask',courseId:'cpp',userText:'useState чиба даркорай?'}});
  expect(await response.json()).toMatchObject({mode:'local',usage:{totalTokens:0}});expect((await response.json()).source).toBeUndefined();
  expect(errors).toEqual([]);
});

test('reviewed course renderer supports lessons, quiz persistence and manual practice (mock source fixture)',async ({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  const text=(value:string)=>({tg:value,ru:value});
  const fixture={courseId:'html',sources:[{id:'fixture-source',title:'Test source',url:'https://example.com/fixture'}],files:[],lessons:[{
    id:'fixture-intro',title:text('Тестовый разбор HTML'),summary:text('Synthetic test fixture, not Telegram content.'),level:'beginner',sourceIds:['fixture-source'],
    sections:[{title:text('Как работает'),body:text('h1 обозначает главный заголовок.'),code:'<h1>Hello</h1>',output:text('Hello')}],
    questions:[{id:'fixture-question',question:text('Для чего нужен h1?'),answer:text('Для главного заголовка страницы.'),options:[text('Заголовок страницы'),text('Изображение')],correctIndex:0}],
    practice:{task:text('Создайте заголовок.'),hint:text('Используйте h1.'),solution:'<h1>Hello</h1>',criteria:[text('Заголовок виден')]},
  }]};
  await page.route('**/api/courses/html',route=>route.fulfill({json:fixture}));
  await page.goto('/courses/html/plan');await expect(page.getByRole('heading',{name:'Тестовый разбор HTML'})).toBeVisible();
  await page.getByRole('button',{name:'Прочитал и понял'}).click();await expect(page.getByRole('button',{name:'Изучено',exact:true})).toBeDisabled();
  await page.goto('/courses/html/tests');await page.getByRole('radio',{name:'Заголовок страницы'}).check();
  await page.getByRole('button',{name:'Проверить',exact:true}).click();await expect(page.getByRole('status')).toHaveText('Верно');
  await page.reload();await expect(page.getByRole('status')).toHaveText('Верно');await expect(page.getByRole('button',{name:'Проверить',exact:true})).toBeDisabled();
  await page.goto('/courses/html/practice');await expect(page.getByText('Это ручная проверка.',{exact:false})).toBeVisible();
  await page.getByRole('checkbox',{name:'Заголовок виден'}).check();await page.getByRole('button',{name:'Самопроверка проекта',exact:true}).click();
  const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state);
  expect(state.courses.html.completedTopics).toEqual(['fixture-intro']);expect(state.courses.html.completedPractice).toEqual(['fixture-intro']);
  expect(state.courses.html.awards).toEqual({'lesson:fixture-intro':5,'test:fixture-question':10,'practice:fixture-intro':4});
  expect(state.completedTopics).toEqual([]);expect(state.awards).toEqual({});expect(errors).toEqual([]);
});

test('public channel index distinguishes unread attachments from reviewed message lessons',async ({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/courses/materials');
  await expect(page.getByRole('heading',{name:'Материалы канала',exact:true})).toBeVisible();
  await expect(page.getByText('151 публичных сообщений · 100 вложений', {exact:true})).toBeVisible();
  await expect(page.getByText('Сами PDF, архивы и видео ещё не прочитаны:',{exact:false})).toBeVisible();
  await page.getByRole('combobox',{name:'Тип материала',exact:true}).selectOption('pdf');
  await expect(page.locator('.telegram-material')).toHaveCount(32);
  await page.getByLabel('Поиск по названию',{exact:true}).fill('JavaScript_Essentials');
  await expect(page.locator('.telegram-material')).toHaveCount(1);
  await expect(page.getByRole('link',{name:'Открыть в Telegram',exact:true})).toHaveAttribute('href','https://t.me/programmerPOdCapot/87?single');
  await expect(page.locator('.telegram-material')).toContainText('4 публикаций');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.goto('/courses/css/answers');
  await expect(page.getByRole('heading',{name:'Sass: variable ва nesting',exact:true})).toBeVisible();
  await page.getByLabel('Найти тему или вопрос',{exact:true}).fill('@include');
  await expect(page.locator('.course-lesson')).toHaveCount(1);
  const response=await page.request.post('/api/tutor',{data:{action:'ask',courseId:'css',userText:'Sass чист?',language:'tg'}});
  const tutor=await response.json();
  expect(tutor).toMatchObject({mode:'local',usage:{totalTokens:0}});
  expect(tutor.reply).toContain('preprocessor');
  expect(tutor.source.href).toContain('/courses/css/answers');
  await page.goto('/courses/css/tests');
  const question=page.locator('.course-question').filter({has:page.getByRole('heading',{name:'Чӣ тавр variable менависем?',exact:true})});
  await question.getByRole('radio',{name:'Бо $',exact:true}).check();
  await question.getByRole('button',{name:'Проверить',exact:true}).click();
  await expect(question.getByRole('status')).toHaveText('Верно');
  await page.reload();await expect(question.getByRole('status')).toHaveText('Верно');
  expect(errors).toEqual([]);
});

test('JavaScript has one card, two month stages and source-backed daily practice',async ({page})=>{
  await page.goto('/courses');
  await expect(page.getByRole('heading',{name:'JavaScript',exact:true})).toHaveCount(1);
  await page.getByRole('button',{name:'Выбрать JavaScript',exact:true}).click();
  await expect(page).toHaveURL('/courses/javascript-1/home');
  await expect(page.getByRole('heading',{name:'JavaScript: forEach, map, filter ва find',exact:true})).toBeVisible();
  await page.goto('/courses/javascript-1/plan');
  await expect(page.locator('.course-month-plan li')).toHaveCount(30);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('link',{name:'Месяц 2 · JS2 API и запросы',exact:true}).click();
  await expect(page).toHaveURL('/courses/javascript-2/plan');
  await expect(page.getByRole('heading',{name:'JavaScript 2: API-и маҳаллӣ бо JSON Server',exact:true})).toBeVisible();
  await page.getByRole('link',{name:'Месяц 1 · JS1 Массивы, объекты и задачи',exact:true}).click();
  await page.goto('/courses/javascript-1/practice#js-average-score');
  const practice=page.locator('#js-average-score');
  await practice.getByText('Подсказка',{exact:true}).click();
  await practice.getByText('Пример решения',{exact:true}).click();
  await expect(practice.locator('pre')).toContainText('scores.reduce');
  const response=await page.request.post('/api/tutor',{data:{action:'ask',courseId:'javascript-1',questionId:'js-average-score-q1',userText:'Миёнаи [80,90,100] чанд аст?',language:'tg',deep:true}});
  expect(await response.json()).toMatchObject({mode:'local',usage:{totalTokens:0}});
  await page.goto('/courses/materials');
  await page.getByRole('combobox',{name:'Тип материала',exact:true}).selectOption('photo');
  await expect(page.locator('.telegram-material')).toHaveCount(20);
  await expect(page.getByRole('link',{name:'Скачать превью изображения',exact:true})).toHaveCount(20);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
