import { getTopic, type LearningTopic } from './course';
import { tr, type ContentLanguage } from '@/lib/translate';
export interface FunctionCase { name:string; args:unknown[]; expected:unknown }
export interface PracticeExercise {
 id:string; title:string; task:string; starter:string; solution:string; hint:string; criteria:string[];
 files:string[]; functionName?:string; tests?:FunctionCase[];
}
const localCode = [
`import { useState } from 'react';
type Todo = { id: number; text: string };
export default function TodoPage() {
  const [items, setItems] = useState<Todo[]>([]);
  const [text, setText] = useState('');
  function handleAdd() {
    if (!text.trim()) return;
    setItems([...items, { id: Date.now(), text: text.trim() }]);
    setText('');
  }
  function handleDelete(id: number) {
    setItems(items.filter(item => item.id !== id));
  }
  return <main>
    <input value={text} onChange={event => setText(event.target.value)} />
    <button onClick={handleAdd}>Илова</button>
    {items.map(item => <div key={item.id}>{item.text}
      <button onClick={() => handleDelete(item.id)}>Удалить</button>
    </div>)}
  </main>;
}`,
`import { useState } from 'react';
export default function ModalPage() {
  const [open, setOpen] = useState(false);
  return <main>
    <button onClick={() => setOpen(true)}>Кушо</button>
    {open && <section role="dialog" aria-modal="true" aria-label="Маълумот">
      <h2>Маълумот</h2>
      <button onClick={() => setOpen(false)}>Пӯш</button>
    </section>}
  </main>;
}`,
`import { useState } from 'react';
const tabs = [{ id: 1, title: 'React', text: 'Компонент ва state' },
  { id: 2, title: 'TypeScript', text: 'Типи маълумот' }];
export default function TabsPage() {
  const [activeId, setActiveId] = useState(1);
  const active = tabs.find(item => item.id === activeId);
  return <main>{tabs.map(item =>
    <button key={item.id} onClick={() => setActiveId(item.id)}
      aria-pressed={activeId === item.id}>{item.title}</button>)}
    <p>{active?.text}</p>
  </main>;
}`,
`import { useState } from 'react';
export default function CounterPage() {
  const [count, setCount] = useState(0);
  function handleAdd() { setCount(prev => prev + 1); }
  function handleRemove() { setCount(prev => Math.max(0, prev - 1)); }
  return <main><p>{count}</p><button onClick={handleAdd}>+</button>
    <button onClick={handleRemove}>−</button>
    <button onClick={() => setCount(0)}>Аз нав</button></main>;
}`,
`import { useState } from 'react';
const items = [{ id: 1, title: 'Props?', text: 'Маълумот аз parent.' },
  { id: 2, title: 'State?', text: 'Памяти компонент.' }];
export default function AccordionPage() {
  const [openId, setOpenId] = useState<number | null>(null);
  function handleToggle(id: number) {
    setOpenId(openId === id ? null : id);
  }
  return <main>{items.map(item => <section key={item.id}>
    <button aria-expanded={openId === item.id}
      onClick={() => handleToggle(item.id)}>{item.title}</button>
    {openId === item.id && <p>{item.text}</p>}
  </section>)}</main>;
}`,
];
const localSpecs=[
 {title:'Todo: add / delete',task:'Рӯйхати вазифаҳо соз. Input controlled бошад. Илова input-ро холӣ кунад. Delete танҳо id-и интихобшударо нест кунад.',criteria:['Input холӣ бошад — чизе илова нашавад.','2 вазифа илова кун, аввалашро нест кун: дуюмаш монад.','State дар ҳамин компонент, бо useState нигоҳ дошта шавад.']},
 {title:'Modal: open / close',task:'Бо як boolean модалкаро кушо ва пӯш. Open=true нишон медиҳад; Close=false мебандад.',criteria:['Дар render-и аввал модалка набошад.','Click ба Кушо: modal намоён шавад.','Click ба Пӯш: modal аз DOM барояд.']},
 {title:'Tabs: activeId',task:'2 вкладка соз. activeId танҳо id-и интихобшударо нигоҳ дорад. Матнро бо find гир.',criteria:['Аввал React фаъол бошад.','Click ба TypeScript: танҳо матни TypeScript барояд.','Click state-ро иваз кунад; useEffect лозим нест.']},
 {title:'Counter: prev + 1',task:'Счётчик соз: зиёд кардан, кам кардан ва reset. Қимат аз 0 паст нашавад.',criteria:['0 → click + → 1.','1 → click − → 0; боз − ҳам 0.','Reset аз ҳар қимат 0 кунад.']},
 {title:'Accordion: openId',task:'Аккордеон соз: як вақт танҳо як ҷавоб кушода бошад. Click-и такрорӣ ҳамон ҷавобро пӯшад.',criteria:['Аввал ҳама пӯшида.','Click 1 → ҷавоби 1; click 2 → танҳо ҷавоби 2.','Боз click 2 → openId=null.']},
];
export const LOCAL_PROJECTS:PracticeExercise[]=localSpecs.map((spec,index)=>({
 ...spec,id:'local-project-'+(index+1),starter:'// src/pages/PracticePage.tsx\n// Компонент, state ва handler-ҳоро навис.\n',solution:localCode[index],
 hint:['useState → input → handleAdd → [...items, item]; delete → filter.','open=false → click → setOpen(true) → render → modal.','activeId → find → active.text.','Қимати пешина лозим: setCount(prev => prev + 1).','openId === id бошад null мон, набошад id-и нав.'][index],
 files:['src/pages/PracticePage.tsx','src/App.tsx'],
}));
export const FUNCTION_LABS:PracticeExercise[]=[
 {id:'function-delete',title:'DELETE · filter',task:'removeTodo(items, id) массиви нав баргардонад. Массиви аввал тағйир наёбад.',
 starter:'type Todo = { id: number; text: string };\nexport function removeTodo(items: Todo[], id: number): Todo[] {\n  // Код\n  return items;\n}',
 solution:'type Todo = { id: number; text: string };\nexport function removeTodo(items: Todo[], id: number): Todo[] {\n  return items.filter(item => item.id !== id);\n}',
 hint:'filter элементҳои item.id !== id-ро нигоҳ медорад.',criteria:['id-и вуҷуддошта нест мешавад.','id-и набуда массивро бетағйир мегузорад.','Массиви холӣ → [].'],files:['src/data/todos.ts'],functionName:'removeTodo',
 tests:[{name:'Удалить id=1',args:[[{id:1,text:'React'},{id:2,text:'TS'}],1],expected:[{id:2,text:'TS'}]},{name:'ID отсутствует',args:[[{id:2,text:'TS'}],9],expected:[{id:2,text:'TS'}]},{name:'Пустой список',args:[[],1],expected:[]}]},
 {id:'function-edit',title:'EDIT · map',task:'renameTodo(items, id, text) матни як todo-ро иваз кунад. Объектҳои дигар ва массиви аввал тағйир наёбанд.',
 starter:'type Todo = { id: number; text: string };\nexport function renameTodo(items: Todo[], id: number, text: string): Todo[] {\n  return items;\n}',
 solution:'type Todo = { id: number; text: string };\nexport function renameTodo(items: Todo[], id: number, text: string): Todo[] {\n  return items.map(item => item.id === id ? { ...item, text } : item);\n}',
 hint:'map ҳар item-ро мебинад. id рост бошад {...item, text}, дигарҳояш item.',criteria:['Танҳо id-и интихобшуда тағйир ёбад.','id-и набуда → ҳамон қиматҳо.','Массиви аввал мутaция нашавад.'],files:['src/data/todos.ts'],functionName:'renameTodo',
 tests:[{name:'Изменение одного элемента',args:[[{id:1,text:'Old'},{id:2,text:'Keep'}],1,'New'],expected:[{id:1,text:'New'},{id:2,text:'Keep'}]},{name:'Нет ID',args:[[{id:1,text:'Old'}],2,'New'],expected:[{id:1,text:'Old'}]}]},
 {id:'function-search',title:'SEARCH · filter',task:'searchTodos(items, query) ҷустуҷӯи матн кунад. Пробелҳои ду тарафи query ва ҳарфҳои калон ба натиҷа таъсир накунанд.',
 starter:'type Todo = { id: number; text: string };\nexport function searchTodos(items: Todo[], query: string): Todo[] {\n  return items;\n}',
 solution:'type Todo = { id: number; text: string };\nexport function searchTodos(items: Todo[], query: string): Todo[] {\n  const search = query.trim().toLowerCase();\n  return items.filter(item => item.text.toLowerCase().includes(search));\n}',
 hint:'query.trim().toLowerCase() ва item.text.toLowerCase().includes(search).',criteria:['react бояд React-ро ёбад.','query холӣ → ҳама.','Натиҷа нест → [].'],files:['src/data/todos.ts'],functionName:'searchTodos',
 tests:[{name:'Регистр и пробелы',args:[[{id:1,text:'React'},{id:2,text:'Vue'}],' REACT '],expected:[{id:1,text:'React'}]},{name:'Пустой запрос',args:[[{id:1,text:'React'}],''],expected:[{id:1,text:'React'}]},{name:'Нет совпадений',args:[[{id:1,text:'React'}],'CSS'],expected:[]}]},
 {id:'function-page',title:'PAGINATION · slice',task:'getPage(items, page, pageSize) танҳо элементҳои ҳамин саҳифаро баргардонад. page аз 1 сар мешавад; берун аз рӯйхат → [].',
 starter:'export function getPage(items: number[], page: number, pageSize: number): number[] {\n  return items;\n}',
 solution:'export function getPage(items: number[], page: number, pageSize: number): number[] {\n  const start = (page - 1) * pageSize;\n  return items.slice(start, start + pageSize);\n}',
 hint:'page=2 ва pageSize=2 бошад, start=2; slice(2,4).',criteria:['Саҳифаи 1: ду элементи аввал.','Саҳифаи 2: ду элементи оянда.','Саҳифаи набуда: [].'],files:['src/data/pagination.ts'],functionName:'getPage',
 tests:[{name:'Первая страница',args:[[1,2,3,4,5],1,2],expected:[1,2]},{name:'Вторая страница',args:[[1,2,3,4,5],2,2],expected:[3,4]},{name:'За пределами списка',args:[[1,2],3,2],expected:[]}]},
 {id:'function-toggle',title:'Accordion · toggle',task:'toggleId(openId, clickedId) id-и кушодаро ҳисоб кунад. Як id-ро дубора click кунӣ → null.',
 starter:'export function toggleId(openId: number | null, clickedId: number): number | null {\n  return openId;\n}',
 solution:'export function toggleId(openId: number | null, clickedId: number): number | null {\n  if (openId === clickedId) return null;\n  return clickedId;\n}',
 hint:'Аввал муқоиса кун: ҳамон id бошад — пӯш.',criteria:['null,1 → 1.','1,1 → null.','1,2 → 2.'],files:['src/data/accordion.ts'],functionName:'toggleId',
 tests:[{name:'Открытие',args:[null,1],expected:1},{name:'Повторный клик',args:[1,1],expected:null},{name:'Другой элемент',args:[1,2],expected:2}]},
];
const EXERCISE_TITLES:Record<ContentLanguage,string[]>={
 tg:['Пайдарпаии кор','Аз сифр навис','Ду ҳолатро муқоиса кун','Хатогиро ёб','Мини-проект'],
 ru:['Порядок работы','Написать с нуля','Сравнить два состояния','Найти ошибку','Мини-проект'],
 en:['Order of work','Write from scratch','Compare two states','Find the mistake','Mini project'],
};

// Ҳар вазифа аз қолиби забонӣ, номи мавзӯъ ва пайдарпаии flow сохта мешавад.
const TASK_BUILDERS:Record<ContentLanguage,((title:string,trace:string,focus:string,step:string)=>string)[]>={
 tg:[
  (title,trace)=>'Мисоли «'+title+'»-ро гир. Пеш аз иҷро натиҷаро навис. Ин пайдарпаиро бо қиматҳои худат нишон деҳ: '+trace,
  (title,_trace,focus)=>'Барои «'+title+'» мисолро аз сифр навис. Ба саволи «'+focus+'» бо мисоли худат ҷавоб деҳ.',
  (title)=>'Дар мисоли «'+title+'» як қимати вурудро иваз кун. Натиҷаи пеш ва баъдро навис. Дигар шартҳоро тағйир надеҳ.',
  (title,_trace,_focus,step)=>'Дар мисоли «'+title+'» як қадами «'+step+'»-ро муваққатан гир. Хатои воқеиро бин, сабабашро фаҳмон ва қадамро баргардон.',
  (title,_trace,focus)=>'Як саҳифаи хурд соз, ки «'+title+'»-ро нишон диҳад. Танҳо ҳамин мавзӯъ ва асосҳои қаблан хондаатро истифода бар. Дар охир ин саволро шарҳ деҳ: '+focus,
 ],
 ru:[
  (title,trace)=>'Разбери пример «'+title+'». Запиши результат до выполнения. Покажи эту цепочку на своих значениях: '+trace,
  (title,_trace,focus)=>'Напиши пример для «'+title+'» с нуля. Ответь своим примером на вопрос «'+focus+'».',
  (title)=>'В примере «'+title+'» измени одно входное значение. Запиши результат до и после. Остальные условия не меняй.',
  (title,_trace,_focus,step)=>'В примере «'+title+'» временно убери шаг «'+step+'». Увидь реальную ошибку, объясни причину и верни шаг на место.',
  (title,_trace,focus)=>'Сделай небольшую страницу, показывающую «'+title+'». Используй только эту тему и уже изученные основы. В конце объясни вопрос: '+focus,
 ],
 en:[
  (title,trace)=>'Walk through the example "'+title+'". Write the result before running. Show this chain with your own values: '+trace,
  (title,_trace,focus)=>'Write the example for "'+title+'" from scratch. Answer the question "'+focus+'" with your own example.',
  (title)=>'In the "'+title+'" example change one input value. Write the result before and after. Do not change the other conditions.',
  (title,_trace,_focus,step)=>'In the "'+title+'" example temporarily remove the step "'+step+'". See the real error, explain the cause and restore the step.',
  (title,_trace,focus)=>'Build a small page that demonstrates "'+title+'". Use only this topic and the fundamentals you already studied. At the end explain: '+focus,
 ],
};

export function exercisesForTopic(topic:LearningTopic, contentLanguage:ContentLanguage='tg'):PracticeExercise[] {
 if(topic.id==='local-practice')return LOCAL_PROJECTS;
 const code=topic.code.join('\n\n');
 const lang=contentLanguage;
 const title=lang==='ru'?topic.titleRu:tr(topic.title,lang);
 const trace=topic.flow.map(step=>tr(step,lang)).join(' → ');
 const question=topic.questions[0];
 const focus=question?tr(question.question,lang):title;
 const titles=EXERCISE_TITLES[lang];
 const builders=TASK_BUILDERS[lang];
 const starterComment=lang==='ru'?'// Напиши своё решение.\n':lang==='en'?'// Write your own solution.\n':'// Ҳалли худатро навис.\n';
 const compareResult=lang==='ru'?'Сравни результат с примером разбора.':lang==='en'?'Compare your result with the worked example.':'Натиҷаро бо мисоли разбор муқоиса кун.';
 const ownWords=lang==='ru'?'Своими словами: какое действие что вызвало и какие данные изменились.':lang==='en'?'In your own words: which action caused what and which data changed.':'Бо суханҳои худат гӯй: кадом амал сабаб шуд ва кадом маълумот тағйир ёфт.';
 const criteria=[trace||tr(topic.explanation[0]?.text||'',lang)||focus, compareResult, ownWords];
 return titles.map((exerciseTitle,index)=>({
  id:topic.id+'-exercise-'+(index+1),title:exerciseTitle,task:builders[index](title,trace,focus,topic.flow[1]?tr(topic.flow[1],lang):focus),
  starter:index===0?code:'// '+title+'\n'+starterComment,
  solution:code||(question?question.answer+'\n'+question.deeper:topic.explanation.map(item=>item.text).join('\n\n')),
  hint:tr(topic.explanation[0]?.text||trace,lang),criteria,files:topic.month===3?['app/page.tsx','app/layout.tsx']:['src/pages/PracticePage.tsx','src/App.tsx'],
 }));
}
export function createProjectPrompt(ids:string[], language:'ru'|'en'|'tg'|'uk') {
 const topics=ids.map(id=>getTopic(id)).filter((topic):topic is LearningTopic=>Boolean(topic));
 if(topics.length<1||topics.length>5||new Set(topics.map(topic=>topic.month)).size!==1)throw new Error('Choose 1–5 topics from one month.');
 const month=topics[0].month;
 const names=topics.map(topic=>topic.titleRu);
 const requirements=topics.map((topic,index)=>(index+1)+'. '+topic.titleRu+': '+(topic.flow.join(' → ')||topic.explanation[0]?.text));
 const rules=month===1?'React + TypeScript. Локальный useState, props и именованные handler. Общий state поднимай в ближайший parent. Без Redux, Zustand, Jotai, Context и Next.js.':
 month===2?'React + TypeScript. Используй только выбранный менеджер состояния, если он есть среди тем. Не добавляй другие менеджеры и Next.js.':
 'Next.js + TypeScript. Server/Client и API используй только если они нужны для выбранных тем.';
 return [
  language==='ru'?'Спроектируй понятный адаптивный интерфейс учебного проекта.':'Design a clear, responsive interface for a learning project.',
  'Темы: '+names.join(', ')+'. Месяц '+month+'.',rules,
  'Сценарии, которые дизайн обязан показать:',...requirements,
  'Для каждой выбранной темы: отдельный видимый сценарий, начальное состояние, действие пользователя и результат. Не добавляй функций за пределами этих сценариев.',
  'Если в выбранной теме есть запрос: loading, success, empty, error. Не придумывай endpoint, поля ответа или авторизацию.',
  'Дизайн: desktop 1440px и mobile 390px, единые отступы, читаемый код, кнопка Назад, доступные контрасты, библиотечные иконки. Без лишнего маркетингового текста.',
  'Код будет написан самостоятельно по этому дизайну. Дай чёткие названия экранов, компонентов и состояний. Более ранние темы допускаются только как необходимая основа.',
 ].join('\n\n');
}
