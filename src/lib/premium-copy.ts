import type { InterfaceLocale } from './locale';

export const PREMIUM_COPY:Record<InterfaceLocale,{starter:string;all:string;login:string;required:string;unavailable:string;plans:string;signIn:string;protected:string}>= {
  ru:{starter:'Бесплатно',all:'Все уровни',login:'Войдите в аккаунт, чтобы открыть этот курс.',required:'Для этого курса нужна действующая подписка',unavailable:'Не удалось проверить доступ. Попробуйте ещё раз.',plans:'Посмотреть тарифы',signIn:'Войти',protected:'Доступ к материалам проверяется сервером.'},
  tg:{starter:'Ройгон',all:'Ҳамаи сатҳҳо',login:'Барои кушодани ин курс ба аккаунт ворид шавед.',required:'Барои ин курс обунаи фаъол лозим аст',unavailable:'Дастрасӣ санҷида нашуд. Боз кӯшиш кунед.',plans:'Дидани тарифҳо',signIn:'Ворид шудан',protected:'Дастрасӣ ба мавод аз тарафи сервер санҷида мешавад.'},
  en:{starter:'Free',all:'All plans',login:'Sign in to open this course.',required:'This course requires an active subscription',unavailable:'Access could not be verified. Please retry.',plans:'View plans',signIn:'Sign in',protected:'The server verifies access to course materials.'},
  uk:{starter:'Безкоштовно',all:'Усі рівні',login:'Увійдіть в акаунт, щоб відкрити цей курс.',required:'Для цього курсу потрібна чинна підписка',unavailable:'Не вдалося перевірити доступ. Спробуйте ще раз.',plans:'Переглянути тарифи',signIn:'Увійти',protected:'Доступ до матеріалів перевіряється сервером.'},
  ja:{starter:'無料',all:'すべてのプラン',login:'このコースを開くにはログインしてください。',required:'このコースには有効なサブスクリプションが必要です',unavailable:'アクセスを確認できませんでした。再試行してください。',plans:'プランを見る',signIn:'ログイン',protected:'教材へのアクセスはサーバーで確認します。'},
  ko:{starter:'무료',all:'모든 요금제',login:'이 과정을 열려면 로그인하세요.',required:'이 과정에는 활성 구독이 필요합니다',unavailable:'접근 권한을 확인하지 못했습니다. 다시 시도하세요.',plans:'요금제 보기',signIn:'로그인',protected:'서버에서 학습 자료 접근 권한을 확인합니다.'},
};
