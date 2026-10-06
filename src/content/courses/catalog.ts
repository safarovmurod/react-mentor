import type { CourseId } from '@/lib/courses/ids';
export const COURSE_CATALOG: {id:CourseId;name:string;symbol:string;ru:string;en:string;route:'web'|'tools'|'systems';prerequisite:CourseId|null}[] = [
  {id:'html',name:'HTML',symbol:'</>',ru:'Структура страницы: текст, ссылки, изображения и формы.',en:'Page structure: text, links, images and forms.',route:'web',prerequisite:null},
  {id:'css',name:'CSS',symbol:'{ }',ru:'Оформление, расположение элементов и адаптация к телефону.',en:'Styling, layout and responsive pages.',route:'web',prerequisite:'html'},
  {id:'javascript-1',name:'JavaScript 1',symbol:'JS',ru:'Первый уровень JavaScript. Темы будут определены по материалам канала.',en:'First JavaScript level. Topics will follow the channel materials.',route:'web',prerequisite:'css'},
  {id:'javascript-2',name:'JavaScript 2',symbol:'JS+',ru:'Следующий уровень того же языка, по материалам канала.',en:'The next level of the same language, based on channel materials.',route:'web',prerequisite:'javascript-1'},
  {id:'react',name:'React',symbol:'⚛',ru:'Готовый курс: разборы, практика, тесты и глубокие ответы.',en:'Ready course: lessons, practice, quizzes and deep answers.',route:'web',prerequisite:'javascript-2'},
  {id:'git',name:'Git / GitHub',symbol:'git',ru:'История изменений и совместная работа. Изучайте параллельно.',en:'Version history and collaboration. Study alongside your main course.',route:'tools',prerequisite:null},
  {id:'cpp',name:'C++',symbol:'C++',ru:'Отдельное направление программирования со своими материалами.',en:'A separate programming path with its own materials.',route:'systems',prerequisite:null},
];
export function courseName(id: CourseId) { return COURSE_CATALOG.find(course => course.id === id)!.name; }
