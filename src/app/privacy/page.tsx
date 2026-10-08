import Link from 'next/link';
import { getRequestLocale } from '@/lib/request-locale';
import { PUBLIC_COPY } from '@/lib/public-copy';

export default async function PrivacyPage() {
  const copy=PUBLIC_COPY[await getRequestLocale()].privacy;
  return <main className="public-policy">
    <Link href="/">← React Mentor</Link>
    <h1>{copy.title}</h1><p>{copy.introduction}</p>
    {copy.sections.map(section=><section key={section.title}><h2>{section.title}</h2><p>{section.text}</p></section>)}
    <p><strong>{copy.notice}</strong></p>
  </main>;
}
