import {chromium,expect,test,type BrowserContext,type Page} from '@playwright/test';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {existsSync} from 'node:fs';

const ids={a:'11111111-1111-4111-8111-111111111111',b:'22222222-2222-4222-8222-222222222222'};
const errors=new WeakMap<Page,string[]>();
test.beforeEach(async ({page})=>{const messages:string[]=[];errors.set(page,messages);page.on('console',m=>{if (m.type()==='error') messages.push(m.text());});page.on('pageerror',e=>{throw e;});});
test.afterEach(async ({page},info)=>{const unexpected=(errors.get(page)||[]).filter(message=>!(info.title.includes('temporary email quota') && /status of 429/.test(message)));expect(unexpected).toEqual([]);await expect(page.locator('nextjs-portal').getByText(/Runtime Error|Build Error/)).toHaveCount(0);});

interface MockServerState {
  profiles:Map<string,{display_name:string;avatar_path:string|null}>;
  progress:Map<string,{data:Record<string,unknown>;revision:number}>;
  factors:Map<string,{id:string;friendly_name:string;factor_type:string;status:string}[]>;
}
async function mockBackend(page:Page,signupFailure=false,previous?:MockServerState) {
  const profiles=previous?.profiles || new Map<string,{display_name:string;avatar_path:string|null}>();
  const progress=previous?.progress || new Map<string,{data:Record<string,unknown>;revision:number}>();
  const factors=previous?.factors || new Map<string,{id:string;friendly_name:string;factor_type:string;status:string}[]>();
  const tokenGrants:string[]=[];
  const uploads:string[]=[];const signups:{email:string;data:{full_name:string};redirect:string|null}[]=[];let oauth='';
  const user=(id:string)=>({id,aud:'authenticated',role:'authenticated',email:id===ids.a ? 'a@example.com':'b@example.com',created_at:new Date().toISOString(),app_metadata:{provider:'email',providers:['email']},user_metadata:{},factors:factors.get(id) || []});
  const token=(id:string,aal='aal1')=>[Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),Buffer.from(JSON.stringify({sub:id,exp:Math.floor(Date.now()/1000)+3600,aal,amr:[]})).toString('base64url'),'test-signature'].join('.');
  const session=(id:string,aal='aal1')=>({access_token:token(id,aal),refresh_token:'test-refresh:'+id+':'+aal,token_type:'bearer',expires_in:3600,user:user(id)});
  await page.route('https://auth-test.supabase.co/**',async route=>{
    const req=route.request(),url=new URL(req.url());const method=req.method();
    const bearer=req.headers().authorization?.split(' ')[1];
    let id='';try {id=JSON.parse(Buffer.from(bearer!.split('.')[1],'base64url').toString()).sub;} catch {}
    const json=(data:unknown)=>route.fulfill({json:data});
    if (url.pathname==='/auth/v1/authorize') {oauth=url.toString();return route.fulfill({contentType:'text/html',body:'<title>Mock Google redirect</title>Mock OAuth destination'});}
    if (url.pathname==='/auth/v1/signup') {
      const body=req.postDataJSON();signups.push({email:body.email,data:body.data,redirect:url.searchParams.get('redirect_to')});
      if (signupFailure) return route.fulfill({status:429,headers:{'x-supabase-api-version':'2024-01-01','access-control-expose-headers':'X-Supabase-Api-Version'},json:{code:'over_email_send_rate_limit',msg:'Email rate limit exceeded'}});
      return json({...user(ids.a),email:body.email,user_metadata:body.data});
    }
    if (url.pathname==='/auth/v1/token') {
      const body=req.postDataJSON(),grant=url.searchParams.get('grant_type') || '';tokenGrants.push(grant);
      if (grant==='refresh_token') {const [,account,aal]=body.refresh_token.split(':');expect([ids.a,ids.b]).toContain(account);return json(session(account,aal));}
      return json(session(body.email==='b@example.com' ? ids.b:ids.a));
    }
    if (url.pathname==='/auth/v1/user') return json(user(id));
    if (url.pathname==='/auth/v1/logout') return json({});
    if (url.pathname==='/auth/v1/factors' && method==='POST') {
      factors.set(id,[{id:'factor-1',friendly_name:'ReactMentor',factor_type:'totp',status:'unverified'}]);
      return json({id:'factor-1',type:'totp',totp:{qr_code:'<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192"><rect width="192" height="192" fill="white"/><text x="5" y="80">MOCK QR</text></svg>',secret:'TEST-ONLY-SECRET',uri:'otpauth://totp/Test?secret=TEST'}});
    }
    if (/\/factors\/[^/]+\/challenge$/.test(url.pathname)) return json({id:'challenge-1',expires_at:Math.floor(Date.now()/1000)+300});
    if (/\/factors\/[^/]+\/verify$/.test(url.pathname)) {factors.set(id,[{id:'factor-1',friendly_name:'ReactMentor',factor_type:'totp',status:'verified'}]);return json(session(id,'aal2'));}
    if (/\/factors\/[^/]+$/.test(url.pathname) && method==='DELETE') {factors.set(id,[]);return json({});}
    if (url.pathname==='/rest/v1/react_mentor_profiles') {
      if (method==='GET') return json(profiles.get(id) || null);
      const body=req.postDataJSON();expect(body.user_id).toBe(id);profiles.set(id,body);return json(null);
    }
    if (url.pathname==='/rest/v1/react_mentor_progress') return json(progress.get(id) || null);
    if (url.pathname==='/rest/v1/rpc/react_mentor_save_progress') {
      const body=req.postDataJSON(),current=progress.get(id);expect(body.expected_revision).toBe(current?.revision || 0);
      const saved={data:body.progress_data,revision:(current?.revision || 0)+1};progress.set(id,saved);return json([saved]);
    }
    if (url.pathname.startsWith('/storage/v1/object/sign/')) return json({signedURL:'/object/sign/react-mentor-avatars/'+id+'/photo.webp?token=public-test'});
    if (url.pathname.startsWith('/storage/v1/object/') && method==='POST') {expect(url.pathname).toContain(id);uploads.push(url.pathname);return json({Key:url.pathname});}
    throw new Error('Unexpected backend request: '+method+' '+url.pathname);
  });
  return {profiles,progress,factors,uploads,signups,tokenGrants,oauth:()=>oauth};
}
async function login(page:Page,email='a@example.com') {
  await page.getByLabel('Email',{exact:true}).fill(email);await page.getByLabel('Пароль',{exact:true}).fill('test-password-123');await page.getByRole('button',{name:'Войти с email',exact:true}).click();
}
async function firstName(page:Page,name:string) {
  await expect(page.getByRole('heading',{name:'Как вас называть?'})).toBeVisible();await page.getByLabel('Ваше имя',{exact:true}).fill(name);await page.getByRole('button',{name:'Начать обучение',exact:true}).click();await expect(page.locator('.header-tools .avatar')).toHaveAttribute('aria-label',name);
  await expect(page.getByRole('heading',{name:'Что будем изучать?'})).toBeVisible();
  await page.getByRole('button',{name:'Выбрать React',exact:true}).click();
}

test('Google is recommended and starts a PKCE OAuth redirect (mock backend)',async ({page},info)=>{
  const backend=await mockBackend(page);await page.goto('/home');await expect(page.getByText('Рекомендуем',{exact:true})).toBeVisible();
  await page.screenshot({path:'/tmp/react-mentor-'+info.project.name+'-login.png'});
  await page.getByRole('button',{name:/Продолжить с Google/}).click();await expect.poll(()=>backend.oauth()).toContain('provider=google');
  const destination=new URL(backend.oauth());expect(destination.searchParams.get('redirect_to')).toBe('http://127.0.0.1:3101/auth/callback');expect(destination.searchParams.get('code_challenge')).toBeTruthy();
});

test('email signup sends the name and callback, then asks for email confirmation (mock backend)',async ({page})=>{
  const backend=await mockBackend(page);await page.goto('/login');
  await page.getByRole('button',{name:'Создать аккаунт',exact:true}).click();
  await page.getByLabel('Ваше имя',{exact:true}).fill('Одина');
  await page.getByLabel('Email',{exact:true}).fill('new@example.com');
  await page.getByLabel('Пароль',{exact:true}).fill('test-password-123');
  await page.getByRole('button',{name:'Создать аккаунт',exact:true}).first().click();
  await expect(page.getByRole('status')).toContainText('Проверьте email и подтвердите адрес');
  expect(backend.signups).toEqual([{email:'new@example.com',data:{full_name:'Одина'},redirect:'http://127.0.0.1:3101/auth/callback'}]);
});

test('signup explains a temporary email quota and allows retry (mock backend)',async ({page})=>{
  // Chromium also logs the expected HTTP 429; the UI must explain that failure.
  await mockBackend(page,true);await page.goto('/login');
  await page.getByRole('button',{name:'Создать аккаунт',exact:true}).click();
  await page.getByLabel('Ваше имя',{exact:true}).fill('Одина');
  await page.getByLabel('Email',{exact:true}).fill('new@example.com');
  await page.getByLabel('Пароль',{exact:true}).fill('test-password-123');
  await page.getByRole('button',{name:'Создать аккаунт',exact:true}).first().click();
  await expect(page.locator('.auth-card').getByRole('alert')).toContainText('Лимит отправки писем');
  await expect(page.getByRole('button',{name:'Создать аккаунт',exact:true}).first()).toBeEnabled();
});

test('first name, private notes and profile survive login, account switching and reload (mock backend)',async ({page})=>{
  const backend=await mockBackend(page);await page.goto('/home');await login(page);await firstName(page,'Мансур');
  await page.goto('/home');await expect(page.locator('.dashboard-heading p')).toContainText('Мансур');
  await page.goto('/notes');await page.getByRole('button',{name:'Новая заметка',exact:true}).click();await page.getByLabel('Название',{exact:true}).fill('Личная заметка A');await page.getByLabel('Текст',{exact:true}).fill('Только аккаунт A');await page.getByRole('button',{name:'Сохранить',exact:true}).click();
  await page.goto('/settings');await page.getByRole('button',{name:'Синхронизировать',exact:true}).click();await expect.poll(()=>backend.progress.get(ids.a)?.data.notes).toEqual([expect.objectContaining({title:'Личная заметка A'})]);
  await page.getByRole('button',{name:'Выйти из аккаунта',exact:true}).click();await expect(page.getByRole('heading',{name:'Ваш путь в React'})).toBeVisible();await login(page,'b@example.com');
  // First profile is mandatory and must not reuse account A's name.
  await firstName(page,'Одина');await page.goto('/home');await expect(page.locator('.dashboard-heading p')).toContainText('Одина');await expect(page.locator('.dashboard-heading p')).not.toContainText('Мансур');await page.goto('/notes');await expect(page.getByText('Личная заметка A',{exact:true})).toHaveCount(0);await page.goto('/settings');
  await page.getByRole('button',{name:'Выйти из аккаунта',exact:true}).click();await login(page);await page.goto('/notes');await expect(page.getByText('Личная заметка A',{exact:true})).toBeVisible();await page.reload();await expect(page.getByText('Личная заметка A',{exact:true})).toBeVisible();
  const keys=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('react-mentor-account-v1:')));expect(keys).toContain('react-mentor-account-v1:'+ids.a);expect(keys).toContain('react-mentor-account-v1:'+ids.b);
});

test('remembered login survives closing the browser, refreshes expired access and respects logout (mock backend)',async ({},info)=>{
  test.setTimeout(60000);
  const directory=await mkdtemp(join(tmpdir(),'react-mentor-remembered-login-'));
  let context:BrowserContext|undefined;const pageErrors:string[]=[];
  async function open(previous?:MockServerState){
    context=await chromium.launchPersistentContext(directory,{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium':undefined),baseURL:info.project.use.baseURL,viewport:info.project.use.viewport});
    const page=context.pages()[0];page.on('pageerror',error=>pageErrors.push(error.message));
    const backend=await mockBackend(page,false,previous);return {page,backend};
  }
  try {
    const first=await open();await first.page.goto('/home');await login(first.page,'b@example.com');await firstName(first.page,'Одина');
    await first.page.evaluate(()=>{
      const key=Object.keys(localStorage).find(key=>key.endsWith('-auth-token'))!;
      const saved=JSON.parse(localStorage.getItem(key)!);saved.expires_at=Math.floor(Date.now()/1000)-60;
      const [header,payload,signature]=saved.access_token.split('.');
      const claims=JSON.parse(atob(payload.replace(/-/g,'+').replace(/_/g,'/')));claims.exp=saved.expires_at;
      saved.access_token=[header,btoa(JSON.stringify(claims)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''),signature].join('.');
      localStorage.setItem(key,JSON.stringify(saved));
    });
    await context!.close();context=undefined;
    const resumed=await open(first.backend);await resumed.page.goto('/login');
    await expect(resumed.page.locator('.header-tools .avatar')).toHaveAttribute('aria-label','Одина');
    await expect(resumed.page).toHaveURL(/\/home$/);
    await expect(resumed.page.getByRole('heading',{name:'Как вас называть?'})).toHaveCount(0);
    expect(resumed.backend.tokenGrants).toEqual(['refresh_token']);expect(resumed.backend.oauth()).toBe('');
    expect(await resumed.page.evaluate(()=>{
      const key=Object.keys(localStorage).find(key=>key.endsWith('-auth-token'))!;
      return JSON.parse(localStorage.getItem(key)!).expires_at>Math.floor(Date.now()/1000);
    })).toBe(true);
    await resumed.page.goto('/settings');await resumed.page.getByRole('button',{name:'Выйти из аккаунта',exact:true}).click();
    await expect(resumed.page.getByRole('heading',{name:'Ваш путь в React'})).toBeVisible();
    await context!.close();context=undefined;
    const loggedOut=await open(first.backend);await loggedOut.page.goto('/home');
    await expect(loggedOut.page.getByRole('button',{name:'Войти с email',exact:true})).toBeVisible();
    expect(loggedOut.backend.tokenGrants).toEqual([]);expect(pageErrors).toEqual([]);
  } finally {await context?.close();await rm(directory,{recursive:true,force:true});}
});

test('photo upload, phone QR and authenticator enrollment/challenge work (mock backend)',async ({page},info)=>{
  const backend=await mockBackend(page);await page.goto('/home');await login(page);await firstName(page,'Мансур');await page.goto('/settings');
  const image=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=20;c.height=20;c.getContext('2d')!.fillRect(0,0,20,20);return c.toDataURL('image/png').split(',')[1];});
  await page.getByLabel('Добавить фото',{exact:true}).setInputFiles({name:'profile.png',mimeType:'image/png',buffer:Buffer.from(image,'base64')});await expect.poll(()=>backend.uploads.length).toBe(1);await expect.poll(()=>backend.profiles.get(ids.a)?.avatar_path).toContain(ids.a+'/');
  await expect(page.getByAltText('QR: открыть вход на телефоне')).toBeVisible();
  await page.getByRole('button',{name:'Подключить authenticator · QR',exact:true}).click();await expect(page.getByAltText('QR для приложения authenticator')).toBeVisible();await page.getByLabel('Код из приложения',{exact:true}).fill('123456');await page.getByRole('button',{name:'Подключить защиту',exact:true}).click();
  await expect(page.getByText('Authenticator подключён',{exact:true})).toBeVisible();await expect(page.getByAltText('QR для приложения authenticator')).toHaveCount(0);
  expect(await page.evaluate(()=>JSON.stringify(localStorage))).not.toContain('TEST-ONLY-SECRET');
  await page.screenshot({path:'/tmp/react-mentor-'+info.project.name+'-account-settings.png',fullPage:true});
  await page.getByRole('button',{name:'Выйти из аккаунта',exact:true}).click();await login(page);
  await expect(page.getByRole('heading',{name:'Подтвердите вход'})).toBeVisible();await expect(page.getByRole('heading',{name:'Время разобраться в React.'})).toHaveCount(0);
  await page.getByLabel('Код authenticator',{exact:true}).fill('123456');await page.getByRole('button',{name:'Подтвердить',exact:true}).click();await expect(page.getByRole('heading',{name:'Настройки',exact:true})).toBeVisible();
});
