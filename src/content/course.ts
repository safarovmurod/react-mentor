import deepSource from './imported/deep.json';
import quizSource from './imported/quiz.json';
import interviewSource from './imported/interview.json';
import roadmapSource from './imported/roadmap.json';
import { EXTRA_TOPICS, EXTRA_QUESTIONS } from './supplemental';

export interface LearningTopic {
  id: string;
  month: number;
  title: string;
  titleRu: string;
  explanation: { title: string; text: string }[];
  flow: string[];
  code: string[];
  questions: { question: string; answer: string; deeper: string }[];
  source: string;
}

export interface LearningQuestion {
  id: string;
  topicId: string;
  month: number;
  group: number;
  question: string;
  answer: string;
  options: string[];
  explanation: string;
  code: string[];
  source: string;
  sourceId: string;
}

const titlesRu = [
  'Зачем нужен React', 'Компоненты', 'JSX', 'Props', 'children', 'Списки и key',
  'Render и re-render', 'Сравнение дерева', 'State и отображение', 'Модель state',
  'Обновление через prev', 'Группировка обновлений', 'Обновление без мутации', 'Правила хуков',
  'Свои хуки', 'useEffect', 'Зависимости эффекта', 'Очистка эффекта', 'Ошибки эффектов',
  'Mount и unmount', 'Отладка', 'useRef', 'Доступ к DOM', 'useReducer', 'useState или useReducer',
  'Мемоизация', 'React.memo', 'useMemo', 'useCallback', 'Когда нужна оптимизация', 'SPA и MPA',
  'React Router', 'Параметры маршрута', 'Защищённые маршруты', 'Разделение кода',
  'Context API', 'Context и управление state', 'Zustand', 'Структура Zustand', 'Архитектура Redux',
  'Redux Toolkit', 'Immer', 'Асинхронный Redux', 'Jotai', 'Локальный, общий, серверный и URL state',
  'Выбор архитектуры', 'Серверные данные', 'TanStack Query', 'TanStack Query и Redux',
  'Структура приложения', 'Задача: render', 'Задача: эффект', 'Задача: state',
  'Задача: производительность', 'Задача: архитектура', 'Объяснить технологию', 'Обосновать решение',
  'Обсудить решение с командой', 'Ревью кода', 'Незнакомый вопрос', 'Почему state не мутируют',
  'Render и DOM update', 'Когда useEffect не нужен', 'Общий state без Redux',
  'Серверный и клиентский state', 'Границы Context', 'Зачем ограничивать мемоизацию',
  'Архитектура и библиотеки', 'Роль JavaScript', 'Выбор библиотеки',
  'Практика: state', 'Практика: React', 'Практика: общий state', 'Практика: серверные данные',
  'Практика: маршруты', 'Практика: производительность', 'Качество кода', 'Объяснение проекта',
];

export const LEARNING_TOPICS: LearningTopic[] = [
  ...deepSource.map((topic, index) => ({
    ...topic, id: `topic-${index + 1}`, title: topic.title.replace(/^\d+\.\s*/, '').replaceAll('`', ''),
    titleRu: titlesRu[index], month: index < 35 ? 1 : index < 50 ? 2 : 3,
    source: 'react_deep_understanding_visual_offline.html',
  })),
  ...EXTRA_TOPICS,
];

export const QUIZ_QUESTIONS: LearningQuestion[] = [
  ...quizSource.groups.flatMap((group, groupIndex) => group.items.map(question => {
    // The source groups share deep's order. Repeated titles such as “Cleanup чист?”
    // must keep their own topic, explanation and code instead of the first match.
    const topic = LEARNING_TOPICS[groupIndex];
    if (!topic || deepSource[groupIndex].title !== group.topic) throw new Error(`Unmapped source question: ${question.id}`);
    return {
      id: `quiz-${question.id}`, sourceId: question.id, topicId: topic.id, month: topic.month,
      group: question.page, question: question.question, answer: question.correctAnswer,
      options: [question.correctAnswer, ...question.distractors],
      explanation: topic.questions.find(item => item.question === question.question)?.deeper || '',
      code: topic.code, source: 'react_quiz_367_offline.html',
    };
  })),
  ...EXTRA_QUESTIONS,
];

// Mapping follows the 40 source groups, not a keyword guess at runtime.
const interviewTopicNumbers = [4,6,7,8,12,13,14,15,16,16,17,18,19,21,22,23,26,27,29,28,30,45,47,40,24,36,37,38,41,42,43,44,32,33,34,35,51,53,54,56];
export const INTERVIEW_QUESTIONS: LearningQuestion[] = interviewSource.flatMap((group, index) => {
  const topic = LEARNING_TOPICS.find(item => item.id === `topic-${interviewTopicNumbers[index]}`)!;
  return group.questions.map(question => ({
    ...question, topicId: topic.id, month: topic.month, group: topic.month, options: [],
    source: 'react-interview.html',
  }));
});

export const ALL_QUESTIONS = [...QUIZ_QUESTIONS, ...INTERVIEW_QUESTIONS];
export const MONTHS = [
  { id: 1, titleRu: 'Основы React', title: 'React fundamentals', descriptionRu: 'Компоненты, state, эффекты и маршруты', description: 'Components, state, effects and routing' },
  { id: 2, titleRu: 'Данные и приложения', title: 'Data & applications', descriptionRu: 'Общий state, формы, TypeScript и проекты', description: 'Shared state, forms, TypeScript and projects' },
  { id: 3, titleRu: 'Next.js и работа', title: 'Next.js & portfolio', descriptionRu: 'Сервер, авторизация, деплой и интервью', description: 'Server, authentication, deployment and interviews' },
];

const dayTopics: Record<string, string[]> = {
  'm1-w1-d1': ['topic-1','topic-3'], 'm1-w1-d2': ['topic-2','topic-4','topic-5','topic-6','topic-8'],
  'm1-w1-d3': ['topic-7','topic-9','topic-10','topic-11','topic-12','topic-13'], 'm1-w1-d4': ['topic-14'],
  'm1-w1-d5': ['local-practice'], 'm1-w2-d1': ['tooling'], 'm1-w2-d2': ['ui-libraries'],
  'm1-w2-d3': ['topic-16','topic-17','topic-18'], 'm1-w2-d4': ['topic-19','topic-20','topic-21'], 'm1-w2-d5': ['local-practice'],
  'm1-w3-d1': ['topic-31'], 'm1-w3-d2': ['topic-32'], 'm1-w3-d3': ['topic-33'], 'm1-w3-d4': ['topic-34'], 'm1-w3-d5': ['topic-35'],
  'm1-w4-d1': ['topic-22','topic-23'], 'm1-w4-d2': ['topic-24','topic-25'], 'm1-w4-d3': ['topic-15'],
  'm1-w4-d4': ['topic-26','topic-27','topic-28','topic-29','topic-30'], 'm1-w4-d5': ['local-persistence'],
  'm2-w1-d1': ['topic-36','topic-37'], 'm2-w1-d2': ['topic-38','topic-39'], 'm2-w1-d3': ['topic-40','topic-41','topic-42'],
  'm2-w1-d4': ['topic-43'], 'm2-w1-d5': ['topic-44'], 'm2-w2-d1': ['react-hook-form'], 'm2-w2-d2': ['formik'],
  'm2-w2-d3': ['typescript'], 'm2-w2-d4': ['data-fetching','topic-47'], 'm2-w2-d5': ['topic-48','topic-49'],
  'm2-w3-d1': ['topic-46','topic-50'], 'm2-w3-d2': ['auth-flow'],
  'm3-w1-d1': ['next-rendering'], 'm3-w1-d2': ['next-routing'], 'm3-w1-d3': ['next-components'], 'm3-w1-d4': ['next-data'], 'm3-w1-d5': ['next-blog'],
  'm3-w2-d1': ['next-api'], 'm3-w2-d2': ['next-auth'], 'm3-w2-d3': ['database'], 'm3-w2-d4': ['deployment'], 'm3-w2-d5': ['fullstack'],
  'm3-w3-d1': ['portfolio'], 'm3-w3-d2': ['portfolio'], 'm3-w3-d3': ['topic-56','topic-57','topic-60'],
  'm3-w3-d4': ['topic-51','topic-52','topic-53','topic-54'], 'm3-w3-d5': ['topic-58','topic-59','topic-78'],
  'm3-w4-d1': ['project-planning'], 'm3-w4-d2': ['fullstack'], 'm3-w4-d3': ['fullstack','typescript'],
  'm3-w4-d4': ['fullstack','topic-77'], 'm3-w4-d5': ['deployment','portfolio'],
};

const dayTitlesRu = [
  'Зачем React, JSX и архитектура','Компоненты, props и композиция','Render, state и useState','Как работают хуки','Todo, модалка, вкладки, счётчик, аккордеон',
  'Vite, сборщики, MUI и Antd','Shadcn, Headless UI и Tailwind','useEffect и очистка','Жизненный цикл и отладка','Практика эффектов',
  'Зачем маршруты: SPA и MPA','React Router: Link и NavLink','Динамические маршруты и params','Защищённые маршруты','Проект с маршрутизацией и lazy',
  'useRef: подробно','useReducer: действия и состояние','Свои хуки','memo, useMemo и useCallback','Тема, язык, слайдер и мини-проект',
  'Context API: подробно','Zustand: синхронные и async действия','Redux Toolkit: синхронный state','Redux: createAsyncThunk','Jotai: sync и async',
  'React Hook Form','Formik и Yup','TypeScript для React','Загрузка данных и ошибки','TanStack Query',
  'Структура файлов и API','Авторизация в приложении',
  'Next.js: SSR, CSR, SSG и ISR','App Router: layout, loading, error','Серверные и клиентские компоненты','Данные в Next.js','Блог и статические страницы',
  'Route Handlers: API','Авторизация с NextAuth','Prisma и SQLite','Vercel, переменные окружения и CI','Мини-проект с сервером',
  'Сайт-портфолио','Резюме и проверка проектов','Теория React для интервью','Задачи с написанием кода','Пробное интервью',
  'План проекта и архитектура','Каркас проекта','Функции, TypeScript и авторизация','Ошибки, загрузка и интерфейс','Деплой и презентация',
];
let dayNumber = 0;
export const CURRICULUM = roadmapSource.map(month => ({
  ...month,
  weeks: month.weeks.map(week => ({...week, days: week.days.map(day => ({
    ...day, titleRu: dayTitlesRu[dayNumber++], topicIds: dayTopics[day.id],
  }))})),
}));

export function getTopic(id: string) { return LEARNING_TOPICS.find(topic => topic.id === id); }
export function questionsForTopic(id: string) { return ALL_QUESTIONS.filter(question => question.topicId === id); }
export function topicTitle(topic: LearningTopic, language: 'ru' | 'en') { return language === 'ru' ? topic.titleRu : topic.title; }
