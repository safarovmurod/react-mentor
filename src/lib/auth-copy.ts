import type { InterfaceLocale } from '@/lib/locale';

export type AuthCopy = {
  signupTitle:string; resetTitle:string; loginTitle:string; intro:string; unavailable:string;
  guest:string; google:string; recommended:string; orEmail:string; name:string; password:string;
  creating:string; saveWait:string; signUp:string; sendLink:string; signIn:string;
  existing:string; createAccount:string; forgot:string; backToLogin:string; security:string;
  googleError:string; resetSent:string; confirmEmail:string;
  firstNameTitle:string; firstNameDescription:string; firstNameStart:string; logout:string; nameError:string;
};
export const AUTH_COPY:Record<InterfaceLocale,AuthCopy>={
  ru:{
    signupTitle:'Начнём учиться вместе',resetTitle:'Восстановить доступ',loginTitle:'Ваш путь в React',intro:'Личный прогресс, заметки и практика — на компьютере и телефоне.',
    unavailable:'Вход и регистрация пока не подключены. Курс и ответы доступны без аккаунта; для AI нужен аккаунт.',
    guest:'Продолжить как гость',google:'Продолжить с Google',recommended:'Рекомендуем',orEmail:'или через email',name:'Ваше имя',password:'Пароль',
    creating:'Создаём…',saveWait:'Подождите…',signUp:'Создать аккаунт',sendLink:'Отправить ссылку',signIn:'Войти с email',existing:'Уже есть аккаунт? Войти',
    createAccount:'Создать аккаунт',forgot:'Забыли пароль?',backToLogin:'Назад ко входу',security:'Google или email · бесплатный аккаунт',
    googleError:'Google вход недоступен. Попробуйте email или повторите позже.',resetSent:'Если этот адрес зарегистрирован, ссылка для сброса пароля придёт на email.',confirmEmail:'Проверьте email и подтвердите адрес. Затем войдите в аккаунт.',
    firstNameTitle:'Как вас называть?',firstNameDescription:'Имя будет в вашем профиле. Изменить его и добавить фото можно в настройках.',firstNameStart:'Начать обучение',logout:'Выйти',nameError:'Не удалось сохранить имя.'
  },
  en:{
    signupTitle:"Let's learn together",resetTitle:'Recover access',loginTitle:'Your React journey',intro:'Your progress, notes and practice — on desktop and mobile.',
    unavailable:'Login and registration are not configured yet. Lessons and answers are available without an account; AI requires an account.',
    guest:'Continue as guest',google:'Continue with Google',recommended:'Recommended',orEmail:'or use email',name:'Your name',password:'Password',
    creating:'Creating…',saveWait:'Please wait…',signUp:'Create account',sendLink:'Send link',signIn:'Sign in with email',existing:'Already have an account? Sign in',
    createAccount:'Create account',forgot:'Forgot password?',backToLogin:'Back to sign in',security:'Google or email · free account',
    googleError:'Google sign-in is unavailable. Try email or try again later.',resetSent:'If this email is registered, you will receive a password reset link.',confirmEmail:'Check your email and confirm your address. Then sign in.',
    firstNameTitle:'What should we call you?',firstNameDescription:'This name will appear in your profile. You can change it and add a photo in Settings.',firstNameStart:'Start learning',logout:'Log out',nameError:'Could not save your name.'
  },
  tg:{
    signupTitle:'Биёед якҷоя омӯзем',resetTitle:'Барқарор кардани дастрасӣ',loginTitle:'Роҳи шумо ба React',intro:'Пешрафт, ёддошт ва машқҳои шахсӣ — дар компютер ва телефон.',
    unavailable:'Воридшавӣ ва бақайдгирӣ ҳоло танзим нашудааст. Дарсҳо бе аккаунт дастрасанд; AI аккаунт мехоҳад.',
    guest:'Идома ҳамчун меҳмон',google:'Идома бо Google',recommended:'Тавсия мешавад',orEmail:'ё бо email',name:'Номи шумо',password:'Рамз',
    creating:'Сохта мешавад…',saveWait:'Лутфан интизор шавед…',signUp:'Сохтани аккаунт',sendLink:'Фиристодани пайванд',signIn:'Воридшавӣ бо email',existing:'Аллакай аккаунт доред? Ворид шавед',
    createAccount:'Сохтани аккаунт',forgot:'Рамзро фаромӯш кардед?',backToLogin:'Бозгашт ба воридшавӣ',security:'Google ё email · аккаунти ройгон',
    googleError:'Воридшавӣ бо Google дастрас нест. Бо email санҷед ё дертар такрор кунед.',resetSent:'Агар ин суроға сабт шуда бошад, пайванди барқароркунӣ ба email меояд.',confirmEmail:'Email-ро санҷед ва суроғаро тасдиқ кунед. Баъд ворид шавед.',
    firstNameTitle:'Шуморо чӣ ном гӯем?',firstNameDescription:'Ном дар профили шумо нишон дода мешавад. Аз Танзимот метавонед онро иваз кунед.',firstNameStart:'Оғози омӯзиш',logout:'Баромадан',nameError:'Ном нигоҳ дошта нашуд.'
  },
  uk:{
    signupTitle:'Нумо навчатися разом',resetTitle:'Відновлення доступу',loginTitle:'Ваш шлях до React',intro:'Особистий прогрес, нотатки та практика — на комп’ютері й телефоні.',
    unavailable:'Вхід і реєстрацію поки не налаштовано. Уроки й відповіді доступні без акаунта; AI потребує акаунта.',
    guest:'Продовжити як гість',google:'Продовжити з Google',recommended:'Рекомендуємо',orEmail:'або через email',name:'Ваше ім’я',password:'Пароль',
    creating:'Створюємо…',saveWait:'Зачекайте…',signUp:'Створити акаунт',sendLink:'Надіслати посилання',signIn:'Увійти через email',existing:'Уже маєте акаунт? Увійти',
    createAccount:'Створити акаунт',forgot:'Забули пароль?',backToLogin:'Назад до входу',security:'Google або email · безплатний акаунт',
    googleError:'Вхід через Google недоступний. Спробуйте email або повторіть пізніше.',resetSent:'Якщо адресу зареєстровано, посилання для скидання пароля надійде на email.',confirmEmail:'Перевірте email і підтвердьте адресу. Потім увійдіть.',
    firstNameTitle:'Як до вас звертатися?',firstNameDescription:'Ім’я відображатиметься у профілі. Змінити його й додати фото можна в налаштуваннях.',firstNameStart:'Почати навчання',logout:'Вийти',nameError:'Не вдалося зберегти ім’я.'
  },
};
