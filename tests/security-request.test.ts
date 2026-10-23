// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { readBoundedJson } from '@/lib/security/request';

function request(body: string, headers?: HeadersInit) {
  return new Request('https://example.test/api', { method: 'POST', body, headers });
}

describe('bounded API JSON parsing', () => {
  it('accepts a valid body at its byte limit', async () => {
    await expect(readBoundedJson(request('{"ok":true}'), 11)).resolves.toEqual({ ok: true });
  });

  it('checks actual bytes even when content-length is absent or forged', async () => {
    for (const headers of [undefined, { 'content-length': '1' }]) {
      await expect(readBoundedJson(request('{"text":"too long"}', headers), 10)).rejects.toMatchObject({ status: 413 });
    }
  });

  it('counts multibyte UTF-8 rather than JavaScript character length', async () => {
    await expect(readBoundedJson(request('"你好"'), 7)).rejects.toMatchObject({ status: 413 });
    await expect(readBoundedJson(request('"你好"'), 8)).resolves.toBe('你好');
  });

  it('rejects advertised oversized bodies without reading their stream', async () => {
    const read = vi.fn();
    const cancel = vi.fn().mockResolvedValue(undefined);
    const input = { headers: new Headers({ 'content-length': '100' }), body: { cancel, getReader: read } } as unknown as Request;
    await expect(readBoundedJson(input, 10)).rejects.toMatchObject({ status: 413 });
    expect(cancel).toHaveBeenCalledOnce();
    expect(read).not.toHaveBeenCalled();
  });

  it('rejects malformed, empty and invalid UTF-8 JSON without exposing internals', async () => {
    await expect(readBoundedJson(request('{'))).rejects.toMatchObject({ status: 400, message: 'Invalid JSON body.' });
    await expect(readBoundedJson(new Request('https://example.test/api', { method: 'POST' }))).rejects.toMatchObject({ status: 400 });
    const invalid = new Request('https://example.test/api', { method: 'POST', body: new Uint8Array([34, 255, 34]) });
    await expect(readBoundedJson(invalid)).rejects.toMatchObject({ status: 400 });
  });
});
