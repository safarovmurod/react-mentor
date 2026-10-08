import { cookies, headers } from 'next/headers';
import { LOCALE_COOKIE, negotiateLocale } from '@/lib/locale';

/** Request-time language: manual > Cloudflare visitor > Vercel country > browser. */
export async function getRequestLocale() {
  const [request, jar] = await Promise.all([headers(), cookies()]);
  return negotiateLocale({
    savedLocale: jar.get(LOCALE_COOKIE)?.value,
    country: request.get('x-vercel-ip-country'),
    cloudflareCountry: request.get('cf-ipcountry'),
    acceptLanguage: request.get('accept-language'),
  });
}
