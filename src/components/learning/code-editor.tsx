'use client';

import dynamic from 'next/dynamic';
import { useLearningStore } from '@/stores/learning-store';
import { EDITOR_COPY } from '@/lib/editor-copy';

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  path?: string;
  language?: string;
  label: string;
  height?: number;
}

function EditorLoading() {
  const copy=EDITOR_COPY[useLearningStore(state=>state.language)];
  return <div className="code-editor-loading" role="status"><span className="editor-loading-dot" />{copy.loading}</div>;
}

const MonacoCodeEditor = dynamic(() => import('./monaco-code-editor'), {
  ssr: false,
  loading: EditorLoading,
});

/** Loaded only inside a practice workspace; dashboards do not download Monaco. */
export function CodeEditor(props: CodeEditorProps) {
  return <div className="learning-code-editor"><MonacoCodeEditor {...props} /></div>;
}
