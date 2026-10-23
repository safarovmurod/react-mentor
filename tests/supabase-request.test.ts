// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createBoundedSupabaseFetch } from '@/lib/supabase/request';

afterEach(() => vi.unstubAllGlobals());

describe('server Supabase request bounds', () => {
  it('preserves the request URL, method, headers and body', async () => {
    const response = new Response('{"ok":true}');
    const upstream = vi.fn().mockResolvedValue(response);
    vi.stubGlobal('fetch', upstream);
    const result = await createBoundedSupabaseFetch()('https://example.supabase.co/rest/v1/rpc/test', {
      method: 'POST', headers: { authorization: 'Bearer test-placeholder' }, body: '{}',
    });
    expect(result).toBe(response);
    expect(upstream).toHaveBeenCalledWith('https://example.supabase.co/rest/v1/rpc/test', expect.objectContaining({
      method: 'POST', headers: { authorization: 'Bearer test-placeholder' }, body: '{}', signal: expect.any(AbortSignal),
    }));
  });

  it('aborts a stalled upstream within the configured deadline', async () => {
    vi.stubGlobal('fetch', vi.fn((_input, init) => new Promise((_resolve, reject) => {
      init.signal.addEventListener('abort', () => reject(init.signal.reason), { once: true });
    })));
    await expect(createBoundedSupabaseFetch(20)('https://example.supabase.co')).rejects.toMatchObject({ name: 'TimeoutError' });
  });

  it('preserves explicit caller cancellation', async () => {
    let signal: AbortSignal | undefined;
    vi.stubGlobal('fetch', vi.fn((_input, init) => { signal = init.signal; return Promise.resolve(new Response()); }));
    const controller = new AbortController();
    await createBoundedSupabaseFetch()('https://example.supabase.co', { signal: controller.signal });
    controller.abort();
    expect(signal?.aborted).toBe(true);
  });

  it('also preserves cancellation embedded in a Request object', async () => {
    let signal: AbortSignal | undefined;
    vi.stubGlobal('fetch', vi.fn((_input, init) => { signal = init.signal; return Promise.resolve(new Response()); }));
    const controller = new AbortController();
    const request = new Request('https://example.supabase.co', { signal: controller.signal });
    await createBoundedSupabaseFetch()(request);
    controller.abort();
    expect(signal?.aborted).toBe(true);
  });
});
