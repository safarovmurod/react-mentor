import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CourseWorkspace } from '@/components/courses/course-workspace';
import { AssessmentHub } from '@/components/learning/assessment-hub';
import { TutorDrawer } from '@/components/layout/tutor-drawer';
import { QuestionAnswer } from '@/components/learning/question-answer';
import { ALL_QUESTIONS } from '@/content/course';
import { emptyProgress } from '@/lib/account/progress';
import type { CourseContent } from '@/lib/courses/schema';
import { useLearningStore } from '@/stores/learning-store';
import { useAppStore } from '@/stores/app-store';

vi.mock('@/components/account/account-provider', () => ({ useAccount: () => ({ user: null }) }));
vi.mock('@/lib/supabase/client', () => ({ getSupabaseBrowserClient: () => null }));
vi.mock('@/components/learning/study-session', () => ({ StudySession: () => <div data-testid="study-session" /> }));
vi.mock('@/components/learning/session-hub', () => ({ SessionHub: () => <div data-testid="session-hub" /> }));

const locales = [
  { locale: 'ru', heading: 'Тесты и интервью', tests: 'Тесты', interview: 'Интервью', answers: 'Ответы и интервью',
    code: 'Ваш код', preview: 'Показать HTML + CSS', result: 'Результат вашего HTML + CSS',
    send: 'Отправить', close: 'Закрыть Tutor', question: 'Вопрос к Tutor', login: 'Вход / регистрация',
    loadError: 'Не удалось загрузить курс.', retry: 'Повторить', aiError: 'Для вопроса к AI войдите через Google или email.' },
  { locale: 'en', heading: 'Tests & interview', tests: 'Tests', interview: 'Interview', answers: 'Answers & interview',
    code: 'Your code', preview: 'Preview HTML + CSS', result: 'Your HTML + CSS result',
    send: 'Send', close: 'Close Tutor', question: 'Question for Tutor', login: 'Sign in / register',
    loadError: 'Could not load the course.', retry: 'Retry', aiError: 'Sign in with Google or email to ask AI a question.' },
  { locale: 'tg', heading: 'Санҷишҳо ва мусоҳиба', tests: 'Санҷишҳо', interview: 'Мусоҳиба', answers: 'Ҷавобҳо ва мусоҳиба',
    code: 'Коди шумо', preview: 'Нишон додани HTML + CSS', result: 'Натиҷаи HTML + CSS-и шумо',
    send: 'Фиристодан', close: 'Пӯшидани Tutor', question: 'Савол ба Tutor', login: 'Воридшавӣ / регистрация',
    loadError: 'Курс бор карда нашуд.', retry: 'Аз нав кӯшиш кунед', aiError: 'Барои саволи AI бо Google ё email ба аккаунт ворид шавед.' },
  { locale: 'uk', heading: 'Тести та співбесіда', tests: 'Тести', interview: 'Співбесіда', answers: 'Відповіді та співбесіда',
    code: 'Ваш код', preview: 'Показати HTML + CSS', result: 'Результат вашого HTML + CSS',
    send: 'Надіслати', close: 'Закрити Tutor', question: 'Питання до Tutor', login: 'Вхід / реєстрація',
    loadError: 'Не вдалося завантажити курс.', retry: 'Спробувати знову', aiError: 'Для питання до AI увійдіть через Google або email.' },
] as const;
const text = (ru: string) => ({ ru, tg: 'Тоҷикӣ: ' + ru, en: 'English: ' + ru });
const content: CourseContent = {
  courseId: 'html', sources: [{ id: 'source-1', title: 'Source', url: 'https://example.com/course' }], files: [],
  lessons: [{ id: 'lesson-1', day: 0, title: text('Русский урок'), summary: text('Описание урока'), level: 'beginner', sourceIds: ['source-1'],
    sections: [{ title: text('Объяснение'), body: text('Авторский текст') }],
    questions: [{ id: 'question-1', question: text('Вопрос курса'), answer: text('Ответ курса'), options: [text('Да'), text('Нет')], correctIndex: 0 }],
    practice: { task: text('Русское задание'), hint: text('Подсказка курса'), solution: '<h1>Hello</h1>', criteria: [text('Заголовок виден')] } }],
};

beforeEach(() => {
  localStorage.clear();
  window.location.hash = '';
  useLearningStore.setState({ ...emptyProgress(), ready: true, contentLanguage: 'ru', selectedCourse: 'html', courseChosen: true });
  useAppStore.setState({ tutorDrawerOpen: false, tutorQuestion: null });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe.each(locales)('$locale learning interface', labels => {
  beforeEach(() => useLearningStore.setState({ language: labels.locale }));

  it('renders localized assessment headings and preserves both session modes', () => {
    const result = render(<AssessmentHub params={{}} />);
    expect(screen.getByRole('heading', { name: labels.heading, level: 1 })).toBeVisible();
    expect(screen.getByRole('region', { name: labels.tests })).toContainElement(screen.getByRole('heading', { name: '1. ' + labels.tests }));
    expect(screen.getByRole('region', { name: labels.interview })).toContainElement(screen.getByRole('heading', { name: '2. ' + labels.interview }));
    expect(screen.getByRole('link', { name: labels.answers })).toHaveAttribute('href', '/answers');
    expect(screen.getAllByTestId('session-hub')).toHaveLength(2);
    result.rerender(<AssessmentHub params={{ topic: 'topic-1' }} />);
    expect(screen.getAllByTestId('study-session')).toHaveLength(2);
  });

  it('localizes practice controls while preserving authored material and saved code', () => {
    render(<CourseWorkspace courseId="html" section="practice" initialContent={content} day={0} />);
    expect(screen.getByRole('heading', { name: 'Русский урок' })).toBeVisible();
    expect(screen.getByText('Русское задание')).toBeVisible();
    fireEvent.change(screen.getByLabelText(labels.code), { target: { value: '<h1>Saved work</h1>' } });
    fireEvent.click(screen.getByRole('button', { name: labels.preview }));
    expect(screen.getByTitle(labels.result)).toHaveAttribute('srcdoc', '<h1>Saved work</h1>');
    expect(screen.getByTitle(labels.result)).toHaveAttribute('sandbox', '');
    expect(useLearningStore.getState().courses.html?.drafts['lesson-1']).toBe('<h1>Saved work</h1>');
    expect(useLearningStore.getState().contentLanguage).toBe('ru');
  });

  it('localizes course loading failures and successfully retries', async () => {
    const fetcher = vi.fn().mockRejectedValueOnce(new TypeError('offline')).mockResolvedValueOnce({ ok: true, json: async () => content });
    vi.stubGlobal('fetch', fetcher);
    render(<CourseWorkspace courseId="html" section="practice" day={0} />);
    expect(await screen.findByRole('alert')).toHaveTextContent(labels.loadError);
    fireEvent.click(screen.getByRole('button', { name: labels.retry }));
    await screen.findByLabelText(labels.code);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('localizes Tutor controls and errors while requesting the independent content language', async () => {
    useLearningStore.setState({ contentLanguage: 'en', selectedCourse: 'react' });
    useAppStore.setState({ tutorDrawerOpen: true });
    const fetcher = vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({ error: 'Барои саволи AI бо Google ё email ба аккаунт ворид шавед.' }) });
    vi.stubGlobal('fetch', fetcher);
    render(<TutorDrawer />);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('link', { name: labels.login })).toHaveAttribute('href', '/login');
    expect(within(dialog).getByLabelText(labels.question)).toHaveFocus();
    fireEvent.click(within(dialog).getByRole('button', { name: 'useState?' }));
    expect(within(dialog).getByLabelText(labels.question)).toHaveValue('What is useState for?');
    fireEvent.click(within(dialog).getByRole('button', { name: labels.send }));
    await screen.findByText(labels.aiError);
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toMatchObject({ language: 'en', userText: 'What is useState for?' });
    expect(within(dialog).getByLabelText(labels.question)).toBeEnabled();
    fireEvent.click(within(dialog).getByRole('button', { name: labels.close }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('uses the interface language for a lesson Tutor button and keeps its Tajik question context', () => {
    useLearningStore.setState({ contentLanguage: 'tg' });
    const question = ALL_QUESTIONS[0];
    const deepLabels = { ru: 'Объясни подробнее', en: 'Explain more', tg: 'Чуқур фаҳмон', uk: 'Поясни докладніше' };
    render(<QuestionAnswer question={question} />);
    expect(screen.getByText(question.answer)).toBeVisible();
    const button = screen.getByRole('button', { name: deepLabels[labels.locale] });
    expect(button).toHaveAttribute('lang', labels.locale);
    fireEvent.click(button);
    expect(useAppStore.getState()).toMatchObject({ tutorDrawerOpen: true, tutorQuestion: { id: question.id, text: question.question } });
  });
});

it('reacts to interface locale changes without discarding the practice draft or changing content', () => {
  render(<CourseWorkspace courseId="html" section="practice" initialContent={content} day={0} />);
  fireEvent.change(screen.getByLabelText('Ваш код'), { target: { value: '<h1>Keep me</h1>' } });
  act(() => useLearningStore.getState().setPreferences({ language: 'uk' }));
  expect(screen.getByRole('button', { name: 'Показати HTML + CSS' })).toBeVisible();
  expect(screen.getByLabelText('Ваш код')).toHaveValue('<h1>Keep me</h1>');
  expect(screen.getByRole('heading', { name: 'Русский урок' })).toBeVisible();
  expect(useLearningStore.getState().contentLanguage).toBe('ru');
});

it('clearly identifies Russian fallback for an untranslated English lesson in a Ukrainian interface', () => {
  useLearningStore.setState({ language: 'uk', contentLanguage: 'en' });
  const untranslated = structuredClone(content);
  delete untranslated.lessons[0].title.en;
  render(<CourseWorkspace courseId="html" section="home" initialContent={untranslated} day={0} />);
  expect(screen.getByRole('heading', { name: 'Русский урок' })).toBeVisible();
  expect(screen.getByRole('note')).toHaveTextContent('Деякі матеріали не перекладені обраною мовою навчання та показані російською.');
  expect(useLearningStore.getState().contentLanguage).toBe('en');
});

it('keeps the existing Russian-only preparation text and identifies its language', () => {
  useLearningStore.setState({ language: 'en', contentLanguage: 'tg', selectedCourse: 'css' });
  render(<CourseWorkspace courseId="css" section="home" initialContent={{ ...content, courseId: 'css' }} day={0} />);
  expect(screen.getByRole('heading', { name: 'Введение в CSS' })).toHaveAttribute('lang', 'ru');
  expect(screen.getByRole('note')).toHaveTextContent('The preparation material is currently available only in Russian.');
  expect(screen.getByRole('link', { name: 'Go to day 1' })).toHaveAttribute('href', '/courses/css/home?day=1');
});

it('updates Tutor chrome and prior errors when locale changes, preserving successful replies and history', async () => {
  useLearningStore.setState({ contentLanguage: 'tg', selectedCourse: 'react' });
  useAppStore.setState({ tutorDrawerOpen: true });
  const fetcher = vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ mode: 'local', reply: 'Ҷавоби аслии тоҷикӣ', usage: { totalTokens: 0 } }) })
    .mockResolvedValueOnce({ ok: false, status: 429, json: async () => ({ error: 'Лимит ё токенҳои AnyModel тамом шуданд. Ҳисоби провайдерро санҷед.' }) });
  vi.stubGlobal('fetch', fetcher);
  render(<TutorDrawer />);
  fireEvent.change(screen.getByLabelText('Вопрос к Tutor'), { target: { value: 'useState?' } });
  fireEvent.click(screen.getByRole('button', { name: 'Отправить' }));
  await screen.findByText('Ҷавоби аслии тоҷикӣ');
  fireEvent.click(screen.getByRole('button', { name: 'Объясни подробнее' }));
  await screen.findByText('Лимит или токены AnyModel закончились. Проверьте аккаунт провайдера.');
  expect(JSON.parse(fetcher.mock.calls[1][1].body)).toMatchObject({ language: 'tg', isDeep: true, userText: 'useState?', history: [
    { role: 'user', content: 'useState?' }, { role: 'assistant', content: 'Ҷавоби аслии тоҷикӣ' },
  ] });
  act(() => useLearningStore.getState().setPreferences({ language: 'en' }));
  expect(screen.getByText('The AnyModel limit or tokens have run out. Check the provider account.')).toBeVisible();
  expect(screen.getByText('Ҷавоби аслии тоҷикӣ')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Send' })).toBeVisible();
  expect(screen.getByText(/Hello! We first look for an answer/)).toBeVisible();
  await waitFor(() => expect(screen.getByLabelText('Question for Tutor')).toBeEnabled());
});
