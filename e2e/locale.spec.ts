import { expect, test } from '@playwright/test';

const expected = [
  {country:'RU',lang:'ru',heading:'От нового интереса',policy:'Конфиденциальность'},
  {country:'UA',lang:'uk',heading:'Від нового інтересу',policy:'Конфіденційність'},
  {country:'US',lang:'en',heading:'Turn your curiosity',policy:'Privacy'},
  {country:'TJ',lang:'tg',heading:'Аз шавқи нав',policy:'Махфият'},
  {country:'JP',lang:'ja',heading:'新しい興味を',policy:'プライバシー'},
  {country:'KR',lang:'ko',heading:'새로운 관심을',policy:'개인정보 처리방침'},
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
    const expectedContentLanguage=['uk','ja','ko'].includes(item.lang)?'en':item.lang;
    await expect(page.locator('select').nth(1)).toHaveValue(expectedContentLanguage);
    await page.reload();
    await expect(page.locator('select').first()).toHaveValue(item.lang);
  });
}

test('Cloudflare visitor country wins over Vercel proxy IP country',async({page})=>{
  await page.setExtraHTTPHeaders({'x-vercel-ip-country':'US','cf-ipcountry':'UA'});
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang','uk');
  await expect(page.getByRole('heading',{name:/Від нового інтересу/})).toBeVisible();
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
  await expect(page.getByRole('heading',{name:/Аз шавқи нав/})).toBeVisible();
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
    'x-vercel-ip-country':'BR',
    'accept-language':'pt-BR,fr-FR;q=0.8',
  }});
  expect(english.ok()).toBe(true);
  expect(await english.text()).toContain('<html lang="en"');
});
