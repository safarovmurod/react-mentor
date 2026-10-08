'use client';
import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { CheckCircle2, Code2, Lightbulb } from 'lucide-react';
import { LabCodeBlock, copyText } from './lab-code-block';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
interface SourceBlock {path:string;code:string;place?:string;practiceCode?:string;origin:string;}
interface SourceLesson {title:string;intro:string;blocks:SourceBlock[];memory?:string;steps?:{title:string;text:{tg:string;ru:string};code?:string}[];concepts?:{name:string;origin:string;why:{tg:string;ru:string};missing:{tg:string;ru:string}}[];}
export interface LocalGlobalData {operations:{id:string;title:string}[];local:Record<string,Record<string,SourceLesson>>;global:Record<string,Record<string,SourceLesson>>;}
const managers=[['redux','Redux Toolkit'],['zustand','Zustand'],['jotai','Jotai']] as const;
const hints:Record<string,string>={setup:'Создайте store/atom и подключите к компоненту.',get:'Загрузите данные; покажите loading/error/empty.',post:'Добавьте элемент: Local — новый массив; Global — POST и обновление списка.',put:'Найдите элемент по id; Local — map, Global — PUT и обновление.',delete:'Удалите по id: Local — filter, Global — DELETE.',info:'Получите id из URL и найдите нужную запись; проверьте F5.',search:'Нормализуйте строку и используйте filter/includes.',pagination:'slice((page - 1) * pageSize, page * pageSize); сбросьте page после фильтра.',checkbox:'Измените только isCompleted выбранного элемента; остальные поля сохраните.','add-img':'Local — временный URL файла; Global — FormData и загрузка.','delete-img':'Удалите выбранное изображение; освободите временный object URL.'};
export function StateApiLab({data}:{data:LocalGlobalData}) {
 const stored=useLearningStore(state=>state.drafts['rzj-ui']);
 const saveUi=useLearningStore(state=>state.saveDraft);
 const [copyStatus,setCopyStatus]=useState('');
 const fragment=useSyncExternalStore(subscribeLabHash,readLabHash,()=> '');
 const ui=readLabUi(stored,data);
 const [urlScope,urlManager,urlOp]=fragment.split('/');
 if((urlScope==='local'||urlScope==='global')&&managers.some(([id])=>id===urlManager)&&data.operations.some(item=>item.id===urlOp)){ui.scope=urlScope;ui.manager=urlManager;ui.op=urlOp;}
 const {scope,manager,op,practice}=ui;
 const updateUi=(patch:Partial<LabUi>)=>{setCopyStatus('');saveUi('rzj-ui',JSON.stringify({...ui,...patch}));if(window.location.hash){window.history.replaceState(null,'',window.location.pathname+window.location.search);window.dispatchEvent(new HashChangeEvent('hashchange'));}};
 const setScope=(value:'local'|'global')=>updateUi({scope:value});
 const setManager=(value:string)=>updateUi({manager:value});
 const setOp=(value:string)=>updateUi({op:value});
 const setPractice=(value:boolean)=>updateUi({practice:value});
 const fileKey=`${scope}-${manager}-${op}`;
 const hidden=ui.hidden[fileKey] || [];
 const hideFile=(path:string)=>updateUi({hidden:{...ui.hidden,[fileKey]:[...hidden,path]}});

 const copy=COPY[useLearningStore(state=>state.language)];
 const contentLanguage=useLearningStore(state=>state.contentLanguage);
 const localText=(value:{tg:string;ru:string})=>contentLanguage==='tg'?value.tg:value.ru;
 const lesson=data[scope][manager][op];
 return <><div className="page-heading"><div><span className="eyebrow">React · Local / Global</span><h1>R.Z.J/PACTICE</h1><p>Одна операция, три библиотеки. Сначала пойми связь файлов, затем напиши сам.</p></div><label className={'lab-practice-toggle '+(practice?'is-on':'')}><input type="checkbox" checked={practice} onChange={e=>setPractice(e.target.checked)}/><Code2 size={16}/>Практика</label></div>
 <div className="lab-compare"><section className="panel lab-compare-card"><h2>Local</h2><p>Данные меняются в памяти приложения. Redux, Zustand и Jotai могут хранить локальный state. Это само по себе не сохраняет данные после перезагрузки.</p></section><section className="panel lab-compare-card"><h2>Global + API</h2><p>Общий state доступен компонентам; сервер хранит данные. Global не означает «автоматически в облаке»: запросы, ошибки и обновление списка пишутся отдельно.</p></section></div>
 <div className="tabs" role="tablist" aria-label="Local или Global">{(['local','global'] as const).map(s=><button role="tab" aria-selected={scope===s} key={s} onClick={()=>setScope(s)}>{s==='local'?'Local':'Global'}</button>)}</div>
 <div className="tabs" role="tablist" aria-label="State manager">{managers.map(([id,label])=><button role="tab" key={id} aria-selected={manager===id} onClick={()=>setManager(id)}>{label}</button>)}</div>
 <div className="tabs lab-operations" role="tablist" aria-label="Операции">{data.operations.map(operation=><button role="tab" key={operation.id} aria-selected={op===operation.id} onClick={()=>setOp(operation.id)}>{operation.title}</button>)}</div>
 <article className="panel lab-lesson" key={`${scope}-${manager}-${op}`}><div className="between lab-lesson-head"><h2>{lesson.title}</h2><span className="badge">{scope==='local'?'Local':'Global'} · {managers.find(([id])=>id===manager)?.[1]}</span></div><p lang="tg">{lesson.intro}</p><aside className="lesson-connections"><h3>Путь действия</h3><p>Кнопка/форма → handler → store/atom → {scope==='global'?'HTTP запрос → сервер → загрузка актуального списка':'новое состояние'} → компонент → отображение.</p><p><Lightbulb size={15}/> {hints[op]}</p></aside>
 {lesson.steps&&<details><summary>Шаги и связь с кодом</summary><ol className="flow-steps">{lesson.steps.map((step,index)=><li key={index}><span>{index+1}</span><div><strong>{step.title}</strong><p>{localText(step.text)}</p>{step.code&&<code>{step.code}</code>}</div></li>)}</ol></details>}
 <div className="lab-code-heading"><h3>{practice?'Практика — напиши сам':'Полный код'}</h3></div>
 <div className="button-row"><button className="button subtle" onClick={async()=>setCopyStatus(await copyText(lesson.blocks.filter(block=>!hidden.includes(block.path)).map(block=>'// '+block.path+'\n'+(practice?(useLearningStore.getState().drafts[`rzj-${scope}-${manager}-${op}-${lesson.blocks.indexOf(block)}`] || '// '+hints[op]):block.code)).join('\n\n'))?'Код скопирован':'Выделите код и скопируйте вручную')}>Скопировать все файлы</button>{hidden.length>0&&<button className="button subtle" onClick={()=>updateUi({hidden:{...ui.hidden,[fileKey]:[]}})}>Показать все файлы ({hidden.length})</button>}{copyStatus&&<span role="status">{copyStatus}</span>}</div>
 {lesson.blocks.filter(block=>!hidden.includes(block.path)).map((block,index)=><section className="lab-block" key={block.path+index}><div className="between"><p className="lab-block-note">{block.place}</p><button className="text-button" onClick={()=>hideFile(block.path)}>Скрыть файл</button></div>{practice?<><LabExercise id={`rzj-${scope}-${manager}-${op}-${lesson.blocks.indexOf(block)}`} path={block.path}/><LabCodeBlock path={block.path} lang={block.path.endsWith('.tsx')?'tsx':'ts'} code={`// ${block.path}\n// Шаг 1: ${hints[op]}\n// Напишите реализацию, затем сравните с решением.`} copyLabel={copy.copy} copiedLabel={copy.copied}/><details className="code-disclosure"><summary>Сравнить с решением</summary><LabCodeBlock path={block.path} lang="tsx" code={block.code} copyLabel={copy.copy} copiedLabel={copy.copied}/></details></>:<LabCodeBlock path={block.path} lang={block.path.endsWith('.tsx')?'tsx':'ts'} code={block.code} copyLabel={copy.copy} copiedLabel={copy.copied}/>}</section>)}
 <p className="lab-result"><CheckCircle2 size={16}/>Проверьте действие, отсутствие нужного id, пустой список и сохранение других полей.</p>{lesson.memory&&<p className="callout">{lesson.memory}</p>}
 {lesson.concepts&&<details><summary>Почему работает каждая часть</summary><div className="concept-grid">{lesson.concepts.map((concept,index)=><section key={index}><h3>{concept.name}</h3><p>{localText(concept.why)}</p><p>{localText(concept.missing)}</p></section>)}</div></details>}
 <details><summary>Как выбрать библиотеку и хранение</summary><p>useState — состояние одного компонента; Context — общий доступ через Provider; Redux Toolkit — actions/reducers; Zustand — store и selectors; Jotai — атомы. TanStack Query отвечает за серверный кэш, загрузку, ошибки и invalidation. Они решают разные задачи; не дублируйте один источник данных во всех хранилищах.</p><p>Смена Local/Global или библиотеки сохраняет выбранную операцию. Примеры из HTML показаны как учебный код и не отправляют запросы внешнему API.</p><Link href="/practice?month=2">Практика React</Link></details>
 <div className="course-sources"><a href="https://redux-toolkit.js.org/tutorials/quick-start" target="_blank" rel="noreferrer">Redux Toolkit</a><a href="https://zustand.docs.pmnd.rs/getting-started/introduction" target="_blank" rel="noreferrer">Zustand</a><a href="https://jotai.org/docs" target="_blank" rel="noreferrer">Jotai</a><span>Источник примеров: Practice-Local-Global.html</span></div></article></>;
}

function LabExercise({id,path}:{id:string;path:string}) {
 const code=useLearningStore(state=>state.drafts[id] || '');
 const saveDraft=useLearningStore(state=>state.saveDraft);
 return <><label htmlFor={id}>Ваш код · {path}</label><textarea id={id} className="practice-editor" rows={10} spellCheck={false} value={code} onChange={event=>saveDraft(id,event.target.value)} placeholder="Напишите реализацию этого файла. Код сохранится в прогрессе React."/><p className="muted small">Сравните реализацию с решением ниже; запросы из учебного редактора не выполняются.</p></>;
}

interface LabUi {scope:'local'|'global';manager:string;op:string;practice:boolean;hidden:Record<string,string[]>;}
function readLabUi(value:string|undefined,data:LocalGlobalData):LabUi {
 const fallback:LabUi={scope:'local',manager:'redux',op:'post',practice:false,hidden:{}};
 try {
  const parsed:unknown=JSON.parse(value || 'null');
  if(!parsed || typeof parsed!=='object')return fallback;
  const obj=parsed as Partial<LabUi>;
  if((obj.scope!=='local'&&obj.scope!=='global')||!managers.some(([id])=>id===obj.manager)||!data.operations.some(item=>item.id===obj.op))return fallback;
  const hidden:Record<string,string[]>={};
  if(obj.hidden&&typeof obj.hidden==='object')for(const [key,list] of Object.entries(obj.hidden))if(Array.isArray(list)&&list.every(item=>typeof item==='string'))hidden[key]=list;
  return {...fallback,scope:obj.scope,manager:obj.manager!,op:obj.op!,practice:obj.practice===true,hidden};
 }catch{return fallback;}
}

const subscribeLabHash=(notify:()=>void)=>{window.addEventListener('hashchange',notify);return ()=>window.removeEventListener('hashchange',notify);};
const readLabHash=()=>{try{return decodeURIComponent(window.location.hash.slice(1));}catch{return '';}};
