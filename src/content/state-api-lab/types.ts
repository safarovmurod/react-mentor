// Типы State & API Lab. Контент двуязычный: tg — оригинал (Душанбе), ru — перевод.
export type LabText = { tg: string; ru: string };

export type LabScope = 'local' | 'global';
export type LabManager = 'redux' | 'zustand' | 'jotai';
export type LabMode = 'local' | LabManager;

export type LabOpId =
  | 'setup' | 'get' | 'post' | 'put' | 'delete'
  | 'info' | 'search' | 'pagination' | 'add-img' | 'delete-img';

export interface LabStep {
  title: string;
  text: LabText;
  code?: string;
}

export interface LabConcept {
  name: string;
  origin: string;
  why: LabText;
  missing: LabText;
}

export interface LabBlock {
  path: string;
  lang: 'ts' | 'tsx';
  note: LabText;
  code: string;
  // Практика ON: скелет с подсказками по шагам вместо готового решения.
  practiceCode: string;
}

export interface LabLesson {
  op: LabOpId;
  mode: LabMode;
  title: string;
  intro: LabText;
  flow: string[];
  steps: LabStep[];
  files: string[];
  relationNote: LabText;
  blocks: LabBlock[];
  concepts: LabConcept[];
  memory: LabText;
  result: LabText;
}

export function t(tg: string, ru: string): LabText {
  return { tg, ru };
}
