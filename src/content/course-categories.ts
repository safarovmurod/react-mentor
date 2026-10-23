import type { InterfaceLocale } from '@/lib/locale';

/** Navigation taxonomy only: categories do not imply a published course or a paid entitlement. */
export const COURSE_CATEGORY_IDS = ['programming', 'ai', 'design', 'marketing', 'analytics', 'business', 'soft-skills', 'content', 'languages', 'kids', 'lifestyle'] as const;
export type CourseCategoryId = typeof COURSE_CATEGORY_IDS[number];
export const PROGRAMMING_SUBTRACK_IDS = ['frontend', 'backend', 'mobile', 'languages', 'databases', 'tools'] as const;
export type ProgrammingSubtrackId = typeof PROGRAMMING_SUBTRACK_IDS[number];
type Labels = Record<InterfaceLocale, string>;

export const COURSE_CATEGORIES: { id: CourseCategoryId; symbol: string; labels: Labels }[] = [
  { id:'programming', symbol:'</>', labels:{ru:'Программирование',tg:'Барномасозӣ',en:'Programming',uk:'Програмування',ja:'プログラミング',ko:'프로그래밍'} },
  { id:'ai', symbol:'✳', labels:{ru:'ИИ-инженерия',tg:'Муҳандисии AI',en:'AI Engineering',uk:'Інженерія ШІ',ja:'AIエンジニアリング',ko:'AI 엔지니어링'} },
  { id:'design', symbol:'✦', labels:{ru:'Дизайн',tg:'Тарроҳӣ',en:'Design',uk:'Дизайн',ja:'デザイン',ko:'디자인'} },
  { id:'marketing', symbol:'↗', labels:{ru:'Маркетинг',tg:'Маркетинг',en:'Marketing',uk:'Маркетинг',ja:'マーケティング',ko:'마케팅'} },
  { id:'analytics', symbol:'▥', labels:{ru:'Аналитика',tg:'Таҳлили маълумот',en:'Analytics',uk:'Аналітика',ja:'データ分析',ko:'데이터 분석'} },
  { id:'business', symbol:'◇', labels:{ru:'Бизнес и управление',tg:'Бизнес ва идоракунӣ',en:'Business and management',uk:'Бізнес та управління',ja:'ビジネス・マネジメント',ko:'비즈니스 및 경영'} },
  { id:'soft-skills', symbol:'◎', labels:{ru:'Гибкие навыки',tg:'Малакаҳои муошират ва ҳамкорӣ',en:'Soft skills',uk:'Гнучкі навички',ja:'ソフトスキル',ko:'소프트 스킬'} },
  { id:'content', symbol:'Aa', labels:{ru:'Создание контента',tg:'Эҷоди муҳтаво',en:'Content creation',uk:'Створення контенту',ja:'コンテンツ制作',ko:'콘텐츠 제작'} },
  { id:'languages', symbol:'文', labels:{ru:'Иностранные языки',tg:'Забонҳои хориҷӣ',en:'Foreign languages',uk:'Іноземні мови',ja:'外国語',ko:'외국어'} },
  { id:'kids', symbol:'☆', labels:{ru:'Для детей',tg:'Барои кӯдакон',en:'For children',uk:'Для дітей',ja:'子ども向け',ko:'어린이 학습'} },
  { id:'lifestyle', symbol:'☀', labels:{ru:'Образ жизни',tg:'Тарзи зиндагӣ',en:'Lifestyle',uk:'Спосіб життя',ja:'ライフスタイル',ko:'라이프스타일'} },
];

export const PROGRAMMING_SUBTRACKS: { id: ProgrammingSubtrackId; symbol: string; labels: Labels }[] = [
  { id:'frontend', symbol:'</>', labels:{ru:'Фронтенд',tg:'Фронтенд',en:'Frontend',uk:'Фронтенд',ja:'フロントエンド',ko:'프런트엔드'} },
  { id:'backend', symbol:'API', labels:{ru:'Бэкенд',tg:'Бэкенд',en:'Backend',uk:'Бекенд',ja:'バックエンド',ko:'백엔드'} },
  { id:'mobile', symbol:'App', labels:{ru:'Мобильная разработка',tg:'Сохтани барномаҳои мобилӣ',en:'Mobile development',uk:'Мобільна розробка',ja:'モバイル開発',ko:'모바일 개발'} },
  { id:'languages', symbol:'{ }', labels:{ru:'Языки программирования',tg:'Забонҳои барномасозӣ',en:'Programming languages',uk:'Мови програмування',ja:'プログラミング言語',ko:'프로그래밍 언어'} },
  { id:'databases', symbol:'DB', labels:{ru:'Базы данных',tg:'Пойгоҳҳои додаҳо',en:'Databases',uk:'Бази даних',ja:'データベース',ko:'데이터베이스'} },
  { id:'tools', symbol:'>_', labels:{ru:'Инструменты',tg:'Абзорҳо',en:'Tools',uk:'Інструменти',ja:'開発ツール',ko:'개발 도구'} },
];

export function categoryLabel(id: CourseCategoryId, locale: InterfaceLocale): string {
  return COURSE_CATEGORIES.find(category => category.id === id)!.labels[locale];
}
export function subtrackLabel(id: ProgrammingSubtrackId, locale: InterfaceLocale): string {
  return PROGRAMMING_SUBTRACKS.find(subtrack => subtrack.id === id)!.labels[locale];
}
