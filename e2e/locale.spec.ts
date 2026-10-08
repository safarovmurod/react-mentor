import { expect, test } from '@playwright/test';

const expected = [
  {country:'RU',lang:'ru',heading:'Изучайте React и JavaScript',policy:'Конфиденциальность'},
  {country:'UA',lang:'uk',heading:'Вивчайте React і JavaScript',policy:'Конфіденційність'},
  {country:'US',lang:'en',heading:'Learn React and JavaScript',policy:'Privacy'},
  {country:'TJ',lang:'tg',heading:'React ва JavaScript-ро',policy:'Махфият'},
] as const;

for (const item of expected) {
  test(`a first-time visitor from ${item.country} sees ${item.lang} on public pages and inside settings`, async ({page}) => {
    await page.setExtraHTTPHeaders({'x-vercel-ip-country':item.country});
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang',item.lang);
    await expect(page.getByRole('heading', {name:new RegExp(item.heading)})).toBeVisible();
    await expect(page.locator('.public-footer').getByRole('link',{name:item.policy})).toHaveAttribute('href','/privacy');

    await page.goto('/settings');
    await expect(page.locator('.language-link')).toHaveText(item.lang.toUpperCase());
    await expect(page.locator('select').first()).toHaveValue(item.lang);
    const expectedContentLanguage=item.lang==='uk'?'en':item.lang;
    await expect(page.locator('select').nth(1)).toHaveValue(expectedContentLanguage);
    await page.reload();
    await expect(page.locator('select').first()).toHaveValue(item.lang);
  });
}

test('Cloudflare visitor country wins over Vercel proxy IP country',async({page})=>{
  await page.setExtraHTTPHeaders({'x-vercel-ip-country':'US','cf-ipcountry':'UA'});
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang','uk');
  await expect(page.getByRole('heading',{name:/Вивчайте React і JavaScript/})).toBeVisible();
});

test('manual preference survives refresh, navigation and country changes',async({page})=>{
  await page.setExtraHTTPHeaders({'x-vercel-ip-country':'UA'});
  await page.goto('/settings');
  await expect(page.locator('select').first()).toHaveValue('uk');
  await page.locator('select').first().selectOption('tg');
  await expect(page.locator('html')).toHaveAttribute('lang','tg');
  await expect(page.locator('select').first()).toHaveValue('tg');
  await page.reload();
  await expect(page.locator('select').first()).toHaveValue('tg');
  await page.setExtraHTTPHeaders({'x-vercel-ip-country':'RU'});
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang','tg');
  await expect(page.getByRole('heading',{name:/React ва JavaScript-ро/})).toBeVisible();
});

test('existing stored account/browser language wins over first-visit geolocation',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('react-mentor-learning-v2',JSON.stringify({
      version:2, state:{language:'en',contentLanguage:'en',preferenceClock:{language:42},selectedCourse:'react',courseChosen:true},
    }));
  });
  await page.setExtraHTTPHeaders({'x-vercel-ip-country':'RU'});
  await page.goto('/settings');
  await expect(page.locator('select').first()).toHaveValue('en');
  await expect(page.locator('.language-link')).toHaveText('EN');
});

test('unknown-country initial HTTP requests honor Accept-Language and English fallback',async({request})=>{
  // Use explicit request headers; device profiles can override Accept-Language
  // on browser navigation. This checks the actual Next.js server response.
  const ukrainian=await request.get('/',{headers:{
    'x-vercel-ip-country':'DE',
    'accept-language':'de-DE,de;q=0.9,uk-UA;q=0.7,en;q=0.6',
  }});
  expect(ukrainian.ok()).toBe(true);
  expect(await ukrainian.text()).toContain('<html lang="uk"');

  const english=await request.get('/',{headers:{
    'x-vercel-ip-country':'JP',
    'accept-language':'ja-JP,ko-KR;q=0.8',
  }});
  expect(english.ok()).toBe(true);
  expect(await english.text()).toContain('<html lang="en"');
});
