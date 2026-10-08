import type { InterfaceLocale } from '@/lib/locale';

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
  tg: {
    privacyLabel:'Махфият',termsLabel:'Қоидаҳо',start:'Оғоз кардан',
    eyebrow:'ПЛАТФОРМАИ ОМӮЗИШИ БАРНОМАСОЗӢ',heroLead:'React ва JavaScript-ро',heroEmphasis:'бо амалия',heroEnd:'омӯзед.',
    heroDescription:'React Mentor дарсҳо, машқҳои код, тестҳо ва пайгирии пешрафтро дар як ҷо ҷамъ мекунад. Барои шурӯъкунандагон — аз қадами аввал.',
    seePlatform:'Дидани платформа',heroNote:'Омӯзиш ҳамчун меҳмон ҳам имконпазир аст. Ҳамоҳангсозии абрӣ ва AI-и онлайн ба танзимоти сервер вобастаанд.',
    featuresTitle:'Аз назария то амалия',
    features:[
      {title:'Дарсҳои қадам ба қадам',description:'JavaScript, React ва дигар мавзӯъҳоро бо нақша омӯзед.'},
      {title:'Машқ ва тест',description:'Код нависед, ҷавобҳоро санҷед ва пешрафтро бинед.'},
      {title:'AI Tutor — ихтиёрӣ',description:'Маводи маҳаллӣ бе API кор мекунад; AI-и онлайн танзими алоҳида мехоҳад.'},
    ],
    ctaTitle:'Барои машқи аввал омодаед?',ctaDescription:'Аз дарсҳо ва машқҳои мавҷуда оғоз кунед.',ctaLink:'Ба дарсҳо',
    title:'ReactMentor — омӯзиш бо амалия',description:'Омӯзиши JavaScript ва React бо дарсҳо, машқҳо ва санҷишҳо.',
    privacy:{
      title:'Махфият',introduction:'React Mentor платформаи омӯзишии барномасозист. Пешрафти меҳмон дар браузер ва маълумоти аккаунт ҳангоми пайваст будани Supabase дар абр нигоҳ дошта мешаванд.',
      sections:[
        {title:'Маълумоти аккаунт',text:'Почтаи электронӣ, профил, ёддоштҳо, ҷавобҳо ва пешрафти омӯзишӣ метавонанд коркард шаванд. Ҳамоҳангсозии абрӣ аккаунти фаъол мехоҳад.'},
        {title:'AI Tutor',text:'Ҷавобҳои маводи платформа бе провайдери беруна дастрасанд. Ҳангоми фаъол будани AI-и онлайн савол ва контексти зарурӣ метавонад ба провайдер фиристода шавад.'},
        {title:'Назорати маълумот',text:'Маълумоти меҳмонро дар браузер идора кунед. Барои маълумоти аккаунт аз танзимоти аккаунт истифода баред.'},
      ],
      notice:'Ин шарҳи ибтидоӣ аст. Пеш аз оғози истифодаи оммавӣ оператор бояд маълумоти тамос, муҳлати нигоҳдорӣ ва ҳуҷҷатҳои ҳуқуқиро тасдиқ кунад.',
    },
    terms:{
      title:'Қоидаҳои истифода',introduction:'React Mentor платформаи омӯзишӣ аст. Машқ, тест ва ёрии AI кафолати сертификат ё корёбӣ нестанд.',
      sections:[
        {title:'Аккаунт',text:'Маълумоти воридшавиро махфӣ нигоҳ доред ва ба маълумоти дигарон беиҷозат дастрасӣ нагиред.'},
        {title:'Имкониятҳои ихтиёрӣ',text:'AI-и онлайн ва ҳамоҳангсозии абрӣ аз конфигуратсияи сервер ва провайдерҳо вобастаанд.'},
      ],
      notice:'Пеш аз истифодаи тиҷоратӣ шартҳои ниҳоӣ ва маълумоти оператор бояд аз нигоҳи ҳуқуқӣ тасдиқ шаванд.',
    },
  },
  ru: {
    privacyLabel:'Конфиденциальность',termsLabel:'Правила',start:'Начать обучение',
    eyebrow:'ПЛАТФОРМА ДЛЯ ОБУЧЕНИЯ ПРОГРАММИРОВАНИЮ',heroLead:'Изучайте React и JavaScript',heroEmphasis:'на практике',heroEnd:'каждый день.',
    heroDescription:'React Mentor объединяет пошаговые уроки, упражнения, тесты и отслеживание прогресса. Для начинающих — с самого первого шага.',
    seePlatform:'Посмотреть платформу',heroNote:'Можно учиться как гость. Облачная синхронизация и онлайн-AI зависят от настроек сервера.',
    featuresTitle:'От теории к практике',
    features:[
      {title:'Пошаговые уроки',description:'Изучайте JavaScript, React и другие темы по учебному плану.'},
      {title:'Практика и тесты',description:'Пишите код, проверяйте ответы и следите за прогрессом.'},
      {title:'AI Tutor — дополнительно',description:'Локальные материалы работают без API; онлайн-AI требует настройки.'},
    ],
    ctaTitle:'Готовы к первому упражнению?',ctaDescription:'Начните с уже доступных уроков и задач.',ctaLink:'К урокам',
    title:'ReactMentor — обучение на практике',description:'Изучение JavaScript и React с уроками, упражнениями и тестами.',
    privacy:{
      title:'Конфиденциальность',introduction:'React Mentor — платформа для обучения программированию. Гостевой прогресс сохраняется в браузере, а данные аккаунта — в Supabase, если сервис настроен.',
      sections:[
        {title:'Данные аккаунта',text:'Могут обрабатываться email, профиль, заметки, ответы и учебный прогресс. Облачная синхронизация требует активного аккаунта.'},
        {title:'AI Tutor',text:'Ответы из встроенных материалов доступны без внешнего провайдера. При использовании настроенного онлайн-AI вопросы и необходимый контекст могут отправляться провайдеру.'},
        {title:'Контроль данных',text:'Локальные данные можно удалить в браузере. Данные аккаунта управляются через настройки аккаунта.'},
      ],
      notice:'Это предварительное описание. До публичного запуска оператор должен уточнить контакт, сроки хранения и юридические документы.',
    },
    terms:{
      title:'Правила использования',introduction:'React Mentor — учебная платформа. Упражнения, тесты и ответы AI не гарантируют сертификат или трудоустройство.',
      sections:[
        {title:'Аккаунт',text:'Не сообщайте другим данные входа и не пытайтесь получить чужие данные.'},
        {title:'Дополнительные возможности',text:'Онлайн-AI и облачная синхронизация зависят от настроек сервера и внешних провайдеров.'},
      ],
      notice:'Перед коммерческим использованием нужны утверждённые условия и данные оператора.',
    },
  },
  en: {
    privacyLabel:'Privacy',termsLabel:'Terms',start:'Start learning',
    eyebrow:'LEARN PROGRAMMING BY BUILDING',heroLead:'Learn React and JavaScript',heroEmphasis:'by practicing',heroEnd:'every day.',
    heroDescription:'React Mentor brings together step-by-step lessons, coding exercises, quizzes and progress tracking. Built for beginners from their first step.',
    seePlatform:'Explore the platform',heroNote:'Guest learning is available. Cloud sync and online AI depend on server configuration.',
    featuresTitle:'From theory to practice',
    features:[
      {title:'Step-by-step lessons',description:'Learn JavaScript, React and more with a structured study plan.'},
      {title:'Coding exercises and quizzes',description:'Write code, check answers and track progress.'},
      {title:'Optional AI Tutor',description:'Local learning materials work without an API; online AI requires setup.'},
    ],
    ctaTitle:'Ready for your first exercise?',ctaDescription:'Start with the existing lessons and coding exercises.',ctaLink:'Go to lessons',
    title:'ReactMentor — learn by doing',description:'Learn JavaScript and React with lessons, exercises and quizzes.',
    privacy:{
      title:'Privacy',introduction:'React Mentor is a programming learning platform. Guest progress is stored in your browser; account data is stored in Supabase when configured.',
      sections:[
        {title:'Account data',text:'Email address, profile, notes, answers and learning progress may be processed. Cloud synchronization requires an active account.'},
        {title:'AI Tutor',text:'Built-in learning answers work without a third-party provider. When configured online AI is used, your question and necessary context may be sent to the provider.'},
        {title:'Data controls',text:'You can manage guest data in your browser. Use account settings for account data.'},
      ],
      notice:'This is a preliminary overview. Before public release, the operator must confirm contact details, retention periods and final legal policies.',
    },
    terms:{
      title:'Terms of use',introduction:'React Mentor is a learning platform. Exercises, quizzes and AI support do not guarantee a certificate or employment.',
      sections:[
        {title:'Account',text:'Keep your credentials private and do not attempt to access another person’s data.'},
        {title:'Optional features',text:'Online AI and cloud synchronization depend on server configuration and external providers.'},
      ],
      notice:'Final terms and operator details require legal review before commercial use.',
    },
  },
  uk: {
    privacyLabel:'Конфіденційність',termsLabel:'Правила',start:'Почати навчання',
    eyebrow:'ПЛАТФОРМА ДЛЯ ВИВЧЕННЯ ПРОГРАМУВАННЯ',heroLead:'Вивчайте React і JavaScript',heroEmphasis:'на практиці',heroEnd:'щодня.',
    heroDescription:'React Mentor поєднує покрокові уроки, вправи з кодом, тести й відстеження прогресу. Для початківців — із першого кроку.',
    seePlatform:'Переглянути платформу',heroNote:'Можна навчатися як гість. Хмарна синхронізація й онлайн-AI потребують налаштування сервера.',
    featuresTitle:'Від теорії до практики',
    features:[
      {title:'Покрокові уроки',description:'Вивчайте JavaScript, React та інші теми за навчальним планом.'},
      {title:'Практика й тести',description:'Пишіть код, перевіряйте відповіді й стежте за прогресом.'},
      {title:'AI Tutor — додатково',description:'Локальні матеріали працюють без API; онлайн-AI потребує налаштування.'},
    ],
    ctaTitle:'Готові до першої вправи?',ctaDescription:'Почніть із наявних уроків і завдань.',ctaLink:'До уроків',
    title:'ReactMentor — навчання на практиці',description:'Вивчайте JavaScript і React за допомогою уроків, вправ і тестів.',
    privacy:{
      title:'Конфіденційність',introduction:'React Mentor — платформа для вивчення програмування. Гостьовий прогрес зберігається в браузері, дані акаунта — в Supabase, якщо сервіс налаштовано.',
      sections:[
        {title:'Дані акаунта',text:'Можуть оброблятися електронна адреса, профіль, нотатки, відповіді й навчальний прогрес. Для хмарної синхронізації потрібен акаунт.'},
        {title:'AI Tutor',text:'Відповіді з вбудованих матеріалів працюють без стороннього провайдера. Під час використання онлайн-AI запитання й потрібний контекст можуть передаватися провайдеру.'},
        {title:'Керування даними',text:'Гостьові дані можна видалити в браузері. Дані акаунта керуються через його налаштування.'},
      ],
      notice:'Це попередній опис. До публічного запуску оператор має підтвердити контакти, строки зберігання та остаточні юридичні документи.',
    },
    terms:{
      title:'Правила користування',introduction:'React Mentor — навчальна платформа. Вправи, тести та відповіді AI не гарантують сертифікат або працевлаштування.',
      sections:[
        {title:'Акаунт',text:'Зберігайте дані входу в таємниці й не намагайтеся отримати доступ до чужих даних.'},
        {title:'Додаткові можливості',text:'Онлайн-AI та хмарна синхронізація залежать від налаштувань сервера й зовнішніх провайдерів.'},
      ],
      notice:'Перед комерційним використанням потрібні затверджені умови й дані оператора.',
    },
  },
};
