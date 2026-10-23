import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { boundedSupabaseFetch } from './request';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseServerClient(authHeader?: string): SupabaseClient | null {
  if (typeof window !== 'undefined') {
    throw new Error('Supabase Server Client called in client context');
  }
  if (!supabaseUrl || !anonKey) {
    return null;
  }

  return createClient(supabaseUrl, anonKey, {
    global: {
      fetch: boundedSupabaseFetch,
      headers: authHeader ? { Authorization: authHeader } : {},
    },
    auth: {
      persistSession: false,
    },
  });
}
