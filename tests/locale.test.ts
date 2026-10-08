// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { contentLocaleFor, localeFromAcceptLanguage, negotiateLocale } from '@/lib/locale';

describe('visitor locale: saved preference, geolocation, browser language', () => {
  it.each([
    ['RU','ru'],['UA','uk'],['US','en'],['TJ','tg'],
    ['ru','ru'],['ua','uk'],['tj','tg'],
  ] as const)('country %s resolves to %s', (country, expected) => {
    expect(negotiateLocale({country,acceptLanguage:'en-US,en;q=0.9'})).toBe(expected);
  });
  it('a saved manual choice always wins over country and browser language', () => {
    expect(negotiateLocale({country:'RU',savedLocale:'tg',acceptLanguage:'uk-UA'})).toBe('tg');
    expect(negotiateLocale({country:'UA',savedLocale:'en',acceptLanguage:'ru-RU'})).toBe('en');
  });
  it('ignores untrusted/unsupported saved values', () => {
    expect(negotiateLocale({country:'US',savedLocale:'<script>'})).toBe('en');
  });
  it('uses browser languages for other countries, weighted by q', () => {
    expect(negotiateLocale({country:'DE',acceptLanguage:'de-DE,uk-UA;q=0.9,ru;q=0.7'})).toBe('uk');
    expect(negotiateLocale({country:'FR',acceptLanguage:'fr-CA,ru-RU;q=0.6,en-US;q=0.8'})).toBe('en');
    expect(negotiateLocale({country:'ZZ',acceptLanguage:'tg-TJ,tg;q=0.9'})).toBe('tg');
    expect(negotiateLocale({country:'ZZ',acceptLanguage:'ja-JP,ko-KR'})).toBe('en');
  });
  it('respects q=0, invalid q, and deterministic tie order', () => {
    expect(localeFromAcceptLanguage('uk;q=0,ru;q=0.9,en;q=0.8')).toBe('ru');
    expect(localeFromAcceptLanguage('ru;q=0,uk;q=bogus,en;q=0.3')).toBe('en');
    expect(localeFromAcceptLanguage('uk;q=0.8,en;q=0.8')).toBe('uk');
  });
  it('does not invent Ukrainian lesson translations', () => {
    expect(contentLocaleFor('uk')).toBe('en');
    expect(contentLocaleFor('tg')).toBe('tg');
    expect(contentLocaleFor('ru')).toBe('ru');
  });
});
