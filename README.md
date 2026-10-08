# React Mentor — Full-Stack Real Learning Platform

Системаи касбии омӯзиши **React**, **JavaScript**, **TypeScript**, **State Management**, **Routing**, **API** ва омодагӣ ба мусоҳиба (Interview) аз сифр то дараҷаи **Junior**.

Лоиҳа дорои санҷиши воқеии 4-қабатаи код, дастрасии офлайн бо IndexedDB (Dexie), ҳамоҳангсозии абрии чанддастгоҳа (Multi-Device Pairing) ва ҳисобкунии 100% воқеии натиҷаҳо мебошад.

---

## 🚀 Стек ва Технологияҳо

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (`strict: true`)
- **State Architecture**:
  - Маҳаллии компонент: `useState`
  - Муштараки UI клиент: `Zustand`
  - Сервер ва кэш: `TanStack React Query`
  - Базаи абрӣ: `Supabase PostgreSQL` бо Row Level Security (RLS)
  - Офлайн ва маҳаллӣ: `IndexedDB` тавассути `Dexie`
- **Код ва Санҷиш**:
  - Муҳаррир: `Monaco Editor`
  - Таҳлил ва санҷиш: `TypeScript Compiler API`
  - Санҷишҳои тестӣ: `Vitest`, `@testing-library/react`, `jsdom`
  - Линтер: `ESLint 9`

---

## ⚡ Оғози Кор (Quick Start)

### 1. Насби бастаҳо
```bash
npm install
```

### 2. Санҷишҳои тестӣ ва типҳо
```bash
npm run typecheck   # Санҷиши сахтгиронаи TypeScript (0 errors)
npm run lint        # Санҷиши ESLint
npm run test        # Санҷиши ҳамаи тестҳои Vitest
npm run test:e2e    # Браузер: прогресс, XP, refresh ва Tutor (desktop + mobile)
npm run build       # Ҷамъоварии production build
```

### 3. Оғози сервери барномасозӣ
```bash
npm run dev
```
Ба браузер ворид шавед: `http://localhost:3000`

---

## 📱 Ҳамоҳангсозии Чанддастгоҳа (Multi-Device Pairing Flow)

Телефон ва компютер ба як ҳисоб ва як пешрафт пайваст мешаванд:

1. **Дастгоҳи А (Компютер)**:
   - Ба саҳифаи `Settings` ё `Devices` гузашта тугмаи **"Подключить другое устройство"**-ро зер кунед.
   - Сервер як рамзи 6-рақамаи яккарата бо эътибори 10-дақиқа тавлид мекунад (дар база танҳо SHA-256 hash нигоҳ дошта мешавад).
2. **Дастгоҳи Б (Телефон)**:
   - Дар экрани аввал тугмаи **"Подключить"**-ро пахш намоед.
   - Рамзи 6-рақамаро ворид кунед.
   - Сервер рамзро тасдиқ карда дастгоҳи навро узви workspace-и аввала месозад.

---

## 💾 Ҳолати Додаҳо: Локально ва Глобально

Дар Header ва Settings корбар метавонад ҳолати корро интихоб кунад:
- **Локально (IndexedDB)**: Тамоми пешрафт танҳо дар ҳамин браузер нигоҳ дошта мешавад ва ба интернет ниёз надорад.
- **Глобально (Supabase Cloud)**: Ҳамаи дастгоҳҳои пайвастшуда як пешрафти муштарак доранд.
- **Интиқол (Migration)**: Бо пахши тугмаи *"Перенести локальный прогресс в глобальный"* тамоми сабтҳо бо калиди яккарата (idempotency key) бе такрори XP ва кӯшишҳо ба абр мегузаранд.

---

## 📊 Формулаи Ҳисобкунии Пешрафт (Ҳеҷ чизи сохта нест!)

### 1. Topic Mastery (Маҳорати мавзӯъ):
- Амалия (Practice) = 40%
- Санҷишҳо (Quiz/Test) = 25%
- Мусоҳиба (Interview) = 20%
- Такрор (Revision) = 15%
*(Агар ягон категория кӯшиш надошта бошад, вазнҳо байни категорияҳои мавҷуд баробар тақсим мешаванд).*

### 2. Course Progress (Пешрафти умумӣ):
$$\text{CourseProgress} = (\text{Coverage} \times 0.60) + (\text{Mastery} \times 0.40)$$

### 3. Streak ва Вақти Фаъол:
Таймер танҳо вақти воқеии фаъолиятро ҳисоб мекунад. Ҳангоми бефаъолиятӣ беш аз 5 дақиқа ё пинҳон шудани варақаи браузер (tab hidden) таймер ба таври худкор таваққуф мекунад.

---

## 🗄️ Базаи Додаҳо ва Мигратсияҳои Supabase

Файли мигратсияи пурра бо ҷадвалҳо, индексҳо ва сиёсатҳои Row Level Security (RLS) дар роҳи зерин ҷойгир аст:
```text
supabase/migrations/20261001000000_init_schema.sql
```

Тағйирёбандаҳои муҳит дар `.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PAIRING_SECRET=
AI_TUTOR_ENABLED=false
AI_PROVIDER_KEY=
AI_MODEL=cx/gpt-6.1-sol
```

Шрифтҳои Inter ва JetBrains Mono дар `src/app/fonts` бо лицензияҳои OFL локалӣ нигоҳ дошта мешаванд; build ба Google Fonts ниёз надорад.

AI Tutor аз тугмаи header ё «Чуқур фаҳмон» дар ҷавоби тест кушода мешавад. Аввал аз ҳамон саволу ҷавоб ва маводи шарҳи лоиҳа ҷавоб медиҳад — 0 токен. Танҳо барои саволи дар мавод ёфтнашуда `AI_TUTOR_ENABLED=true` ва калиди нави серверии AnyModel лозиманд. Қадамҳо, маҳдудиятҳои токен ва санҷишҳо дар [docs/anymodel-tutor.md](docs/anymodel-tutor.md) оварда шудаанд. Калидро танҳо дар танзимоти махфӣ ё `.env.local` нигоҳ доред.
# Accounts

Google/email sign-in, private profiles, device sync and authenticator QR setup:
[docs/accounts-setup.md](docs/accounts-setup.md). Supports a shared Supabase Free
project using separate ReactMentor tables. Apply its standalone migration and
configure Vercel public Supabase variables before expecting live sign-in.


## 🌍 Автоинтихоби забон аз рӯйи кишвар (аввалин воридшавӣ)

Сервер дар **дархости аввал** кишвари меҳмонро муайян мекунад ва саҳифаро бо забони мувофиқ намоиш медиҳад:

| Country | Interface |
|---|---|
| Russia (\`RU\`) | Русский (\`ru\`) |
| Ukraine (\`UA\`) | Українська (\`uk\`) |
| United States (\`US\`) | English (\`en\`) |
| Tajikistan (\`TJ\`) | Тоҷикӣ (\`tg\`) |
| Дигар кишварҳо | Бо \`Accept-Language\`, агар дастгирӣ шавад; вагарна \`en\` |

**Тартиб:** интихоби дастии нигоҳдошташуда > кишвари меҳмон аз Cloudflare \`CF-IPCountry\` > кишвари IP аз Vercel \`x-vercel-ip-country\` > \`Accept-Language\` > English. Иваз кардани забон аз **Settings** дар cookie \`react-mentor-locale\` ва прогресси аккаунт/браузер нигоҳ дошта мешавад. Забон/прогресси қаблан интихобшударо муҳоҷирати кишвар аз нав нанависад.

**Агар Cloudflare Proxy фаъол бошад:** барои гирифтани кишвари *меҳмони воқеӣ*, дар Cloudflare → **Network → IP Geolocation → On** ё **Rules → Transform Rules → Managed Transforms → Add visitor location headers**-ро фаъол кунед. Дар акси ҳол Vercel метавонад танҳо IP-и Cloudflare-ро бинад. Қисми \`CF-IPCountry\` худкор аз IP дар тарафи Cloudflare ҳисоб мешавад, дар браузер иҷозати Location ё API-и пулакӣ лозим нест.

**Маҳдудиятҳо:** геолокатсияи IP метавонад ҳангоми VPN, прокси ё роутерҳо нодуруст бошад; корбар ҳамеша метавонад забонро дастӣ иваз кунад. **Интерфейси украинӣ** мавҷуд аст, аммо матнҳои ҳамаи дарсҳо ҳанӯз тарҷумаи украинӣ надоранд: забони дарсро дар Settings (\`en\`, \`ru\` ё \`tg\`) алоҳида интихоб кардан мумкин.

**Санҷиш:** \`npm run test\`, \`npm run test:e2e\`, \`npm run test:auth\`. Сценарияҳои \`e2e/locale.spec.ts\` чор кишвар, cookie, интихоби дастӣ, refresh, ҳисоби кӯҳна ва fallback-и браузерро дар localhost бо header-ҳои симулятсияшуда месанҷанд. Санҷиши IP-и воқеӣ бояд дар production аз шабакаҳои воқеии ин кишварҳо анҷом дода шавад.

**Барои дастрасии оммавӣ:** Vercel Preview-и ҳамин project аз Deployment Protection / Vercel Login муҳофизат шудааст. \`READY\` будани deployment маънои дастрасии умумиро надорад. Соҳиби project бояд домени воқеӣ ва танзимоти Deployment Protection-ро аз назар гузаронад; то он вақт санҷиши оммавии production тасдиқ нашудааст.
