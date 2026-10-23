import type { SupabaseClient } from '@supabase/supabase-js';

export type MembershipTier = 'starter' | 'pro' | 'expert';
export function membershipTier(row: unknown, now = Date.now()): MembershipTier {
  if (!row || typeof row !== 'object') return 'starter';
  const value = row as Record<string, unknown>;
  if (value.tier !== 'pro' && value.tier !== 'expert') return 'starter';
  if (typeof value.expires_at !== 'string' || !Number.isFinite(Date.parse(value.expires_at)) || Date.parse(value.expires_at) <= now) return 'starter';
  return value.tier;
}
/** Server query uses the caller JWT and own-row RLS, never user metadata/localStorage. */
export async function serverMembership(client: SupabaseClient, userId: string) {
  if (typeof window !== 'undefined') throw new Error('Server membership called in browser');
  const result = await client.from('react_mentor_memberships').select('tier,expires_at').eq('user_id', userId).maybeSingle();
  if (result.error) return { tier: 'starter' as const, available: false };
  return { tier: membershipTier(result.data), available: true };
}
