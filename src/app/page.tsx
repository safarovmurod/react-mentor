import Link from 'next/link';
import { ArrowRight, BookOpen, Code2, Sparkles, Compass, FileCode2, CheckCircle2 } from 'lucide-react';
import { getRequestLocale } from '@/lib/request-locale';
import { PUBLIC_COPY } from '@/lib/public-copy';
import { BRAND_NAME } from '@/lib/brand';

const STUDIO_COPY = {
  ru:{lesson:'Ваш первый проект',workspace:'Учебная мастерская',day:'День 1 · HTML',instruction:'Создайте страницу. Посмотрите результат.',preview:'Предпросмотр',heading:'Привет, мир!',description:'Мой путь в разработку начинается здесь.',step:'Урок → Код → Проверка → Новый день',tracks:'Веб · Бэкенд · Python · Мобильная разработка · C++'},
  en:{lesson:'Your first project',workspace:'Learning workspace',day:'Day 1 · HTML',instruction:'Build a page. See the result.',preview:'Preview',heading:'Hello, world!',description:'My developer journey starts here.',step:'Learn → Code → Check → Next day',tracks:'Web · Backend · Python · Mobile · C++'},
  tg:{lesson:'Лоиҳаи аввалини шумо',workspace:'Муҳити омӯзиш',day:'Рӯзи 1 · HTML',instruction:'Саҳифа созед. Натиҷаро бинед.',preview:'Пешнамоиш',heading:'Салом, ҷаҳон!',description:'Роҳи ман дар барномасозӣ аз ҳамин ҷо оғоз мешавад.',step:'Дарс → Код → Санҷиш → Рӯзи нав',tracks:'Веб · Бэкенд · Python · Мобилӣ · C++'},
  uk:{lesson:'Ваш перший проєкт',workspace:'Навчальна майстерня',day:'День 1 · HTML',instruction:'Створіть сторінку. Перегляньте результат.',preview:'Попередній перегляд',heading:'Привіт, світе!',description:'Мій шлях у розробку починається тут.',step:'Урок → Код → Перевірка → Новий день',tracks:'Веб · Бекенд · Python · Мобільна розробка · C++'},
  ja:{lesson:'最初のプロジェクト',workspace:'学習ワークスペース',day:'1日目 · HTML',instruction:'ページを作り、結果を確認しましょう。',preview:'プレビュー',heading:'こんにちは、世界！',description:'ここからプログラミングの旅が始まります。',step:'学ぶ → 書く → 確認 → 次の日へ',tracks:'ウェブ · バックエンド · Python · モバイル · C++'},
  ko:{lesson:'첫 번째 프로젝트',workspace:'학습 작업 공간',day:'1일차 · HTML',instruction:'페이지를 만들고 결과를 확인하세요.',preview:'미리 보기',heading:'안녕, 세상!',description:'개발자로서의 여정이 여기서 시작됩니다.',step:'학습 → 코딩 → 확인 → 다음 날',tracks:'웹 · 백엔드 · Python · 모바일 · C++'},
};

const icons = [BookOpen, Code2, Sparkles] as const;

export default async function Page() {
  const locale=await getRequestLocale();
  const copy=PUBLIC_COPY[locale], studio=STUDIO_COPY[locale];
  return <main className="public-home">
    <header className="public-header">
      <Link href="/" className="public-brand" aria-label={BRAND_NAME}><span className="brand-icon"><Compass size={24}/></span>Dev<span>Atlas</span></Link>
      <nav aria-label="Primary">
        <Link href="/privacy">{copy.privacyLabel}</Link>
        <Link href="/terms">{copy.termsLabel}</Link>
        <Link href="/login" className="button primary">{copy.start} <ArrowRight size={16}/></Link>
      </nav>
    </header>
    <div className="public-hero-layout"><section className="public-hero">
      <p className="public-eyebrow">{copy.eyebrow}</p>
      <h1>{copy.heroLead} <span>{copy.heroEmphasis}</span> {copy.heroEnd}</h1>
      <p>{copy.heroDescription}</p>
      <div className="public-actions"><Link href="/login" className="button primary">{copy.start} <ArrowRight size={18}/></Link><Link href="/home" className="button subtle">{copy.seePlatform}</Link></div>
      <small>{copy.heroNote}</small>
      <p className="public-tracks">{studio.tracks}</p>
    </section>
    <section className="studio-preview" aria-label={studio.workspace}><div className="studio-top"><span className="window-dots" aria-hidden="true"><i/><i/><i/></span><span>{studio.workspace}</span><Code2 size={16}/></div><div className="studio-task"><span className="eyebrow">{studio.day}</span><h2>{studio.lesson}</h2><p>{studio.instruction}</p></div><div className="studio-file"><FileCode2 size={14}/>index.html</div><pre className="studio-code"><code><span className="code-comment">&lt;!doctype html&gt;</span>{'\n'}<span className="code-tag">&lt;main&gt;</span>{'\n'}  <span className="code-tag">&lt;h1&gt;</span>{studio.heading}<span className="code-tag">&lt;/h1&gt;</span>{'\n'}  <span className="code-tag">&lt;p&gt;</span>{studio.description}<span className="code-tag">&lt;/p&gt;</span>{'\n'}<span className="code-tag">&lt;/main&gt;</span></code></pre><div className="studio-result"><span>{studio.preview}</span><h3>{studio.heading}</h3><p>{studio.description}</p></div><div className="studio-flow"><CheckCircle2 size={16}/>{studio.step}</div></section></div>
    <section className="public-features" aria-labelledby="public-features-heading">
      <h2 id="public-features-heading">{copy.featuresTitle}</h2>
      <div className="public-feature-grid">{copy.features.map((feature,index)=>{
        const Icon=icons[index];
        return <article key={feature.title}><Icon size={24}/><h3>{feature.title}</h3><p>{feature.description}</p></article>;
      })}</div>
    </section>
    <section className="public-cta"><div><h2>{copy.ctaTitle}</h2><p>{copy.ctaDescription}</p></div><Link className="button primary" href="/home">{copy.ctaLink} <ArrowRight size={18}/></Link></section>
    <footer className="public-footer"><span>© {new Date().getFullYear()} {BRAND_NAME}</span><div><Link href="/privacy">{copy.privacyLabel}</Link><Link href="/terms">{copy.termsLabel}</Link></div></footer>
  </main>;
}
