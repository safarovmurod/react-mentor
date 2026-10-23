import { describe, expect, it } from 'vitest';
import { gradeHtmlDocument, safeHtmlPreview } from '@/lib/grading/html-grader';
const html = `<!doctype html><html lang='tg'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'><title>Саҳифаи ман</title></head><body><main><h1>Салом</h1><p>Матни худам</p><a href='https://developer.mozilla.org/'>Ҳуҷҷатҳо</a></main></body></html>`;
describe('first HTML lesson semantic checks', () => {
 it('accepts personal wording, single quotes and attributes independent of reference code', () => {
   expect(gradeHtmlDocument(html).every(check => check.passed)).toBe(true);
 });
 it('reports exactly a missing heading without rejecting unrelated correct markup', () => {
   expect(gradeHtmlDocument(html.replace('<h1>Салом</h1>', '<h2>Салом</h2>')).filter(check => !check.passed).map(check => check.id)).toEqual(['heading']);
 });
 it('does not accept a javascript URL or empty documentation link', () => {
   expect(gradeHtmlDocument(html.replace('https://developer.mozilla.org/', 'javascript:alert(1)')).find(check => check.id === 'link')?.passed).toBe(false);
   expect(gradeHtmlDocument(html.replace('Ҳуҷҷатҳо', '')).find(check => check.id === 'link')?.passed).toBe(false);
 });
 it('does not execute scripts while inspecting an HTML document', () => {
   gradeHtmlDocument(html + '<script>globalThis.__htmlGradeSideEffect = true</script>');
   expect((globalThis as Record<string, unknown>).__htmlGradeSideEffect).toBeUndefined();
 });
 it('adds network/form/script restrictions ahead of learner markup', () => {
   const preview = safeHtmlPreview('<script>fetch("https://example.com")</script>');
   expect(preview).toContain("default-src 'none'");
   expect(preview).toContain("connect-src 'none'");
   expect(preview).toContain("form-action 'none'");
   expect(preview.indexOf('Content-Security-Policy')).toBeLessThan(preview.indexOf('<script>'));
 });
});
