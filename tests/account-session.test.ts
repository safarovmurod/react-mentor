import {expect,it,vi} from 'vitest';
import {AuthApiError,AuthRetryableFetchError,type Session,type SupabaseClient} from '@supabase/supabase-js';
import {verifySavedSession} from '@/lib/account/session';

const saved={access_token:'old-access',refresh_token:'saved-refresh',user:{id:'account-a'}} as Session;
function client(getUser:ReturnType<typeof vi.fn>,refreshSession=vi.fn()) {
  return {auth:{getUser,refreshSession}} as unknown as SupabaseClient;
}
it.each([new AuthApiError('Expired access',401,undefined),new AuthApiError('Bad JWT',403,'bad_jwt')])('refreshes rejected access without another interactive login (%s)',async error=>{
  const getUser=vi.fn().mockResolvedValueOnce({data:{user:null},error}).mockResolvedValueOnce({data:{user:{id:'account-a'}},error:null});
  const refreshSession=vi.fn().mockResolvedValue({data:{session:{...saved,access_token:'new-access'}},error:null});
  expect((await verifySavedSession(client(getUser,refreshSession),saved)).access_token).toBe('new-access');
  expect(refreshSession).toHaveBeenCalledTimes(1);expect(getUser.mock.calls.map(call=>call[0])).toEqual(['old-access','new-access']);
});
it('preserves a temporary network failure without rotating the saved refresh token',async()=>{
  const error=new AuthRetryableFetchError('Offline',503),getUser=vi.fn().mockResolvedValue({data:{user:null},error}),refreshSession=vi.fn();
  await expect(verifySavedSession(client(getUser,refreshSession),saved)).rejects.toBe(error);expect(refreshSession).not.toHaveBeenCalled();
});
it('does not reuse a session when refresh discovers another signed-in account',async()=>{
  const getUser=vi.fn().mockResolvedValue({data:{user:null},error:new AuthApiError('Expired',401,undefined)});
  const refreshSession=vi.fn().mockResolvedValue({data:{session:{...saved,user:{id:'account-b'}}},error:null});
  await expect(verifySavedSession(client(getUser,refreshSession),saved)).rejects.toThrow('Сессия изменилась');expect(getUser).toHaveBeenCalledTimes(1);
});
it('requires a new login when the saved refresh token was revoked',async()=>{
  const error=new AuthApiError('Refresh token revoked',400,'refresh_token_not_found');
  const getUser=vi.fn().mockResolvedValue({data:{user:null},error:new AuthApiError('Expired',401,undefined)}),refreshSession=vi.fn().mockResolvedValue({data:{session:null},error});
  await expect(verifySavedSession(client(getUser,refreshSession),saved)).rejects.toBe(error);
});
