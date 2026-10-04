import { AnswersLibrary } from '@/components/learning/answers-library';
import { ANSWER_COUNT, ANSWER_PROGRESS_IDS, answerSummary, filterAnswerTopics, type AnswerSource } from '@/content/answers';

export const metadata = { title: 'Ответы — ReactMentor' };
export default async function AnswersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const source: AnswerSource = ['deep','quiz','interview'].includes(String(params.source)) ? params.source as AnswerSource : 'all';
  const group = [1,2,3].includes(Number(params.group)) ? Number(params.group) : 0;
  const query = typeof params.q === 'string' ? params.q.slice(0, 200) : '';
  const topics = filterAnswerTopics(source, group, query);
  const pageCount = Math.max(1, Math.ceil(topics.length / 18));
  const page = Math.min(pageCount, Math.max(1, Number.isInteger(Number(params.page)) ? Number(params.page) : 1));
  const groups = [1,2,3].map(id => ({ id, count: filterAnswerTopics(source, id, '').reduce((sum, topic) => sum + topic.questions.length, 0) }));
  const deepAnswers = filterAnswerTopics('deep', 0, '').reduce((sum, topic) => sum + topic.questions.length, 0);
  return <AnswersLibrary topics={topics.slice((page - 1) * 18, page * 18).map(answerSummary)} source={source} group={group} query={query} page={page} pageCount={pageCount} totalTopics={topics.length} totalAnswers={ANSWER_COUNT} deepAnswers={deepAnswers} progressIds={ANSWER_PROGRESS_IDS} groups={groups}/>;
}
