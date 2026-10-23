/** Bound every server-side Supabase request, including auth and RLS RPC calls.
 * The caller's cancellation is preserved; a stalled upstream must not hang a page.
 */
export function createBoundedSupabaseFetch(timeoutMs = 8000): typeof fetch {
  return (input, init) => {
    const callerSignal = init?.signal ?? (input instanceof Request ? input.signal : undefined);
    const timeout = AbortSignal.timeout(timeoutMs);
    const signal = callerSignal ? AbortSignal.any([callerSignal, timeout]) : timeout;
    return fetch(input, { ...init, signal });
  };
}

export const boundedSupabaseFetch = createBoundedSupabaseFetch();
