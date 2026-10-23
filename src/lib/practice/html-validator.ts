import { parse, type DefaultTreeAdapterTypes } from 'parse5';
import type { PracticeCheck } from './types';

type Node = DefaultTreeAdapterTypes.Node;
type Element = DefaultTreeAdapterTypes.Element;
const element = (node: Node): node is Element => 'tagName' in node;
const attr = (node: Element | undefined, name: string) => node?.attrs.find(item => item.name === name)?.value ?? '';

function descendants(root: Node | undefined, tag: string): Element[] {
  if (!root) return [];
  const found: Element[] = [], queue: Node[] = [root];
  while (queue.length) {
    const node = queue.pop()!;
    if (element(node) && node.tagName === tag && node.namespaceURI === 'http://www.w3.org/1999/xhtml') found.push(node);
    if ('childNodes' in node) queue.push(...node.childNodes);
  }
  return found;
}

function hasText(root: Node): boolean {
  const queue: Node[] = [root];
  while (queue.length) {
    const node = queue.pop()!;
    if (node.nodeName === '#text' && 'value' in node && node.value.trim()) return true;
    if (element(node) && ['script', 'style', 'template'].includes(node.tagName)) continue;
    if ('childNodes' in node) queue.push(...node.childNodes);
  }
  return false;
}

/** Visit each body node once. Scanning every nested main separately is quadratic
 * for a malicious document containing thousands of nested main elements.
 */
function mainContent(root: Node | undefined): Element[] {
  if (!root) return [];
  const found: Element[] = [];
  const queue: { node: Node; insideMain: boolean }[] = [{ node: root, insideMain: false }];
  while (queue.length) {
    const { node, insideMain } = queue.pop()!;
    const htmlElement = element(node) && node.namespaceURI === 'http://www.w3.org/1999/xhtml';
    const inMain = insideMain || (htmlElement && node.tagName === 'main');
    if (inMain && htmlElement && ['h1', 'p', 'a'].includes(node.tagName)) found.push(node);
    if ('childNodes' in node) {
      for (const child of node.childNodes) queue.push({ node: child, insideMain: inMain });
    }
  }
  return found;
}

/** Server-side HTML5 parsing only. Learner JavaScript is never evaluated. */
export function validateFirstHtmlLesson(code: string): PracticeCheck[] {
  const document = parse(code);
  const html = descendants(document, 'html')[0];
  const head = descendants(html, 'head')[0];
  const body = descendants(html, 'body')[0];
  const mainElements = mainContent(body);
  const metas = descendants(head, 'meta');
  return [
    { id: 'doctype', passed: document.childNodes.some(node => node.nodeName === '#documentType' && 'name' in node && node.name.toLowerCase() === 'html') },
    { id: 'language', passed: Boolean(attr(html, 'lang').trim()) },
    { id: 'encoding', passed: metas.some(meta => /^utf-?8$/i.test(attr(meta, 'charset').trim())) },
    { id: 'viewport', passed: metas.some(meta => attr(meta, 'name').toLowerCase() === 'viewport' && /(?:^|,)\s*width\s*=\s*device-width\s*(?:,|$)/i.test(attr(meta, 'content'))) },
    { id: 'title', passed: descendants(head, 'title').some(hasText) },
    { id: 'heading', passed: mainElements.some(node => node.tagName === 'h1' && hasText(node)) },
    { id: 'paragraph', passed: mainElements.some(node => node.tagName === 'p' && hasText(node)) },
    { id: 'link', passed: mainElements.some(link => {
      if (link.tagName !== 'a') return false;
      if (!hasText(link)) return false;
      try { return new URL(attr(link, 'href')).protocol === 'https:'; } catch { return false; }
    }) },
  ];
}
