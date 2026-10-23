'use client';

import { useState } from 'react';
import { CheckCircle2, Eye, FileCode2, Play } from 'lucide-react';
import { COURSE_CATALOG } from '@/content/courses/catalog';
import { CodeEditor } from '@/components/learning/code-editor';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import { LEARNING_UI_COPY } from '@/lib/learning-ui-copy';
import { courseText, type CourseLesson } from '@/lib/courses/schema';
import type { ImportedCourseId } from '@/lib/courses/ids';
import type { InterfaceLocale } from '@/lib/locale';
import { gradeHtmlDocument, safeHtmlPreview, HTML_CHECK_IDS, type HtmlCheck } from '@/lib/grading/html-grader';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { PracticeSubmissionResult } from '@/lib/practice/types';

type HtmlCheckId = typeof HTML_CHECK_IDS[number];
const RUBRIC: Record<InterfaceLocale, Record<HtmlCheckId, string>> = {
  ru: { doctype: 'Объявлен документ HTML: <!doctype html>', language: 'У html указан язык lang', encoding: 'Указана кодировка UTF-8', viewport: 'Добавлен viewport с width=device-width', title: 'У страницы есть непустой title', heading: 'В main есть непустой заголовок h1', paragraph: 'В main есть абзац p с вашим текстом', link: 'Есть непустая ссылка на документацию с HTTPS' },
  tg: { doctype: 'Ҳуҷҷати HTML эълон шудааст: <!doctype html>', language: 'Забони lang дар html навишта шудааст', encoding: 'Рамзгузории UTF-8 нишон дода шудааст', viewport: 'Viewport дорои width=device-width аст', title: 'Саҳифа title-и холӣ надорад', heading: 'Дар main сарлавҳаи h1 ҳаст', paragraph: 'Дар main матни шумо дар p ҳаст', link: 'Пайванди HTTPS ба ҳуҷҷатҳо ҳаст' },
  en: { doctype: 'Declare an HTML document: <!doctype html>', language: 'Set the html lang attribute', encoding: 'Declare UTF-8 encoding', viewport: 'Add a viewport with width=device-width', title: 'Give the page a nonempty title', heading: 'Add a nonempty h1 inside main', paragraph: 'Add your own paragraph inside main', link: 'Add a meaningful HTTPS documentation link' },
  uk: { doctype: 'Оголошено документ HTML: <!doctype html>', language: 'Для html указано мову lang', encoding: 'Указано кодування UTF-8', viewport: 'Додано viewport із width=device-width', title: 'Сторінка має непорожній title', heading: 'У main є непорожній заголовок h1', paragraph: 'У main є абзац p з вашим текстом', link: 'Є змістовне HTTPS-посилання на документацію' },
  ja: { doctype: 'HTML文書を宣言する：<!doctype html>', language: 'htmlのlang属性に言語を指定する', encoding: '文字コードUTF-8を指定する', viewport: 'viewportにwidth=device-widthを指定する', title: 'ページに空でないtitleを付ける', heading: 'main内に空でないh1見出しを置く', paragraph: 'main内のp要素に自分の文章を書く', link: '説明文のあるHTTPSのドキュメントリンクを追加する' },
  ko: { doctype: 'HTML 문서 선언: <!doctype html>', language: 'html의 lang 속성에 언어 지정', encoding: 'UTF-8 문자 인코딩 지정', viewport: 'viewport에 width=device-width 추가', title: '비어 있지 않은 페이지 title 작성', heading: 'main 안에 비어 있지 않은 h1 제목 추가', paragraph: 'main 안의 p 요소에 내 문장 작성', link: '설명 텍스트가 있는 HTTPS 문서 링크 추가' },
};


type PracticeCopy = Record<'instructions' | 'verify' | 'passed' | 'failed' | 'note' | 'local' | 'serverVerified' | 'serverUnavailable', string>;
const PRACTICE_COPY: Record<InterfaceLocale, PracticeCopy> = {
  ru: {
    instructions: 'Условие задания', verify: 'Проверить решение', passed: 'Все проверки пройдены. Практика сохранена.', failed: 'Исправьте отмеченные требования и проверьте ещё раз.',
    note: 'Проверяем структуру страницы, а не совпадение с примером. Ваши слова и оформление могут отличаться.', local: 'Учебная проверка в браузере. Это не серверная аттестация.',
    serverVerified: 'Решение подтверждено сервером. XP начислен в защищённом журнале.', serverUnavailable: 'Серверная проверка недоступна. Учебный результат сохранён только локально; попробуйте позже.',
  },
  tg: {
    instructions: 'Шарти супориш', verify: 'Санҷидани ҳалли масъала', passed: 'Ҳамаи санҷишҳо гузаштанд. Практика сабт шуд.', failed: 'Талаботи ишорашударо ислоҳ карда, боз санҷед.',
    note: 'Сохтори саҳифа санҷида мешавад, на монандии код ба мисол. Матн ва ороиш метавонанд дигар бошанд.', local: 'Санҷиши омӯзишӣ дар браузер. Ин аттестатсияи серверӣ нест.',
    serverVerified: 'Ҳалли масъала аз тарафи сервер тасдиқ шуд. XP дар сабти муҳофизатшуда нигоҳ дошта шуд.', serverUnavailable: 'Санҷиши серверӣ дастрас нест. Натиҷаи омӯзишӣ танҳо маҳаллӣ сабт шуд; баъдтар санҷед.',
  },
  en: {
    instructions: 'Task instructions', verify: 'Check solution', passed: 'All checks passed. Practice saved.', failed: 'Fix the highlighted requirements and try again.',
    note: 'We check document structure, not a match with the reference. Your wording and styling may differ.', local: 'Learning check in your browser, not a server-verified assessment.',
    serverVerified: 'Server verified. XP recorded in the protected ledger.', serverUnavailable: 'Server assessment unavailable. Your learning result is local only; retry later.',
  },
  uk: {
    instructions: 'Умова завдання', verify: 'Перевірити розв’язання', passed: 'Усі перевірки пройдено. Практику збережено.', failed: 'Виправте позначені вимоги й перевірте ще раз.',
    note: 'Перевіряємо структуру сторінки, а не збіг із прикладом. Ваші слова й оформлення можуть відрізнятися.', local: 'Навчальна перевірка в браузері. Це не серверне оцінювання.',
    serverVerified: 'Розв’язання підтверджено сервером. XP нараховано в захищеному журналі.', serverUnavailable: 'Серверна перевірка недоступна. Навчальний результат збережено лише локально; спробуйте пізніше.',
  },
  ja: {
    instructions: '課題の説明', verify: '解答を確認', passed: 'すべての確認項目を満たしました。演習を保存しました。', failed: '指摘された項目を修正して、もう一度確認してください。',
    note: '解答例との一致ではなく、ページの構造を確認します。文章や見た目は異なっていても構いません。', local: 'ブラウザー内の学習用チェックです。サーバーによる評価ではありません。',
    serverVerified: 'サーバーで解答を確認しました。保護された台帳にXPを記録しました。', serverUnavailable: 'サーバーで評価できませんでした。学習結果はローカルにのみ保存されています。後で再試行してください。',
  },
  ko: {
    instructions: '과제 설명', verify: '풀이 확인', passed: '모든 확인 항목을 통과했습니다. 실습을 저장했습니다.', failed: '표시된 요구 사항을 수정하고 다시 확인하세요.',
    note: '예시와의 일치 여부가 아닌 페이지 구조를 확인합니다. 문장이나 디자인은 달라도 됩니다.', local: '브라우저 내 학습용 확인입니다. 서버에서 검증한 평가는 아닙니다.',
    serverVerified: '서버에서 풀이를 검증했습니다. 보호된 원장에 XP를 기록했습니다.', serverUnavailable: '서버 평가를 이용할 수 없습니다. 학습 결과는 로컬에만 저장되었습니다. 나중에 다시 시도하세요.',
  },
};

export function CoursePractice({ courseId, lesson }: { courseId: ImportedCourseId; lesson: CourseLesson }) {
  const state = useLearningStore();
  const copy = COPY[state.language], ui = LEARNING_UI_COPY[state.language], practice = lesson.practice!;
  const [checks, setChecks] = useState<number[]>([]);
  const [results, setResults] = useState<HtmlCheck[] | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverStatus, setServerStatus] = useState<'verified' | 'unavailable' | null>(null);
  const code = state.courses[courseId]?.drafts[lesson.id] ?? '';
  const completed = state.courses[courseId]?.completedPractice.includes(lesson.id);
  const automatic = courseId === 'html' && lesson.id === 'html-day-01';
  const written=practice.kind==='written';
  const language = COURSE_CATALOG.find(course=>course.id===courseId)?.editorLanguage ?? 'typescript';
  const filenames: Record<string, string> = { html:'index.html',css:'styles.css',cpp:'main.cpp',python:'main.py',shell:'commands.sh',java:'Main.java',csharp:'Program.cs',go:'main.go',rust:'main.rs',php:'main.php',ruby:'main.rb',sql:'lesson.sql',javascript:'solution.js',swift:'main.swift',kotlin:'Main.kt' };
  const filename = courseId==='nodejs'?'main.mjs':courseId==='mongodb'?'main.js':courseId==='bash'?'main.sh':filenames[language] ?? 'solution.ts';
  const rubric = RUBRIC[state.language];
  const labels = PRACTICE_COPY[state.language];

  function update(value: string) {
    state.saveCourseDraft(courseId, lesson.id, value);
    setResults(null);
    setServerStatus(null);
  }
  async function verify() {
    const storageName = useLearningStore.persist.getOptions().name;
    const current = () => useLearningStore.persist.getOptions().name === storageName && useLearningStore.getState().courses[courseId]?.drafts[lesson.id] === code;
    const next = gradeHtmlDocument(code);
    setResults(next);
    setPreview(code);
    setServerStatus(null);
    if (!next.every(check => check.passed)) return;
    state.completeCoursePractice(courseId, lesson.id, true);
    const client = getSupabaseBrowserClient();
    if (!client) return;
    setSubmitting(true);
    try {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      if (!data.session) return;
      const response = await fetch('/api/practice/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + data.session.access_token }, body: JSON.stringify({ courseId, lessonId: lesson.id, code }), signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error('Server assessment unavailable');
      const result: PracticeSubmissionResult = await response.json();
      if (result.verified !== true || !result.passed) throw new Error('Server assessment did not pass');
      if (current()) setServerStatus('verified');
    } catch { if (current()) setServerStatus('unavailable'); }
    finally { setSubmitting(false); }
  }

  return <div className="course-practice-studio">
    <details className="practice-instructions" open><summary>{labels.instructions}</summary><p className="preserve-lines">{courseText(practice.task, state.contentLanguage)}</p><details><summary>{copy.hint}</summary><p>{courseText(practice.hint, state.contentLanguage)}</p></details></details>
    {written?<div className="written-practice"><label htmlFor={lesson.id+'-answer'}>{copy.yourAnswer}</label><textarea id={lesson.id+'-answer'} rows={10} value={code} onChange={event=>update(event.target.value)} maxLength={100000}/><p className="small muted">{copy.saved}</p></div>:<div className="editor-panel"><div className="editor-header"><span><FileCode2 size={16} />{filename}</span><span>{language}</span></div>
      <CodeEditor path={courseId + '/' + lesson.id + '/' + filename} language={language} label={ui.yourCode} value={code} onChange={update} />
      <div className="editor-footer"><span>{copy.saved}</span><div className="button-row">{courseId === 'html' && <button className="button subtle" disabled={!code.trim()} onClick={() => setPreview(code)}><Eye size={16} />{ui.showHtml}</button>}{automatic && <button className="button primary" disabled={!code.trim() || submitting} onClick={verify}><Play size={16} />{submitting ? copy.loading : labels.verify}</button>}</div></div>
    </div>}
    {courseId === 'html' && preview !== null && <iframe title={ui.htmlResult} className="html-preview" sandbox="" referrerPolicy="no-referrer" srcDoc={safeHtmlPreview(preview)} />}
    {automatic ? <section className="practice-validation" aria-live="polite"><p className="small muted">{labels.note}</p><ul>{(results ?? HTML_CHECK_IDS.map(id => ({ id, passed: false }))).map(check => <li key={check.id} className={results ? check.passed ? 'success-text' : 'warning-text' : ''}><span aria-hidden="true">{results ? check.passed ? '✓' : '×' : '○'}</span> {rubric[check.id as HtmlCheckId]}</li>)}</ul>{results && <p role="status">{results.every(check => check.passed) ? labels.passed : labels.failed}</p>}<p className="small muted">{labels.local}</p></section> : <section className="practice-validation"><p>{copy.manualHint}</p>{practice.criteria.map((criterion, index) => <label className="course-criterion" key={index}><input type="checkbox" checked={!!completed || checks.includes(index)} disabled={completed} onChange={event => setChecks(event.target.checked ? [...checks, index] : checks.filter(value => value !== index))} />{courseText(criterion, state.contentLanguage)}</label>)}<button className="button subtle" disabled={completed || !code.trim() || checks.length !== practice.criteria.length} onClick={() => state.completeCoursePractice(courseId, lesson.id)}><CheckCircle2 size={16} />{completed ? copy.completed : copy.manual}</button></section>}
    <details className="solution"><summary>{copy.solution}</summary>{written?<p className="preserve-lines">{practice.referenceAnswer?courseText(practice.referenceAnswer,state.contentLanguage):practice.solution}</p>:<pre><code>{practice.solution}</code></pre>}</details>
    {serverStatus && <p role="status" className={serverStatus === 'verified' ? 'success-text' : 'warning-text'}>{serverStatus === 'verified' ? labels.serverVerified : labels.serverUnavailable}</p>}
  </div>;
}
