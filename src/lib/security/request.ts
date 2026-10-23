/** Reject oversized JSON before buffering or parsing an untrusted request body. */
export class RequestBodyError extends Error {
  constructor(public readonly status: 400 | 413) {
    super(status === 413 ? 'Request body is too large.' : 'Invalid JSON body.');
    this.name = 'RequestBodyError';
  }
}

export async function readBoundedJson(request: Request, maxBytes = 32_768): Promise<unknown> {
  const length = request.headers.get('content-length');
  if (length && /^\d+$/.test(length) && Number(length) > maxBytes) {
    await request.body?.cancel().catch(() => undefined);
    throw new RequestBodyError(413);
  }
  if (!request.body) throw new RequestBodyError(400);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw new RequestBodyError(413);
      }
      chunks.push(chunk.value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch (error) {
    if (error instanceof RequestBodyError) throw error;
    throw new RequestBodyError(400);
  } finally {
    reader.releaseLock();
  }
}
