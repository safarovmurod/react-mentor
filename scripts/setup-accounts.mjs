/** Scoped setup for the user's existing project. Never prints keys/tokens. */
import {readFile} from 'node:fs/promises';
const ref=process.env.REACT_MENTOR_SUPABASE_PROJECT_REF || 'sqveszluhdargkiqowjp';
if (!/^[a-z]{20}$/.test(ref)) {console.error('Invalid Supabase project reference.');process.exit(1);}
const site='https://react-mentor-opal.vercel.app';
const access=process.env.SUPABASE_ACCESS_TOKEN;
if (!access) {console.error('Set SUPABASE_ACCESS_TOKEN securely in the environment.');process.exit(1);}
async function api(path,method='GET',body) {
  const response=await fetch('https://api.supabase.com/v1/projects/'+ref+path,{method,headers:{Authorization:'Bearer '+access,'Content-Type':'application/json'},...(body ? {body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(45000)});
  if (!response.ok) {
    let reason='';
    try {
      const result=await response.json();
      if (typeof result.message==='string') reason=result.message.replaceAll(access,'[redacted]').replace(/[\r\n]/g,' ').slice(0,400);
    } catch {}
    throw new Error('Supabase operation failed: '+method+' '+path+' HTTP '+response.status+(reason ? ': '+reason : ''));
  }
  return response.json();
}
try {
  const existing=await api('/database/query','POST',{query:"select to_regclass('public.react_mentor_profiles') is not null as installed"});
  if (!existing[0]?.installed) {
    const query=await readFile(new URL('../supabase/migrations/20261004000000_accounts.sql',import.meta.url),'utf8');
    await api('/database/query','POST',{query});console.log('ReactMentor account migration applied. Other app tables were not changed.');
  } else {
    const functions=await api('/database/query','POST',{query:"select to_regprocedure('public.react_mentor_save_progress(bigint,jsonb)') is not null as complete"});
    if (!functions[0]?.complete) throw new Error('Existing ReactMentor schema is incomplete. Review before applying changes.');
    console.log('ReactMentor migration already present.');
  }
  const conflictMigration=await readFile(new URL('../supabase/migrations/20261005000000_progress_conflict.sql',import.meta.url),'utf8');
  await api('/database/query','POST',{query:conflictMigration});
  console.log('ReactMentor progress conflicts return HTTP 409.');
  const config=await api('/config/auth');
  const redirects=new Set(String(config.uri_allow_list || '').split(',').map(value=>value.trim()).filter(Boolean));
  const missingCallbacks=[site+'/auth/callback',site+'/auth/callback?recovery=1'].filter(url=>!redirects.has(url));
  if (missingCallbacks.length) {
    for (const url of missingCallbacks) redirects.add(url);
    await api('/config/auth','PATCH',{uri_allow_list:[...redirects].join(',')});
    console.log('ReactMentor callback URLs added; existing site URL and other app redirects preserved.');
  } else console.log('ReactMentor callback URLs already configured.');
  console.log('Google provider configured: '+Boolean(config.external_google_enabled && config.external_google_client_id));
  console.log('Public project URL: https://'+ref+'.supabase.co');
  console.log('Use the project publishable/anon key in Vercel NEXT_PUBLIC_SUPABASE_ANON_KEY; never use service_role.');
} catch(error) {console.error(error instanceof Error ? error.message:'Setup failed.');process.exitCode=1;}
