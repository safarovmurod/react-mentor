import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { LearningProvider } from '@/components/providers/learning-provider';
import { ActivityTracker } from '@/components/providers/activity-tracker';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { TutorDrawer } from '@/components/layout/tutor-drawer';

const inter = localFont({ src: './fonts/Inter.ttf', weight: '100 900', variable: '--font-inter', display: 'swap' });
const jetbrains = localFont({ src: './fonts/JetBrainsMono.ttf', weight: '100 800', variable: '--font-jetbrains', display: 'swap' });

export const metadata: Metadata = { title:'ReactMentor — Практика React', description:'React, TypeScript и Next.js: учебный план, практика, вопросы и интервью.' };
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="ru" suppressHydrationWarning className={`${inter.variable} ${jetbrains.variable}`}><body><LearningProvider><ActivityTracker/><Header/><Sidebar/><main className="app-main"><div className="page-container">{children}</div></main><TutorDrawer/></LearningProvider></body></html>;
}
