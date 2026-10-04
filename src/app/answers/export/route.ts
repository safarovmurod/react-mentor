import { exportAnswersHtml } from '@/lib/answers-export';

export function GET() {
  return new Response(exportAnswersHtml(), { headers: {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Disposition': 'attachment; filename="react-answers.html"',
    'Content-Security-Policy': "sandbox; default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'",
    'X-Content-Type-Options': 'nosniff',
  } });
}
