export interface HtmlCheck { id: string; passed: boolean }
export const HTML_CHECK_IDS = ['doctype', 'language', 'encoding', 'viewport', 'title', 'heading', 'paragraph', 'link'] as const;

/** Semantic checks for the first lesson, not a comparison with a reference string.
 * DOMParser never executes scripts here. Later exercises require their own rubric.
 */
export function gradeHtmlDocument(code: string): HtmlCheck[] {
  const document = new DOMParser().parseFromString(code, 'text/html');
  const text = (selector: string) => Boolean(document.querySelector(selector)?.textContent?.trim());
  const charset = document.querySelector('meta[charset]')?.getAttribute('charset')?.toLowerCase().replace('-', '');
  return [
    { id: 'doctype', passed: document.doctype?.name.toLowerCase() === 'html' },
    { id: 'language', passed: Boolean(document.documentElement.getAttribute('lang')?.trim()) },
    { id: 'encoding', passed: charset === 'utf8' },
    { id: 'viewport', passed: /(?:^|,)\s*width\s*=\s*device-width\s*(?:,|$)/i.test(document.querySelector('meta[name="viewport"]')?.getAttribute('content') || '') },
    { id: 'title', passed: text('head title') },
    { id: 'heading', passed: text('main h1') },
    { id: 'paragraph', passed: text('main p') },
    { id: 'link', passed: Array.from(document.querySelectorAll('main a[href]')).some(link => {
      try { return Boolean(link.textContent?.trim()) && new URL(link.getAttribute('href') || '').protocol === 'https:'; } catch { return false; }
    }) },
  ];
}

/** Browsers enforce this CSP in addition to the iframe's opaque sandbox. */
export function safeHtmlPreview(code: string) {
  return '<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src data:; font-src \'none\'; connect-src \'none\'; base-uri \'none\'; form-action \'none\';">' + code;
}
