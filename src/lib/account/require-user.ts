import { getSupabaseServerClient } from '@/lib/supabase/server';
export async function authenticatedUser(request: Request) {
  const header=request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  const token=header.slice(7),client=getSupabaseServerClient(header);
  if (!client) return null;
  try {
    const {data,error}=await client.auth.getUser(token);
    if (error || !data.user) return null;
    // Check verified server-side token through the RLS helper, including MFA.
    const allowed=await client.rpc('react_mentor_session_allowed');
    if (allowed.error || allowed.data!==true) return null;
    return data.user;
  } catch {return null;}
}
