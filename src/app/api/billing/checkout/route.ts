import { authenticatedUser } from '@/lib/account/require-user';
import { readBoundedJson, RequestBodyError } from '@/lib/security/request';
import { communityResponse } from '@/lib/billing/community-server';

/** Deliberately no checkout URL or success response until a real provider is selected. */
export async function POST(request: Request) {
  if (!await authenticatedUser(request)) return communityResponse({ error: 'authentication_required' }, 401);
  let body: unknown;
  try { body = await readBoundedJson(request, 1024); }
  catch (error) { return communityResponse({ error: 'invalid_request' }, error instanceof RequestBodyError ? error.status : 400); }
  if (!body || typeof body !== 'object' || !('tier' in body) || !['pro', 'expert'].includes(String(body.tier))) {
    return communityResponse({ error: 'invalid_plan' }, 400);
  }
  return communityResponse({ error: 'billing_not_configured' }, 503);
}
