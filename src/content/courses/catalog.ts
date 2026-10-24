import type { CourseId } from '@/lib/courses/ids';
import type { CourseCategoryId, ProgrammingSubtrackId } from '@/content/course-categories';

export interface CourseCatalogEntry {
  id: CourseId;
  name: string;
  symbol: string;
  ru: string;
  en: string;
  /** Legacy navigation hint; category/subtrack are authoritative for catalog grouping. */
  route: 'web' | 'tools' | 'systems';
  prerequisite: CourseId | null;
  category: CourseCategoryId;
  subtrack?: ProgrammingSubtrackId;
  editorLanguage?: string;
  /** Execution setup guidance, not a claim that the site executes this runtime. */
  runtime?: 'browser' | 'local';
  introductoryDays?: 2;
  accessTier?: 'starter' | 'pro' | 'expert';
  /** Number of real scheduled days; library-only reference lessons are not counted. */
  publishedDays?: number;
}

export const COURSE_CATALOG: CourseCatalogEntry[] = [
  {id:'html',publishedDays:30,category:'programming',subtrack:'frontend',editorLanguage:'html',runtime:'browser',name:'HTML + CSS',symbol:'</>',ru:'Один месяц с нуля: структура, оформление и адаптивный сайт. Новый шаг и практика каждый день.',en:'One month from zero: structure, styling and a responsive website. A new step and practice each day.',route:'web',prerequisite:null},
  {id:'css',publishedDays:5,category:'programming',subtrack:'frontend',editorLanguage:'css',runtime:'browser',name:'CSS',symbol:'{ }',ru:'Оформление, расположение элементов и адаптация к телефону.',en:'Styling, layout and responsive pages.',route:'web',prerequisite:'html'},
  {id:'javascript-1',publishedDays:30,category:'programming',subtrack:'frontend',editorLanguage:'javascript',runtime:'browser',name:'JavaScript · JS1',symbol:'JS',ru:'Месяц 1: массивы, объекты, даты и алгоритмические задачи.',en:'Month 1: arrays, objects, dates and algorithm exercises.',route:'web',prerequisite:'html'},
  {id:'javascript-2',publishedDays:30,category:'programming',subtrack:'frontend',editorLanguage:'javascript',runtime:'local',name:'JavaScript · JS2',symbol:'JS+',ru:'Месяц 2: JSON Server, API и запросы Axios.',en:'Month 2: JSON Server, APIs and Axios requests.',route:'web',prerequisite:'javascript-1'},
  {id:'react',publishedDays:60,category:'programming',subtrack:'frontend',editorLanguage:'typescript',runtime:'local',name:'React',symbol:'⚛',ru:'Готовый курс: разборы, практика, тесты и глубокие ответы.',en:'Ready course: lessons, practice, quizzes and deep answers.',route:'web',prerequisite:'javascript-2'},
  {id:'nextjs',publishedDays:20,category:'programming',subtrack:'frontend',editorLanguage:'typescript',runtime:'local',name:'Next.js',symbol:'N',ru:'Отдельный курс: App Router, серверные компоненты, API, авторизация и деплой.',en:'Independent course: App Router, server components, APIs, authentication and deployment.',route:'web',prerequisite:'react'},
  {id:'git',publishedDays:30,category:'programming',subtrack:'tools',editorLanguage:'shell',runtime:'local',name:'Git / GitHub',symbol:'git',ru:'История изменений и совместная работа. Изучайте параллельно.',en:'Version history and collaboration. Study alongside your main course.',route:'tools',prerequisite:null},
  {"id":"typescript","publishedDays":14,"name":"TypeScript","symbol":"TS","ru":"Четырнадцать дней: типы, функции, generics, strict-режим и типизированный мини-проект.","en":"Fourteen days: types, functions, generics, strict mode and a typed mini project.","route":"web","prerequisite":"javascript-2","category":"programming","subtrack":"frontend","editorLanguage":"typescript","runtime":"local"},
  {"id":"algorithms","publishedDays":14,"name":"Algorithms","symbol":"Σ","ru":"Четырнадцать дней: сложность, массивы, поиск, сортировки, структуры данных и решение задач.","en":"Fourteen days: complexity, arrays, searching, sorting, data structures and problem solving.","route":"systems","prerequisite":"javascript-1","category":"programming","subtrack":"algorithms","editorLanguage":"javascript","runtime":"browser"},
  {id:'python',publishedDays:30,category:'programming',subtrack:'languages',editorLanguage:'python',runtime:'local',name:'Python',symbol:'Py',ru:'Полный курс с нуля: 30 дней от переменных до итогового проекта-анализатора расходов.',en:'A full course from zero: 30 days from variables to a final expense-analyzer project.',route:'systems',prerequisite:null},
  {id:'backend',publishedDays:2,category:'programming',subtrack:'backend',editorLanguage:'javascript',runtime:'local',introductoryDays:2,name:'Backend',symbol:'API',ru:'Вводный модуль: два дня, HTTP-сервер и проверка запросов. Нужен локальный Node.js.',en:'Two-day introduction: an HTTP server and request validation. Requires local Node.js.',route:'web',prerequisite:'javascript-1'},
  {id:'mobile',publishedDays:2,category:'programming',subtrack:'mobile',editorLanguage:'typescript',runtime:'local',introductoryDays:2,name:'Mobile',symbol:'App',ru:'Вводный модуль: два дня, экран React Native и счётчик. Запуск через Expo на своём устройстве.',en:'Two-day introduction: a React Native screen and counter. Run with Expo on your own device.',route:'tools',prerequisite:'react'},
  {id:'cpp',publishedDays:30,category:'programming',subtrack:'languages',editorLanguage:'cpp',runtime:'local',name:'C++',symbol:'C++',ru:'Отдельное направление программирования со своими материалами.',en:'A separate programming path with its own materials.',route:'systems',prerequisite:null},
  {id:"java",publishedDays:30,name:"Java",symbol:"J",ru:"Полный курс с нуля: 30 дней от первого класса до библиотеки книг с коллекциями и отчётом.",en:"A full course from zero: 30 days from your first class to a book library with collections and a report.",route:"systems",prerequisite:null,category:"programming",subtrack:"backend",editorLanguage:"java",runtime:"local"},
  {"id":"csharp","publishedDays":2,"name":"C#","symbol":"C#","ru":"Вводный модуль: два дня. Типы, методы и консольная программа на C#.","en":"Two-day introductory module. Types, methods and a C# console program.","route":"systems","prerequisite":null,"category":"programming","subtrack":"backend","editorLanguage":"csharp","runtime":"local","introductoryDays":2},
  {"id":"go","publishedDays":2,"name":"Go","symbol":"Go","ru":"Вводный модуль: два дня. Переменные, функции и первая программа на Go.","en":"Two-day introductory module. Variables, functions and your first Go program.","route":"systems","prerequisite":null,"category":"programming","subtrack":"languages","editorLanguage":"go","runtime":"local","introductoryDays":2},
  {"id":"rust","publishedDays":2,"name":"Rust","symbol":"Rs","ru":"Вводный модуль: два дня. Переменные, владение и первая программа на Rust.","en":"Two-day introductory module. Variables, ownership and your first Rust program.","route":"systems","prerequisite":null,"category":"programming","subtrack":"languages","editorLanguage":"rust","runtime":"local","introductoryDays":2},
  {"id":"php","publishedDays":2,"name":"PHP","symbol":"PHP","ru":"Вводный модуль: два дня. Переменные, функции и обработка данных на PHP.","en":"Two-day introductory module. Variables, functions and data handling in PHP.","route":"web","prerequisite":null,"category":"programming","subtrack":"backend","editorLanguage":"php","runtime":"local","introductoryDays":2},
  {"id":"ruby","publishedDays":2,"name":"Ruby","symbol":"Rb","ru":"Вводный модуль: два дня. Переменные, коллекции и методы Ruby.","en":"Two-day introductory module. Variables, collections and Ruby methods.","route":"systems","prerequisite":null,"category":"programming","subtrack":"languages","editorLanguage":"ruby","runtime":"local","introductoryDays":2},
  {"id":"sql","publishedDays":2,"name":"SQL","symbol":"SQL","ru":"Вводный модуль: два дня. Таблицы, SELECT и фильтрация записей.","en":"Two-day introductory module. Tables, SELECT and filtering records.","route":"systems","prerequisite":null,"category":"programming","subtrack":"databases","editorLanguage":"sql","runtime":"local","introductoryDays":2},
  {"id":"bash","publishedDays":2,"name":"Bash","symbol":">_","ru":"Вводный модуль: два дня. Безопасная работа с терминалом и первый скрипт.","en":"Two-day introductory module. Safe terminal use and your first script.","route":"tools","prerequisite":null,"category":"programming","subtrack":"tools","editorLanguage":"shell","runtime":"local","introductoryDays":2},
  {id:"nodejs",publishedDays:30,name:"Node.js",symbol:"Node",ru:"Полный курс с нуля: 30 дней от первого скрипта до TODO API с тестами.",en:"A full course from zero: 30 days from your first script to a TODO API with tests.",route:"web",prerequisite:"javascript-1",category:"programming",subtrack:"backend",editorLanguage:"javascript",runtime:"local"},
  {"id":"mongodb","publishedDays":2,"name":"MongoDB","symbol":"DB","ru":"Вводный модуль: два дня. Документы, коллекции и запросы к MongoDB.","en":"Two-day introductory module. Documents, collections and MongoDB queries.","route":"systems","prerequisite":null,"category":"programming","subtrack":"databases","editorLanguage":"javascript","runtime":"local","introductoryDays":2},
  {"id":"swift","publishedDays":2,"name":"Swift","symbol":"Sw","ru":"Вводный модуль: два дня. Переменные, функции и основы Swift для приложений.","en":"Two-day introductory module. Variables, functions and Swift application fundamentals.","route":"tools","prerequisite":null,"category":"programming","subtrack":"mobile","editorLanguage":"swift","runtime":"local","introductoryDays":2},
  {"id":"kotlin","publishedDays":2,"name":"Kotlin","symbol":"Kt","ru":"Вводный модуль: два дня. Типы, функции и основы Kotlin для приложений.","en":"Two-day introductory module. Types, functions and Kotlin application fundamentals.","route":"tools","prerequisite":null,"category":"programming","subtrack":"mobile","editorLanguage":"kotlin","runtime":"local","introductoryDays":2},
  {"id":"ux-design","publishedDays":2,"name":"UX/UI Design","symbol":"UX","ru":"Вводный модуль: два дня. Потребности пользователя, сценарий и прототип интерфейса.","en":"Two-day introductory module. User needs, a user flow and an interface prototype.","route":"tools","prerequisite":null,"category":"design","introductoryDays":2},
  {"id":"ai-fundamentals","publishedDays":14,"name":"AI Fundamentals","symbol":"AI","ru":"Четырнадцать дней: что такое ИИ и LLM, токены и контекст, промпты, галлюцинации, безопасность и мини-проект.","en":"Fourteen days: what AI and LLMs are, tokens and context, prompts, hallucinations, safety and a mini project.","route":"systems","prerequisite":null,"category":"ai","editorLanguage":"javascript","runtime":"browser"},
  {"id":"context-engineering","publishedDays":14,"name":"Context Engineering","symbol":"CTX","ru":"Четырнадцать дней: окно контекста, бюджет токенов, релевантность, RAG, сжатие контекста и учебный проект.","en":"Fourteen days: the context window, token budgets, relevance, RAG, context compression and a learning project.","route":"systems","prerequisite":"ai-fundamentals","category":"ai","editorLanguage":"typescript","runtime":"local"},
  {"id":"agent-harness","publishedDays":14,"name":"Agent Harness","symbol":"AH","ru":"Четырнадцать дней: цикл агента, инструменты и схемы, права доступа, песочница, контрольные точки и мини-агент.","en":"Fourteen days: the agent loop, tools and schemas, permissions, sandboxing, checkpoints and a mini agent.","route":"systems","prerequisite":"context-engineering","category":"ai","editorLanguage":"typescript","runtime":"local"},
  {"id":"digital-marketing","publishedDays":2,"name":"Digital Marketing","symbol":"↗","ru":"Вводный модуль: два дня. Аудитория, предложение и измеримый план кампании.","en":"Two-day introductory module. An audience, a value proposition and a measurable campaign plan.","route":"tools","prerequisite":null,"category":"marketing","introductoryDays":2},
  {"id":"data-analytics","publishedDays":2,"name":"Data Analytics","symbol":"▥","ru":"Вводный модуль: два дня. Качество данных, простые расчёты и выводы.","en":"Two-day introductory module. Data quality, simple calculations and evidence-based conclusions.","route":"tools","prerequisite":null,"category":"analytics","introductoryDays":2},
  {"id":"business-foundations","publishedDays":2,"name":"Business Foundations","symbol":"◇","ru":"Вводный модуль: два дня. Проблема клиента, ценность и проверка бизнес-идеи.","en":"Two-day introductory module. A customer problem, value proposition and business idea validation.","route":"tools","prerequisite":null,"category":"business","introductoryDays":2},
  {"id":"communication","publishedDays":2,"name":"Communication","symbol":"◎","ru":"Вводный модуль: два дня. Понятное сообщение, обратная связь и рабочий диалог.","en":"Two-day introductory module. Clear messages, feedback and workplace conversations.","route":"tools","prerequisite":null,"category":"soft-skills","introductoryDays":2},
  {"id":"content-creation","publishedDays":2,"name":"Content Creation","symbol":"Aa","ru":"Вводный модуль: два дня. Бриф, структура и редактирование полезного материала.","en":"Two-day introductory module. A brief, structure and editing useful content.","route":"tools","prerequisite":null,"category":"content","introductoryDays":2},
  {"id":"english-foundations","publishedDays":2,"name":"English Foundations","symbol":"EN","ru":"Вводный модуль: два дня. Знакомство, простые фразы и короткий диалог.","en":"Two-day introductory module. Introductions, simple phrases and a short conversation.","route":"tools","prerequisite":null,"category":"languages","introductoryDays":2},
  {"id":"digital-literacy","publishedDays":2,"name":"Digital Literacy","symbol":"☆","ru":"Вводный модуль: два дня. Файлы, поиск информации и безопасность в интернете.","en":"Two-day introductory module. Files, finding information and online safety.","route":"tools","prerequisite":null,"category":"kids","introductoryDays":2},
  {"id":"personal-productivity","publishedDays":2,"name":"Personal Productivity","symbol":"☀","ru":"Вводный модуль: два дня. Реалистичный план дня, приоритеты и проверка результата.","en":"Two-day introductory module. A realistic daily plan, priorities and reviewing outcomes.","route":"tools","prerequisite":null,"category":"lifestyle","introductoryDays":2},
  {"id":"management-foundations","publishedDays":2,"name":"Management Foundations","symbol":"◇","ru":"Вводный модуль: два дня. Цели команды, распределение задач и обратная связь.","en":"Two-day introductory module. Team goals, task delegation and feedback.","route":"tools","prerequisite":null,"category":"business","introductoryDays":2},
  {id:"javascript-pro",name:"JavaScript Pro",symbol:"JS+",ru:"Тридцать дней Pro: event loop, промисы, отмена, retry, генераторы, память, производительность, безопасность и планировщик задач.",en:"Thirty Pro days: the event loop, promises, cancellation, retries, generators, memory, performance, security and a task scheduler.",route:"web",prerequisite:"javascript-2",category:"programming",subtrack:"frontend",editorLanguage:"javascript",runtime:"browser",accessTier:"pro",publishedDays:30},
  {"id":"backend-pro","name":"Backend Pro","symbol":"API+","ru":"Тридцать дней Pro: HTTP, REST, аутентификация, безопасность, кэш, надёжность, тестирование и защищённый API-проект.","en":"Thirty Pro days: HTTP, REST, authentication, security, caching, reliability, testing and a hardened API project.","route":"web","prerequisite":"backend","category":"programming","subtrack":"backend","editorLanguage":"javascript","runtime":"local","accessTier":"pro","publishedDays":30},
  {"id":"architecture-expert","name":"Software Architecture Expert","symbol":"ARCH","ru":"Тридцать дней Expert: архитектурные решения, ADR, границы, данные, отказоустойчивость, миграции и capstone-дизайн сервиса.","en":"Thirty Expert days: architecture decisions, ADRs, boundaries, data, resilience, migrations and a service-design capstone.","route":"systems","prerequisite":"backend-pro","category":"programming","subtrack":"backend","editorLanguage":"javascript","runtime":"local","accessTier":"expert","publishedDays":30},
  {"id":"ux-pro","name":"UX Design Pro","symbol":"UX+","ru":"Тридцать дней Pro: интервью, journeys, информационная архитектура, юзабилити-тесты, доступность, дизайн-системы и сквозной кейс.","en":"Thirty Pro days: interviews, journey maps, information architecture, usability testing, accessibility, design systems and an end-to-end case.","route":"tools","prerequisite":"ux-design","category":"design","accessTier":"pro","publishedDays":30},
  {"id":"business-pro","name":"Business Pro","symbol":"BIZ+","ru":"Тридцать дней Pro: сегменты и ICP, ценность, ценообразование, юнит-экономика, воронки, эксперименты, финансы и 90-дневный план запуска.","en":"Thirty Pro days: segments and ICP, value, pricing, unit economics, funnels, experiments, finances and a 90-day launch plan.","route":"tools","prerequisite":"business-foundations","category":"business","accessTier":"pro","publishedDays":30},
];
export function courseName(id: CourseId) { return COURSE_CATALOG.find(course => course.id === id)!.name; }
export function coursePublishedDays(id: CourseId) { return COURSE_CATALOG.find(course => course.id === id)?.publishedDays ?? 0; }

/* ============ Learning tracks ============
   A track is one discipline studied across three stages: Beginner (free),
   Pro and Expert (paid). Stage membership is derived from accessTier so a
   course can never claim a stage its access tier contradicts. Tracks with
   unpublished stages list only what actually exists — the UI renders missing
   stages as "not published yet", never as finished courses. */
export type LearningStage = 'beginner' | 'pro' | 'expert';
export interface TrackStageRef { stage: LearningStage; course: CourseId; }
export interface LearningTrack { id: string; name: string; courses: TrackStageRef[]; }

const stageOf = (id: CourseId): LearningStage => {
  const tier = COURSE_CATALOG.find(course => course.id === id)?.accessTier;
  return tier === 'pro' ? 'pro' : tier === 'expert' ? 'expert' : 'beginner';
};

function track(id: string, name: string, courses: CourseId[]): LearningTrack {
  return { id, name, courses: courses.map(course => ({ stage: stageOf(course), course })) };
}

export const LEARNING_TRACKS: LearningTrack[] = [
  track('html', 'HTML + CSS', ['html']),
  track('css', 'CSS', ['css']),
  track('javascript', 'JavaScript', ['javascript-1', 'javascript-2', 'javascript-pro']),
  track('typescript', 'TypeScript', ['typescript']),
  track('react', 'React', ['react']),
  track('nextjs', 'Next.js', ['nextjs']),
  track('python', 'Python', ['python']),
  track('algorithms', 'Algorithms', ['algorithms']),
  track('cpp', 'C++', ['cpp']),
  track('java', 'Java', ['java']),
  track('csharp', 'C#', ['csharp']),
  track('go', 'Go', ['go']),
  track('rust', 'Rust', ['rust']),
  track('php', 'PHP', ['php']),
  track('ruby', 'Ruby', ['ruby']),
  track('backend', 'Backend', ['backend', 'backend-pro']),
  track('nodejs', 'Node.js', ['nodejs']),
  track('sql', 'SQL', ['sql']),
  track('mongodb', 'MongoDB', ['mongodb']),
  track('bash', 'Bash', ['bash']),
  track('git', 'Git / GitHub', ['git']),
  track('mobile', 'Mobile', ['mobile']),
  track('swift', 'Swift', ['swift']),
  track('kotlin', 'Kotlin', ['kotlin']),
  track('ai-fundamentals', 'AI Fundamentals', ['ai-fundamentals']),
  track('context-engineering', 'Context Engineering', ['context-engineering']),
  track('agent-harness', 'Agent Harness', ['agent-harness']),
  track('ux', 'UX/UI Design', ['ux-design', 'ux-pro']),
  track('digital-marketing', 'Digital Marketing', ['digital-marketing']),
  track('data-analytics', 'Data Analytics', ['data-analytics']),
  track('business', 'Business', ['business-foundations', 'business-pro']),
  track('management', 'Management', ['management-foundations']),
  track('communication', 'Communication', ['communication']),
  track('content-creation', 'Content Creation', ['content-creation']),
  track('english', 'English', ['english-foundations']),
  track('digital-literacy', 'Digital Literacy', ['digital-literacy']),
  track('personal-productivity', 'Personal Productivity', ['personal-productivity']),
  track('architecture', 'Software Architecture', ['architecture-expert']),
];

export function courseTrack(id: CourseId): LearningTrack | null {
  return LEARNING_TRACKS.find(item => item.courses.some(entry => entry.course === id)) ?? null;
}
