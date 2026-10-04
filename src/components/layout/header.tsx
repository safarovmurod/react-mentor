'use client';
import Link from 'next/link';
import { Atom, Menu, Settings2, Clock3, Sparkles } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import { AccountAvatar } from '@/components/account/account-avatar';

export function Header() {
  const toggleSidebar = useAppStore(state=>state.toggleSidebar);
  const setTutorDrawerOpen = useAppStore(state=>state.setTutorDrawerOpen);
  const seconds = useAppStore(state=>state.activeSecondsToday);
  const language = useLearningStore(state=>state.language);
  const copy = COPY[language];
  return <header className="app-header">
    <div className="header-brand"><button className="icon-button mobile-menu" onClick={toggleSidebar} aria-label={language==='ru'?'Открыть меню':'Open menu'}><Menu size={21}/></button>
      <Link href="/home" className="brand"><span className="brand-icon"><Atom size={23}/></span><span>React<span className="brand-light">Mentor</span></span></Link>
    </div>
    <span className="header-caption">{copy.course}</span>
    <div className="header-tools"><button className="icon-button" onClick={()=>setTutorDrawerOpen(true)} aria-label="AI Tutor"><Sparkles size={19}/></button><span className="active-time"><Clock3 size={16}/>{Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')}</span><Link href="/settings" className="language-link">{language.toUpperCase()}</Link><Link href="/settings" className="icon-button" aria-label={copy.settings}><Settings2 size={19}/></Link><Link href="/settings" aria-label="Профиль"><AccountAvatar/></Link></div>
  </header>;
}
