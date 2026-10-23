import type { InterfaceLocale } from './locale';

export function courseDayCount(count:number,locale:InterfaceLocale){
  const plural=new Intl.PluralRules(locale).select(count);
  if(locale==='ru')return `${count} ${plural==='one'?'день':plural==='few'?'дня':'дней'}`;
  if(locale==='uk')return `${count} ${plural==='one'?'день':plural==='few'?'дні':'днів'}`;
  if(locale==='tg')return `${count} рӯз`;
  if(locale==='ja')return `${count}日`;
  if(locale==='ko')return `${count}일`;
  return `${count} ${count===1?'day':'days'}`;
}

export function courseTopicCount(count:number,locale:'ru'|'uk'){
  const plural=new Intl.PluralRules(locale).select(count);
  return `${count} ${locale==='ru'?(plural==='one'?'тема':plural==='few'?'темы':'тем'):(plural==='one'?'тема':plural==='few'?'теми':'тем')}`;
}
