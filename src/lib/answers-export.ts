import { ANSWER_COUNT, ANSWER_SOURCES, ANSWER_TOPICS, type AnswerTopic } from '@/content/answers';

export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
const paragraph = (value: string) => `<p>${escapeHtml(value)}</p>`;
const code = (value: string) => `<pre><code>${escapeHtml(value)}</code></pre>`;
const flow = (steps: string[]) => `<ol class="flow">${steps.map(step => `<li>${escapeHtml(step)}</li>`).join('')}</ol>`;
function renderTopic(topic: AnswerTopic) {
  return `<article id="${topic.id}"><a href="#contents">↑ Оглавление</a><h2>${escapeHtml(topic.title)}</h2><p class="muted">${escapeHtml(topic.chapter)} · ${topic.sources.includes('deep') ? 'Deep — рекомендуется' : 'Interview'}</p>
    ${topic.context ? '<h3>Контекст задачи</h3>' + paragraph(topic.context) : ''}
    ${topic.flow.length ? '<h3>Как это работает · Роҳи кор</h3>' + flow(topic.flow) : ''}
    ${topic.explanation.map(section => `<h3>${escapeHtml(section.title)}</h3>${paragraph(section.text)}`).join('')}
    ${topic.code.map(code).join('')}
    ${topic.questions.map((question, index) => `<section id="${question.id}" class="question"><h3>${index + 1}. ${escapeHtml(question.question)}</h3><h4>Ҷавоб · Ответ</h4>${paragraph(question.answer)}
      ${question.deeper.length ? `<h4>${escapeHtml(question.deeperTitle)}</h4><ul>${question.deeper.map(point => `<li>${escapeHtml(point)}</li>`).join('')}</ul>` : ''}
      ${question.codeLabel ? '<h4>' + escapeHtml(question.codeLabel) + '</h4>' : ''}${question.code.map(code).join('')}
      ${question.explanation ? '<h4>Что произошло и почему</h4>' + paragraph(question.explanation) : ''}
      ${question.diagrams.map(diagram => `<h4>${escapeHtml(diagram.title)}</h4>${flow(diagram.steps)}`).join('')}</section>`).join('')}
    <p class="muted">Источник: ${escapeHtml(topic.sources.map(id => ANSWER_SOURCES.find(source => source.id === id)!.name).join(' + '))} · ${escapeHtml(topic.sourceId)}</p></article>`;
}

/** A standalone reading document: escaped source text, no scripts or remote assets. */
export function exportAnswersHtml() {
  return `<!doctype html><html lang="tg"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>ReactMentor — все ответы</title><style>
    :root{color-scheme:light dark}body{max-width:1000px;margin:auto;padding:24px;font:17px/1.7 system-ui,sans-serif}a{color:#6753e8}h1,h2,h3,h4{line-height:1.35}h2{font-size:28px}h3{font-size:21px}h4{font-size:17px}article{border-top:2px solid #aaa;padding:32px 0;scroll-margin-top:24px}.question{padding:20px 0;border-top:1px solid #aaa;break-inside:avoid}p{white-space:pre-wrap;overflow-wrap:anywhere}pre{padding:20px;background:#151b2b;color:#e3e8ff;overflow:auto;border-radius:12px;font:14px/1.7 ui-monospace,monospace;white-space:pre;tab-size:2}.flow{display:flex;flex-wrap:wrap;gap:12px;padding-left:24px}.flow li{padding:8px 16px;margin-right:16px;border:1px solid #aaa;border-radius:8px}.muted{font-size:14px}nav li{margin:8px 0}@media print{body{max-width:none;font-size:12pt}pre{white-space:pre-wrap;overflow-wrap:anywhere}nav{break-after:page}a{color:inherit}}
    </style></head><body><header><h1>ReactMentor · Ответы</h1><p>${ANSWER_COUNT} саволу ҷавоб · 119 разделов · 3 источника. Оригинальные объяснения на тоҷикӣ. Deep understanding — рекомендуется.</p><p>Одинаковые 367 вопросов из deep и quiz объединены; ещё 106 вопросов — из interview. Все ответы, код и схемы можно читать без интернета.</p></header><nav id="contents"><h2>Оглавление</h2>${[1,2,3].map(group => `<h3>Группа ${group}</h3><ul>${ANSWER_TOPICS.filter(topic => topic.group === group).map(topic => `<li><a href="#${topic.id}">${escapeHtml(topic.title)}</a> · ${topic.sources.includes('deep') ? 'Deep' : 'Interview'} · ${topic.questions.length}</li>`).join('')}</ul>`).join('')}</nav><main>${ANSWER_TOPICS.map(renderTopic).join('')}</main><footer><h2>Исходные файлы</h2>${ANSWER_SOURCES.map(source => paragraph(source.name + ' · SHA-256: ' + source.sha256)).join('')}</footer></body></html>`;
}
