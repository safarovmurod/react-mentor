import Link from 'next/link';
import { ArrowRight, BookOpen, Code2, Sparkles } from 'lucide-react';

export default function Page() {
  return <main className="public-home">
    <header className="public-header">
      <Link href="/" className="public-brand">React<span>Mentor</span></Link>
      <nav aria-label="Асосӣ">
        <Link href="/privacy">Махфият</Link>
        <Link href="/terms">Қоидаҳо</Link>
        <Link href="/login" className="button primary">Оғоз кардан <ArrowRight size={16}/></Link>
      </nav>
    </header>
    <section className="public-hero">
      <p className="public-eyebrow">ПЛАТФОРМАИ ОМӮЗИШИИ БАРНОМАСОЗӢ</p>
      <h1>React ва JavaScript-ро <span>бо амалия</span> омӯзед.</h1>
      <p>React Mentor дарсҳо, машқҳои код, тестҳо ва пайгирии пешрафтро дар як ҷо ҷамъ мекунад. Барои шурӯъкунандагон — аз қадами аввал.</p>
      <div className="public-actions"><Link href="/login" className="button primary">Оғози омӯзиш <ArrowRight size={18}/></Link><Link href="/home" className="button subtle">Дидани платформа</Link></div>
      <small>Омӯзишро ҳамчун меҳмон низ оғоз кардан мумкин аст. Ҳамоҳангсозии абрӣ ва AI-и онлайн ба танзимоти сервер вобастаанд.</small>
    </section>
    <section className="public-features" aria-labelledby="public-features-heading">
      <h2 id="public-features-heading">Аз назария то амалия</h2>
      <div className="public-feature-grid">
        <article><BookOpen size={24}/><h3>Дарсҳои қадам ба қадам</h3><p>JavaScript, React ва мавзӯъҳои дигар бо нақшаи омӯзишӣ.</p></article>
        <article><Code2 size={24}/><h3>Машқ ва тест</h3><p>Дар браузер код нависед, ҷавобҳоро санҷед ва пешрафтро бинед.</p></article>
        <article><Sparkles size={24}/><h3>AI Tutor — ихтиёрӣ</h3><p>Ҷавобҳои тайёр бе API кор мекунанд; AI-и онлайн танзими алоҳида мехоҳад.</p></article>
      </div>
    </section>
    <section className="public-cta"><div><h2>Барои машқи аввал омодаед?</h2><p>Аз курсҳо ва машқҳои аллакай мавҷуда оғоз кунед.</p></div><Link className="button primary" href="/home">Ба дарсҳо <ArrowRight size={18}/></Link></section>
    <footer className="public-footer"><span>© {new Date().getFullYear()} React Mentor</span><div><Link href="/privacy">Махфият</Link><Link href="/terms">Қоидаҳо</Link></div></footer>
  </main>;
}
