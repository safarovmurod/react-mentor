import { z } from 'zod';
import { readBoundedJson, RequestBodyError } from '@/lib/security/request';
import { communityResponse, requireMembership } from '@/lib/billing/community-server';

const Input = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('message'), text: z.string().trim().min(1).max(2000) }).strict(),
  z.object({ kind: z.literal('heartbeat') }).strict(),
  z.object({ kind: z.literal('leave') }).strict(),
]);
export async function GET(request: Request) {
  const access = await requireMembership(request);
  if ('failure' in access) return access.failure;
  const [messages, online] = await Promise.all([
    access.client.from('react_mentor_chat_messages').select('id,author_id,author_name,body,created_at').order('created_at', { ascending: false }).limit(50),
    access.client.from('react_mentor_chat_presence').select('user_id', { count: 'exact', head: true }).gt('last_seen', new Date(Date.now() - 90_000).toISOString()),
  ]);
  if (messages.error || online.error) return communityResponse({ error: 'service_unavailable' }, 503);
  return communityResponse({ messages: (messages.data || []).reverse(), online: online.count || 0, tier: access.tier });
}
export async function POST(request: Request) {
  const access = await requireMembership(request);
  if ('failure' in access) return access.failure;
  let body: unknown;
  try { body = await readBoundedJson(request, 9000); }
  catch (error) { return communityResponse({ error: 'invalid_request' }, error instanceof RequestBodyError ? error.status : 400); }
  const parsed = Input.safeParse(body);
  if (!parsed.success) return communityResponse({ error: 'invalid_request' }, 400);
  const input = parsed.data;
  const result = input.kind === 'message'
    ? await access.client.rpc('react_mentor_send_message', { message_body: input.text })
    : await access.client.rpc('react_mentor_chat_heartbeat', { leaving: input.kind === 'leave' });
  if (result.error) {
    const status = result.error.code === 'PT429' ? 429 : result.error.code === '42501' ? 403 : 503;
    return communityResponse({ error: status === 429 ? 'rate_limited' : status === 403 ? 'membership_required' : 'service_unavailable' }, status);
  }
  return communityResponse({ ok: true }, input.kind === 'message' ? 201 : 200);
}
