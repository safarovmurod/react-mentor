import Link from 'next/link';
import { ArrowRight, BookOpen, Code2, Sparkles } from 'lucide-react';
import { getRequestLocale } from '@/lib/request-locale';
import { PUBLIC_COPY } from '@/lib/public-copy';

const icons = [BookOpen, Code2, Sparkles] as const;

export default async function Page() {
  const copy=PUBLIC_COPY[await getRequestLocale()];
  return <main className="public-home">
    <header className="public-header">
      <Link href="/" className="public-brand">React<span>Mentor</span></Link>
      <nav aria-label="Primary">
        <Link href="/privacy">{copy.privacyLabel}</Link>
        <Link href="/terms">{copy.termsLabel}</Link>
        <Link href="/login" className="button primary">{copy.start} <ArrowRight size={16}/></Link>
      </nav>
    </header>
    <section className="public-hero">
      <p className="public-eyebrow">{copy.eyebrow}</p>
      <h1>{copy.heroLead} <span>{copy.heroEmphasis}</span> {copy.heroEnd}</h1>
      <p>{copy.heroDescription}</p>
      <div className="public-actions"><Link href="/login" className="button primary">{copy.start} <ArrowRight size={18}/></Link><Link href="/home" className="button subtle">{copy.seePlatform}</Link></div>
      <small>{copy.heroNote}</small>
    </section>
    <section className="public-features" aria-labelledby="public-features-heading">
      <h2 id="public-features-heading">{copy.featuresTitle}</h2>
      <div className="public-feature-grid">{copy.features.map((feature,index)=>{
        const Icon=icons[index];
        return <article key={feature.title}><Icon size={24}/><h3>{feature.title}</h3><p>{feature.description}</p></article>;
      })}</div>
    </section>
    <section className="public-cta"><div><h2>{copy.ctaTitle}</h2><p>{copy.ctaDescription}</p></div><Link className="button primary" href="/home">{copy.ctaLink} <ArrowRight size={18}/></Link></section>
    <footer className="public-footer"><span>© {new Date().getFullYear()} React Mentor</span><div><Link href="/privacy">{copy.privacyLabel}</Link><Link href="/terms">{copy.termsLabel}</Link></div></footer>
  </main>;
}
