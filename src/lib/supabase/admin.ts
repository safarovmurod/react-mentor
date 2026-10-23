import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { boundedSupabaseFetch } from './request';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseAdminConfigured = Boolean(
  supabaseUrl &&
  serviceRoleKey &&
  supabaseUrl.startsWith('http') &&
  serviceRoleKey.length > 10
);

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient | null {
  if (typeof window !== 'undefined') {
    throw new Error('SECURITY VIOLATION: Supabase Admin Client must never be called in the browser!');
  }
  if (!isSupabaseAdminConfigured) {
    return null;
  }
  if (!adminClient) {
    adminClient = createClient(supabaseUrl!, serviceRoleKey!, {
      global: { fetch: boundedSupabaseFetch },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return adminClient;
}
