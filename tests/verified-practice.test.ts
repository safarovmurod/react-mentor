// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { validateFirstHtmlLesson } from '@/lib/practice/html-validator';

const mocks = vi.hoisted(() => ({ authenticate: vi.fn(), admin: vi.fn() }));
vi.mock('@/lib/account/require-user', () => ({ authenticatedUser: mocks.authenticate }));
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdminClient: mocks.admin }));

const solution = '<!doctype html><html lang="tg"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Салом</title></head><body><main><section><h1><span>Саҳифаи ман</span></h1><p>Матни дигар ва ҳалли дигар.</p><a href="https://developer.mozilla.org/">Маълумот</a></section></main></body></html>';
const input = { courseId: 'html', lessonId: 'html-day-01', code: solution };
function request(body: unknown, token = 'valid') {
  return new Request('http://localhost/api/practice/submit', { method: 'POST', headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
}
function database(rpc = vi.fn().mockResolvedValue({ data: [{ awarded_xp: 50, total_xp: 50 }], error: null })) {
  return { rpc, from: vi.fn((table: string) => ({ select: () => ({ eq: vi.fn().mockResolvedValue({ data: table.endsWith('_days') ? [] : [{ lesson_id: 'html-day-01', xp: 50 }], error: null }) }) })) };
}
beforeEach(() => { mocks.authenticate.mockReset().mockResolvedValue({ id: 'learner-a' }); mocks.admin.mockReset().mockReturnValue(database()); });

describe('server HTML semantic validation', () => {
  it('accepts alternate names, wording, nesting and language', () => {
    expect(validateFirstHtmlLesson(solution).every(check => check.passed)).toBe(true);
  });
  it('does not accept rubric text hidden in comments or script strings', () => {
    const checks = validateFirstHtmlLesson(`<!-- ${solution} --><script>${JSON.stringify(solution)}</script>`);
    expect(checks.some(check => check.passed)).toBe(false);
  });
  it('requires actual heading, paragraph and meaningful safe link inside main', () => {
    const checks = validateFirstHtmlLesson(solution.replace('<main>', '<div>').replace('</main>', '</div>'));
    for (const id of ['heading', 'paragraph', 'link']) expect(checks.find(check => check.id === id)?.passed).toBe(false);
    expect(validateFirstHtmlLesson(solution.replace('https://developer.mozilla.org/', 'javascript:alert(1)')).find(check => check.id === 'link')?.passed).toBe(false);
  });
  it('does not execute scripts or fetch resources', () => {
    const code = solution.replace('</main>', '<script>throw new Error("must never execute")</script><img src="https://example.invalid/track"></main>');
    expect(validateFirstHtmlLesson(code).every(check => check.passed)).toBe(true);
  });
});

describe('verified practice API boundary', () => {
  it('requires bearer authentication before accessing privileged database', async () => {
    const { POST } = await import('@/app/api/practice/submit/route');
    expect((await POST(request(input, ''))).status).toBe(401);
    expect(mocks.admin).not.toHaveBeenCalled();
  });
  it('reports missing server configuration without pretending to award XP', async () => {
    mocks.admin.mockReturnValue(null);
    const { POST } = await import('@/app/api/practice/submit/route');
    expect((await POST(request(input))).status).toBe(503);
  });
  it('rejects invalid sessions and forged client result/XP claims', async () => {
    const { POST } = await import('@/app/api/practice/submit/route');
    mocks.authenticate.mockResolvedValueOnce(null);
    expect((await POST(request(input))).status).toBe(401);
    expect((await POST(request({ ...input, passed: true, xp: 1000, userId: 'victim' }))).status).toBe(400);
  });
  it('does not record failed submissions', async () => {
    const db = database(); mocks.admin.mockReturnValue(db);
    const { POST } = await import('@/app/api/practice/submit/route');
    const response = await POST(request({ ...input, code: '<h1>Incomplete</h1>' }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ passed: false, awardedXp: 0 });
    expect(db.rpc).not.toHaveBeenCalled();
  });
  it('records the server-authenticated identity and a hash rather than learner source', async () => {
    const db = database(); mocks.admin.mockReturnValue(db);
    const { POST } = await import('@/app/api/practice/submit/route');
    const response = await POST(request(input));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ verified: true, passed: true, awardedXp: 50, totalXp: 50 });
    expect(db.rpc).toHaveBeenCalledWith('react_mentor_record_verified_html', { learner_id: 'learner-a', solution_hash: expect.stringMatching(/^[a-f0-9]{64}$/) });
    expect(response.headers.get('cache-control')).toBe('no-store');
  });
  it('preserves idempotent award result returned by transactional RPC', async () => {
    mocks.admin.mockReturnValue(database(vi.fn().mockResolvedValue({ data: [{ awarded_xp: 0, total_xp: 50 }], error: null })));
    const { POST } = await import('@/app/api/practice/submit/route');
    expect(await (await POST(request(input))).json()).toMatchObject({ awardedXp: 0, totalXp: 50 });
  });
  it('rejects large bodies and unsupported lessons', async () => {
    const { POST } = await import('@/app/api/practice/submit/route');
    expect((await POST(request({ ...input, code: 'a'.repeat(130_000) }))).status).toBe(413);
    expect((await POST(request({ ...input, lessonId: 'html-day-30' }))).status).toBe(400);
  });
  it('rejects confirmation before a verified prerequisite', async () => {
    mocks.admin.mockReturnValue(database(vi.fn().mockResolvedValue({ data: null, error: { code: 'PT409' } })));
    const { POST } = await import('@/app/api/practice/confirm/route');
    expect((await POST(request({ courseId: 'html', day: 1 }))).status).toBe(409);
  });
  it('returns private progress for authenticated identity only', async () => {
    const { GET } = await import('@/app/api/practice/progress/route');
    const response = await GET(new Request('http://localhost/api/practice/progress?userId=victim', { headers: { authorization: 'Bearer valid' } }));
    expect(await response.json()).toEqual({ verified: true, completedLessons: ['html-day-01'], confirmedDays: [], xp: 50 });
  });
});
