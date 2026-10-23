import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { CoursePractice } from '@/components/courses/course-practice';
import { emptyProgress } from '@/lib/account/progress';
import type { CourseLesson } from '@/lib/courses/schema';
import { useLearningStore } from '@/stores/learning-store';

const auth = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock('@/lib/supabase/client', () => ({ getSupabaseBrowserClient: () => ({ auth }) }));
vi.mock('@/components/learning/code-editor', () => ({
  CodeEditor: ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => <textarea aria-label={label} value={value} onChange={event => onChange(event.target.value)} />,
}));

const labels = [
  { locale:'ru', instructions:'Условие задания', verify:'Проверить решение', rubric:'У html указан язык lang', failed:'Исправьте отмеченные требования и проверьте ещё раз.', passed:'Все проверки пройдены. Практика сохранена.', verified:'Решение подтверждено сервером. XP начислен в защищённом журнале.', unavailable:'Серверная проверка недоступна. Учебный результат сохранён только локально; попробуйте позже.' },
  { locale:'tg', instructions:'Шарти супориш', verify:'Санҷидани ҳалли масъала', rubric:'Забони lang дар html навишта шудааст', failed:'Талаботи ишорашударо ислоҳ карда, боз санҷед.', passed:'Ҳамаи санҷишҳо гузаштанд. Практика сабт шуд.', verified:'Ҳалли масъала аз тарафи сервер тасдиқ шуд. XP дар сабти муҳофизатшуда нигоҳ дошта шуд.', unavailable:'Санҷиши серверӣ дастрас нест. Натиҷаи омӯзишӣ танҳо маҳаллӣ сабт шуд; баъдтар санҷед.' },
  { locale:'en', instructions:'Task instructions', verify:'Check solution', rubric:'Set the html lang attribute', failed:'Fix the highlighted requirements and try again.', passed:'All checks passed. Practice saved.', verified:'Server verified. XP recorded in the protected ledger.', unavailable:'Server assessment unavailable. Your learning result is local only; retry later.' },
  { locale:'uk', instructions:'Умова завдання', verify:'Перевірити розв’язання', rubric:'Для html указано мову lang', failed:'Виправте позначені вимоги й перевірте ще раз.', passed:'Усі перевірки пройдено. Практику збережено.', verified:'Розв’язання підтверджено сервером. XP нараховано в захищеному журналі.', unavailable:'Серверна перевірка недоступна. Навчальний результат збережено лише локально; спробуйте пізніше.' },
  { locale:'ja', instructions:'課題の説明', verify:'解答を確認', rubric:'htmlのlang属性に言語を指定する', failed:'指摘された項目を修正して、もう一度確認してください。', passed:'すべての確認項目を満たしました。演習を保存しました。', verified:'サーバーで解答を確認しました。保護された台帳にXPを記録しました。', unavailable:'サーバーで評価できませんでした。学習結果はローカルにのみ保存されています。後で再試行してください。' },
  { locale:'ko', instructions:'과제 설명', verify:'풀이 확인', rubric:'html의 lang 속성에 언어 지정', failed:'표시된 요구 사항을 수정하고 다시 확인하세요.', passed:'모든 확인 항목을 통과했습니다. 실습을 저장했습니다.', verified:'서버에서 풀이를 검증했습니다. 보호된 원장에 XP를 기록했습니다.', unavailable:'서버 평가를 이용할 수 없습니다. 학습 결과는 로컬에만 저장되었습니다. 나중에 다시 시도하세요.' },
] as const;
const text = (ru: string) => ({ ru, tg:'Тоҷикӣ', en:'English' });
const lesson: CourseLesson = {
  id:'html-day-01', day:1, title:text('Первый урок'), summary:text('Описание'), level:'beginner', sourceIds:['html-standard'], sections:[{ title:text('Разбор'), body:text('Объяснение') }], questions:[],
  practice:{ task:text('Авторское задание'), hint:text('Подсказка'), solution:'<h1>Пример</h1>', criteria:[text('Критерий')] },
};
const validCode = '<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Мой проект</title></head><body><main><h1>Привет</h1><p>Мой текст</p><a href="https://developer.mozilla.org/">Документация</a></main></body></html>';

beforeEach(() => {
  localStorage.clear();
  useLearningStore.setState({ ...emptyProgress(), ready:true, contentLanguage:'ru' });
  auth.getSession.mockResolvedValue({ data:{ session:{ access_token:'test-session-token' } }, error:null });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

it.each(labels)('$locale uses interface language for rubric and controls without translating authored content', async copy => {
  useLearningStore.setState({ language:copy.locale });
  useLearningStore.getState().saveCourseDraft('html',lesson.id,'<h1>Incomplete</h1>');
  render(<CoursePractice courseId="html" lesson={lesson} />);
  expect(screen.getByText(copy.instructions)).toBeVisible();
  expect(screen.getByText(copy.rubric)).toBeVisible();
  expect(screen.getByText('Авторское задание')).toBeVisible();
  fireEvent.click(screen.getByRole('button',{ name:copy.verify }));
  expect(await screen.findByRole('status')).toHaveTextContent(copy.failed);
  expect(auth.getSession).not.toHaveBeenCalled();
  expect(useLearningStore.getState().contentLanguage).toBe('ru');
});

it.each(labels)('$locale localizes successful server assessment status', async copy => {
  useLearningStore.setState({ language:copy.locale });
  useLearningStore.getState().saveCourseDraft('html',lesson.id,validCode);
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ ok:true,json:async () => ({ verified:true,passed:true }) }));
  render(<CoursePractice courseId="html" lesson={lesson} />);
  fireEvent.click(screen.getByRole('button',{ name:copy.verify }));
  expect(await screen.findByText(copy.verified)).toBeVisible();
  expect(screen.getByText(copy.passed)).toBeVisible();
});

it.each(labels)('$locale localizes unavailable server status without losing the local result', async copy => {
  useLearningStore.setState({ language:copy.locale });
  useLearningStore.getState().saveCourseDraft('html',lesson.id,validCode);
  vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new TypeError('offline')));
  render(<CoursePractice courseId="html" lesson={lesson} />);
  fireEvent.click(screen.getByRole('button',{ name:copy.verify }));
  expect(await screen.findByText(copy.unavailable)).toBeVisible();
  expect(screen.getByText(copy.passed)).toBeVisible();
});

it('updates existing diagnostics on interface-language change and preserves the draft', async () => {
  useLearningStore.setState({ language:'en' });
  useLearningStore.getState().saveCourseDraft('html',lesson.id,'<h1>My draft</h1>');
  render(<CoursePractice courseId="html" lesson={lesson} />);
  fireEvent.click(screen.getByRole('button',{ name:'Check solution' }));
  expect(await screen.findByRole('status')).toHaveTextContent(labels[2].failed);
  act(() => useLearningStore.getState().setPreferences({ language:'ja' }));
  expect(screen.getByRole('button',{ name:'解答を確認' })).toBeVisible();
  expect(screen.getByText(labels[4].rubric)).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent(labels[4].failed);
  expect(useLearningStore.getState().courses.html?.drafts[lesson.id]).toBe('<h1>My draft</h1>');
  expect(useLearningStore.getState().contentLanguage).toBe('ru');
});
