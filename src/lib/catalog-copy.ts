import { COURSE_CATALOG } from '@/content/courses/catalog';
import type { CourseId } from '@/lib/courses/ids';
import type { InterfaceLocale } from '@/lib/locale';

type LocalizedText = Record<InterfaceLocale, string>;
function text(ru: string, en: string, tg: string, uk: string, ja: string, ko: string): LocalizedText {
  return { ru, en, tg, uk, ja, ko };
}

// Technology/product names remain the proper names from the catalog. Subject
// names are translated explicitly; they never silently fall back to English.
const DISPLAY_NAMES: Partial<Record<CourseId, LocalizedText>> = {
  "javascript-pro": text("JavaScript · Pro", "JavaScript · Pro", "JavaScript · Pro", "JavaScript · Pro", "JavaScript · Pro", "JavaScript · Pro"),
  "backend-pro": text("Бэкенд · Pro", "Backend · Pro", "Бэкенд · Pro", "Бекенд · Pro", "バックエンド · Pro", "백엔드 · Pro"),
  "architecture-expert": text("Архитектура · Expert", "Architecture · Expert", "Меъмории система · Expert", "Архітектура · Expert", "システム設計 · Expert", "시스템 설계 · Expert"),
  "ux-pro": text("UX-дизайн · Pro", "UX Design · Pro", "Тарроҳии UX · Pro", "UX-дизайн · Pro", "UXデザイン · Pro", "UX 디자인 · Pro"),
  "business-pro": text("Бизнес · Pro", "Business · Pro", "Бизнес · Pro", "Бізнес · Pro", "ビジネス · Pro", "비즈니스 · Pro"),
  backend: text('Серверная разработка', 'Backend development', 'Барномасозии серверӣ', 'Серверна розробка', 'バックエンド開発', '백엔드 개발'),
  mobile: text('Мобильная разработка', 'Mobile development', 'Барномасозии мобилӣ', 'Мобільна розробка', 'モバイルアプリ開発', '모바일 앱 개발'),
  'ux-design': text('UX/UI-дизайн', 'UX/UI Design', 'Тарҳрезии UX/UI', 'UX/UI-дизайн', 'UX/UIデザイン', 'UX/UI 디자인'),
  'digital-marketing': text('Цифровой маркетинг', 'Digital Marketing', 'Маркетинги рақамӣ', 'Цифровий маркетинг', 'デジタルマーケティング', '디지털 마케팅'),
  'data-analytics': text('Аналитика данных', 'Data Analytics', 'Таҳлили додаҳо', 'Аналітика даних', 'データ分析', '데이터 분석'),
  'business-foundations': text('Основы бизнеса', 'Business Foundations', 'Асосҳои соҳибкорӣ', 'Основи бізнесу', 'ビジネスの基礎', '비즈니스 기초'),
  communication: text('Коммуникация', 'Communication', 'Муошират', 'Комунікація', 'コミュニケーション', '의사소통'),
  'content-creation': text('Создание контента', 'Content Creation', 'Таҳияи муҳтаво', 'Створення контенту', 'コンテンツ制作', '콘텐츠 제작'),
  'english-foundations': text('Английский с нуля', 'English Foundations', 'Англисӣ аз сифр', 'Англійська з нуля', 'はじめての英語', '영어 기초'),
  'digital-literacy': text('Цифровая грамотность', 'Digital Literacy', 'Саводи рақамӣ', 'Цифрова грамотність', 'デジタルリテラシー', '디지털 활용 기초'),
  'personal-productivity': text('Личная продуктивность', 'Personal Productivity', 'Самаранокии шахсӣ', 'Особиста продуктивність', '自己管理と生産性', '자기 관리와 생산성'),
  'management-foundations': text('Основы управления', 'Management Foundations', 'Асосҳои идоракунӣ', 'Основи управління', 'マネジメントの基礎', '관리의 기초'),
  'ai-fundamentals': text('Основы ИИ', 'AI Fundamentals', 'Асосҳои AI', 'Основи ШІ', 'AIの基礎', 'AI 기초'),
  'context-engineering': text('Инженерия контекста', 'Context Engineering', 'Муҳандисии контекст', 'Інженерія контексту', 'コンテキストエンジニアリング', '컨텍스트 엔지니어링'),
  'agent-harness': text('Каркас агентов', 'Agent Harness', 'Каркаси агентҳо', 'Каркас агентів', 'エージェントハーネス', '에이전트 하네스'),
};

const DESCRIPTIONS: Record<CourseId, LocalizedText> = {
  "javascript-pro": text("Тридцать дней Pro: event loop, промисы, отмена запросов, retry, генераторы, память, кэш, безопасность, наблюдаемость и планировщик задач. Нужен Node.js.", "Thirty Pro days: the event loop, promises, request cancellation, retries, generators, memory, caching, security, observability and a task scheduler. Requires Node.js.", "Си рӯзи Pro: event loop, promise-ҳо, бекор кардани дархост, retry, генераторҳо, хотира, кэш, бехатарӣ, мушоҳида ва планери вазифаҳо. Node.js лозим аст.", "Тридцять днів Pro: event loop, проміси, скасування запитів, retry, генератори, пам'ять, кеш, безпека, спостережуваність і планувальник задач. Потрібен Node.js.", "Proの30日間。イベントループ、プロミス、キャンセル、リトライ、ジェネレーター、メモリー、キャッシュ、セキュリティ、オブザーバビリティ、タスクスケジューラーを学びます。Node.jsが必要です。", "Pro 30일 과정입니다. 이벤트 루프, 프로미스, 요청 취소, 재시도, 제너레이터, 메모리, 캐시, 보안, 관측성과 작업 스케줄러를 배웁니다. Node.js가 필요합니다."),
  "backend-pro": text("Тридцать дней Pro: HTTP и REST, аутентификация и авторизация, безопасность (XSS, CSRF, инъекции), кэш, лимиты, надёжность, тестирование и capstone — защищённый TODO API. Нужен Node.js.", "Thirty Pro days: HTTP and REST, authentication and authorization, security (XSS, CSRF, injection), caching, rate limits, reliability, testing and a capstone — a hardened TODO API. Requires Node.js.", "Си рӯзи Pro: HTTP ва REST, аутентификатсия ва авторизатсия, бехатарӣ (XSS, CSRF, инъексия), кэш, маҳдудиятҳо, устуворӣ, тестҳо ва capstone — TODO API-и муҳофизатшуда. Node.js лозим аст.", "Тридцять днів Pro: HTTP і REST, автентифікація та авторизація, безпека (XSS, CSRF, ін'єкції), кеш, ліміти, надійність, тестування і capstone — захищений TODO API. Потрібен Node.js.", "Proの30日間。HTTPとREST、認証と認可、セキュリティ（XSS、CSRF、インジェクション）、キャッシュ、レート制限、信頼性、テスト、総合課題（保護されたTODO API）を学びます。Node.jsが必要です。", "Pro 30일 과정입니다. HTTP와 REST, 인증과 권한 부여, 보안(XSS, CSRF, 인젝션), 캐시, 속도 제한, 안정성, 테스트와 캡스톤(보강된 TODO API)을 배웁니다. Node.js가 필요합니다."),
  "architecture-expert": text("Тридцать дней Expert: архитектурные решения и их цена, ADR, границы и домены, данные и согласованность, масштабирование, отказоустойчивость, безопасность, миграции без простоя и полный дизайн-кейс сервиса. Письменные решения с разбором.", "Thirty Expert days: architecture decisions and their cost, ADRs, boundaries and domains, data and consistency, scaling, resilience, security, zero-downtime migrations and a full service design case. Written decisions with review.", "Си рӯзи Expert: қарорҳои меъморӣ ва нархи онҳо, ADR, сарҳадҳо ва доменҳо, додаҳо ва мувофиқат, масштаббандӣ, устуворӣ, бехатарӣ, мигратсияҳо бе таваққуф ва кейси пурраи дизайн. Қарорҳои хаттӣ бо таҳлил.", "Тридцять днів Expert: архітектурні рішення та їх ціна, ADR, межі й домени, дані та узгодженість, масштабування, стійкість, безпека, міграції без простою і повний дизайн-кейс сервісу. Письмові рішення з розбором.", "Expertの30日間。アーキテクチャ決定とそのコスト、ADR、境界とドメイン、データと整合性、スケーリング、耐障害性、セキュリティ、ダウンタイムなしの移行、完全なサービス設計ケースを学びます。", "Expert 30일 과정입니다. 아키텍처 결정과 그 비용, ADR, 경계와 도메인, 데이터와 일관성, 확장, 복원력, 보안, 무중단 마이그레이션과 전체 서비스 설계 케이스를 다룹니다."),
  "ux-pro": text("Тридцать дней Pro: проблемные интервью, персоны и journeys, информационная архитектура, прототипы, юзабилити-тесты, метрики, доступность, дизайн-системы и сквозной кейс продукта.", "Thirty Pro days: problem interviews, personas and journeys, information architecture, prototyping, usability testing, metrics, accessibility, design systems and an end-to-end product case.", "Си рӯзи Pro: мусоҳибаҳои масъалаӣ, persona ва journey, меъмории иттилоотӣ, прототипҳо, санҷиши usability, метрикаҳо, дастрасӣ, дизайн-системаҳо ва кейси пурраи маҳсулот.", "Тридцять днів Pro: проблемні інтерв'ю, персони й journeys, інформаційна архітектура, прототипи, юзабіліті-тести, метрики, доступність, дизайн-системи і наскрізний кейс продукту.", "Proの30日間。問題発見インタビュー、ペルソナとジャーニー、情報設計、プロトタイプ、ユーザビリティテスト、指標、アクセシビリティ、デザインシステム、総合ケースを学びます。", "Pro 30일 과정입니다. 문제 인터뷰, 페르소나와 저니, 정보 구조, 프로토타이핑, 사용성 테스트, 지표, 접근성, 디자인 시스템과 엔드투엔드 케이스를 배웁니다."),
  "business-pro": text("Тридцать дней Pro: сегменты и ICP, ценностное предложение, ценообразование, юнит-экономика (CAC/LTV), воронки, когорты, эксперименты, P&L и денежный поток, найм, стратегия и capstone — 90-дневный план запуска учебного продукта.", "Thirty Pro days: segments and ICP, value proposition, pricing, unit economics (CAC/LTV), funnels, cohorts, experiments, P&L and cash flow, hiring, strategy and a capstone — a 90-day launch plan for a learning product.", "Си рӯзи Pro: сегментҳо ва ICP, пешниҳоди арзиш, нархгузорӣ, иқтисоди воҳид (CAC/LTV), воронкаҳо, когортҳо, таҷрибаҳо, P&L ва ҷараёни пул, коргузорӣ, стратегия ва capstone — нақшаи 90-рӯзаи оғози маҳсулот.", "Тридцять днів Pro: сегменти й ICP, ціннісна пропозиція, ціноутворення, юніт-економіка (CAC/LTV), воронки, когорти, експерименти, P&L і грошовий потік, найм, стратегія і капстоун — 90-денний план запуску.", "Proの30日間。セグメントとICP、価値提案、価格設定、ユニットエコノミクス（CAC/LTV）、ファネル、コホート、実験、P&Lとキャッシュフロー、採用、戦略、総合課題（90日のローンチ計画）を学びます。", "Pro 30일 과정입니다. 세그먼트와 ICP, 가치 제안, 가격 책정, 유닛 이코노믹스(CAC/LTV), 퍼널, 코호트, 실험, P&L과 현금 흐름, 채용, 전략과 캡스톤(90일 런치 계획)을 다룹니다."),
  html: text(
    'От первого HTML-файла до адаптивной страницы: структура, оформление и ежедневные задания.',
    'From your first HTML file to a responsive page: structure, styling and daily assignments.',
    'Аз файли аввали HTML то саҳифаи мутобиқшаванда: сохтор, ороиш ва супоришҳои ҳаррӯза.',
    'Від першого HTML-файлу до адаптивної сторінки: структура, оформлення й щоденні завдання.',
    '最初のHTMLファイルからレスポンシブなページへ。構造、見た目、日々の課題を学びます。',
    '첫 HTML 파일부터 반응형 페이지까지 구조와 스타일을 배우고 매일 과제를 진행합니다.'),
  css: text(
    'Цвет, отступы, расположение элементов и адаптация страницы к телефону.',
    'Colors, spacing, layout and adapting a page to mobile screens.',
    'Ранг, фосила, ҷойгиршавии унсурҳо ва мутобиқ кардани саҳифа ба телефон.',
    'Колір, відступи, розташування елементів та адаптація сторінки до телефона.',
    '色、余白、レイアウト、スマートフォンに対応したページの作り方を学びます。',
    '색상, 여백, 레이아웃과 모바일 화면에 맞는 페이지 구성을 배웁니다.'),
  'javascript-1': text(
    'Первый месяц: массивы, объекты, даты и задачи на работу с данными.',
    'Month one: arrays, objects, dates and data-processing exercises.',
    'Моҳи аввал: массивҳо, объектҳо, санаҳо ва масъалаҳои кор бо додаҳо.',
    'Перший місяць: масиви, об’єкти, дати й завдання з обробки даних.',
    '1か月目は配列、オブジェクト、日付、データ処理の課題に取り組みます。',
    '첫 달에는 배열, 객체, 날짜와 데이터 처리 과제를 학습합니다.'),
  'javascript-2': text(
    'Второй месяц: API, JSON Server и запросы Axios в учебном проекте.',
    'Month two: APIs, JSON Server and Axios requests in a learning project.',
    'Моҳи дуюм: API, JSON Server ва дархостҳои Axios дар лоиҳаи омӯзишӣ.',
    'Другий місяць: API, JSON Server і запити Axios у навчальному проєкті.',
    '2か月目は学習用プロジェクトでAPI、JSON Server、Axiosのリクエストを学びます。',
    '둘째 달에는 학습 프로젝트에서 API, JSON Server와 Axios 요청을 배웁니다.'),
  react: text(
    'Компоненты, hooks, состояние и приложения: объяснения, задания и вопросы для проверки знаний.',
    'Components, hooks, state and applications, with explanations, assignments and knowledge checks.',
    'Компонентҳо, hook-ҳо, ҳолат ва барномаҳо: шарҳҳо, супоришҳо ва санҷиши дониш.',
    'Компоненти, hooks, стан і застосунки: пояснення, завдання й перевірка знань.',
    'コンポーネント、フック、状態、アプリケーションを解説、課題、確認問題で学びます。',
    '컴포넌트, 훅, 상태와 애플리케이션을 해설, 과제, 확인 문제로 학습합니다.'),
  nextjs: text(
    'App Router, серверные компоненты, API, авторизация и размещение приложения.',
    'App Router, server components, APIs, authentication and application deployment.',
    'App Router, компонентҳои серверӣ, API, воридшавӣ ва нашри барнома.',
    'App Router, серверні компоненти, API, авторизація та розгортання застосунку.',
    'App Router、サーバーコンポーネント、API、認証、アプリの公開を学びます。',
    'App Router, 서버 컴포넌트, API, 인증과 애플리케이션 배포를 배웁니다.'),
  git: text(
    'История изменений, коммиты и совместная работа с Git и GitHub.',
    'Version history, commits and collaboration with Git and GitHub.',
    'Таърихи тағйирот, commit-ҳо ва кори муштарак бо Git ва GitHub.',
    'Історія змін, коміти та спільна робота з Git і GitHub.',
    'GitとGitHubで変更履歴、コミット、共同作業を学びます。',
    'Git과 GitHub로 변경 이력, 커밋과 협업을 배웁니다.'),
  cpp: text(
    'Отдельное направление: основы C++ и задания для работы с компилятором.',
    'A separate path covering C++ fundamentals and exercises using a compiler.',
    'Самти алоҳида: асосҳои C++ ва супоришҳо барои кор бо компилятор.',
    'Окремий напрям: основи C++ і завдання для роботи з компілятором.',
    'C++の基礎とコンパイラーを使う課題に取り組む独立した学習コースです。',
    'C++ 기초와 컴파일러를 사용하는 과제를 다루는 별도 과정입니다.'),
  python: text(
    'Полный курс с нуля: 30 дней от переменных и условий до файлов, функций и итогового проекта. Запуск примеров через Python 3 на своём компьютере.',
    'A full course from zero: 30 days from variables and conditions to files, functions and a final project. Run examples with Python 3 on your own computer.',
    'Курси пурра аз сифр: 30 рӯз аз тағйирёбандаҳо ва шартҳо то файлҳо, функсияҳо ва лоиҳаи ниҳоӣ. Мисолҳоро бо Python 3 дар компютери худ иҷро кунед.',
    'Повний курс з нуля: 30 днів від змінних і умов до файлів, функцій і підсумкового проєкту. Запускайте приклади через Python 3 на власному комп’ютері.',
    'ゼロから学ぶ完全コース。30日間で変数と条件からファイル、関数、最終プロジェクトまで学びます。サンプルは自分のパソコンのPython 3で実行します。',
    '제로부터 배우는 완전 과정입니다. 30일 동안 변수와 조건부터 파일, 함수, 최종 프로젝트까지 학습합니다. 예제는 내 컴퓨터의 Python 3로 실행하세요.'),
  typescript: text(
    'Четырнадцать дней: типы, функции, narrowing, generics, utility types, strict-режим и типизированный мини-проект.',
    'Fourteen days: types, functions, narrowing, generics, utility types, strict mode and a typed mini project.',
    'Чордаҳ рӯз: типҳо, функсияҳо, narrowing, generics, utility types, режими strict ва лоиҳаи хурди типизатсияшуда.',
    'Чотирнадцять днів: типи, функції, звуження, generics, utility types, strict-режим і типізований мініпроєкт.',
    '14日間。型、関数、ナローイング、ジェネリクス、ユーティリティ型、strictモード、型付きミニプロジェクトを学びます。',
    '14일 과정입니다. 타입, 함수, narrowing, 제네릭, 유틸리티 타입, strict 모드와 타입이 적용된 미니 프로젝트를 배웁니다.'),
  algorithms: text(
    'Четырнадцать дней: сложность, массивы и строки, поиск, сортировки, структуры данных и пошаговое решение задач.',
    'Fourteen days: complexity, arrays and strings, searching, sorting, data structures and step-by-step problem solving.',
    'Чордаҳ рӯз: мураккабӣ, массивҳо ва сатрҳо, ҷустуҷӯ, тартибдодан, сохторҳои додаҳо ва ҳалли масъала қадам ба қадам.',
    'Чотирнадцять днів: складність, масиви й рядки, пошук, сортування, структури даних і покрокове розв’язання задач.',
    '14日間。計算量、配列と文字列、探索、ソート、データ構造、問題解決の手順を学びます。',
    '14일 과정입니다. 복잡도, 배열과 문자열, 탐색, 정렬, 자료 구조와 단계별 문제 해결을 배웁니다.'),
  backend: text(
    'HTTP-сервер и проверка запросов. Для запуска нужен локальный Node.js.',
    'An HTTP server and request validation. Running the examples requires local Node.js.',
    'Сервери HTTP ва санҷиши дархостҳо. Барои иҷро Node.js дар компютер лозим аст.',
    'HTTP-сервер і перевірка запитів. Для запуску потрібен локальний Node.js.',
    'HTTPサーバーとリクエストの検証を学びます。実行にはローカルのNode.jsが必要です。',
    'HTTP 서버와 요청 검증을 배웁니다. 예제를 실행하려면 로컬 Node.js가 필요합니다.'),
  mobile: text(
    'Экран React Native и счётчик. Запускайте приложение через Expo на своём устройстве.',
    'A React Native screen and counter. Run the app with Expo on your own device.',
    'Экрани React Native ва ҳисобкунак. Барномаро бо Expo дар дастгоҳи худ иҷро кунед.',
    'Екран React Native і лічильник. Запускайте застосунок через Expo на власному пристрої.',
    'React Nativeの画面とカウンターを作ります。Expoで自分のデバイス上で実行します。',
    'React Native 화면과 카운터를 만듭니다. Expo로 내 기기에서 앱을 실행하세요.'),
  java: text(
    'Классы, методы и небольшая программа. Выполняйте код в локальном JDK.',
    'Classes, methods and a small program. Run the code with a local JDK.',
    'Классҳо, методҳо ва барномаи хурд. Кодро бо JDK дар компютер иҷро кунед.',
    'Класи, методи й невелика програма. Виконуйте код у локальному JDK.',
    'クラス、メソッド、小さなプログラムを学びます。コードはローカルのJDKで実行します。',
    '클래스, 메서드와 작은 프로그램을 배웁니다. 로컬 JDK로 코드를 실행하세요.'),
  csharp: text(
    'Типы, методы и консольная программа. Для запуска установите .NET SDK.',
    'Types, methods and a console program. Install the .NET SDK to run the code.',
    'Типҳо, методҳо ва барномаи консолӣ. Барои иҷро .NET SDK насб кунед.',
    'Типи, методи й консольна програма. Для запуску встановіть .NET SDK.',
    '型、メソッド、コンソールプログラムを学びます。実行には.NET SDKをインストールします。',
    '타입, 메서드와 콘솔 프로그램을 배웁니다. 실행하려면 .NET SDK를 설치하세요.'),
  go: text(
    'Переменные, функции и первая программа. Запускайте код локальным инструментом go.',
    'Variables, functions and a first program. Run the code with the local go tool.',
    'Тағйирёбандаҳо, функсияҳо ва барномаи аввал. Кодро бо абзори go дар компютер иҷро кунед.',
    'Змінні, функції й перша програма. Запускайте код локальним інструментом go.',
    '変数、関数、最初のプログラムを学びます。コードはローカルのgoツールで実行します。',
    '변수, 함수와 첫 프로그램을 배웁니다. 로컬 go 도구로 코드를 실행하세요.'),
  rust: text(
    'Переменные, владение и первая программа. Для запуска нужны Rust и Cargo.',
    'Variables, ownership and a first program. Running the code requires Rust and Cargo.',
    'Тағйирёбандаҳо, соҳибият ва барномаи аввал. Барои иҷро Rust ва Cargo лозиманд.',
    'Змінні, володіння й перша програма. Для запуску потрібні Rust і Cargo.',
    '変数、所有権、最初のプログラムを学びます。実行にはRustとCargoが必要です。',
    '변수, 소유권과 첫 프로그램을 배웁니다. 실행하려면 Rust와 Cargo가 필요합니다.'),
  php: text(
    'Переменные, функции и обработка данных. Запускайте примеры локальным PHP.',
    'Variables, functions and data handling. Run examples with local PHP.',
    'Тағйирёбандаҳо, функсияҳо ва коркарди додаҳо. Мисолҳоро бо PHP дар компютер иҷро кунед.',
    'Змінні, функції та обробка даних. Запускайте приклади локальним PHP.',
    '変数、関数、データ処理を学びます。サンプルはローカルのPHPで実行します。',
    '변수, 함수와 데이터 처리를 배웁니다. 로컬 PHP로 예제를 실행하세요.'),
  ruby: text(
    'Переменные, коллекции и методы. Выполняйте примеры в локальном Ruby.',
    'Variables, collections and methods. Run examples with local Ruby.',
    'Тағйирёбандаҳо, маҷмӯаҳо ва методҳо. Мисолҳоро бо Ruby дар компютер иҷро кунед.',
    'Змінні, колекції та методи. Виконуйте приклади в локальному Ruby.',
    '変数、コレクション、メソッドを学びます。サンプルはローカルのRubyで実行します。',
    '변수, 컬렉션과 메서드를 배웁니다. 로컬 Ruby로 예제를 실행하세요.'),
  sql: text(
    'Таблицы, SELECT и фильтрация записей. Выполняйте запросы в учебной базе SQLite.',
    'Tables, SELECT and filtering records. Run queries in a learning SQLite database.',
    'Ҷадвалҳо, SELECT ва филтри сабтҳо. Дархостҳоро дар пойгоҳи омӯзишии SQLite иҷро кунед.',
    'Таблиці, SELECT і фільтрація записів. Виконуйте запити в навчальній базі SQLite.',
    'テーブル、SELECT、レコードの絞り込みを学びます。学習用SQLiteデータベースでクエリを実行します。',
    '테이블, SELECT와 레코드 필터링을 배웁니다. 학습용 SQLite 데이터베이스에서 쿼리를 실행하세요.'),
  bash: text(
    'Безопасная работа в терминале и первый скрипт. Практикуйтесь в отдельной учебной папке.',
    'Safe terminal use and a first script. Practice in a separate learning folder.',
    'Кори бехатар дар терминал ва скрипти аввал. Дар ҷузвдони алоҳидаи омӯзишӣ машқ кунед.',
    'Безпечна робота в терміналі й перший скрипт. Практикуйтеся в окремій навчальній папці.',
    '安全なターミナル操作と最初のスクリプトを学びます。専用の学習フォルダーで練習します。',
    '안전한 터미널 사용과 첫 스크립트를 배웁니다. 별도의 학습 폴더에서 연습하세요.'),
  nodejs: text(
    'JavaScript вне браузера и простой HTTP-сервер. Запускайте примеры локальным Node.js.',
    'JavaScript outside the browser and a simple HTTP server. Run examples with local Node.js.',
    'JavaScript берун аз браузер ва сервери содаи HTTP. Мисолҳоро бо Node.js дар компютер иҷро кунед.',
    'JavaScript поза браузером і простий HTTP-сервер. Запускайте приклади локальним Node.js.',
    'ブラウザー外のJavaScriptと簡単なHTTPサーバーを学びます。サンプルはローカルのNode.jsで実行します。',
    '브라우저 밖의 JavaScript와 간단한 HTTP 서버를 배웁니다. 로컬 Node.js로 예제를 실행하세요.'),
  mongodb: text(
    'Документы, коллекции и запросы. Используйте отдельную учебную базу MongoDB.',
    'Documents, collections and queries. Use a separate learning MongoDB database.',
    'Ҳуҷҷатҳо, коллексияҳо ва дархостҳо. Пойгоҳи алоҳидаи омӯзишии MongoDB-ро истифода баред.',
    'Документи, колекції та запити. Використовуйте окрему навчальну базу MongoDB.',
    'ドキュメント、コレクション、クエリを学びます。専用の学習用MongoDBデータベースを使います。',
    '문서, 컬렉션과 쿼리를 배웁니다. 별도의 학습용 MongoDB 데이터베이스를 사용하세요.'),
  swift: text(
    'Переменные, функции и основы приложений. Запускайте примеры локальными инструментами Swift.',
    'Variables, functions and application fundamentals. Run examples with local Swift tools.',
    'Тағйирёбандаҳо, функсияҳо ва асосҳои барномаҳо. Мисолҳоро бо абзорҳои Swift дар компютер иҷро кунед.',
    'Змінні, функції та основи застосунків. Запускайте приклади локальними інструментами Swift.',
    '変数、関数、アプリの基礎を学びます。サンプルはローカルのSwiftツールで実行します。',
    '변수, 함수와 앱 기초를 배웁니다. 로컬 Swift 도구로 예제를 실행하세요.'),
  kotlin: text(
    'Типы, функции и основы приложений. Для запуска нужен локальный компилятор Kotlin.',
    'Types, functions and application fundamentals. Running the examples requires a local Kotlin compiler.',
    'Типҳо, функсияҳо ва асосҳои барномаҳо. Барои иҷро компилятори Kotlin дар компютер лозим аст.',
    'Типи, функції та основи застосунків. Для запуску потрібен локальний компілятор Kotlin.',
    '型、関数、アプリの基礎を学びます。実行にはローカルのKotlinコンパイラーが必要です。',
    '타입, 함수와 앱 기초를 배웁니다. 예제를 실행하려면 로컬 Kotlin 컴파일러가 필요합니다.'),
  'ux-design': text(
    'Потребности пользователя, сценарий и прототип интерфейса. Составьте собственное проектное решение.',
    'User needs, a user flow and an interface prototype. Create your own design proposal.',
    'Ниёзи корбар, раванди истифода ва намунаи интерфейс. Ҳалли тарҳрезии худро таҳия кунед.',
    'Потреби користувача, сценарій і прототип інтерфейсу. Створіть власне проєктне рішення.',
    'ユーザーのニーズ、操作の流れ、画面のプロトタイプを学び、自分のデザイン案を作ります。',
    '사용자 요구, 사용자 흐름과 화면 프로토타입을 배우고 나만의 디자인 제안서를 만듭니다.'),
  'digital-marketing': text(
    'Аудитория, предложение и измеримый план кампании. Подготовьте учебный маркетинговый бриф.',
    'An audience, a value proposition and a measurable campaign plan. Prepare a learning marketing brief.',
    'Мухотаб, пешниҳоди арзиш ва нақшаи маърака бо меъёрҳои ченшаванда. Брифи омӯзишии маркетингӣ омода кунед.',
    'Аудиторія, пропозиція та вимірюваний план кампанії. Підготуйте навчальний маркетинговий бриф.',
    '対象者、価値提案、測定可能なキャンペーン計画を学び、練習用のマーケティング概要を作ります。',
    '대상 고객, 가치 제안과 측정 가능한 캠페인 계획을 배우고 학습용 마케팅 기획서를 작성합니다.'),
  'data-analytics': text(
    'Качество данных, простые расчёты и обоснованные выводы на небольшом наборе данных.',
    'Data quality, simple calculations and evidence-based conclusions using a small dataset.',
    'Сифати додаҳо, ҳисобҳои сода ва хулосаҳои асоснок бо маҷмӯи хурди додаҳо.',
    'Якість даних, прості розрахунки й обґрунтовані висновки на невеликому наборі даних.',
    '小さなデータセットで、データの品質、基本的な計算、根拠に基づく結論を学びます。',
    '작은 데이터셋으로 데이터 품질, 간단한 계산과 근거 있는 결론을 배웁니다.'),
  'business-foundations': text(
    'Проблема клиента, ценность продукта и проверка бизнес-идеи. Сформулируйте проверяемую гипотезу.',
    'A customer problem, product value and business idea validation. Form a testable hypothesis.',
    'Мушкилоти муштарӣ, арзиши маҳсулот ва санҷиши ғояи соҳибкорӣ. Фарзияи санҷидашаванда тартиб диҳед.',
    'Проблема клієнта, цінність продукту й перевірка бізнес-ідеї. Сформулюйте гіпотезу, яку можна перевірити.',
    '顧客の課題、商品の価値、事業アイデアの検証を学び、検証できる仮説を立てます。',
    '고객 문제, 제품 가치와 사업 아이디어 검증을 배우고 검증 가능한 가설을 세웁니다.'),
  communication: text(
    'Понятное сообщение, обратная связь и рабочий диалог. Отработайте общение на конкретной ситуации.',
    'Clear messages, feedback and workplace conversations. Practice with a specific scenario.',
    'Паёми равшан, бозхӯрд ва гуфтугӯи корӣ. Муоширатро дар вазъияти мушаххас машқ кунед.',
    'Зрозуміле повідомлення, зворотний зв’язок і робочий діалог. Відпрацюйте спілкування на конкретній ситуації.',
    '明確なメッセージ、フィードバック、職場での対話を学び、具体的な場面で練習します。',
    '명확한 메시지, 피드백과 업무 대화를 배우고 구체적인 상황으로 연습합니다.'),
  'content-creation': text(
    'Бриф, структура и редактирование полезного материала. Создайте и улучшите собственный текст.',
    'A brief, structure and editing useful content. Create and improve your own text.',
    'Бриф, сохтор ва таҳрири маводи муфид. Матни худро эҷод карда, беҳтар созед.',
    'Бриф, структура й редагування корисного матеріалу. Створіть і поліпшіть власний текст.',
    '制作概要、構成、役立つ内容の編集を学び、自分の文章を作って改善します。',
    '기획, 구성과 유용한 콘텐츠 편집을 배우고 직접 작성한 글을 개선합니다.'),
  'english-foundations': text(
    'Знакомство, простые фразы и короткий диалог. Практикуйтесь в письменных ответах.',
    'Introductions, simple phrases and a short conversation. Practice with written responses.',
    'Шиносоӣ, ибораҳои сода ва гуфтугӯи кӯтоҳ. Бо ҷавобҳои хаттӣ машқ кунед.',
    'Знайомство, прості фрази й короткий діалог. Практикуйтеся в письмових відповідях.',
    '自己紹介、簡単な表現、短い会話を学び、文章で答える練習をします。',
    '자기소개, 간단한 표현과 짧은 대화를 배우고 글로 답하는 연습을 합니다.'),
  'digital-literacy': text(
    'Файлы, поиск информации и безопасность в интернете. Выполните понятные задания для начинающих.',
    'Files, finding information and online safety. Complete clear beginner assignments.',
    'Файлҳо, ҷустуҷӯи иттилоот ва бехатарӣ дар интернет. Супоришҳои равшан барои навомӯзонро иҷро кунед.',
    'Файли, пошук інформації та безпека в інтернеті. Виконайте зрозумілі завдання для початківців.',
    'ファイル、情報検索、インターネットの安全を学び、初心者向けの課題に取り組みます。',
    '파일, 정보 검색과 온라인 안전을 배우고 초보자를 위한 명확한 과제를 진행합니다.'),
  'personal-productivity': text(
    'Реалистичный план дня, приоритеты и проверка результата. Составьте собственный рабочий план.',
    'A realistic daily plan, priorities and reviewing outcomes. Create your own work plan.',
    'Нақшаи воқеии рӯз, афзалиятҳо ва санҷиши натиҷа. Нақшаи кории худро тартиб диҳед.',
    'Реалістичний план дня, пріоритети й перевірка результату. Складіть власний робочий план.',
    '無理のない1日の計画、優先順位、結果の振り返りを学び、自分の作業計画を立てます。',
    '현실적인 하루 계획, 우선순위와 결과 검토를 배우고 나만의 업무 계획을 세웁니다.'),
  'management-foundations': text(
    'Цели команды, распределение задач и обратная связь. Подготовьте план работы небольшой команды.',
    'Team goals, task delegation and feedback. Prepare a work plan for a small team.',
    'Ҳадафҳои даста, тақсимоти вазифаҳо ва бозхӯрд. Нақшаи кори дастаи хурдро омода кунед.',
    'Цілі команди, розподіл завдань і зворотний зв’язок. Підготуйте план роботи невеликої команди.',
    'チームの目標、仕事の分担、フィードバックを学び、小さなチームの作業計画を作ります。',
    '팀 목표, 업무 위임과 피드백을 배우고 소규모 팀의 업무 계획을 작성합니다.'),
  'ai-fundamentals': text(
    'Четырнадцать бесплатных дней: ИИ, LLM, токены и контекст, инструкции, галлюцинации, безопасность и мини-проект.',
    'Fourteen free days: AI, LLMs, tokens and context, instructions, hallucinations, safety and a mini project.',
    'Чордаҳ рӯзи бепул: AI, LLM, token ва контекст, дастурҳо, галлюсинасия, бехатарӣ ва лоиҳаи хурд.',
    'Чотирнадцять безкоштовних днів: ШІ, LLM, токени й контекст, інструкції, галюцинації, безпека й мініпроєкт.',
    '無料の14日間。AI、LLM、トークンとコンテキスト、指示、ハルシネーション、安全性、ミニプロジェクトを学びます。',
    '무료 14일 과정입니다. AI, LLM, 토큰과 컨텍스트, 지시문, 환각, 안전성과 미니 프로젝트를 배웁니다.'),
  'context-engineering': text(
    'Четырнадцать дней: окно контекста, бюджет токенов, релевантность и шум, RAG, сжатие контекста и проект помощника.',
    'Fourteen days: the context window, token budgets, relevance and noise, RAG, context compression and an assistant project.',
    'Чордаҳ рӯз: тирезаи контекст, буҷети token, мувофиқат ва шовуғ, RAG, фишурдани контекст ва лоиҳаи ёрдамчӣ.',
    'Чотирнадцять днів: вікно контексту, бюджет токенів, релевантність і шум, RAG, стиснення контексту й проєкт помічника.',
    '14日間。コンテキストウィンドウ、トークン予算、関連性とノイズ、RAG、コンテキスト圧縮、アシスタント課題を学びます。',
    '14일 과정입니다. 컨텍스트 윈도우, 토큰 예산, 관련성과 노이즈, RAG, 컨텍스트 압축과 어시스턴트 프로젝트를 배웁니다.'),
  'agent-harness': text(
    'Четырнадцать дней: цикл агента, инструменты и схемы, права доступа, песочница, контрольные точки и мини-агент.',
    'Fourteen days: the agent loop, tools and schemas, permissions, sandboxing, checkpoints and a mini agent.',
    'Чордаҳ рӯз: даври агент, абзорҳо ва схемаҳо, иҷозатҳо, sandbox, нуқтаҳои назоратӣ ва агент-и хурд.',
    'Чотирнадцять днів: цикл агента, інструменти й схеми, права доступу, пісочниця, контрольні точки й мініагент.',
    '14日間。エージェントのループ、ツールとスキーマ、権限、サンドボックス、チェックポイント、ミニエージェントを学びます。',
    '14일 과정입니다. 에이전트 루프, 도구와 스키마, 권한, 샌드박스, 체크포인트와 미니 에이전트를 배웁니다.'),
};

const INTRODUCTION = text('Вводный модуль · 2 дня.', 'Introductory module · 2 days.', 'Модули муқаддимавӣ · 2 рӯз.', 'Вступний модуль · 2 дні.', '2日間の入門モジュール。', '2일 입문 모듈.');

export function courseDisplayName(id: CourseId, locale: InterfaceLocale): string {
  const localized = DISPLAY_NAMES[id];
  if (localized) return localized[locale];
  // All remaining courses are named after their technology, not English UI text.
  return COURSE_CATALOG.find(course => course.id === id)?.name ?? id;
}

export function courseDescription(id: CourseId, locale: InterfaceLocale): string {
  const description = DESCRIPTIONS[id][locale];
  return COURSE_CATALOG.find(course => course.id === id)?.introductoryDays === 2
    ? `${INTRODUCTION[locale]} ${description}`
    : description;
}
