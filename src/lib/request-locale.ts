import { cookies, headers } from 'next/headers';
import { LOCALE_COOKIE, negotiateLocale } from '@/lib/locale';

/** Request-time language: saved manual choice > Vercel country > browser language. */
export async function getRequestLocale() {
  const [request, jar] = await Promise.all([headers(), cookies()]);
  return negotiateLocale({
    savedLocale: jar.get(LOCALE_COOKIE)?.value,
    country: request.get('x-vercel-ip-country'),
    acceptLanguage: request.get('accept-language'),
  });
}
