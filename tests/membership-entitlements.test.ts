// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { membershipTier, serverMembership } from '@/lib/billing/entitlements';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('membership authorization',()=>{
 const now=Date.parse('2026-10-22T12:00:00Z');
 it('requires an explicitly supported paid tier with a future server expiry',()=>{
  for(const row of [null,{}, {tier:'admin',expires_at:'2099-01-01'}, {tier:'pro'}, {tier:'pro',expires_at:'invalid'}, {tier:'pro',expires_at:'2026-10-22T12:00:00Z'}, {tier:'expert',expires_at:'2026-10-21'}])expect(membershipTier(row,now)).toBe('starter');
  expect(membershipTier({tier:'pro',expires_at:'2026-10-23'},now)).toBe('pro');
  expect(membershipTier({tier:'expert',expires_at:'2026-10-23'},now)).toBe('expert');
 });
 it('fails closed on unavailable membership storage and scopes reads to verified user id',async()=>{
  const maybeSingle=vi.fn().mockResolvedValue({error:{code:'42P01'},data:null});
  const eq=vi.fn().mockReturnValue({maybeSingle});
  const select=vi.fn().mockReturnValue({eq});const from=vi.fn().mockReturnValue({select});
  await expect(serverMembership({from} as unknown as SupabaseClient,'verified-user')).resolves.toEqual({tier:'starter',available:false});
  expect(from).toHaveBeenCalledWith('react_mentor_memberships');expect(eq).toHaveBeenCalledWith('user_id','verified-user');
 });
});
