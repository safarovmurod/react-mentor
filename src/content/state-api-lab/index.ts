import type { LabLesson, LabOpId, LabMode } from './types';
import { localLessons } from './local';
import { reduxLessons } from './redux';
import { zustandLessons } from './zustand';
import { jotaiLessons } from './jotai';

export type { LabBlock, LabConcept, LabLesson, LabManager, LabMode, LabOpId, LabScope, LabStep, LabText } from './types';
export { t } from './types';

export const LAB_OPS: { id: LabOpId; label: string }[] = [
  { id: 'setup', label: 'Setup' },
  { id: 'get', label: 'GET' },
  { id: 'post', label: 'POST' },
  { id: 'put', label: 'PUT' },
  { id: 'delete', label: 'DELETE' },
  { id: 'info', label: 'Info' },
  { id: 'search', label: 'Search' },
  { id: 'pagination', label: 'Pagination' },
  { id: 'add-img', label: 'Add Image' },
  { id: 'delete-img', label: 'Delete Image' },
];

export const LAB_LESSONS: Record<LabMode, Record<LabOpId, LabLesson>> = {
  local: Object.fromEntries(localLessons.map(l => [l.op, l])),
  redux: Object.fromEntries(reduxLessons.map(l => [l.op, l])),
  zustand: Object.fromEntries(zustandLessons.map(l => [l.op, l])),
  jotai: Object.fromEntries(jotaiLessons.map(l => [l.op, l])),
} as Record<LabMode, Record<LabOpId, LabLesson>>;

// Одинаковый API для всех четырёх вариантов — реальный API practica.zip.
export const LAB_API_NOTE = 'https://to-dos-api.softclub.tj/api/to-dos';

export const LAB_INTRO = {
  tg: 'Як вазифа — чор роҳ. Операцияро интихоб кун ва бинӣ, ки Local, Redux, Zustand ва Jotai ҳамон корро чӣ тавр мекунанд.',
  ru: 'Одна задача — четыре способа. Выбери операцию и посмотри, как Local, Redux, Zustand и Jotai делают одно и то же.',
};

export const LAB_COMPARE = {
  local: {
    title: { tg: 'Local', ru: 'Local' },
    text: {
      tg: 'Қобилист, ки маълумот танҳо ба ҳамин component ё қисми хурди он лозим бошад. Ҳама чиз дар дохили компонент мемонад.',
      ru: 'Подходит, когда данные нужны только этому component или небольшой его части. Всё живёт внутри компонента.',
    },
    example: { tg: 'мисол: modal open/close, инпути форма', ru: 'пример: modal open/close, инпут формы' },
  },
  global: {
    title: { tg: 'Global', ru: 'Global' },
    text: {
      tg: 'Қобилист, ки як маълумот дар компонентҳо ва саҳифаҳои гуногун лозим бошад: store ё атом мубодила мекунад.',
      ru: 'Подходит, когда одни данные нужны в разных components/pages: их раздаёт store или атом.',
    },
    example: { tg: 'мисол: current user, cart, рӯйхати умумии todo', ru: 'пример: current user, cart, общие todo' },
  },
};

export const LAB_PRACTICE_NOTE = {
  tg: 'Практика фаъол аст: баданаи омода пинҳон аст. Фақат imports, сохтор ва Шаг 1, 2, 3... мемонад — баданаро худат навис!',
  ru: 'Практика включена: готовое тело скрыто. Остаются imports, структура и Шаг 1, 2, 3... — тело напиши сам!',
};
