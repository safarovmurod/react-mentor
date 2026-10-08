# React Mentor — Full-Stack Real Learning Platform

Системаи касбии омӯзиши **React**, **JavaScript**, **TypeScript**, **State Management**, **Routing**, **API** ва омодагӣ ба мусоҳиба (Interview) аз сифр то дараҷаи **Junior**.

Лоиҳа дарсҳо, машқҳои код, тестҳо, XP ва пешрафтро пешниҳод мекунад. Пешрафти фаъол дар `localStorage` нигоҳ дошта мешавад; ҳамоҳангсозии ҳисоб тавассути Supabase танҳо баъд аз танзими сервер кор мекунад. Санҷиши баъзе машқҳо дастӣ аст; ин сертификат ё кафолати омодагӣ ба кор нест.

---

## 🚀 Стек ва Технологияҳо

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (`strict: true`)
- **State Architecture**:
  - Маҳаллии компонент: `useState`
  - Муштараки UI клиент: `Zustand`
  - Маводи курсҳо: JSON-и серверӣ ва API routes
  - Базаи абрӣ: `Supabase PostgreSQL` бо Row Level Security (RLS)
  - Кэши фаъоли маҳаллӣ: `localStorage`, алоҳида барои меҳмон ва ҳар ҳисоб
  - `Dexie`: дастрасӣ ба маълумоти кӯҳна барои export; базаи асосии пешрафти фаъол нест
- **Код ва Санҷиш**:
  - Машқҳо: textarea, preview дар iframe-и sandbox ва санҷиши функсия дар Web Worker
  - Машқҳои лоиҳавӣ: self-check-и дастӣ; ҳамаи забонҳо компилятори худкор надоранд
  - Санҷишҳои тестӣ: `Vitest`, `@testing-library/react`, `jsdom`
  - Линтер: `ESLint 9`

---

## ⚡ Оғози Кор (Quick Start)

### 1. Насби бастаҳо
```bash
npm ci
```

### 2. Санҷишҳои тестӣ ва типҳо
```bash
npm run typecheck   # Санҷиши сахтгиронаи TypeScript (0 errors)
npm run lint        # Санҷиши ESLint
npm run test        # Санҷиши ҳамаи тестҳои Vitest
npm run test:e2e    # Браузер: прогресс, XP, refresh ва Tutor (desktop + mobile)
npm run test:auth   # Авторизация бо mock backend; live OAuth-ро исбот намекунад
npm run build       # Ҷамъоварии production build
```

### 3. Оғози сервери барномасозӣ
```bash
npm run dev
```
Ба браузер ворид шавед: `http://localhost:3000`

---

## 📱 Ҳамоҳангсозии чанддастгоҳа

Дар ҳар дастгоҳ ба **ҳамон ҳисоб** ворид шавед. QR танҳо саҳифаи login-ро мекушояд ва худ аз худ ворид намекунад. Endpoint-ҳои кӯҳнаи шашрақамаи `/api/pair/create` ва `/api/pair/connect` бо HTTP 410 баста шудаанд. Танзимоти воқеии Supabase ва Google/email дар [docs/accounts-setup.md](docs/accounts-setup.md) оварда шудааст.

---

## 💾 Нигоҳдории маълумот

- **Меҳмон**: пешрафт дар ҳамин браузер мемонад. Кэш кардани пешрафт маънои дастрасии пурраи офлайн ба ҳамаи саҳифаҳо надорад.
- **Ҳисоб**: кэши алоҳидаи маҳаллӣ ва sync-и Supabase бо RLS, merge ва revision check. Тағйироти ду дастгоҳ бояд бе такрори XP якҷоя шаванд.
- **Интиқол**: ворид кардани пешрафти меҳмон ба ҳисоб амали алоҳидаи settings аст. Logout пешрафти меҳмонро нест намекунад.

---

## 📊 Пешрафт ва вақти омӯзиш

UI дарсҳо, саволҳои омӯхташуда, ҷавобҳо, машқҳо ва XP-и сабтшударо нишон медиҳад. Формулаи кӯҳнаи weighted mastery аз `progress-engine` дар workflow-и фаъол истифода намешавад.

### Вақти фаъол
Таймер танҳо вақти воқеии фаъолиятро ҳисоб мекунад. Ҳангоми бефаъолиятӣ беш аз 5 дақиқа ё пинҳон шудани варақаи браузер (tab hidden) таймер ба таври худкор таваққуф мекунад.

---

## 🗄️ Базаи Додаҳо ва Мигратсияҳои Supabase

Барои ҳисобҳои фаъол мигратсияҳои `20261004000000_accounts.sql` ва `20261005000000_progress_conflict.sql` лозиманд; қадамҳо дар [docs/accounts-setup.md](docs/accounts-setup.md) ҳастанд. Мигратсияи кӯҳнаи workspace шарти кори локалӣ нест. Пеш аз тағйироти shared Supabase лоиҳа, redirects ва ҷадвалҳои барномаҳои дигарро ҳифз кунед.

Тағйирёбандаҳои муҳит дар `.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
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
| Russia (`RU`) | Русский (`ru`) |
| Ukraine (`UA`) | Українська (`uk`) |
| United States (`US`) | English (`en`) |
| Tajikistan (`TJ`) | Тоҷикӣ (`tg`) |
| Дигар кишварҳо | Бо `Accept-Language`, агар дастгирӣ шавад; вагарна `en` |

**Тартиб:** интихоби дастии нигоҳдошташуда > кишвари меҳмон аз Cloudflare `CF-IPCountry` > кишвари IP аз Vercel `x-vercel-ip-country` > `Accept-Language` > English. Иваз кардани забон аз **Settings** дар cookie `react-mentor-locale` ва прогресси аккаунт/браузер нигоҳ дошта мешавад. Забон/прогресси қаблан интихобшударо муҳоҷирати кишвар аз нав нанависад.

**Агар Cloudflare Proxy фаъол бошад:** барои гирифтани кишвари *меҳмони воқеӣ*, дар Cloudflare → **Network → IP Geolocation → On** ё **Rules → Transform Rules → Managed Transforms → Add visitor location headers**-ро фаъол кунед. Дар акси ҳол Vercel метавонад танҳо IP-и Cloudflare-ро бинад. Қисми `CF-IPCountry` худкор аз IP дар тарафи Cloudflare ҳисоб мешавад, дар браузер иҷозати Location ё API-и пулакӣ лозим нест.

**Маҳдудиятҳо:** геолокатсияи IP метавонад ҳангоми VPN, прокси ё роутерҳо нодуруст бошад; корбар ҳамеша метавонад забонро дастӣ иваз кунад. **Интерфейси украинӣ** мавҷуд аст, аммо матнҳои ҳамаи дарсҳо ҳанӯз тарҷумаи украинӣ надоранд: забони дарсро дар Settings (`en`, `ru` ё `tg`) алоҳида интихоб кардан мумкин.

**Санҷиш:** `npm run test`, `npm run test:e2e`, `npm run test:auth`. Сценарияҳои `e2e/locale.spec.ts` чор кишвар, cookie, интихоби дастӣ, refresh, ҳисоби кӯҳна ва fallback-и браузерро дар localhost бо header-ҳои симулятсияшуда месанҷанд. Санҷиши IP-и воқеӣ бояд дар production аз шабакаҳои воқеии ин кишварҳо анҷом дода шавад.

**Барои дастрасии оммавӣ:** Vercel Preview-и ҳамин project аз Deployment Protection / Vercel Login муҳофизат шудааст. `READY` будани deployment маънои дастрасии умумиро надорад. Соҳиби project бояд домени воқеӣ ва танзимоти Deployment Protection-ро аз назар гузаронад; то он вақт санҷиши оммавии production тасдиқ нашудааст.

## Launch readiness

Санҷишҳои иҷрошуда, корҳои баста ва қадами навбатӣ: [docs/launch-checklist.md](docs/launch-checklist.md). Матни пешакии startup application: [docs/startup-application.md](docs/startup-application.md). Он ҳанӯз фиристода нашудааст.
