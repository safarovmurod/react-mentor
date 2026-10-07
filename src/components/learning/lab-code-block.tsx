'use client';
import { useState } from 'react';
import { Check, Copy, FileCode } from 'lucide-react';

// Простой подсветчик синтаксиса — перенесён из Practice-Antigraviti.html.
// Сначала esc(), потом span-ы: в HTML попадает только безопасный текст.
function esc(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

function highlightPart(text: string) {
  if (!text) return '';
  let s = esc(text);
  s = s.replace(/(&quot;[\s\S]*?&quot;|&#39;[\s\S]*?&#39;|`[\s\S]*?`)/g, '<span class="lab-tok-str">$1</span>');
  s = s.replace(/\b(import|export|const|let|var|async|await|return|try|catch|finally|from|if|else|for|new|function|type|interface|as|true|false|null|undefined)\b/g, '<span class="lab-tok-kw">$1</span>');
  s = s.replace(/\b(createAsyncThunk|createSlice|configureStore|create|atom|atomWithRefresh|useSelector|useDispatch|useTodoStore|useAtom|useSetAtom|useAtomValue|useSearchParams|useNavigate|useEffect|useState|axios|console)\b/g, '<span class="lab-tok-fn">$1</span>');
  s = s.replace(/\.([a-zA-Z0-9_$]+)(?=\()/g, '.<span class="lab-tok-fn">$1</span>');
  s = s.replace(/\b(\d+)\b/g, '<span class="lab-tok-num">$1</span>');
  return s;
}

function highlightLine(raw: string) {
  const ci = raw.indexOf('//');
  if (ci >= 0) {
    const before = raw.slice(0, ci);
    const com = raw.slice(ci);
    const isStep = com.includes('Шаг') || com.includes('STEP');
    const comHtml = isStep ? '<span class="lab-tok-step">' + esc(com) + '</span>' : '<span class="lab-tok-com">' + esc(com) + '</span>';
    return highlightPart(before) + comHtml;
  }
  return highlightPart(raw);
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

export function LabCodeBlock({ path, lang, code, copiedLabel, copyLabel }: {
  path: string;
  lang: string;
  code: string;
  copiedLabel: string;
  copyLabel: string;
}) {
  const [done, setDone] = useState(false);
  const lines = code.split('\n');
  async function onCopy() {
    if (await copyText(code)) {
      setDone(true);
      setTimeout(() => setDone(false), 1200);
    }
  }
  return (
    <div className="lab-code">
      <div className="lab-code-header">
        <span className="lab-code-path"><FileCode size={14} /><span>{path}</span></span>
        <span className="lab-code-tools">
          <span className="lab-code-lang">{lang}</span>
          <button type="button" className="lab-copy-btn" onClick={onCopy}>
            {done ? <Check size={13} /> : <Copy size={13} />}
            {done ? copiedLabel : copyLabel}
          </button>
        </span>
      </div>
      <pre className="lab-code-pre">
        {lines.map((line, index) => (
          <span className="lab-code-line" key={index}>
            <span className="lab-code-ln">{index + 1}</span>
            <span className="lab-code-text" dangerouslySetInnerHTML={{ __html: highlightLine(line) || '&nbsp;' }} />
          </span>
        ))}
      </pre>
    </div>
  );
}
