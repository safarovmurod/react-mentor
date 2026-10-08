import { expect, test } from '@playwright/test';
test.beforeEach(async ({page})=>{
  await page.addInitScript(()=>{if (!localStorage.getItem('react-mentor-learning-v2')) localStorage.setItem('react-mentor-learning-v2',JSON.stringify({version:2,state:{selectedCourse:'react',courseChosen:true}}));});
});

test('phone header controls never overlap and the menu scrolls, traps focus and closes', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/home');
  await expect(page.getByRole('heading', { name: 'Время разобраться в React.' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  for (const width of [320,360,375,390,430]) {
    await page.setViewportSize({ width, height: 740 });
    await expect(page.locator('.header-settings')).toBeHidden();
    const boxes = await Promise.all([
      page.getByRole('button', { name: 'Открыть меню' }), page.locator('.brand'),
      page.getByRole('button', { name: 'AI Tutor', exact: true }), page.locator('.language-link'), page.locator('.header-profile'),
    ].map(locator => locator.boundingBox()));
    for (let index=0;index<boxes.length;index++) {
      const box=boxes[index]!;expect(box).toBeTruthy();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width);
      if (index) expect(boxes[index-1]!.x+boxes[index-1]!.width).toBeLessThanOrEqual(box.x);
    }
  }
  await page.setViewportSize({width:360,height:568});
  await expect(page.locator('.dashboard-heading p')).not.toContainText('Мансур');
  await page.screenshot({path:'/tmp/react-mentor-'+info.project.name+'-phone-home.png'});
  const menu=page.getByRole('button',{name:'Открыть меню'});
  await menu.click();
  const drawer=page.getByRole('dialog',{name:'Навигация по курсу'});
  await expect(drawer).toBeVisible();
  await expect.poll(async()=>Math.round((await drawer.boundingBox())!.x)).toBe(0);
  await expect(drawer.getByRole('button',{name:'Закрыть меню'})).toBeFocused();
  expect(await page.evaluate(()=>document.body.style.overflow)).toBe('hidden');
  const profile=await drawer.locator('.profile-row').boundingBox();expect(profile!.y+profile!.height).toBeLessThanOrEqual(568);
  await drawer.locator('.profile-row').focus();await page.keyboard.press('Tab');
  await expect(drawer.getByRole('button',{name:'Закрыть меню'})).toBeFocused();
  await page.screenshot({path:'/tmp/react-mentor-'+info.project.name+'-phone-menu.png',animations:'disabled'});
  await page.keyboard.press('Escape');await expect(drawer).toBeHidden();await expect(menu).toBeFocused();
  expect(await page.evaluate(()=>document.body.style.overflow)).toBe('');
  await menu.click();await page.locator('.sidebar-overlay').click({position:{x:350,y:100}});await expect(menu).toHaveAttribute('aria-expanded','false');
  await menu.click();await page.getByRole('dialog').getByRole('link',{name:'Ответы и интервью',exact:true}).click();
  await expect(page).toHaveURL('/answers');await expect(page.getByRole('heading',{name:'Ответы и интервью',exact:true})).toBeVisible();
  await expect(page.locator('.sidebar')).toHaveAttribute('inert','');
  expect(errors).toEqual([]);
});

test('unconfigured registration explains the blocker and offers usable guest access on small phones', async ({ page }, info) => {
  const authRequests: string[]=[];
  page.on('request',request=>{if(/\/auth\/v1\//.test(request.url()))authRequests.push(request.url());});
  for (const width of [320,360,375,430]) {
    await page.setViewportSize({width,height:740});await page.goto('/login');
    await expect(page.getByRole('status')).toContainText('Вход и регистрация пока не подключены');
    await expect(page.getByRole('button',{name:'Продолжить с Google',exact:true})).toBeDisabled();
    await expect(page.getByLabel('Email',{exact:true})).toBeDisabled();
    await expect(page.getByRole('button',{name:'Продолжить как гость',exact:true})).toBeInViewport();
    const google=await page.locator('.google-button').boundingBox();const label=await page.locator('.google-button > span:last-child').boundingBox();
    expect(label!.x+label!.width).toBeLessThanOrEqual(google!.x+google!.width);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await page.getByRole('button',{name:'Создать аккаунт',exact:true}).click();
  await expect(page.getByLabel('Ваше имя',{exact:true})).toBeDisabled();
  await page.screenshot({path:'/tmp/react-mentor-'+info.project.name+'-phone-registration.png',fullPage:true});
  await page.getByRole('button',{name:'Продолжить как гость',exact:true}).click();
  await expect(page).toHaveURL('/home');await expect(page.getByRole('heading',{name:'Время разобраться в React.'})).toBeVisible();
  expect(authRequests).toEqual([]);
});
