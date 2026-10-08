// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocked = vi.hoisted(() => ({
  authenticate: vi.fn(),
  serverClient: vi.fn(),
}));
vi.mock('@/lib/account/require-user', () => ({ authenticatedUser: mocked.authenticate }));
vi.mock('@/lib/supabase/server', () => ({ getSupabaseServerClient: mocked.serverClient }));

const workspaceId = '11111111-1111-4111-8111-111111111111';
const otherWorkspace = '22222222-2222-4222-8222-222222222222';

function request(method: string, url = `http://localhost/api/training/todos?workspaceId=${workspaceId}`, body?: unknown, token = 'test-token') {
  return new NextRequest(url, {
    method,
    headers: token ? { authorization: 'Bearer ' + token, 'content-type': 'application/json' } : { 'content-type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

beforeEach(() => {
  mocked.authenticate.mockReset();
  mocked.serverClient.mockReset();
  mocked.authenticate.mockResolvedValue({ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' });
});

describe('Training todos authorization', () => {
  it('rejects unauthenticated requests before database access', async () => {
    const { GET, POST, PUT, DELETE } = await import('@/app/api/training/todos/route');
    expect((await GET(request('GET',undefined,undefined,''))).status).toBe(401);
    expect((await POST(request('POST',undefined,{workspaceId,title:'Task'},''))).status).toBe(401);
    expect((await PUT(request('PUT',undefined,{workspaceId,id:otherWorkspace,completed:true},''))).status).toBe(401);
    expect((await DELETE(request('DELETE', `http://localhost/api/training/todos?workspaceId=${workspaceId}&id=${otherWorkspace}`,undefined,''))).status).toBe(401);
    expect(mocked.serverClient).not.toHaveBeenCalled();
  });
  it('denies writes when caller is not a member of the workspace', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data:null, error:null });
    const builder = {select:()=>builder,eq:()=>builder,maybeSingle};
    mocked.serverClient.mockReturnValue({ from: vi.fn().mockReturnValue(builder) });
    const { POST } = await import('@/app/api/training/todos/route');
    expect((await POST(request('POST',undefined,{workspaceId,title:'Task'}))).status).toBe(403);
    expect(mocked.serverClient).toHaveBeenCalledWith('Bearer test-token');
  });
  it('rejects malformed workspace IDs and empty titles', async () => {
    const { GET, POST } = await import('@/app/api/training/todos/route');
    expect((await GET(request('GET','http://localhost/api/training/todos?workspaceId=bad'))).status).toBe(400);
    expect((await POST(request('POST',undefined,{workspaceId,title:'    '}))).status).toBe(400);
    expect(mocked.serverClient).not.toHaveBeenCalled();
  });
});
