'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ReactPracticeLibrary } from '@/components/learning/react-course-entry';
export default function ReactPracticeLibraryPage() {
  return <section className="react-entry"><Link href="/courses/react" className="back-link"><ArrowLeft size={16}/>React</Link><ReactPracticeLibrary/></section>;
}
