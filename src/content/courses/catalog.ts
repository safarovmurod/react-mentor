import type { CourseId } from '@/lib/courses/ids';
export const COURSE_CATALOG: {id:CourseId;name:string;symbol:string;ru:string;en:string;route:'web'|'tools'|'systems';prerequisite:CourseId|null}[] = [
  {id:'html',name:'HTML + CSS',symbol:'</>',ru:'Один месяц с нуля: структура, оформление и адаптивный сайт. Новый шаг и практика каждый день.',en:'One month from zero: structure, styling and a responsive website. A new step and practice each day.',route:'web',prerequisite:null},
  {id:'css',name:'CSS',symbol:'{ }',ru:'Оформление, расположение элементов и адаптация к телефону.',en:'Styling, layout and responsive pages.',route:'web',prerequisite:'html'},
  {id:'javascript-1',name:'JavaScript · JS1',symbol:'JS',ru:'Месяц 1: массивы, объекты, даты и алгоритмические задачи.',en:'Month 1: arrays, objects, dates and algorithm exercises.',route:'web',prerequisite:'html'},
  {id:'javascript-2',name:'JavaScript · JS2',symbol:'JS+',ru:'Месяц 2: JSON Server, API и запросы Axios.',en:'Month 2: JSON Server, APIs and Axios requests.',route:'web',prerequisite:'javascript-1'},
  {id:'react',name:'React',symbol:'⚛',ru:'Готовый курс: разборы, практика, тесты и глубокие ответы.',en:'Ready course: lessons, practice, quizzes and deep answers.',route:'web',prerequisite:'javascript-2'},
  {id:'nextjs',name:'Next.js',symbol:'N',ru:'Отдельный курс: App Router, серверные компоненты, API, авторизация и деплой.',en:'Independent course: App Router, server components, APIs, authentication and deployment.',route:'web',prerequisite:'react'},
  {id:'git',name:'Git / GitHub',symbol:'git',ru:'История изменений и совместная работа. Изучайте параллельно.',en:'Version history and collaboration. Study alongside your main course.',route:'tools',prerequisite:null},
  {id:'cpp',name:'C++',symbol:'C++',ru:'Отдельное направление программирования со своими материалами.',en:'A separate programming path with its own materials.',route:'systems',prerequisite:null},
];
export function courseName(id: CourseId) { return COURSE_CATALOG.find(course => course.id === id)!.name; }
