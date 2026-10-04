'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, BookOpen, BookOpenCheck, Code2, MessagesSquare, ListChecks, RotateCcw, CircleAlert, NotebookPen, Settings2, X, ArrowUpRight } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import { LEARNING_TOPICS } from '@/content/course';
import { useAccount } from '@/components/account/account-provider';
import { AccountAvatar } from '@/components/account/account-avatar';
const items = [
  {key:'home',href:'/home',icon:CalendarDays},{key:'plan',href:'/plan',icon:BookOpen},{key:'practice',href:'/practice',icon:Code2},
  {key:'tests',href:'/tests',icon:ListChecks},{key:'interview',href:'/interview',icon:MessagesSquare},{key:'revision',href:'/revision',icon:RotateCcw},
  {key:'weak',href:'/weak-topics',icon:CircleAlert},{key:'notes',href:'/notes',icon:NotebookPen},{key:'answers',href:'/answers',icon:BookOpenCheck},
] as const;

export function Sidebar() {
  const account=useAccount();
  const pathname=usePathname();
  const open=useAppStore(state=>state.sidebarOpen);
  const setOpen=useAppStore(state=>state.setSidebarOpen);
  const language=useLearningStore(state=>state.language);
  const month=useLearningStore(state=>state.activeMonth);
  const completed=useLearningStore(state=>state.completedTopics);
  const copy=COPY[language];
  const total=LEARNING_TOPICS.filter(topic=>topic.month===month).length;
  const count=LEARNING_TOPICS.filter(topic=>topic.month===month&&completed.includes(topic.id)).length;
  return <>{open&&<button className="sidebar-overlay" aria-label={language==='ru'?'Закрыть меню':'Close menu'} onClick={()=>setOpen(false)}/>}
    <aside className={'sidebar '+(open?'is-open':'')}><div className="sidebar-top"><span className="eyebrow">{language==='ru'?'ОБУЧЕНИЕ':'WORKSPACE'}</span><button className="icon-button mobile-menu" onClick={()=>setOpen(false)} aria-label={language==='ru'?'Закрыть меню':'Close menu'}><X size={18}/></button></div>
      <nav>{items.map(item=>{const Icon=item.icon;const active=pathname===item.href || (item.href==='/answers'&&pathname.startsWith('/answers/')) || (item.href==='/plan'&&(pathname.startsWith('/lesson/')||pathname.startsWith('/plan/')));return <Link key={item.href} href={item.href} aria-current={active?'page':undefined} className={'nav-item '+(active?'active':'')} onClick={()=>setOpen(false)}><Icon size={18}/><span>{copy[item.key]}</span>{active&&<span className="nav-dot"/>}</Link>;})}</nav>
      <div className="sidebar-bottom"><div className="sidebar-progress"><div className="between"><span>{copy.month} {month}</span><ArrowUpRight size={16}/></div><strong>{count}<span> / {total}</span></strong><div className="progress-track"><span style={{width:(total?count/total*100:0)+'%'}}/></div></div><Link href="/settings" className={'nav-item '+(pathname==='/settings'?'active':'')} onClick={()=>setOpen(false)}><Settings2 size={18}/>{copy.settings}</Link><Link href="/settings" className="profile-row" onClick={()=>setOpen(false)}><AccountAvatar/><div><strong>{account.profile?.displayName || (language==='ru' ? 'Гость':'Guest')}</strong><span>{account.user ? (language==='ru' ? 'Личный аккаунт':'Personal account'):(language==='ru' ? 'В этом браузере':'In this browser')}</span></div></Link></div>
    </aside></>;
}
