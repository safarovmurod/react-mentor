import type { Session, SupabaseClient } from '@supabase/supabase-js';

/** Refresh a rejected access token once without asking for another Google login. */
export async function verifySavedSession(client: SupabaseClient, saved: Session): Promise<Session> {
  let session=saved;
  let verification=await client.auth.getUser(session.access_token);
  if (verification.error && (verification.error.status===401 || verification.error.code==='bad_jwt')) {
    const refreshed=await client.auth.refreshSession();
    if (refreshed.error) throw refreshed.error;
    if (!refreshed.data.session || refreshed.data.session.user.id!==saved.user.id) throw new Error('Сессия изменилась. Повторите открытие аккаунта.');
    session=refreshed.data.session;
    verification=await client.auth.getUser(session.access_token);
  }
  if (verification.error) throw verification.error;
  if (verification.data.user?.id!==saved.user.id) throw new Error('Не удалось подтвердить аккаунт. Войдите ещё раз.');
  return {...session,user:verification.data.user};
}
