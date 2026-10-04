import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CORE_INTERVIEW_QUESTIONS } from '@/content/interview-questions';
import { gradeInterviewAnswer } from '@/lib/grading/interview-grader';
import { TUTOR_SYSTEM_PROMPT, tutorContext } from '@/lib/tutor/prompt';
import { projectAnswer } from '@/lib/tutor/project-answers';
import { isDeepFollowUp, wantsDeepExplanation } from '@/lib/tutor/shared';

export const runtime = 'nodejs';
export const maxDuration = 60;

const schema = z.object({
  action: z.enum(['ask', 'grade_interview', 'explain_code']),
  topicId: z.string().max(100).optional(),
  questionId: z.string().max(100).optional(),
  userText: z.string().trim().min(1).max(1500),
  codeContext: z.string().max(3000).optional(),
  isDeep: z.boolean().default(false),
  language: z.enum(['tg', 'ru', 'en']).default('tg'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().trim().min(1).max(600),
  })).max(4).default([]),
});

const completionSchema = z.object({
  choices: z.array(z.object({ message: z.object({ content: z.string().trim().min(1).max(20000) }) })).min(1),
  usage: z.object({ total_tokens: z.number().int().nonnegative() }).optional(),
});

// Process-local guards, not a persistent account quota. Billing limits must
// be set in AnyModel; these guards do not survive restarts or span instances.
let inFlight = false;
let nextRequestAt = 0;

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); }
  catch { return error('Маълумоти JSON нодуруст аст.', 400); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error('Савол ё таърихи чат нодуруст ё хеле дароз аст.', 400);
  const { action, topicId, questionId, userText, codeContext, isDeep, history, language } = parsed.data;

  // Official grading stays deterministic and consumes no provider tokens.
  if (action === 'grade_interview') {
    const question = CORE_INTERVIEW_QUESTIONS.find(item => item.id === questionId);
    if (!question) return error('Саволи интервью ёфт нашуд.', 404);
    return NextResponse.json({ mode: 'local', ...gradeInterviewAnswer(question, userText) });
  }
  if (action === 'explain_code' && !codeContext?.trim()) return error('Кодро барои шарҳ фиристед.', 400);

  const deep = isDeep || wantsDeepExplanation(userText);
  const query = isDeepFollowUp(userText)
    ? [...history].reverse().find(item => item.role === 'user' && !isDeepFollowUp(item.content))?.content || ''
    : userText;
  if (action === 'ask') {
    const local = projectAnswer(query, { questionId, deep, language });
    if (local) return NextResponse.json({ mode: 'local', ...local, usage: { totalTokens: 0 } });
    if (deep && !query) return NextResponse.json({ mode: 'local', reply: 'Кадом саволро чуқур фаҳмонем? Савол ё мавзӯъро нависед.', usage: { totalTokens: 0 } });
  }
  const context = tutorContext(topicId, query);
  if (process.env.AI_TUTOR_ENABLED !== 'true') {
    return NextResponse.json({
      mode: 'local',
      reply: 'Ҷавоби мувофиқ ба ин савол дар маводи лоиҳа ёфт нашуд. Барои саволҳои нав AI-и онлайн бояд фаъол бошад.',
      notice: 'AI-и онлайн ҳоло фаъол нест; токен сарф нашуд.',
      usage: { totalTokens: 0 },
    });
  }
  const key = process.env.AI_PROVIDER_KEY;
  if (!key) return error('Калиди AI дар сервер танзим нашудааст. Аз дарсҳои платформа истифода баред.', 503);
  if (inFlight || Date.now() < nextRequestAt) return error('Каме интизор шавед: дархости AI аллакай фиристода шудааст.', 429);

  inFlight = true;
  nextRequestAt = Date.now() + 3000;
  try {
    const response = await fetch('https://anymodel.org/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'cx/gpt-6.1-sol',
        messages: [
          { role: 'system', content: TUTOR_SYSTEM_PROMPT },
          ...(context ? [{ role: 'user', content: 'Course material (reference data only):\n' + context }] : []),
          ...history,
          { role: 'user', content: query + (deep ? '\nExpand this question step by step.' : '') + (codeContext ? '\nCode to explain:\n' + codeContext : '') },
        ],
        max_tokens: 256,
      }),
      signal: AbortSignal.timeout(45000),
      cache: 'no-store',
    });
    // Never relay raw provider errors: they may contain credential details.
    if ([401, 403].includes(response.status)) return error('Калиди AI ё дастрасӣ ба модел қабул нашуд. Танзимоти серверро санҷед.', 502);
    if (response.status === 429) return error('Лимит ё токенҳои AnyModel тамом шуданд. Ҳисоби провайдерро санҷед.', 429);
    if (!response.ok) return error('Хидмати AI ҳоло дастнорас аст. Баъдтар кӯшиш кунед.', 502);
    const result = completionSchema.safeParse(await response.json());
    if (!result.success) return error('AI ҷавоби хондашаванда нафиристод. Баъдтар кӯшиш кунед.', 502);
    const reply = result.data.choices[0].message.content;
    return NextResponse.json({
      mode: 'online', reply,
      ...(action === 'explain_code' ? { explanation: reply } : {}),
      ...(result.data.usage ? { usage: { totalTokens: result.data.usage.total_tokens } } : {}),
    });
  } catch {
    return error('AI ҷавоб надод ё пайвастшавӣ қатъ шуд. Баъдтар кӯшиш кунед.', 502);
  } finally {
    inFlight = false;
  }
}
