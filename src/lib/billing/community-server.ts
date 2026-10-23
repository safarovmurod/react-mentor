import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { MembershipTier } from './entitlements';
import { authenticatedUser } from '@/lib/account/require-user';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { serverMembership } from './entitlements';

export function communityResponse(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });
}
export async function requireMembership(request: Request): Promise<{ failure: Response } | { client: SupabaseClient; user: User; tier: MembershipTier }> {
  const user = await authenticatedUser(request);
  if (!user) return { failure: communityResponse({ error: 'authentication_required' }, 401) };
  const client = getSupabaseServerClient(request.headers.get('authorization') || undefined);
  if (!client) return { failure: communityResponse({ error: 'service_unavailable' }, 503) };
  const membership = await serverMembership(client, user.id);
  if (!membership.available) return { failure: communityResponse({ error: 'service_unavailable' }, 503) };
  if (membership.tier === 'starter') return { failure: communityResponse({ error: 'membership_required' }, 403) };
  return { client, user, tier: membership.tier };
}
