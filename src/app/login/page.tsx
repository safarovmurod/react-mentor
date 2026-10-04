'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function LoginPage() {const router=useRouter();useEffect(()=>{router.replace('/home');},[router]);return <p role="status">Открываем обучение…</p>;}
