import {expect,test,type Page} from '@playwright/test';

const ids={a:'11111111-1111-4111-8111-111111111111',b:'22222222-2222-4222-8222-222222222222'};
const errors=new WeakMap<Page,string[]>();
test.beforeEach(async ({page})=>{const messages:string[]=[];errors.set(page,messages);page.on('console',m=>{if (m.type()==='error') messages.push(m.text());});page.on('pageerror',e=>{throw e;});});
test.afterEach(async ({page})=>{expect(errors.get(page)).toEqual([]);await expect(page.locator('nextjs-portal').getByText(/Runtime Error|Build Error/)).toHaveCount(0);});

async function mockBackend(page:Page) {
  const profiles=new Map<string,{display_name:string;avatar_path:string|null}>();
  const progress=new Map<string,{data:Record<string,unknown>;revision:number}>();
  const factors=new Map<string,{id:string;friendly_name:string;factor_type:string;status:string}[]>();
  const uploads:string[]=[];let oauth='';
  const user=(id:string)=>({id,aud:'authenticated',role:'authenticated',email:id===ids.a ? 'a@example.com':'b@example.com',created_at:new Date().toISOString(),app_metadata:{provider:'email',providers:['email']},user_metadata:{},factors:factors.get(id) || []});
  const token=(id:string,aal='aal1')=>[Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),Buffer.from(JSON.stringify({sub:id,exp:Math.floor(Date.now()/1000)+3600,aal,amr:[]})).toString('base64url'),'test-signature'].join('.');
  const session=(id:string,aal='aal1')=>({access_token:token(id,aal),refresh_token:'test-refresh',token_type:'bearer',expires_in:3600,user:user(id)});
  await page.route('https://auth-test.supabase.co/**',async route=>{
    const req=route.request(),url=new URL(req.url());const method=req.method();
    const bearer=req.headers().authorization?.split(' ')[1];
    let id='';try {id=JSON.parse(Buffer.from(bearer!.split('.')[1],'base64url').toString()).sub;} catch {}
    const json=(data:unknown)=>route.fulfill({json:data});
    if (url.pathname==='/auth/v1/authorize') {oauth=url.toString();return route.fulfill({contentType:'text/html',body:'<title>Mock Google redirect</title>Mock OAuth destination'});}
    if (url.pathname==='/auth/v1/token') {const body=req.postDataJSON();return json(session(body.email==='b@example.com' ? ids.b:ids.a));}
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
  return {profiles,progress,factors,uploads,oauth:()=>oauth};
}
async function login(page:Page,email='a@example.com') {
  await page.getByLabel('Email',{exact:true}).fill(email);await page.getByLabel('Пароль',{exact:true}).fill('test-password-123');await page.getByRole('button',{name:'Войти с email',exact:true}).click();
}
async function firstName(page:Page,name:string) {
  await expect(page.getByRole('heading',{name:'Как вас называть?'})).toBeVisible();await page.getByLabel('Ваше имя',{exact:true}).fill(name);await page.getByRole('button',{name:'Начать обучение',exact:true}).click();await expect(page.locator('.header-tools .avatar')).toHaveAttribute('aria-label',name);
}

test('Google is recommended and starts a PKCE OAuth redirect (mock backend)',async ({page},info)=>{
  const backend=await mockBackend(page);await page.goto('/home');await expect(page.getByText('Рекомендуем',{exact:true})).toBeVisible();
  await page.screenshot({path:'/tmp/react-mentor-'+info.project.name+'-login.png'});
  await page.getByRole('button',{name:/Продолжить с Google/}).click();await expect.poll(()=>backend.oauth()).toContain('provider=google');
  const destination=new URL(backend.oauth());expect(destination.searchParams.get('redirect_to')).toBe('http://127.0.0.1:3101/auth/callback');expect(destination.searchParams.get('code_challenge')).toBeTruthy();
});

test('first name, private notes and profile survive login, account switching and reload (mock backend)',async ({page})=>{
  const backend=await mockBackend(page);await page.goto('/home');await login(page);await firstName(page,'Мансур');
  await page.goto('/notes');await page.getByRole('button',{name:'Новая заметка',exact:true}).click();await page.getByLabel('Название',{exact:true}).fill('Личная заметка A');await page.getByLabel('Текст',{exact:true}).fill('Только аккаунт A');await page.getByRole('button',{name:'Сохранить',exact:true}).click();
  await page.goto('/settings');await page.getByRole('button',{name:'Синхронизировать',exact:true}).click();await expect.poll(()=>backend.progress.get(ids.a)?.data.notes).toEqual([expect.objectContaining({title:'Личная заметка A'})]);
  await page.getByRole('button',{name:'Выйти из аккаунта',exact:true}).click();await expect(page.getByRole('heading',{name:'Ваш путь в React'})).toBeVisible();await login(page,'b@example.com');
  // First profile is mandatory and must not reuse account A's name.
  await firstName(page,'Одина');await page.goto('/notes');await expect(page.getByText('Личная заметка A',{exact:true})).toHaveCount(0);await page.goto('/settings');
  await page.getByRole('button',{name:'Выйти из аккаунта',exact:true}).click();await login(page);await page.goto('/notes');await expect(page.getByText('Личная заметка A',{exact:true})).toBeVisible();await page.reload();await expect(page.getByText('Личная заметка A',{exact:true})).toBeVisible();
  const keys=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('react-mentor-account-v1:')));expect(keys).toContain('react-mentor-account-v1:'+ids.a);expect(keys).toContain('react-mentor-account-v1:'+ids.b);
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
