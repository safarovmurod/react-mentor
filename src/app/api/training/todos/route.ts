import { NextRequest, NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { authenticatedUser } from '@/lib/account/require-user';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const WorkspaceId = z.string().uuid();
const PostSchema = z.object({
  workspaceId: WorkspaceId,
  title: z.string().trim().min(1).max(200),
});
const PutSchema = z.object({
  workspaceId: WorkspaceId,
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(200).optional(),
  completed: z.boolean().optional(),
}).refine(value => value.title !== undefined || value.completed !== undefined);

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } });
}

// Use the caller's JWT, not service_role. The database RLS policy on
// training_todos also checks workspace membership for each row/write.
async function authorize(req: NextRequest, workspaceId: string):
  Promise<{ client: SupabaseClient } | { failure: NextResponse }> {
  const authorization = req.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return { failure: fail('Аввал ба аккаунт ворид шавед.', 401) };
  }
  const user = await authenticatedUser(req);
  if (!user) return { failure: fail('Сессия тасдиқ нашуд.', 401) };
  const client = getSupabaseServerClient(authorization);
  if (!client) return { failure: fail('Базаи сервер танзим нашудааст.', 503) };

  const { data, error } = await client.from('workspace_members')
    .select('workspace_id')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) return { failure: fail('Иҷозати workspace санҷида нашуд.', 503) };
  if (!data) return { failure: fail('Ба ин workspace иҷозат надоред.', 403) };
  return { client };
}

export async function GET(req: NextRequest) {
  const workspaceId = new URL(req.url).searchParams.get('workspaceId');
  if (!WorkspaceId.safeParse(workspaceId).success) return fail('workspaceId нодуруст аст.', 400);
  const access = await authorize(req, workspaceId!);
  if ('failure' in access) return access.failure;
  const { data, error } = await access.client.from('training_todos')
    .select('*').eq('workspace_id', workspaceId!).order('created_at', { ascending: false });
  if (error) return fail('Вазифаҳоро хонда натавонистем.', 500);
  return NextResponse.json(data ?? [], { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  let input: unknown;
  try { input = await req.json(); } catch { return fail('JSON нодуруст аст.', 400); }
  const parsed = PostSchema.safeParse(input);
  if (!parsed.success) return fail('workspaceId ё title нодуруст аст.', 400);
  const { workspaceId, title } = parsed.data;
  const access = await authorize(req, workspaceId);
  if ('failure' in access) return access.failure;
  const { data, error } = await access.client.from('training_todos')
    .insert({ workspace_id: workspaceId, title, completed: false }).select('*').single();
  if (error) return fail('Вазифаро нигоҳ дошта натавонистем.', 500);
  return NextResponse.json(data, { status: 201, headers: { 'Cache-Control': 'no-store' } });
}

export async function PUT(req: NextRequest) {
  let input: unknown;
  try { input = await req.json(); } catch { return fail('JSON нодуруст аст.', 400); }
  const parsed = PutSchema.safeParse(input);
  if (!parsed.success) return fail('Маълумоти вазифа нодуруст аст.', 400);
  const { workspaceId, id, title, completed } = parsed.data;
  const access = await authorize(req, workspaceId);
  if ('failure' in access) return access.failure;
  const changes = {
    ...(title !== undefined ? { title } : {}),
    ...(completed !== undefined ? { completed } : {}),
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await access.client.from('training_todos')
    .update(changes).eq('id', id).eq('workspace_id', workspaceId).select('*').maybeSingle();
  if (error) return fail('Вазифаро тағйир дода натавонистем.', 500);
  if (!data) return fail('Вазифа ёфт нашуд.', 404);
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}

export async function DELETE(req: NextRequest) {
  const params = new URL(req.url).searchParams;
  const workspaceId = params.get('workspaceId'), id = params.get('id');
  if (!WorkspaceId.safeParse(workspaceId).success || !z.string().uuid().safeParse(id).success) {
    return fail('workspaceId ё id нодуруст аст.', 400);
  }
  const access = await authorize(req, workspaceId!);
  if ('failure' in access) return access.failure;
  const { error } = await access.client.from('training_todos')
    .delete().eq('id', id!).eq('workspace_id', workspaceId!);
  if (error) return fail('Вазифаро нест карда натавонистем.', 500);
  return new NextResponse(null, { status: 204 });
}
