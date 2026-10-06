'use client';

import Link from 'next/link';
import { useDeferredValue, useState } from 'react';
import { ArrowLeft, ExternalLink, FileText } from 'lucide-react';
import { useLearningStore } from '@/stores/learning-store';

export type TelegramIndex = {
  channel:string; collectedAt:string;
  summary:{messageWidgets:number;attachmentReferences:number;attachmentGroups:number;possibleReposts:number;photos:number;videoWidgets:number;originalAttachmentsRead:number};
  materials:{id:string;title:string;kind:string;sizeLabel:string;suggestedTopic:string;status:string;urls:string[]}[];
  links:{url:string;status:string}[];
};

export function TelegramMaterials({index}:{index:TelegramIndex}) {
  const language=useLearningStore(state=>state.language);
  const t=(ru:string,tg:string,en:string)=>({ru,tg,en})[language];
  const [query,setQuery]=useState(''), [kind,setKind]=useState('all');
  const deferred=useDeferredValue(query.trim().toLocaleLowerCase());
  const rows=index.materials.filter(item=>(kind==='all'||item.kind===kind)&&item.title.toLocaleLowerCase().includes(deferred));
  return <section className="page telegram-materials">
    <Link href="/courses" className="back-link"><ArrowLeft size={16}/>{t('Все курсы','Ҳамаи курсҳо','All courses')}</Link>
    <div className="page-heading"><div><span className="eyebrow">TELEGRAM · {index.collectedAt}</span><h1>{t('Материалы канала','Маводи канал','Channel materials')}</h1><p>{t('Список доступных в публичной истории материалов и ссылки на оригиналы.','Рӯйхати мавод аз таърихи оммавӣ ва пайванд ба аслҳо.','Materials visible in the public history, with links to the originals.')}</p></div></div>
    <div className="panel course-route"><FileText size={24}/><div><strong>{index.summary.messageWidgets} {t('публичных сообщений','паёми оммавӣ','public message widgets')} · {index.summary.attachmentReferences} {t('вложений','замима','attachments')}</strong><p>{t('Названия файлов получены. Сами PDF, архивы, изображения и видео ещё не прочитаны. Откройте оригинал в Telegram; готовые разборы текста сообщений уже находятся в курсах.','Номи файлҳо гирифта шуд. Худи PDF, архив, сурату видео ҳоло хонда нашудаанд. Аслро дар Telegram кушоед; шарҳи матнҳои хондашуда дар курсҳо ҳаст.','File names were collected. Original PDFs, archives, images and videos have not been read. Open the original in Telegram; reviewed message explanations are available in the courses.')}</p><span>{t('Совпавшие название и размер объединены в одну строку. Это возможные повторы: равенство содержимого ещё не проверено.','Ному ҳаҷми якхела дар як сатр ҷамъ шудаанд. Ин такрори эҳтимолӣ аст: мундариҷа ҳоло муқоиса нашудааст.','Matching names and sizes share a row. They may be reposts; file contents have not been compared.')}</span></div></div>
    <div className="course-filters"><label>{t('Поиск по названию','Ҷустуҷӯ аз рӯи ном','Search by name')}<input value={query} onChange={event=>setQuery(event.target.value)}/></label><label>{t('Тип материала','Навъи мавод','Material type')}<select value={kind} onChange={event=>setKind(event.target.value)}><option value="all">{t('Все','Ҳама','All')}</option>{['pdf','zip','html','md','png','photo','video','mkv','mov','mp4'].map(value=><option key={value} value={value}>{value.toUpperCase()}</option>)}</select></label></div>
    <p className="account-hint">{rows.length} {t('материалов в списке','мавод дар рӯйхат','items listed')}</p>
    <div className="telegram-material-grid">{rows.map(item=><article className="panel telegram-material" key={item.id}>
      <div className="between"><span className="badge">{item.kind.toUpperCase()}</span><small>{item.sizeLabel}</small></div>
      <h2>{item.title}</h2><p>{t('Оригинал ещё не изучен','Асл ҳоло хонда нашудааст','Original not reviewed')}</p>
      <a href={item.urls[0]} target="_blank" rel="noreferrer" className="text-link">{t('Открыть в Telegram','Дар Telegram кушодан','Open in Telegram')}<ExternalLink size={15}/></a>
      {item.urls.length>1&&<details><summary>{item.urls.length} {t('публикаций с таким названием и размером','паём бо ин ному ҳаҷм','posts with this name and size')}</summary>{item.urls.map(url=><a href={url} key={url} target="_blank" rel="noreferrer">{url.split('/').at(-1)?.split('?')[0]}</a>)}</details>}
    </article>)}</div>
    {!rows.length&&<p role="status">{t('Материалов с таким названием нет.','Бо ин ном мавод нест.','No matching materials.')}</p>}
    <section className="panel course-files"><h2>{t('Учебные ссылки из сообщений','Пайвандҳои таълимӣ аз паёмҳо','Learning links from messages')}</h2><p>{t('Слайды Canva, уроки Stepik и видео пока недоступны для анализа из этой среды.','Слайдҳои Canva, дарсҳои Stepik ва видео аз ин муҳит ҳоло барои таҳлил дастрас нестанд.','Canva slides, Stepik lessons and videos cannot yet be analyzed from this environment.')}</p>{index.links.map(link=><a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="text-link">{new URL(link.url).hostname} · {new URL(link.url).pathname}<ExternalLink size={14}/></a>)}</section>
  </section>;
}
