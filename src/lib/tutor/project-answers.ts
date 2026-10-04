import { ALL_QUESTIONS, LEARNING_TOPICS, type LearningQuestion, type LearningTopic } from '@/content/course';
import { tr, type ContentLanguage } from '@/lib/translate';
import type { TutorSource } from './shared';

// Search and answers use the same authored data as the quiz and interview UI.
// This is deterministic retrieval, not a local language model.
const topics = new Map(LEARNING_TOPICS.map(topic => [topic.id, topic]));
const aliases: Record<string, string> = {
  реакт: 'react', стейт: 'state', состояние: 'state', состояния: 'state',
  пропс: 'props', пропсы: 'props', свойства: 'props',
  компонент: 'component', компоненты: 'component', компонента: 'component', компонентхо: 'component',
  рендер: 'render', ререндер: 'rerender', контекст: 'context',
  юзстейт: 'usestate', юзэффект: 'useeffect',
};
const stopWords = new Set(`чӣ чи чияй чист чиба чихе чихел хел барои чаро чихелай даркор даркорай аст ай аз дар ба бо ва ё е ин ҳамин хамин хами ҳаму хаму мо ту ман кор мекунад мекна мекуна шуда мешавад шавад чӣтавр чукур чуқур чуқуртар фаҳмон фахмон фаҳмона фахмона шарҳ шарх савол саволи пешинаро қадам кадам намекунад намекна як ягон
сода фаҳмо фахмо чотка пурра хеле чукуртар чукурфахмон чуқурфаҳмон мисол намуна
what why how when where which does do is are can to for a an the in of and or with explain more deeper expand previous question step by
please simple simply example terms words
что как зачем почему для чего это работает такое такой такая объясни объяснить подробнее глубже пожалуйста простыми словами расскажи поподробнее в во на и или из по с со не ли`.split(/\s+/));

function words(text: string): string[] {
  return (text.normalize('NFKC').toLowerCase().replaceAll('ё', 'е').replace(/re[-\s]render/g, 'rerender').match(/[\p{L}\p{N}]+/gu) || []).map(word => aliases[word] || word);
}
function normalized(text: string) {
  // Preserve code syntax: useEffect(fn), useEffect(fn, []) and
  // useEffect(fn, [value]) must never collapse into the same question.
  return text.normalize('NFKC').toLowerCase().replaceAll('ё', 'е').replaceAll('`', '')
    .replace(/\s+/g, ' ').trim().replace(/[?!.]+$/g, '')
    .replace(/\s*([^\p{L}\p{N}\s])\s*/gu, '$1');
}
function terms(text: string) { return [...new Set(words(text).filter(word => word.length >= 3 && !stopWords.has(word)))]; }

const entries: LearningQuestion[] = [...ALL_QUESTIONS];
const originalTexts = new Set(entries.map(question => normalized(question.question)));
for (const topic of LEARNING_TOPICS) {
  topic.questions.forEach((question, index) => {
    if (originalTexts.has(normalized(question.question))) return;
    entries.push({
      id: 'course:' + topic.id + ':' + index, sourceId: 'deep-' + (index + 1),
      topicId: topic.id, month: topic.month, group: topic.month,
      question: question.question, answer: question.answer, explanation: question.deeper,
      code: topic.code, options: [], source: topic.source,
    });
  });
}
const byId = new Map(entries.map(entry => [entry.id, entry]));
const exact = new Map<string, LearningQuestion>();
const indexed = entries.map(question => {
  const topic = topics.get(question.topicId);
  const variants = [question.question, tr(question.question, 'ru'), tr(question.question, 'en')];
  for (const variant of variants) if (!exact.has(normalized(variant))) exact.set(normalized(variant), question);
  const title = topic ? topic.title + ' ' + topic.titleRu + ' ' + ((topic as LearningTopic & { chapter?: string }).chapter || '') : '';
  return {
    question,
    questionTerms: new Set(terms(variants.join(' '))),
    titleTerms: new Set(terms(title)),
    answerTerms: new Set(terms([question.answer, tr(question.answer, 'ru'), tr(question.answer, 'en'), question.explanation].join(' '))),
  };
});

function findQuestion(query: string): LearningQuestion | undefined {
  const direct = exact.get(normalized(query));
  if (direct) return direct;
  const queryTerms = terms(query);
  if (!queryTerms.length) return;
  let best: LearningQuestion | undefined, bestScore = 0;
  for (const item of indexed) {
    let matched = 0, score = 0;
    for (const term of queryTerms) {
      const weight = item.questionTerms.has(term) ? 4 : item.titleTerms.has(term) ? 3 : item.answerTerms.has(term) ? 1 : 0;
      if (weight) { matched++; score += weight; }
    }
    // Shared words alone must not make a new subject look locally answered.
    if (matched / queryTerms.length < 0.75 || score < 3) continue;
    if (queryTerms.length === 1 && /чист|даркорай|what is|что такое/i.test(item.question.question)) score += 1;
    if (score > bestScore) { best = item.question; bestScore = score; }
  }
  return best;
}

const labels = {
  tg: { topic: 'Мавзӯъ', question: 'Савол', answer: 'Ҷавоб', deeper: 'Чуқуртар', flow: 'Ҷараёни кор', code: 'Код', related: 'Саволҳои вобаста' },
  ru: { topic: 'Тема', question: 'Вопрос', answer: 'Ответ', deeper: 'Подробнее', flow: 'Как это работает', code: 'Код', related: 'Связанные вопросы' },
  en: { topic: 'Topic', question: 'Question', answer: 'Answer', deeper: 'Deeper explanation', flow: 'How it works', code: 'Code', related: 'Related questions' },
};

export function projectAnswer(query: string, options: { questionId?: string; deep?: boolean; language?: ContentLanguage } = {}): { reply: string; source: TutorSource } | null {
  const explicit = options.questionId ? byId.get(options.questionId) : undefined;
  const question = explicit && (options.deep || normalized(query) === normalized(explicit.question)) ? explicit : findQuestion(query);
  if (!question) return null;
  const topic = topics.get(question.topicId);
  const language = options.language || 'tg', label = labels[language];
  const translate = (text: string) => tr(text, language);
  const blocks = [label.question + ': ' + translate(question.question), label.answer + ': ' + translate(question.answer)];
  if (topic) {
    const chapter = (topic as LearningTopic & { chapter?: string }).chapter;
    blocks.unshift(label.topic + ': ' + (chapter ? chapter + ' · ' : '') + (language === 'ru' ? topic.titleRu : topic.title));
  }
  if (question.explanation && question.explanation !== question.answer) blocks.push(label.deeper + ': ' + translate(question.explanation));
  if (options.deep && topic) {
    for (const item of topic.explanation) blocks.push(translate(item.title) + ': ' + translate(item.text));
    if (topic.flow.length) blocks.push(label.flow + ':\n' + topic.flow.map((step, index) => (index + 1) + '. ' + translate(step)).join('\n'));
  }
  const code = question.code.length ? question.code : options.deep ? topic?.code || [] : [];
  if (code.length) blocks.push(label.code + ':\n' + code.join('\n\n'));
  if (options.deep && topic) {
    const related = topic.questions.filter(item => normalized(item.question) !== normalized(question.question)).slice(0, 3);
    if (related.length) blocks.push(label.related + ':\n' + related.map(item => translate(item.question) + '\n' + translate(item.answer) + (item.deeper ? '\n' + translate(item.deeper) : '')).join('\n\n'));
  }
  return {
    reply: blocks.join('\n\n'),
    source: { questionId: question.id, topicId: question.topicId, title: topic ? (language === 'ru' ? topic.titleRu : topic.title) : question.question, file: question.source, sourceId: question.sourceId },
  };
}
