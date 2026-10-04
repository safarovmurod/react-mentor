import { NextResponse } from 'next/server';

// Retire the old demo/shared-workspace pairing endpoint. A device signs into
// its owner's account; a caller-supplied userId can never grant membership.
export async function POST() {
  return NextResponse.json({error:'Войдите в тот же аккаунт на телефоне через Google или email. Старые коды подключения больше не поддерживаются.'},{status:410});
}
