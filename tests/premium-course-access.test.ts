// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CourseAccessTier } from '@/lib/courses/access';
const mocks = vi.hoisted(() => ({ authenticatedUser: vi.fn(), serverClient: vi.fn(), load: vi.fn() }));
vi.mock('@/lib/account/require-user', () => ({ authenticatedUser: mocks.authenticatedUser }));
vi.mock('@/lib/supabase/server', () => ({ getSupabaseServerClient: mocks.serverClient }));
vi.mock('@/lib/courses/content', () => ({ loadCourseContent: mocks.load }));
import { courseAccessTier, hasCourseAccess } from '@/lib/courses/access';
import { GET } from '@/app/api/courses/[courseId]/route';

const secretContent = { lessons: [{ title: 'PREMIUM_PRIVATE_LESSON', solution: 'PREMIUM_PRIVATE_SOLUTION' }] };
function request(courseId: string, authorization?: string, extra: HeadersInit = {}) {
  return GET(new Request(`https://example.test/api/courses/${courseId}`, {
    headers: { ...(authorization ? { authorization } : {}), ...extra },
  }), { params: Promise.resolve({ courseId }) });
}
function membership(data: unknown, error: unknown = null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data, error });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });
  mocks.serverClient.mockReturnValue({ from });
  return { from, select, eq, maybeSingle };
}
async function expectDenied(response: Response, status: number, body: unknown) {
  expect(response.status).toBe(status);
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  const text = await response.text();
  expect(JSON.parse(text)).toEqual(body);
  expect(text).not.toMatch(/PREMIUM_PRIVATE|lessons|solution|practice|starterCode/);
  expect(mocks.load).not.toHaveBeenCalled();
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.authenticatedUser.mockResolvedValue({ id: 'server-verified-user' });
  mocks.load.mockResolvedValue(secretContent);
});

describe('catalog access and tier hierarchy', () => {
  it('makes ordinary courses Starter and sets each premium requirement explicitly', () => {
    for (const id of ['html', 'python', 'backend', 'react', 'ux-design', 'business-foundations']) expect(courseAccessTier(id)).toBe('starter');
    for (const id of ['javascript-pro', 'backend-pro', 'ux-pro', 'business-pro']) expect(courseAccessTier(id)).toBe('pro');
    expect(courseAccessTier('architecture-expert')).toBe('expert');
    expect(courseAccessTier('unknown')).toBeNull();
  });
  it('Expert includes Pro while Pro cannot access Expert and Starter cannot access either', () => {
    const tiers: CourseAccessTier[] = ['starter', 'pro', 'expert'];
    const expected = [[true, false, false], [true, true, false], [true, true, true]];
    tiers.forEach((member, index) => tiers.forEach((required, other) => expect(hasCourseAccess(member, required)).toBe(expected[index][other])));
  });
});

describe('premium course API authorization before content loading', () => {
  it('leaves existing Starter content public without authentication or membership queries', async () => {
    const response = await request('html');
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('public, max-age=60');
    expect(mocks.authenticatedUser).not.toHaveBeenCalled();
    expect(mocks.serverClient).not.toHaveBeenCalled();
    expect(mocks.load).toHaveBeenCalledWith('html');
  });
  it('denies every premium course without bearer authentication and sends no private body', async () => {
    for (const course of ['javascript-pro', 'backend-pro', 'architecture-expert', 'ux-pro', 'business-pro']) {
      await expectDenied(await request(course), 401, { error: 'authentication_required' });
    }
    expect(mocks.authenticatedUser).not.toHaveBeenCalled();
  });
  it('does not trust cookies, plan headers, malformed prefixes or whitespace tokens', async () => {
    for (const header of [undefined, 'Basic fake', 'bearer fake', 'Bearer ']) {
      await expectDenied(await request('javascript-pro', header, { cookie: 'tier=expert; session=fake', 'x-membership-tier': 'expert' }), 401, { error: 'authentication_required' });
    }
    expect(mocks.authenticatedUser).not.toHaveBeenCalled();
  });
  it('requires the server-verified identity rather than a bearer prefix alone', async () => {
    mocks.authenticatedUser.mockResolvedValue(null);
    await expectDenied(await request('javascript-pro', 'Bearer forged-token'), 401, { error: 'authentication_required' });
    expect(mocks.serverClient).not.toHaveBeenCalled();
  });
  it('queries own membership with caller JWT and denies nonexistent, expired and invalid memberships', async () => {
    for (const row of [null, { tier: 'pro', expires_at: '2001-01-01' }, { tier: 'expert', expires_at: 'invalid' }, { tier: 'admin', expires_at: '2099-01-01' }]) {
      const db = membership(row);
      await expectDenied(await request('javascript-pro', 'Bearer verified-token'), 403, { error: 'membership_required', requiredTier: 'pro' });
      expect(mocks.serverClient).toHaveBeenLastCalledWith('Bearer verified-token');
      expect(db.eq).toHaveBeenCalledWith('user_id', 'server-verified-user');
    }
  });
  it('fails closed with 503 when membership storage is missing, errors or throws', async () => {
    mocks.serverClient.mockReturnValue(null);
    await expectDenied(await request('javascript-pro', 'Bearer verified-token'), 503, { error: 'service_unavailable' });
    membership(null, { message: 'internal_database_secret', code: '42P01' });
    await expectDenied(await request('javascript-pro', 'Bearer verified-token'), 503, { error: 'service_unavailable' });
    mocks.serverClient.mockImplementation(() => { throw new Error('internal_database_secret'); });
    await expectDenied(await request('javascript-pro', 'Bearer verified-token'), 503, { error: 'service_unavailable' });
  });
  it('allows Pro content for Pro, but never loads Expert content for Pro', async () => {
    membership({ tier: 'pro', expires_at: '2099-01-01' });
    const allowed = await request('javascript-pro', 'Bearer verified-token');
    expect(allowed.status).toBe(200);
    expect(allowed.headers.get('cache-control')).toBe('private, no-store');
    expect(await allowed.json()).toEqual(secretContent);
    mocks.load.mockClear();
    await expectDenied(await request('architecture-expert', 'Bearer verified-token'), 403, { error: 'membership_required', requiredTier: 'expert' });
  });
  it('allows Expert members to load both Pro and Expert with private no-store responses', async () => {
    membership({ tier: 'expert', expires_at: '2099-01-01' });
    for (const course of ['javascript-pro', 'architecture-expert']) {
      const response = await request(course, 'Bearer verified-token');
      expect(response.status).toBe(200);
      expect(response.headers.get('cache-control')).toBe('private, no-store');
      expect(await response.json()).toEqual(secretContent);
    }
  });
  it('rejects unknown paths without loading any source', async () => {
    expect((await request('unknown-pro')).status).toBe(404);
    expect((await request('../javascript-pro')).status).toBe(404);
    expect(mocks.load).not.toHaveBeenCalled();
  });
});
