import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { LearningProvider } from '@/components/providers/learning-provider';
import { AccountProvider } from '@/components/account/account-provider';
import { AccountShell } from '@/components/account/account-shell';

const inter = localFont({ src: './fonts/Inter.ttf', weight: '100 900', variable: '--font-inter', display: 'swap' });
const jetbrains = localFont({ src: './fonts/JetBrainsMono.ttf', weight: '100 800', variable: '--font-jetbrains', display: 'swap' });

export const metadata: Metadata = { title:'ReactMentor — Практика React', description:'React, TypeScript и Next.js: учебный план, практика, вопросы и интервью.' };
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="ru" suppressHydrationWarning className={`${inter.variable} ${jetbrains.variable}`}><body><AccountProvider><LearningProvider><AccountShell>{children}</AccountShell></LearningProvider></AccountProvider></body></html>;
}
