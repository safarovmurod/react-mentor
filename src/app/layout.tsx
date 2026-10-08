import type { Metadata } from 'next';
import { getRequestLocale } from '@/lib/request-locale';
import { PUBLIC_COPY } from '@/lib/public-copy';
import localFont from 'next/font/local';
import './globals.css';
import { LearningProvider } from '@/components/providers/learning-provider';
import { AccountProvider } from '@/components/account/account-provider';
import { AccountShell } from '@/components/account/account-shell';

const inter = localFont({ src: './fonts/Inter.ttf', weight: '100 900', variable: '--font-inter', display: 'swap' });
const jetbrains = localFont({ src: './fonts/JetBrainsMono.ttf', weight: '100 800', variable: '--font-jetbrains', display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const copy=PUBLIC_COPY[await getRequestLocale()];
  return {title:copy.title,description:copy.description};
}
export default async function RootLayout({children}:{children:React.ReactNode}) {
  const locale=await getRequestLocale();
  return <html lang={locale} suppressHydrationWarning className={`${inter.variable} ${jetbrains.variable}`}><body><AccountProvider initialLocale={locale}><LearningProvider initialLocale={locale}><AccountShell>{children}</AccountShell></LearningProvider></AccountProvider></body></html>;
}
