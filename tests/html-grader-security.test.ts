// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { validateFirstHtmlLesson } from '@/lib/practice/html-validator';

describe('HTML grading adversarial document shapes', () => {
  it('handles thousands of nested main elements without repeated subtree grading', () => {
    // Within the API's 100,000-character limit. Each heading/paragraph/link scan
    // previously re-walked every ancestor main when the required nodes were absent.
    const code = '<!doctype html><html lang="en"><title>Test</title><body>'
      + '<main>'.repeat(7000) + '</main>'.repeat(7000) + '</body></html>';
    expect(code.length).toBeLessThan(100_000);
    const started = performance.now();
    const checks = validateFirstHtmlLesson(code);
    expect(checks.filter(item => ['heading', 'paragraph', 'link'].includes(item.id)).every(item => !item.passed)).toBe(true);
    expect(performance.now() - started).toBeLessThan(1500);
  });

  it('accepts required content in a nested main but not a sibling outside it', () => {
    const nested = validateFirstHtmlLesson('<main><main><h1>Heading</h1><p>Text</p><a href="https://example.org">Docs</a></main></main>');
    expect(nested.filter(item => ['heading', 'paragraph', 'link'].includes(item.id)).every(item => item.passed)).toBe(true);
    const siblings = validateFirstHtmlLesson('<main></main><h1>Heading</h1><p>Text</p><a href="https://example.org">Docs</a>');
    expect(siblings.filter(item => ['heading', 'paragraph', 'link'].includes(item.id)).every(item => !item.passed)).toBe(true);
  });
});
