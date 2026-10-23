import { describe, expect, it } from 'vitest';
import { COPY } from '@/lib/i18n';
import { PUBLIC_COPY } from '@/lib/public-copy';
import { AUTH_COPY } from '@/lib/auth-copy';
import { ACCOUNT_COPY, localizedAuthError } from '@/lib/account-copy';
import { LEARNING_UI_COPY, lessonTranslationNotice } from '@/lib/learning-ui-copy';
import { contentLocaleFor, INTERFACE_LOCALES, INTERFACE_LANGUAGE_NAMES } from '@/lib/locale';

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,shape(item)]));
  expect(typeof value).toBe('string');
  expect((value as string).trim()).not.toBe('');
  return 'text';
}

describe('supported interface languages', () => {
  for (const [name, dictionary] of Object.entries({ COPY, PUBLIC_COPY, AUTH_COPY, ACCOUNT_COPY, LEARNING_UI_COPY })) {
    it(`${name} contains every nonempty interface key in all supported languages`, () => {
      for (const locale of INTERFACE_LOCALES) {
        expect(shape(dictionary[locale])).toEqual(shape(dictionary.ru));
      }
    });
  }

  it('names each locale in its own language and identifies untranslated lesson coverage', () => {
    expect(INTERFACE_LANGUAGE_NAMES.ja).toBe('日本語');
    expect(INTERFACE_LANGUAGE_NAMES.ko).toBe('한국어');
    expect(lessonTranslationNotice('ja')).toContain('日本語の教材翻訳はまだありません');
    expect(lessonTranslationNotice('ko')).toContain('한국어로 번역된 학습 자료는 아직 없습니다');
    expect(contentLocaleFor('ja')).toBe('en');
    expect(contentLocaleFor('ko')).toBe('en');
  });

  it('shows localized authentication errors without leaking provider details', () => {
    expect(localizedAuthError({code:'invalid_credentials',message:'sensitive server details'},'login','ja')).toBe('ログインできませんでした。メールアドレスとパスワードを確認してください。');
    expect(localizedAuthError({status:429,message:'sensitive server details'},'login','ko')).toBe('시도 횟수가 너무 많습니다. 잠시 후 다시 시도하세요.');
  });
});
