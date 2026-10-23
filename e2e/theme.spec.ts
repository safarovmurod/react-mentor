import { expect, test } from '@playwright/test';

test('appearance changes the shell and persists without loading Monaco on the catalog',async({page})=>{
  await page.addInitScript(()=>{
    const key='react-mentor-learning-v2';
    if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({version:2,state:{language:'ru',contentLanguage:'ru',selectedCourse:'react',courseChosen:true}}));
  });
  const editorRequests:string[]=[];
  page.on('request',request=>{if(new URL(request.url()).pathname.startsWith('/monaco/'))editorRequests.push(request.url());});
  await page.goto('/settings');
  const appearance=page.getByRole('combobox',{name:'Оформление',exact:true});
  await appearance.selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.body).backgroundColor)).toBe('rgb(13, 20, 34)');
  await page.goto('/courses');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await expect(page.locator('h1')).toHaveCSS('color','rgb(237, 243, 253)');
  await expect(page.locator('.course-card').first()).toHaveCSS('background-color','rgb(21, 31, 48)');
  expect(editorRequests).toEqual([]);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.goto('/settings');
  await appearance.selectOption('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.body).backgroundColor)).toBe('rgb(245, 247, 251)');
});
