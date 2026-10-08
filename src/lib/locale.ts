/** Locale negotiation is UI personalization, never an authorization signal. */
export const LOCALE_COOKIE = 'react-mentor-locale';
export const INTERFACE_LOCALES = ['ru', 'uk', 'en', 'tg'] as const;
export type InterfaceLocale = typeof INTERFACE_LOCALES[number];
export type ContentLocale = 'ru' | 'en' | 'tg';

export function isInterfaceLocale(value: unknown): value is InterfaceLocale {
  return typeof value === 'string' && (INTERFACE_LOCALES as readonly string[]).includes(value);
}

export function contentLocaleFor(locale: InterfaceLocale): ContentLocale {
  // The existing lessons are available in RU/EN/TG only. Never label Russian
  // or English lesson text as a Ukrainian translation.
  return locale === 'ru' ? 'ru' : locale === 'tg' ? 'tg' : 'en';
}

const countryLocales: Record<string, InterfaceLocale> = {
  RU: 'ru', UA: 'uk', US: 'en', TJ: 'tg',
};

/** q=0 entries must not be selected. Unsupported languages fall through. */
export function localeFromAcceptLanguage(value: string | null | undefined): InterfaceLocale {
  if (!value) return 'en';
  const preferred = value.split(',').map((item, index) => {
    const [tag, ...parts] = item.trim().split(';');
    const qPart = parts.find(part => /^q=/i.test(part.trim()));
    const q = qPart ? Number(qPart.trim().slice(2)) : 1;
    const language = tag?.trim().toLowerCase().split('-')[0];
    return { index, language, q };
  }).filter(item => Number.isFinite(item.q) && item.q > 0 && item.q <= 1)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  for (const item of preferred) {
    if (isInterfaceLocale(item.language)) return item.language;
  }
  return 'en';
}

export function negotiateLocale(input: {
  country?: string | null;
  cloudflareCountry?: string | null;
  acceptLanguage?: string | null;
  savedLocale?: string | null;
}): InterfaceLocale {
  if (isInterfaceLocale(input.savedLocale)) return input.savedLocale;
  // When Cloudflare proxies a domain, Vercel sees the proxy's country.
  // Prefer Cloudflare's visitor country when it provides one.
  const country = (input.cloudflareCountry?.trim() || input.country?.trim() || '').toUpperCase();
  if (Object.hasOwn(countryLocales, country)) return countryLocales[country];
  return localeFromAcceptLanguage(input.acceptLanguage);
}

export function getManualLocale(): InterfaceLocale | null {
  if (typeof document === 'undefined') return null;
  const found = document.cookie.split(';').map(part => part.trim()).find(part => part.startsWith(LOCALE_COOKIE + '='));
  const value = found?.slice(LOCALE_COOKIE.length + 1) || null;
  return isInterfaceLocale(value) ? value : null;
}

export function persistManualLocale(locale: InterfaceLocale) {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}
