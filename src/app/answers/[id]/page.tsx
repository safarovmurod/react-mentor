import { notFound } from 'next/navigation';
import { AnswerReader } from '@/components/learning/answer-reader';
import { getAnswerTopic } from '@/content/answers';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const topic = getAnswerTopic((await params).id);
  return { title: topic ? `${topic.title} — Ответы — ReactMentor` : 'Ответы — ReactMentor' };
}

export default async function AnswerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = getAnswerTopic(id);
  if (!topic) notFound();
  return <AnswerReader topic={topic}/>;
}
