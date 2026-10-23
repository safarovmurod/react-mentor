import type { InterfaceLocale } from '@/lib/locale';
import { JAPANESE_PUBLIC_COPY } from './locales/ja';
import { KOREAN_PUBLIC_COPY } from './locales/ko';

type PublicLocaleCopy = {
  privacyLabel: string; termsLabel: string; start: string;
  eyebrow: string; heroLead: string; heroEmphasis: string; heroEnd: string;
  heroDescription: string; seePlatform: string; heroNote: string;
  featuresTitle: string; features: { title:string; description:string }[];
  ctaTitle: string; ctaDescription: string; ctaLink: string;
  title: string; description: string;
  privacy: { title:string; introduction:string; sections:{title:string;text:string}[]; notice:string };
  terms: { title:string; introduction:string; sections:{title:string;text:string}[]; notice:string };
};

export const PUBLIC_COPY: Record<InterfaceLocale, PublicLocaleCopy> = {
  ja:JAPANESE_PUBLIC_COPY,
  ko:KOREAN_PUBLIC_COPY,
  tg: {
    privacyLabel:'Махфият',termsLabel:'Қоидаҳо',start:'Оғоз кардан',
    eyebrow:'ПЛАТФОРМАИ ОМӮЗИШ ВА МАЛАКАҲО',heroLead:'Аз шавқи нав',heroEmphasis:'то малакаи амалӣ',heroEnd:'қадам ба қадам.',
    heroDescription:'Барномасозӣ, муҳандисии AI, дизайн, соҳибкорӣ ва маркетинг: самти худро интихоб кунед. DevAtlas дарсҳо, супоришҳои амалӣ ва пайгирии пешрафтро дар як ҷо ҷамъ мекунад.',
    seePlatform:'Дидани платформа',heroNote:'Омӯзиш ҳамчун меҳмон ҳам имконпазир аст. Ҳамоҳангсозии абрӣ ва AI-и онлайн ба танзимоти сервер вобастаанд.',
    featuresTitle:'Аз назария то амалия',
    features:[
      {title:'Дарсҳои қадам ба қадам',description:'Самти омӯзишро интихоб карда, мавзӯъҳоро қадам ба қадам аз худ кунед.'},
      {title:'Супориш ва лоиҳа',description:'Донишро дар амал истифода баред, натиҷаро санҷед ва пешрафтро бинед.'},
      {title:'AI Tutor — ихтиёрӣ',description:'Маводи маҳаллӣ бе API кор мекунад; AI-и онлайн танзими алоҳида мехоҳад.'},
    ],
    ctaTitle:'Барои машқи аввал омодаед?',ctaDescription:'Аз дарсҳо ва машқҳои мавҷуда оғоз кунед.',ctaLink:'Ба дарсҳо',
    title:'DevAtlas — омӯзиш бо амалия',description:'Платформаи омӯзиши малакаҳо: барномасозӣ, дизайн, соҳибкорӣ ва маркетинг бо дарсҳо ва супоришҳои амалӣ.',
    privacy:{
      title:'Махфият',introduction:'DevAtlas платформаи омӯзишӣ аст. Пешрафти меҳмон дар браузер ва маълумоти аккаунт ҳангоми пайваст будани Supabase дар абр нигоҳ дошта мешаванд.',
      sections:[
        {title:'Маълумоти аккаунт',text:'Почтаи электронӣ, профил, ёддоштҳо, ҷавобҳо ва пешрафти омӯзишӣ метавонанд коркард шаванд. Ҳамоҳангсозии абрӣ аккаунти фаъол мехоҳад.'},
        {title:'AI Tutor',text:'Ҷавобҳои маводи платформа бе провайдери беруна дастрасанд. Ҳангоми фаъол будани AI-и онлайн савол ва контексти зарурӣ метавонад ба провайдер фиристода шавад.'},
        {title:'Назорати маълумот',text:'Маълумоти меҳмонро дар браузер идора кунед. Барои маълумоти аккаунт аз танзимоти аккаунт истифода баред.'},
      ],
      notice:'Ин шарҳи ибтидоӣ аст. Пеш аз оғози истифодаи оммавӣ оператор бояд маълумоти тамос, муҳлати нигоҳдорӣ ва ҳуҷҷатҳои ҳуқуқиро тасдиқ кунад.',
    },
    terms:{
      title:'Қоидаҳои истифода',introduction:'DevAtlas платформаи омӯзишӣ аст. Машқ, тест ва ёрии AI кафолати сертификат ё корёбӣ нестанд.',
      sections:[
        {title:'Аккаунт',text:'Маълумоти воридшавиро махфӣ нигоҳ доред ва ба маълумоти дигарон беиҷозат дастрасӣ нагиред.'},
        {title:'Имкониятҳои ихтиёрӣ',text:'AI-и онлайн ва ҳамоҳангсозии абрӣ аз конфигуратсияи сервер ва провайдерҳо вобастаанд.'},
      ],
      notice:'Пеш аз истифодаи тиҷоратӣ шартҳои ниҳоӣ ва маълумоти оператор бояд аз нигоҳи ҳуқуқӣ тасдиқ шаванд.',
    },
  },
  ru: {
    privacyLabel:'Конфиденциальность',termsLabel:'Правила',start:'Начать обучение',
    eyebrow:'ОБРАЗОВАТЕЛЬНАЯ ПЛАТФОРМА',heroLead:'От нового интереса',heroEmphasis:'к полезному навыку',heroEnd:'шаг за шагом.',
    heroDescription:'Программирование, ИИ-инженерия, дизайн, бизнес и маркетинг — выберите своё направление. DevAtlas объединяет понятные уроки, практические задания и отслеживание прогресса.',
    seePlatform:'Посмотреть платформу',heroNote:'Можно учиться как гость. Облачная синхронизация и онлайн-AI зависят от настроек сервера.',
    featuresTitle:'От теории к практике',
    features:[
      {title:'Пошаговые уроки',description:'Выберите направление и осваивайте новые темы по понятному учебному плану.'},
      {title:'Задания и проекты',description:'Применяйте знания на практике, проверяйте результат и следите за прогрессом.'},
      {title:'AI Tutor — дополнительно',description:'Локальные материалы работают без API; онлайн-AI требует настройки.'},
    ],
    ctaTitle:'Готовы к первому упражнению?',ctaDescription:'Начните с уже доступных уроков и задач.',ctaLink:'К урокам',
    title:'DevAtlas — обучение на практике',description:'Платформа для развития навыков: программирование, ИИ-инженерия, дизайн, бизнес и маркетинг с уроками и практическими заданиями.',
    privacy:{
      title:'Конфиденциальность',introduction:'DevAtlas — образовательная платформа. Гостевой прогресс сохраняется в браузере, а данные аккаунта — в Supabase, если сервис настроен.',
      sections:[
        {title:'Данные аккаунта',text:'Могут обрабатываться email, профиль, заметки, ответы и учебный прогресс. Облачная синхронизация требует активного аккаунта.'},
        {title:'AI Tutor',text:'Ответы из встроенных материалов доступны без внешнего провайдера. При использовании настроенного онлайн-AI вопросы и необходимый контекст могут отправляться провайдеру.'},
        {title:'Контроль данных',text:'Локальные данные можно удалить в браузере. Данные аккаунта управляются через настройки аккаунта.'},
      ],
      notice:'Это предварительное описание. До публичного запуска оператор должен уточнить контакт, сроки хранения и юридические документы.',
    },
    terms:{
      title:'Правила использования',introduction:'DevAtlas — учебная платформа. Упражнения, тесты и ответы AI не гарантируют сертификат или трудоустройство.',
      sections:[
        {title:'Аккаунт',text:'Не сообщайте другим данные входа и не пытайтесь получить чужие данные.'},
        {title:'Дополнительные возможности',text:'Онлайн-AI и облачная синхронизация зависят от настроек сервера и внешних провайдеров.'},
      ],
      notice:'Перед коммерческим использованием нужны утверждённые условия и данные оператора.',
    },
  },
  en: {
    privacyLabel:'Privacy',termsLabel:'Terms',start:'Start learning',
    eyebrow:'A PLATFORM FOR LEARNING AND SKILLS',heroLead:'Turn your curiosity',heroEmphasis:'into useful skills',heroEnd:'one step at a time.',
    heroDescription:'Programming, AI engineering, design, business and marketing: choose your direction. DevAtlas brings together clear lessons, practical assignments and progress tracking.',
    seePlatform:'Explore the platform',heroNote:'Guest learning is available. Cloud sync and online AI depend on server configuration.',
    featuresTitle:'From theory to practice',
    features:[
      {title:'Step-by-step lessons',description:'Choose a direction and explore new topics with a clear study plan.'},
      {title:'Assignments and projects',description:'Put knowledge into practice, check your work and track your progress.'},
      {title:'Optional AI Tutor',description:'Local learning materials work without an API; online AI requires setup.'},
    ],
    ctaTitle:'Ready for your first exercise?',ctaDescription:'Start with the available lessons and practical assignments.',ctaLink:'Go to lessons',
    title:'DevAtlas — learn by doing',description:'Build skills in programming, AI engineering, design, business and marketing with lessons and practical assignments.',
    privacy:{
      title:'Privacy',introduction:'DevAtlas is an educational platform. Guest progress is stored in your browser; account data is stored in Supabase when configured.',
      sections:[
        {title:'Account data',text:'Email address, profile, notes, answers and learning progress may be processed. Cloud synchronization requires an active account.'},
        {title:'AI Tutor',text:'Built-in learning answers work without a third-party provider. When configured online AI is used, your question and necessary context may be sent to the provider.'},
        {title:'Data controls',text:'You can manage guest data in your browser. Use account settings for account data.'},
      ],
      notice:'This is a preliminary overview. Before public release, the operator must confirm contact details, retention periods and final legal policies.',
    },
    terms:{
      title:'Terms of use',introduction:'DevAtlas is a learning platform. Exercises, quizzes and AI support do not guarantee a certificate or employment.',
      sections:[
        {title:'Account',text:'Keep your credentials private and do not attempt to access another person’s data.'},
        {title:'Optional features',text:'Online AI and cloud synchronization depend on server configuration and external providers.'},
      ],
      notice:'Final terms and operator details require legal review before commercial use.',
    },
  },
  uk: {
    privacyLabel:'Конфіденційність',termsLabel:'Правила',start:'Почати навчання',
    eyebrow:'ОСВІТНЯ ПЛАТФОРМА',heroLead:'Від нового інтересу',heroEmphasis:'до корисної навички',heroEnd:'крок за кроком.',
    heroDescription:'Програмування, Інженерія ШІ, дизайн, бізнес і маркетинг — оберіть свій напрям. DevAtlas поєднує зрозумілі уроки, практичні завдання й відстеження прогресу.',
    seePlatform:'Переглянути платформу',heroNote:'Можна навчатися як гість. Хмарна синхронізація й онлайн-AI потребують налаштування сервера.',
    featuresTitle:'Від теорії до практики',
    features:[
      {title:'Покрокові уроки',description:'Оберіть напрям і опановуйте нові теми за зрозумілим навчальним планом.'},
      {title:'Завдання й проєкти',description:'Застосовуйте знання на практиці, перевіряйте результат і стежте за прогресом.'},
      {title:'AI Tutor — додатково',description:'Локальні матеріали працюють без API; онлайн-AI потребує налаштування.'},
    ],
    ctaTitle:'Готові до першої вправи?',ctaDescription:'Почніть із наявних уроків і завдань.',ctaLink:'До уроків',
    title:'DevAtlas — навчання на практиці',description:'Платформа для розвитку навичок: програмування, інженерія ШІ, дизайн, бізнес і маркетинг з уроками та практичними завданнями.',
    privacy:{
      title:'Конфіденційність',introduction:'DevAtlas — освітня платформа. Гостьовий прогрес зберігається в браузері, дані акаунта — в Supabase, якщо сервіс налаштовано.',
      sections:[
        {title:'Дані акаунта',text:'Можуть оброблятися електронна адреса, профіль, нотатки, відповіді й навчальний прогрес. Для хмарної синхронізації потрібен акаунт.'},
        {title:'AI Tutor',text:'Відповіді з вбудованих матеріалів працюють без стороннього провайдера. Під час використання онлайн-AI запитання й потрібний контекст можуть передаватися провайдеру.'},
        {title:'Керування даними',text:'Гостьові дані можна видалити в браузері. Дані акаунта керуються через його налаштування.'},
      ],
      notice:'Це попередній опис. До публічного запуску оператор має підтвердити контакти, строки зберігання та остаточні юридичні документи.',
    },
    terms:{
      title:'Правила користування',introduction:'DevAtlas — навчальна платформа. Вправи, тести та відповіді AI не гарантують сертифікат або працевлаштування.',
      sections:[
        {title:'Акаунт',text:'Зберігайте дані входу в таємниці й не намагайтеся отримати доступ до чужих даних.'},
        {title:'Додаткові можливості',text:'Онлайн-AI та хмарна синхронізація залежать від налаштувань сервера й зовнішніх провайдерів.'},
      ],
      notice:'Перед комерційним використанням потрібні затверджені умови й дані оператора.',
    },
  },
};
