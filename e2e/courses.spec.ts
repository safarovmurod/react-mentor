import { expect, test } from '@playwright/test';

test('new learner chooses a course, preserves separate notes and returns to the existing React course',async ({page},testInfo)=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/home');
  await expect(page.getByRole('heading',{name:'Что будем изучать?'})).toBeVisible();
  await expect(page.locator('[data-course=html]')).toContainText('Материалы ожидаются');
  await expect(page.locator('[data-course=react]')).toContainText('можно учиться');
  await expect(page.locator('.course-card')).toHaveCount(7);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'/tmp/react-mentor-'+testInfo.project.name+'-courses.png',fullPage:false});
  await page.getByRole('button',{name:'Выбрать HTML',exact:true}).click();
  await expect(page).toHaveURL('/courses/html/home');await expect(page.getByRole('heading',{name:'Материалы ожидаются'})).toBeVisible();
  await page.goto('/notes');await page.getByRole('button',{name:'Новая заметка',exact:true}).click();
  await page.getByLabel('Название',{exact:true}).fill('Моя HTML заметка');await page.getByLabel('Текст',{exact:true}).fill('Структура страницы');
  await page.getByRole('button',{name:'Сохранить',exact:true}).click();await expect(page.getByText('Структура страницы',{exact:true})).toBeVisible();
  await page.goto('/courses');await page.getByRole('button',{name:'Выбрать CSS',exact:true}).click();
  await page.goto('/notes');await expect(page.getByText('Моя HTML заметка',{exact:true})).toHaveCount(0);
  await page.goto('/courses');await page.getByRole('button',{name:'Выбрать HTML',exact:true}).click();
  await expect(page).toHaveURL('/courses/html/home');
  await page.reload();await expect(page.getByRole('heading',{name:'Материалы ожидаются'})).toBeVisible();
  await page.goto('/notes');await expect(page.getByText('Моя HTML заметка',{exact:true})).toBeVisible();
  await page.goto('/courses');await page.getByRole('button',{name:'Выбрать React',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Время разобраться в React.'})).toBeVisible();
  await page.reload();await expect(page.getByRole('heading',{name:'Время разобраться в React.'})).toBeVisible();
  await page.goto('/notes');await expect(page.getByText('Моя HTML заметка',{exact:true})).toHaveCount(0);
  const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state);
  expect(state.courses.html.notes[0].title).toBe('Моя HTML заметка');expect(state.selectedCourse).toBe('react');
  await page.goto('/courses/cpp/tests');await expect(page.getByRole('heading',{name:'Материалы ожидаются'})).toBeVisible();
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
