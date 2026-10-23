'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAccount } from '@/components/account/account-provider';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useLearningStore } from '@/stores/learning-store';
import { MEMBERSHIP_COPY, type MembershipCopy } from '@/lib/billing/copy';
import styles from './membership.module.css';

type Message={id:string;author_id:string;author_name:string;body:string;created_at:string};
type ErrorKey='login'|'membership'|'service'|'rate'|'invalid'|'error';
function errorKey(status:number):ErrorKey{return status===401?'login':status===403?'membership':status===429?'rate':status===400||status===413?'invalid':'service';}
async function request(userId:string,body?:{kind:string;text?:string}) {
 const client=getSupabaseBrowserClient();
 if(!client)throw new Error('login');
 const {data,error}=await client.auth.getSession();
 if(error||!data.session||data.session.user.id!==userId)throw new Error('login');
 const response=await fetch('/api/community',{method:body?'POST':'GET',headers:{Authorization:`Bearer ${data.session.access_token}`,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),cache:'no-store',signal:AbortSignal.timeout(12_000)});
 if(!response.ok)throw new Error(errorKey(response.status));
 return response.json();
}
function failure(cause:unknown):ErrorKey{
 const key=cause instanceof Error?cause.message:'';
 return ['login','membership','service','rate','invalid'].includes(key)?key as ErrorKey:'service';
}
export function CommunityScreen(){
 const {user}=useAccount();
 return <CommunitySession key={user?.id || 'guest'}/>;
}
function CommunitySession(){
 const {user}=useAccount();const locale=useLearningStore(state=>state.language);const copy:MembershipCopy=MEMBERSHIP_COPY[locale];
 const [messages,setMessages]=useState<Message[]>([]),[online,setOnline]=useState(0),[text,setText]=useState('');
 const [state,setState]=useState<'loading'|'ready'|ErrorKey>('loading'),[sending,setSending]=useState(false),[notice,setNotice]=useState<ErrorKey|'sent'|''>('');
 const [attempt,setAttempt]=useState(0);
 useEffect(()=>{
  let active=true;let busy=false;let connected=false;let lastHeartbeat=0;
  const uid=user?.id;
  async function refresh(){
   if(!uid){if(active)setState('login');return;}
   if(busy||document.hidden)return;busy=true;
   try{
    if(Date.now()-lastHeartbeat>30_000){await request(uid,{kind:'heartbeat'});lastHeartbeat=Date.now();}
    const result=await request(uid);
    if(!active)return;
    setMessages(result.messages);setOnline(result.online);setState('ready');connected=true;
   }catch(cause){if(active)setState(failure(cause));}
   finally{busy=false;}
  }
  void refresh();const timer=setInterval(()=>{void refresh();},15_000);
  const onVisible=()=>{if(!document.hidden)void refresh();};document.addEventListener('visibilitychange',onVisible);
  return()=>{active=false;clearInterval(timer);document.removeEventListener('visibilitychange',onVisible);if(uid&&connected)void request(uid,{kind:'leave'}).catch(()=>undefined);};
 },[user?.id,attempt]);
 async function send(event:React.FormEvent){
  event.preventDefault();if(!user||sending)return;
  const value=text.trim();if(!value||value.length>2000){setNotice('invalid');return;}
  setSending(true);setNotice('');
  try{await request(user.id,{kind:'message',text:value});setText('');setNotice('sent');const result=await request(user.id);setMessages(result.messages);setOnline(result.online);}
  catch(cause){setNotice(failure(cause));}finally{setSending(false);}
 }
 return <section><header className={styles.hero}><h1>{copy.community}</h1><p>{copy.communityIntro}</p></header><div className={styles.panel}>
 {state==='loading'?<p role="status">{copy.loading}</p>:state!=='ready'?<><p role="status">{copy[state]}</p><div className={styles.links}>{state==='login'?<Link href="/login" className={styles.button}>{copy.signin}</Link>:<button className={styles.button} onClick={()=>setAttempt(n=>n+1)}>{copy.retry}</button>}<Link href="/plans" className={styles.button}>{copy.plans}</Link></div></>:<><div className={styles.toolbar}><strong>{copy.community}</strong><span className={styles.presence}>{online} {copy.online}</span></div>{messages.length===0?<p>{copy.empty}</p>:<ol className={styles.messages} aria-label={copy.community}>{messages.map(message=><li key={message.id} className={styles.bubble}><div className={styles.meta}><strong>{message.author_name}</strong><time dateTime={message.created_at}>{new Intl.DateTimeFormat(locale,{hour:'2-digit',minute:'2-digit',month:'short',day:'numeric'}).format(new Date(message.created_at))}</time></div><p>{message.body}</p></li>)}</ol>}<form className={styles.form} onSubmit={send}><label htmlFor="community-message">{copy.message}</label><textarea id="community-message" className={styles.input} maxLength={2000} value={text} onChange={event=>setText(event.target.value)} required/><div className={styles.actions}><span>{text.length}/2000</span><button className={styles.button} disabled={sending||!text.trim()}>{sending?copy.sending:copy.send}</button></div></form></>}
 <p className={styles.feedback} role="status">{notice?copy[notice]:''}</p></div></section>;
}
