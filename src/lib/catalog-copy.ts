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
};

const DESCRIPTIONS: Record<CourseId, LocalizedText> = {
  "javascript-pro": text("Три дня Pro: преобразование данных, асинхронные ошибки и проверяемый проект. Нужен Node.js.", "Three Pro days: data transformations, async failures and a tested project. Requires Node.js.", "Се рӯзи Pro: табдили додаҳо, хатогиҳои асинхронӣ ва лоиҳаи санҷидашаванда. Node.js лозим аст.", "Три дні Pro: перетворення даних, асинхронні помилки й проєкт із тестами. Потрібен Node.js.", "Proの3日間。データ変換、非同期エラー、テスト可能な課題に取り組みます。Node.jsが必要です。", "Pro 3일 과정입니다. 데이터 변환, 비동기 오류와 테스트 가능한 프로젝트를 다룹니다. Node.js가 필요합니다."),
  "backend-pro": text("Три дня Pro: проверка HTTP-запросов, права владельца и тесты серверного поведения. Нужен Node.js.", "Three Pro days: HTTP validation, ownership authorization and server behavior tests. Requires Node.js.", "Се рӯзи Pro: санҷиши HTTP, ҳуқуқи соҳиб ва санҷишҳои рафтори сервер. Node.js лозим аст.", "Три дні Pro: перевірка HTTP-запитів, права власника й тести поведінки сервера. Потрібен Node.js.", "Proの3日間。HTTPの検証、所有者の認可、サーバーの動作テストを学びます。Node.jsが必要です。", "Pro 3일 과정입니다. HTTP 검증, 소유자 권한과 서버 동작 테스트를 배웁니다. Node.js가 필요합니다."),
  "architecture-expert": text("Три дня Expert: отказоустойчивость, модель угроз и план восстановления. Работа с письменными архитектурными решениями.", "Three Expert days: resilience, threat modeling and recovery plans through written architecture decisions.", "Се рӯзи Expert: устуворӣ, модели таҳдид ва нақшаи барқарорсозӣ бо қарорҳои хаттии меъморӣ.", "Три дні Expert: стійкість до відмов, модель загроз і план відновлення через письмові архітектурні рішення.", "Expertの3日間。障害への備え、脅威モデル、復旧計画を設計文書で学びます。", "Expert 3일 과정입니다. 장애 대응, 위협 모델과 복구 계획을 설계 문서로 학습합니다."),
  "ux-pro": text("Три дня Pro: исследование задачи, прототип и проверка удобства на учебном кейсе.", "Three Pro days: problem research, prototyping and usability evaluation through a learning case.", "Се рӯзи Pro: таҳқиқи масъала, прототип ва санҷиши осонии истифода дар мисоли омӯзишӣ.", "Три дні Pro: дослідження проблеми, прототип і перевірка зручності на навчальному кейсі.", "Proの3日間。学習用ケースで課題調査、プロトタイプ、使いやすさの評価に取り組みます。", "Pro 3일 과정입니다. 학습 사례를 통해 문제 조사, 프로토타입과 사용성 평가를 진행합니다."),
  "business-pro": text("Три дня Pro: проверяемые эксперименты, экономика продукта и решения по данным учебного кейса.", "Three Pro days: testable experiments, product economics and decisions based on learning-case data.", "Се рӯзи Pro: таҷрибаҳои санҷидашаванда, иқтисоди маҳсулот ва қарор аз додаҳои мисоли омӯзишӣ.", "Три дні Pro: перевірювані експерименти, економіка продукту й рішення за даними навчального кейсу.", "Proの3日間。検証可能な実験、製品の収支、学習ケースのデータに基づく判断を学びます。", "Pro 3일 과정입니다. 검증 가능한 실험, 제품 수익 구조와 사례 데이터 기반 의사 결정을 배웁니다."),
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
    'Переменные и функции. Запускайте примеры через Python 3 на своём компьютере.',
    'Variables and functions. Run examples with Python 3 on your own computer.',
    'Тағйирёбандаҳо ва функсияҳо. Мисолҳоро бо Python 3 дар компютери худ иҷро кунед.',
    'Змінні та функції. Запускайте приклади через Python 3 на власному комп’ютері.',
    '変数と関数を学びます。サンプルは自分のパソコンのPython 3で実行します。',
    '변수와 함수를 배웁니다. 예제는 내 컴퓨터의 Python 3로 실행하세요.'),
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
