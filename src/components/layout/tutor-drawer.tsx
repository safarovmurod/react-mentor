'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { X, Send, Sparkles, Layers } from 'lucide-react';
import Link from 'next/link';
import { useLearningStore } from '@/stores/learning-store';
import { isDeepFollowUp, type TutorSource } from '@/lib/tutor/shared';
import { useAccount } from '@/components/account/account-provider';
import { LEARNING_UI_COPY, tutorErrorKey, type TutorErrorKey } from '@/lib/learning-ui-copy';

interface ChatMsg {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  mode?: 'local' | 'online';
  tokens?: number;
  error?: boolean;
  errorKey?: TutorErrorKey;
  source?: TutorSource;
  followUp?: boolean;
  subject?: string;
}

class TutorRequestError extends Error {
  constructor(readonly key: TutorErrorKey) { super(key); }
}

export function TutorDrawer() {
  const account=useAccount();
  const open = useAppStore(state => state.tutorDrawerOpen);
  const setOpen = useAppStore(state => state.setTutorDrawerOpen);
  const selectedQuestion = useAppStore(state => state.tutorQuestion);
  const setSelectedQuestion = useAppStore(state => state.setTutorQuestion);
  const language = useLearningStore(state => state.contentLanguage);
  const uiLanguage = useLearningStore(state => state.language);
  const ui = LEARNING_UI_COPY[uiLanguage];
  const prompts = LEARNING_UI_COPY[language];
  const courseId = useLearningStore(state => state.selectedCourse);
  const [messages, setMessages] = useState<ChatMsg[]>([{
    id: 'welcome', sender: 'assistant',
    text: '',
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const sending = useRef(false);
  const dialog = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageList = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && selectedQuestion) setInput(selectedQuestion.text);
  }, [open, selectedQuestion]);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
      if (event.key !== 'Tab') return;
      const controls = dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]), textarea:not([disabled]), a[href]');
      if (!controls?.length) return;
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      previousFocus?.focus();
    };
  }, [open, setOpen]);

  useEffect(() => {
    if (messageList.current) messageList.current.scrollTop = messageList.current.scrollHeight;
  }, [messages, loading, open]);

  async function send(deep = false) {
    if (sending.current || (!deep && !input.trim())) return;
    const followUp = deep || isDeepFollowUp(input);
    const lastQuestion = [...messages].reverse().find(message => message.sender === 'user' && !message.followUp);
    const lastReply = [...messages].reverse().find(message => message.sender === 'assistant' && message.subject === lastQuestion?.text && !message.error);
    if (deep && !lastQuestion && !selectedQuestion) return;
    sending.current = true;
    setLoading(true);
    const text = deep ? prompts.promptDeep : input.trim();
    const query = followUp ? selectedQuestion?.text || lastQuestion?.text || text : text;
    const questionId = followUp ? selectedQuestion?.id || lastReply?.source?.questionId
      : selectedQuestion?.text === text ? selectedQuestion.id : undefined;
    const history = messages.filter(message => message.id !== 'welcome' && !message.error)
      .slice(-4).map(message => ({
        role: message.sender, content: message.text.slice(0, 600),
      }));
    setMessages(previous => [...previous, { id: crypto.randomUUID(), sender: 'user', text: selectedQuestion && deep ? selectedQuestion.text : text, followUp: followUp && !selectedQuestion }]);
    setSelectedQuestion(null);
    if (!deep) setInput('');
    try {
      const topicId = window.location.pathname.match(/^\/lesson\/([^/]+)$/)?.[1];
      const session=await getSupabaseBrowserClient()?.auth.getSession();
      const token=session?.data.session?.access_token;
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',...(token ? {Authorization:'Bearer '+token}:{}) },
        body: JSON.stringify({ action: 'ask', courseId, userText: query, isDeep: followUp, history, topicId, questionId, language }),
        signal: AbortSignal.timeout(50000),
      });
      const data = await response.json();
      if (!response.ok) throw new TutorRequestError(tutorErrorKey(response.status, data.error));
      if (typeof data.reply !== 'string' || !data.reply.trim()) throw new TutorRequestError('tutorEmpty');
      setMessages(previous => [...previous, {
        id: crypto.randomUUID(), sender: 'assistant', text: data.reply,
        mode: data.mode === 'online' ? 'online' : 'local',
        source: data.source,
        subject: query,
        tokens: Number.isSafeInteger(data.usage?.totalTokens) && data.usage.totalTokens >= 0 ? data.usage.totalTokens : undefined,
      }]);
    } catch (caught) {
      setMessages(previous => [...previous, {
        id: crypto.randomUUID(), sender: 'assistant', error: true,
        text: '', errorKey: caught instanceof TutorRequestError ? caught.key : 'tutorConnection',
      }]);
    } finally {
      sending.current = false;
      setLoading(false);
    }
  }

  if (!open) return null;
  const tokens = messages.reduce((sum, message) => sum + (message.tokens || 0), 0);
  return <div className="tutor-backdrop" onClick={() => setOpen(false)}>
    <aside className="tutor-panel" role="dialog" aria-modal="true" aria-labelledby="tutor-title" ref={dialog} onClick={event => event.stopPropagation()}>
      <div className="tutor-heading">
        <div><h2 id="tutor-title"><Sparkles size={19}/> AI Tutor</h2><p>{ui.tutorIntro}</p></div>
        <button className="icon-button" onClick={() => setOpen(false)} aria-label={ui.tutorClose}><X size={20}/></button>
      </div>
      <div className="tutor-messages" aria-live="polite" aria-relevant="additions" ref={messageList}>
        {messages.map(message => <div key={message.id} className={'tutor-message ' + message.sender + (message.error ? ' tutor-error' : '')}>
          {message.mode && <span className="tutor-source">{message.mode === 'online' ? 'AI · AnyModel' : message.source ? ui.tutorMaterial : ui.tutorLocal}{message.tokens !== undefined ? ' · ' + message.tokens + ' ' + ui.tokens : ''}</span>}
          <p>{message.id === 'welcome' ? ui.tutorWelcome : message.errorKey ? ui[message.errorKey] : message.text}</p>
          {message.source && <Link className="tutor-source" href={message.source.href || '/lesson/' + encodeURIComponent(message.source.topicId)} onClick={()=>setOpen(false)}>{ui.source} {message.source.title} · {message.source.sourceId}</Link>}
        </div>)}
        {loading && <p role="status" className="tutor-loading">{ui.tutorLoading}</p>}
      </div>
      <div className="tutor-composer">
        {!account.user && <div className="tutor-signin"><p>{ui.tutorSignIn}</p><Link className="button subtle" href="/login" onClick={()=>setOpen(false)}>{ui.tutorLogin}</Link></div>}
        <div className="tutor-shortcuts">
          <button className="button subtle" disabled={loading} onClick={() => setInput(courseId==='react'?prompts.promptReact:prompts.promptTopic)}>{courseId==='react'?'useState?':ui.tutorTopic}</button>
          <button className="button subtle" disabled={loading || (!selectedQuestion && !messages.some(message => message.sender === 'user' && !message.followUp))} onClick={() => send(true)}><Layers size={15}/>{ui.tutorDeep}</button>
        </div>
        <form onSubmit={event => { event.preventDefault(); void send(); }}>
          <label className="sr-only" htmlFor="tutor-input">{ui.tutorQuestion}</label>
          <textarea id="tutor-input" ref={inputRef} value={input} maxLength={1500} rows={3} disabled={loading}
            onChange={event => setInput(event.target.value)} placeholder={ui.tutorPlaceholder}/>
          <button className="button primary" type="submit" disabled={loading || !input.trim()} aria-label={ui.tutorSend}><Send size={17}/>{ui.tutorSend}</button>
        </form>
        <p className="tutor-footnote">{tokens > 0 ? ui.tutorSpent + ' ' + tokens + ' ' + ui.tokens + '. ' : ''}{ui.tutorCaution}</p>
      </div>
    </aside>
  </div>;
}
