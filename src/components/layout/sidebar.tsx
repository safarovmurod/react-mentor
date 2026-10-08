'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CalendarDays, BookOpen, BookOpenCheck, Code2, ListChecks, NotebookPen, Settings2, X, ArrowUpRight, Layers } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import learningIndex from '@/content/learning-index.json';
const LEARNING_TOPICS=learningIndex.topics;
import { useAccount } from '@/components/account/account-provider';
import { AccountAvatar } from '@/components/account/account-avatar';
import { courseName } from '@/content/courses/catalog';
const items = [
  {key:'plan',href:'/plan',icon:BookOpen},{key:'home',href:'/home',icon:CalendarDays},{key:'practice',href:'/practice',icon:Code2},
  {key:'tests',href:'/tests',icon:ListChecks},{key:'notes',href:'/notes',icon:NotebookPen},{key:'answers',href:'/answers',icon:BookOpenCheck},
] as const;

export function Sidebar() {
  const account=useAccount();
  const pathname=usePathname();
  const open=useAppStore(state=>state.sidebarOpen);
  const setOpen=useAppStore(state=>state.setSidebarOpen);
  const [mobile,setMobile]=useState(false);
  const drawer=useRef<HTMLElement>(null);
  const closeButton=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    const media=window.matchMedia('(max-width: 860px)');
    const update=()=>{setMobile(media.matches);if (!media.matches) setOpen(false);};
    update();media.addEventListener('change',update);
    return ()=>media.removeEventListener('change',update);
  },[setOpen]);
  useEffect(()=>{
    if (!open || !mobile) return;
    const previousFocus=document.activeElement instanceof HTMLElement ? document.activeElement:null;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    closeButton.current?.focus();
    function onKey(event:KeyboardEvent) {
      if (event.key==='Escape') {event.preventDefault();setOpen(false);return;}
      if (event.key!=='Tab') return;
      const controls=drawer.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])');
      if (!controls?.length) return;
      const first=controls[0],last=controls[controls.length-1];
      if (event.shiftKey && document.activeElement===first) {event.preventDefault();last.focus();}
      else if (!event.shiftKey && document.activeElement===last) {event.preventDefault();first.focus();}
    }
    document.addEventListener('keydown',onKey);
    return ()=>{document.body.style.overflow=previousOverflow;document.removeEventListener('keydown',onKey);if (previousFocus?.isConnected) previousFocus.focus();};
  },[open,mobile,setOpen]);
  const language=useLearningStore(state=>state.language);
  const month=useLearningStore(state=>state.activeMonth);
  const completed=useLearningStore(state=>state.completedTopics);
  const course=useLearningStore(state=>state.selectedCourse);
  const courseCount=useLearningStore(state=>course==='react'?0:course==='css'?state.courses.css?.completedTopics.length||0:state.courses[course]?.completedTopics.filter(id=>id.startsWith(course+'-day-')&&state.courses[course]?.completedPractice.includes(id)).length || 0);
  const courseTotal=course==='css'?5:30;
  const copy=COPY[language];
  const total=LEARNING_TOPICS.filter(topic=>topic.month===month).length;
  const count=LEARNING_TOPICS.filter(topic=>topic.month===month&&completed.includes(topic.id)).length;
  return <>{open&&<button className="sidebar-overlay" aria-label={language==='ru'?'Закрыть меню':'Close menu'} onClick={()=>setOpen(false)}/>}
    <aside id="learning-sidebar" ref={drawer} className={'sidebar '+(open?'is-open':'')} role={mobile&&open?'dialog':undefined} aria-modal={mobile&&open?true:undefined} aria-label={language==='ru'?'Навигация по курсу':'Course navigation'} inert={mobile&&!open}><div className="sidebar-top"><span className="eyebrow">{language==='ru'?'ОБУЧЕНИЕ':'WORKSPACE'}</span><button ref={closeButton} className="icon-button mobile-menu" onClick={()=>setOpen(false)} aria-label={language==='ru'?'Закрыть меню':'Close menu'}><X size={20}/></button></div>
      <Link href="/courses" aria-current={pathname==='/courses'?'page':undefined} className={'nav-item course-switch '+(pathname==='/courses'?'active':'')} onClick={()=>setOpen(false)}><Layers size={18}/><span>{language==='ru'?'Выбрать курс':'Choose course'}<small>{courseName(course)}</small></span></Link>
      <nav>{items.map(item=>{const Icon=item.icon;const href=course==='react'||item.key==='notes'?item.href:`/courses/${course}${item.href}`;const active=pathname===href || (course==='react'&&item.href==='/answers'&&pathname.startsWith('/answers/')) || (course==='react'&&item.href==='/plan'&&(pathname.startsWith('/lesson/')||pathname.startsWith('/plan/')));return <Link key={item.href} href={href} aria-current={active?'page':undefined} className={'nav-item '+(active?'active':'')} onClick={()=>setOpen(false)}><Icon size={18}/><span>{item.key==='tests'?(language==='ru'?'Тесты и интервью':'Tests & interview'):item.key==='answers'?(language==='ru'?'Ответы и интервью':'Answers & interview'):copy[item.key]}</span>{active&&<span className="nav-dot"/>}</Link>;})}
      </nav>
      <div className="sidebar-bottom"><div className="sidebar-progress"><div className="between"><span>{course==='react'?copy.month+' '+month:courseName(course)}</span><ArrowUpRight size={16}/></div><strong>{course==='react'?count:courseCount}<span>{' / '+(course==='react'?total:courseTotal)}</span></strong><div className="progress-track"><span style={{width:(course==='react'&&total?count/total*100:courseCount/courseTotal*100)+'%'}}/></div></div><Link href="/settings" aria-current={pathname==='/settings'?'page':undefined} className={'nav-item '+(pathname==='/settings'?'active':'')} onClick={()=>setOpen(false)}><Settings2 size={18}/>{copy.settings}</Link><Link href="/settings" className="profile-row" onClick={()=>setOpen(false)}><AccountAvatar/><div><strong>{account.profile?.displayName || (language==='ru' ? 'Гость':'Guest')}</strong><span>{account.user ? (language==='ru' ? 'Личный аккаунт':'Personal account'):(language==='ru' ? 'В этом браузере':'In this browser')}</span></div></Link></div>
    </aside></>;
}
