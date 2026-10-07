'use client';
import { Fragment, useState } from 'react';
import {
  ArrowDownToLine, ArrowUpFromLine, Atom, Boxes, Braces, CircleCheck, Database,
  GraduationCap, Globe, House, ImagePlus, Images, Info, Lightbulb, Pencil, Search,
  TableOfContents, Trash2, type LucideIcon,
} from 'lucide-react';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import { PageHeading } from '@/components/learning/page-heading';
import {
  LAB_COMPARE, LAB_INTRO, LAB_LESSONS, LAB_OPS, LAB_PRACTICE_NOTE,
  type LabManager, LabMode, LabOpId, LabScope, LabText,
} from '@/content/state-api-lab';
import { LabCodeBlock } from './lab-code-block';

const OP_ICONS: Record<LabOpId, LucideIcon> = {
  setup: Braces,
  get: ArrowDownToLine,
  post: ArrowUpFromLine,
  put: Pencil,
  delete: Trash2,
  info: Info,
  search: Search,
  pagination: TableOfContents,
  'add-img': ImagePlus,
  'delete-img': Images,
};

const MANAGERS: { id: LabManager; label: string; icon: LucideIcon }[] = [
  { id: 'redux', label: 'Redux', icon: Boxes },
  { id: 'zustand', label: 'Zustand', icon: Database },
  { id: 'jotai', label: 'Jotai', icon: Atom },
];

const MODE_LABEL: Record<LabMode, string> = { local: 'Local', redux: 'Redux', zustand: 'Zustand', jotai: 'Jotai' };

const UI = {
  ru: {
    practice: 'Практика', scopeLabel: 'Local или Global', managerLabel: 'State manager', opsLabel: 'Операции',
    what: 'Что делает?', flowLabel: 'Как идёт запрос', files: 'Какие файлы участвуют?', steps: 'Шаги',
    code: 'Полный код', practiceCode: 'Практика — напиши сам', practiceOn: 'подсказки по шагам',
    why: 'Почему работает?', result: 'Что получится',
  },
  en: {
    practice: 'Practice', scopeLabel: 'Local or Global', managerLabel: 'State manager', opsLabel: 'Operations',
    what: 'What does it do?', flowLabel: 'Request flow', files: 'Which files are involved?', steps: 'Steps',
    code: 'Full code', practiceCode: 'Practice — write it yourself', practiceOn: 'step hints',
    why: 'Why it works', result: 'Result',
  },
};

function FlowChain({ items }: { items: string[] }) {
  return (
    <div className="lab-flow">
      {items.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && <i aria-hidden="true">→</i>}
          <span>{item}</span>
        </Fragment>
      ))}
    </div>
  );
}

// State & API Lab: одна операция — четыре способа (Local / Redux / Zustand / Jotai) на одной странице.
export function StateApiLab() {
  const language = useLearningStore(state => state.language);
  const contentLanguage = useLearningStore(state => state.contentLanguage);
  const copy = COPY[language];
  const ui = UI[language];
  const L = (text: LabText) => (contentLanguage === 'tg' ? text.tg : text.ru);

  // op и manager хранятся отдельно: при переключении Local ↔ Global операция сохраняется.
  const [scope, setScope] = useState<LabScope>('local');
  const [manager, setManager] = useState<LabManager>('redux');
  const [op, setOp] = useState<LabOpId>('setup');
  const [practice, setPractice] = useState(false);

  const mode: LabMode = scope === 'local' ? 'local' : manager;
  const lesson = LAB_LESSONS[mode][op];
  const OpIcon = OP_ICONS[op];

  return (
    <>
      <PageHeading title="State & API Lab" subtitle={L(LAB_INTRO)} back="/home">
        <label className={'lab-practice-toggle' + (practice ? ' is-on' : '')} title={ui.practiceOn}>
          <input type="checkbox" checked={practice} onChange={event => setPractice(event.target.checked)} />
          <GraduationCap size={16} />
          <span>{ui.practice}</span>
        </label>
      </PageHeading>

      <div className="lab-compare">
        <section className="panel lab-compare-card">
          <h2><House size={17} /> Local</h2>
          <p>{L(LAB_COMPARE.local.text)}</p>
          <span className="lab-compare-example">{L(LAB_COMPARE.local.example)}</span>
        </section>
        <section className="panel lab-compare-card">
          <h2><Globe size={17} /> Global</h2>
          <p>{L(LAB_COMPARE.global.text)}</p>
          <span className="lab-compare-example">{L(LAB_COMPARE.global.example)}</span>
        </section>
      </div>

      <div className="tabs" role="tablist" aria-label={ui.scopeLabel}>
        <button type="button" role="tab" aria-selected={scope === 'local'} onClick={() => setScope('local')}>
          <House size={16} />Local
        </button>
        <button type="button" role="tab" aria-selected={scope === 'global'} onClick={() => setScope('global')}>
          <Globe size={16} />Global
        </button>
      </div>

      {scope === 'global' && (
        <div className="tabs lab-manager-tabs" role="tablist" aria-label={ui.managerLabel}>
          {MANAGERS.map(item => {
            const Icon = item.icon;
            return (
              <button type="button" key={item.id} role="tab" aria-selected={manager === item.id} onClick={() => setManager(item.id)}>
                <Icon size={16} />{item.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="tabs" role="tablist" aria-label={ui.opsLabel}>
        {LAB_OPS.map(item => {
          const Icon = OP_ICONS[item.id];
          return (
            <button type="button" key={item.id} role="tab" aria-selected={op === item.id} onClick={() => setOp(item.id)}>
              <Icon size={15} />{item.label}
            </button>
          );
        })}
      </div>

      <article className="panel lab-lesson">
        <header className="lab-lesson-head">
          <h2><OpIcon size={18} /> {lesson.title} <span className="badge">{MODE_LABEL[mode]}</span></h2>
          <FlowChain items={lesson.flow} />
        </header>

        <div className="lab-top-grid">
          <section>
            <h3>{ui.what}</h3>
            <p>{L(lesson.intro)}</p>
          </section>
          <section>
            <h3>{ui.files}</h3>
            <FlowChain items={lesson.files} />
            <p className="muted small lab-relation">{L(lesson.relationNote)}</p>
          </section>
        </div>

        <h3 className="lab-subheading">{ui.steps}</h3>
        <ol className="flow-steps">
          {lesson.steps.map((step, index) => (
            <li key={index}>
              <span>{index + 1}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{L(step.text)}</p>
                {step.code && <code>{step.code}</code>}
              </div>
            </li>
          ))}
        </ol>

        <div className="between lab-code-heading">
          <h3>{practice ? ui.practiceCode : ui.code}</h3>
          {practice && <span className="badge"><Lightbulb size={13} />{ui.practiceOn}</span>}
        </div>
        {practice && <p className="callout lab-practice-note">{L(LAB_PRACTICE_NOTE)}</p>}
        {lesson.blocks.map((block, index) => (
          <section className="lab-block" key={index}>
            <p className="lab-block-note">{L(block.note)}</p>
            <LabCodeBlock
              path={block.path}
              lang={block.lang}
              code={practice ? block.practiceCode : block.code}
              copyLabel={copy.copy}
              copiedLabel={copy.copied}
            />
          </section>
        ))}

        <p className="lab-result"><CircleCheck size={15} /><span><strong>{ui.result}:</strong> {L(lesson.result)}</span></p>

        <h3 className="lab-subheading">{ui.why}</h3>
        <div className="concept-grid">
          {lesson.concepts.map((concept, index) => (
            <section key={index}>
              <h3>{concept.name}</h3>
              <span className="lab-concept-origin">{concept.origin}</span>
              <p>{L(concept.why)}</p>
              <p className="lab-concept-missing">{L(concept.missing)}</p>
            </section>
          ))}
        </div>

        <p className="lab-memory"><Lightbulb size={15} /><span>{L(lesson.memory)}</span></p>
      </article>
    </>
  );
}
