import { t, type LabLesson } from './types';

// Уроки Jotai — перенесены из Practice-Antigraviti.html (реальный проект practica.zip).
export const jotaiLessons: LabLesson[] = [
  {
    op: 'setup',
    mode: 'jotai',
    title: 'SETUP · jotaiStore.ts',
    intro: t(
      'Сохтори атомҳои Jotai: searchAtom, pageAtom, getDataAtom (atomWithRefresh), атомҳои амалиётӣ ва Suspense дар Jotai.tsx.',
      'Структура атомов Jotai: searchAtom, pageAtom, getDataAtom (atomWithRefresh), action-атомы и Suspense в Jotai.tsx.'
    ),
    flow: ['atom (state)', 'atomWithRefresh (GET)', 'atom(null, write)', 'Suspense'],
    steps: [
      { title: 'Атомҳои ҳолат', text: t('searchAtom ва pageAtom бо atom() сохта мешаванд.', 'searchAtom и pageAtom создаются через atom().'), code: "atom(''), atom(1)" },
      { title: 'getDataAtom', text: t('Бо atomWithRefresh сохта мешавад, то бо set(getDataAtom) refresh шавад.', 'Создаётся через atomWithRefresh, чтобы обновляться через set(getDataAtom).'), code: 'atomWithRefresh(...)' },
      { title: 'Action atoms', text: t('Атомҳои write-only: atom(null, async (get, set, arg) => ...).', 'Атомы write-only: atom(null, async (get, set, arg) => ...).'), code: 'atom(null, async ...)' },
      { title: 'Suspense', text: t('Дар Jotai.tsx компонент дар дохили <Suspense> печонида мешавад.', 'В Jotai.tsx компонент оборачивается в <Suspense>.'), code: '<Suspense fallback={...}>' },
    ],
    files: ['src/store/jotaiStore.ts', 'src/pages/Jotai.tsx'],
    relationNote: t('JotaiContent дар дохили Suspense render мешавад.', 'JotaiContent рендерится внутри Suspense.'),
    blocks: [
      {
        path: 'src/store/jotaiStore.ts',
        lang: 'ts',
        note: t('Атомҳои асосӣ — ин ҷо ҳама чиз сар мешавад.', 'Базовые атомы — здесь всё начинается.'),
        code: `import { atom } from "jotai"
import { atomWithRefresh } from "jotai/utils"
import axios from "axios"

let api = "https://to-dos-api.softclub.tj/api/to-dos"

export const searchAtom = atom("")
export const pageAtom = atom(1)

export const getDataAtom = atomWithRefresh(async (get) => {
  const search = get(searchAtom)
  const page = get(pageAtom)
  const { data } = await axios.get(\`\${api}?query=\${search}&PageNumber=\${page}&PageSize=4\`)
  return data.data
})`,
        practiceCode: `import { atom } from "jotai"
import { atomWithRefresh } from "jotai/utils"
import axios from "axios"

const api = "https://to-dos-api.softclub.tj/api/to-dos"

// Шаг 1: export const searchAtom = atom("")
// Шаг 2: export const pageAtom = atom(1)
// Шаг 3: getDataAtom = atomWithRefresh(async (get) => { ... })
//   — внутри: const search = get(searchAtom), const page = get(pageAtom)
//   — axios.get(\`\${api}?query=...&PageNumber=...&PageSize=4\`)
//   — return data.data || []`,
      },
      {
        path: 'src/pages/Jotai.tsx',
        lang: 'tsx',
        note: t('Атоми асинхронӣ бо useAtomValue хонда мешавад ва дар Suspense печонида мешавад.', 'Асинхронный атом читается через useAtomValue и оборачивается в Suspense.'),
        code: `import { useAtomValue } from "jotai"
import { getDataAtom } from "../store/jotaiStore"

const Jotai = () => {
  const data = useAtomValue(getDataAtom)

  return (
    <div>
      <h1>Jotai To-Do</h1>
      {data?.map((el: any) => (
        <div key={el.id}>{el.name}</div>
      ))}
    </div>
  )
}

export default Jotai`,
        practiceCode: `import { Suspense } from "react"
import { useAtomValue } from "jotai"
import { getDataAtom } from "../store/jotaiStore"

const JotaiContent = () => {
  // Шаг 1: const data = useAtomValue(getDataAtom)
  // Шаг 2: data?.map((el) => <div key={el.id}>{el.name}</div>)

  return (
    <div>

    </div>
  )
}

const Jotai = () => (
  // Шаг 3: <Suspense fallback={...}><JotaiContent /></Suspense>
  <div></div>
)

export default Jotai`,
      },
    ],
    concepts: [
      { name: 'atom', origin: 'jotai', why: t('Воҳиди алоҳидаи state', 'Отдельная единица state.'), missing: t('Бе atom state дар Jotai вуҷуд надорад.', 'Без atom в Jotai нет state.') },
      { name: 'atomWithRefresh', origin: 'jotai/utils', why: t('Атоми асинхрон, ки худашро refresh карда метавонад', 'Асинхронный атом, умеющий обновлять себя.'), missing: t('Бе ин пас аз POST/DELETE рӯйхатро нав карда наметавонӣ.', 'Без него не обновить список после POST/DELETE.') },
      { name: 'Suspense', origin: 'react', why: t('Ҳангоми боргирии атоми асинхрон fallback нишон медиҳад', 'Пока асинхронный атом грузится, показывает fallback.'), missing: t('Бе ин React хатогӣ медиҳад.', 'Без этого React выдаст ошибку.') },
    ],
    memory: t('atom (state) + atomWithRefresh (GET) + atom(null, write) + Suspense.', 'atom (state) + atomWithRefresh (GET) + atom(null, write) + Suspense.'),
    result: t('Атомҳо кор мекунанд ва Suspense Loading-ро нишон медиҳад.', 'Атомы работают, Suspense показывает Loading.'),
  },
  {
    op: 'get',
    mode: 'jotai',
    title: 'GET · getDataAtom',
    intro: t(
      'getDataAtom бо atomWithRefresh қиматҳои searchAtom ва pageAtom-ро бо get() мехонад ва axios.get мекунад. Дар Jotai.tsx бо useAtomValue хонда мешавад.',
      'getDataAtom через atomWithRefresh читает searchAtom и pageAtom через get() и делает axios.get. В Jotai.tsx читается через useAtomValue.'
    ),
    flow: ['useAtomValue(getDataAtom)', 'get(searchAtom/pageAtom)', 'axios.get', 'return data.data', 'UI'],
    steps: [
      { title: 'useAtomValue(getDataAtom)', text: t('Component қимати getDataAtom-ро мехонад.', 'Компонент читает значение getDataAtom.'), code: 'useAtomValue(getDataAtom)' },
      { title: 'get(searchAtom), get(pageAtom)', text: t('Атом худаш ин ду атомро dependency мегирад.', 'Атом сам делает эти два атома dependency.'), code: 'get(searchAtom)' },
      { title: 'axios.get', text: t('Дархост ба сервер меравад.', 'Запрос уходит на сервер.'), code: 'axios.get(...)' },
      { title: 'return data.data', text: t('Маълумот ба component мерасад.', 'Данные приходят в компонент.'), code: 'return data.data' },
    ],
    files: ['src/store/jotaiStore.ts', 'src/pages/Jotai.tsx'],
    relationNote: t('Вақте searchAtom ё pageAtom тағйир меёбанд, Jotai худаш getDataAtom-ро дубора даъват мекунад.', 'Когда searchAtom или pageAtom меняются, Jotai сам перевызывает getDataAtom.'),
    blocks: [
      {
        path: 'src/store/jotaiStore.ts',
        lang: 'ts',
        note: t('atomWithRefresh — атоми асинхронӣ, ки refresh мешавад.', 'atomWithRefresh — асинхронный атом с refresh.'),
        code: `export const getDataAtom = atomWithRefresh(async (get) => {
  const search = get(searchAtom)
  const page = get(pageAtom)
  try {
    const { data } = await axios.get(\`\${api}?query=\${search}&PageNumber=\${page}&PageSize=4\`)
    return data.data
  } catch (error) {
    console.error(error)
    return []
  }
})`,
        practiceCode: `export const getDataAtom = atomWithRefresh(async (get) => {
  // Шаг 1: const search = get(searchAtom), const page = get(pageAtom)
  // Шаг 2: const { data } = await axios.get(\`\${api}?query=...&PageNumber=...&PageSize=4\`)
  // Шаг 3: return data.data
})`,
      },
      {
        path: 'src/pages/Jotai.tsx',
        lang: 'tsx',
        note: t('Хондани атом ва намоиши рӯйхат.', 'Чтение атома и показ списка.'),
        code: `import { useAtom, useAtomValue } from "jotai"
import { getDataAtom, searchAtom, pageAtom } from "../store/jotaiStore"

const [search, setSearch] = useAtom(searchAtom)
const [page, setPage] = useAtom(pageAtom)
const data = useAtomValue(getDataAtom)

return (
  <div>
    <input value={search} onChange={(e) => setSearch(e.target.value)} />
    {data?.map((el: any) => (
      <div key={el.id}>{el.name}</div>
    ))}
  </div>
)`,
        practiceCode: `// Шаг 1: const [search, setSearch] = useAtom(searchAtom)
// Шаг 2: const [page, setPage] = useAtom(pageAtom)
// Шаг 3: const data = useAtomValue(getDataAtom)
// Шаг 4: data?.map((el) => <div key={el.id}>{el.name}</div>)`,
      },
    ],
    concepts: [
      { name: 'useAtomValue', origin: 'jotai', why: t('Hook барои танҳо хондани қимати атом (read-only)', 'Hook только для чтения значения атома (read-only).'), missing: t('Re-render-ҳои нолозим ба вуҷуд меоянд.', 'Появляются лишние re-render-ы.') },
      { name: 'get() дар атом', origin: 'getter callback', why: t('Қимати дигар атомҳоро мехонад ва онҳоро dependency месозад', 'Читает другие атомы и делает их dependency.'), missing: t('Бе ин бояд useEffect менавиштӣ.', 'Без этого пришлось бы писать useEffect.') },
    ],
    memory: t('get(searchAtom) → axios.get → return data.data → useAtomValue(getDataAtom).', 'get(searchAtom) → axios.get → return data.data → useAtomValue(getDataAtom).'),
    result: t('Рӯйхат аз сервер бо Suspense меояд.', 'Список приходит с сервера через Suspense.'),
  },
  {
    op: 'post',
    mode: 'jotai',
    title: 'POST · AddDataAtom',
    intro: t(
      'AddDataAtom вазифаи навро бо axios.post сабт карда, бо set(getDataAtom) рӯйхатро refresh мекунад.',
      'AddDataAtom сохраняет новую задачу через axios.post и обновляет список через set(getDataAtom).'
    ),
    flow: ['useSetAtom(AddDataAtom)', 'addData(formData)', 'axios.post', 'set(getDataAtom)', 'UI'],
    steps: [
      { title: 'useSetAtom(AddDataAtom)', text: t('Setter hook гирифта мешавад.', 'Получаем setter hook.'), code: 'useSetAtom(AddDataAtom)' },
      { title: 'addData(formData)', text: t('FormData ба атом меравад.', 'FormData уходит в атом.'), code: 'addData(formData)' },
      { title: 'axios.post', text: t('Запрос ба сервер меравад.', 'Запрос уходит на сервер.'), code: 'axios.post(api, user)' },
      { title: 'set(getDataAtom)', text: t('Jotai getDataAtom-ро аз нав ҳисоб мекунад.', 'Jotai пересчитывает getDataAtom.'), code: 'set(getDataAtom)' },
    ],
    files: ['src/store/jotaiStore.ts', 'src/components/dialogJotai/DialogAddJotai.tsx', 'src/pages/Jotai.tsx'],
    relationNote: t('DialogAddJotai.tsx useSetAtom(AddDataAtom)-ро истифода мебарад.', 'DialogAddJotai.tsx использует useSetAtom(AddDataAtom).'),
    blocks: [
      {
        path: 'src/store/jotaiStore.ts',
        lang: 'ts',
        note: t('atom(null, ...) — атоми write-only: танҳо барои иҷрои амал.', 'atom(null, ...) — write-only атом: только для выполнения действия.'),
        code: `export const AddDataAtom = atom(null, async (get, set, user) => {
  try {
    await axios.post(api, user)
    set(getDataAtom) // atomWithRefresh-ро маҷбур мекунад аз сари нав request кунад!
  } catch (error) {
    console.error(error)
  }
})`,
        practiceCode: `export const AddDataAtom = atom(null, async (get, set, user) => {
  // Шаг 1: await axios.post(api, user)
  // Шаг 2: set(getDataAtom) — обновить список без useEffect!
})`,
      },
      {
        path: 'src/pages/Jotai.tsx',
        lang: 'tsx',
        note: t('Тугмаи «+ Add Task» ва кушодани модал.', 'Кнопка «+ Add Task» и открытие модалки.'),
        code: `const [add, setAdd] = useState(false)

<button onClick={() => setAdd(true)}>
  + Add Task
</button>

<DialogAddJotai user={add} setUser={setAdd} />`,
        practiceCode: `// Шаг 1: const [add, setAdd] = useState(false)
// Шаг 2: <button onClick={() => setAdd(true)}>+ Add Task</button>
// Шаг 3: <DialogAddJotai user={add} setUser={setAdd} />`,
      },
      {
        path: 'src/components/dialogJotai/DialogAddJotai.tsx',
        lang: 'tsx',
        note: t('useSetAtom — танҳо функсияи нависанда мегирад.', 'useSetAtom — берёт только функцию записи.'),
        code: `import { useSetAtom } from "jotai"
import { AddDataAtom } from "../../store/jotaiStore"

const DialogAddJotai = ({ user, setUser }: any) => {
  const addData = useSetAtom(AddDataAtom)

  function AddUser(e: any) {
    e.preventDefault()
    const formData = new FormData()
    formData.append("Name", e.target.name.value)
    formData.append("Description", e.target.description.value)
    for (const el of e.target.images.files) {
      formData.append("Images", el)
    }
    addData(formData)
    setUser(null)
  }

  if (!user) return null

  return (
    <div className="modal">
      <form onSubmit={AddUser}>
        <input name="name" required placeholder="Title" />
        <input name="description" required placeholder="Description" />
        <input type="file" name="images" multiple />
        <button type="submit">Add</button>
      </form>
    </div>
  )
}

export default DialogAddJotai`,
        practiceCode: `import { useSetAtom } from "jotai"
import { AddDataAtom } from "../../store/jotaiStore"

const DialogAddJotai = ({ user, setUser }: any) => {
  // Шаг 1: const addData = useSetAtom(AddDataAtom)

  function AddUser(e: any) {
    e.preventDefault()
    // Шаг 2: const formData = new FormData()
    // Шаг 3: formData.append("Name", ...), formData.append("Description", ...)
    // Шаг 4: for (const el of e.target.images.files) formData.append("Images", el)
    // Шаг 5: addData(formData)
    // Шаг 6: setUser(null)
  }

  if (!user) return null

  return (
    <div className="modal">
      {/* формаи name, description, images */}
    </div>
  )
}

export default DialogAddJotai`,
      },
    ],
    concepts: [
      { name: 'useSetAtom', origin: 'jotai', why: t('Функсияи нависандаи атомро медиҳад (setter)', 'Даёт функцию записи атома (setter).'), missing: t('Action-ро бе re-render-и лозимӣ даъват карда наметавонӣ.', 'Не вызвать action без лишних re-render-ов.') },
      { name: 'set(getDataAtom)', origin: 'Jotai Refresh', why: t('getDataAtom-ро водор мекунад, ки аз нав боргирӣ кунад', 'Заставляет getDataAtom перезагрузиться.'), missing: t('Бе ин рӯйхат нав намешавад.', 'Без этого список не обновится.') },
    ],
    memory: t('user → axios.post → set(getDataAtom) → рӯйхат нав мешавад.', 'user → axios.post → set(getDataAtom) → список обновляется.'),
    result: t('Вазифаи нав бе useEffect дар рӯйхат пайдо мешавад.', 'Новая задача появляется в списке без useEffect.'),
  },
  {
    op: 'put',
    mode: 'jotai',
    title: 'PUT · EditDataAtom & IsCompletedAtom',
    intro: t(
      'EditDataAtom барои таҳрири матн ва IsCompletedAtom барои чекбокс. Ҳарду axios.put мекунанд ва set(getDataAtom) менамоянд.',
      'EditDataAtom — для правки текста, IsCompletedAtom — для чекбокса. Оба делают axios.put и вызывают set(getDataAtom).'
    ),
    flow: ['editobj / checkbox', 'editData(user) / isCompleted(id)', 'axios.put', 'set(getDataAtom)', 'UI'],
    steps: [
      { title: 'Таҳрир ё Чекбокс', text: t('Корбар тугмаи Save ё чекбоксро пахш мекунад.', 'Пользователь нажимает Save или чекбокс.'), code: 'editData ё isCompleted' },
      { title: 'axios.put', text: t('Запрос ба сервер меравад.', 'Запрос уходит на сервер.'), code: 'axios.put(...)' },
      { title: 'set(getDataAtom)', text: t('Рӯйхат ба таври худкор нав мешавад.', 'Список обновляется автоматически.'), code: 'set(getDataAtom)' },
    ],
    files: ['src/store/jotaiStore.ts', 'src/components/dialogJotai/DialogEditJotai.tsx', 'src/pages/Jotai.tsx'],
    relationNote: t('Jotai.tsx чекбокси IsCompletedAtom-ро бо useSetAtom даъват мекунад.', 'Jotai.tsx вызывает чекбокс IsCompletedAtom через useSetAtom.'),
    blocks: [
      {
        path: 'src/store/jotaiStore.ts',
        lang: 'ts',
        note: t('Ду атоми write — сохторашон якхела.', 'Два write-атома — структура одинаковая.'),
        code: `export const EditDataAtom = atom(null, async (get, set, user) => {
  try {
    await axios.put(api, user)
    set(getDataAtom)
  } catch (error) {
    console.error(error)
  }
})

export const IsCompletedAtom = atom(null, async (get, set, id) => {
  try {
    await axios.put(\`https://to-dos-api.softclub.tj/completed?id=\${id}\`)
    set(getDataAtom)
  } catch (error) {
    console.error(error)
  }
})`,
        practiceCode: `export const EditDataAtom = atom(null, async (get, set, user) => {
  // Шаг 1: await axios.put(api, user)
  // Шаг 2: set(getDataAtom)
})

export const IsCompletedAtom = atom(null, async (get, set, id) => {
  // Шаг 1: await axios.put(\`https://to-dos-api.softclub.tj/completed?id=\${id}\`)
  // Шаг 2: set(getDataAtom)
})`,
      },
      {
        path: 'src/pages/Jotai.tsx',
        lang: 'tsx',
        note: t('Тугмаи Edit ва чекбокс бо useSetAtom.', 'Кнопка Edit и чекбокс через useSetAtom.'),
        code: `import { useSetAtom } from "jotai"
import { IsCompletedAtom } from "../store/jotaiStore"
import DialogEditJotai from "../components/dialogJotai/DialogEditJotai"

const isCompleted = useSetAtom(IsCompletedAtom)
const [edit, setEdit] = useState(null)

<button onClick={() => setEdit(el)}>Edit</button>

<input
  type="checkbox"
  checked={el.isCompleted}
  onChange={() => isCompleted(el.id)}
/>

<DialogEditJotai user={edit} setUser={setEdit} />`,
        practiceCode: `// Шаг 1: const isCompleted = useSetAtom(IsCompletedAtom)
// Шаг 2: <button onClick={() => setEdit(el)}>Edit</button>
// Шаг 3: <input type="checkbox" onChange={() => isCompleted(el.id)} />
// Шаг 4: <DialogEditJotai user={edit} setUser={setEdit} />`,
      },
      {
        path: 'src/components/dialogJotai/DialogEditJotai.tsx',
        lang: 'tsx',
        note: t('editobj сохта, ба EditDataAtom дода мешавад.', 'Собирается editobj и передаётся в EditDataAtom.'),
        code: `import { useSetAtom } from "jotai"
import { EditDataAtom } from "../../store/jotaiStore"

const DialogEditJotai = ({ user, setUser }: any) => {
  const editData = useSetAtom(EditDataAtom)

  function EditUser(e: any) {
    e.preventDefault()
    const editobj = {
      id: user.id,
      name: e.target.name.value,
      description: e.target.description.value,
    }
    editData(editobj)
    setUser(null)
  }

  if (!user) return null

  return (
    <div className="modal">
      <form onSubmit={EditUser}>
        <input name="name" defaultValue={user.name} />
        <input name="description" defaultValue={user.description} />
        <button type="submit">Save</button>
      </form>
    </div>
  )
}

export default DialogEditJotai`,
        practiceCode: `import { useSetAtom } from "jotai"
import { EditDataAtom } from "../../store/jotaiStore"

const DialogEditJotai = ({ user, setUser }: any) => {
  // Шаг 1: const editData = useSetAtom(EditDataAtom)

  function EditUser(e: any) {
    e.preventDefault()
    // Шаг 2: const editobj = { id: user.id, name: ..., description: ... }
    // Шаг 3: editData(editobj)
    // Шаг 4: setUser(null)
  }

  if (!user) return null

  return (
    <div className="modal">
      {/* формаи таҳрир бо defaultValue */}
    </div>
  )
}

export default DialogEditJotai`,
      },
    ],
    concepts: [
      { name: 'Action Atom', origin: 'Jotai pattern', why: t('Амалиётҳои асинхронӣ бе нигоҳдории state-и алоҳида', 'Асинхронные операции без хранения отдельного state.'), missing: t('Барои ҳар амал бояд атоми алоҳидаи state мекардӣ.', 'Для каждого действия пришлось бы хранить отдельный state.') },
    ],
    memory: t('user → axios.put → set(getDataAtom).', 'user → axios.put → set(getDataAtom).'),
    result: t('Тағйирот фавран дар рӯйхат пайдо мешаванд.', 'Изменения сразу появляются в списке.'),
  },
  {
    op: 'delete',
    mode: 'jotai',
    title: 'DELETE · DeleteDataAtom',
    intro: t(
      'DeleteDataAtom вазифаро бо axios.delete нест мекунад ва set(getDataAtom) менамояд.',
      'DeleteDataAtom удаляет задачу через axios.delete и вызывает set(getDataAtom).'
    ),
    flow: ['Клик ба Delete', 'deleteData(el.id)', 'axios.delete', 'set(getDataAtom)', 'UI'],
    steps: [
      { title: 'Клик ба Delete', text: t('useSetAtom(DeleteDataAtom) даъват мешавад.', 'Вызывается useSetAtom(DeleteDataAtom).'), code: 'deleteData(el.id)' },
      { title: 'axios.delete', text: t('Запрос ба сервер меравад.', 'Запрос уходит на сервер.'), code: 'axios.delete(`${api}?id=${id}`)' },
      { title: 'set(getDataAtom)', text: t('getDataAtom refresh мешавад.', 'getDataAtom обновляется.'), code: 'set(getDataAtom)' },
    ],
    files: ['src/store/jotaiStore.ts', 'src/pages/Jotai.tsx'],
    relationNote: t('Тугмаи Delete дар кортҳои Jotai.tsx истифода шудааст.', 'Кнопка Delete используется в карточках Jotai.tsx.'),
    blocks: [
      {
        path: 'src/store/jotaiStore.ts',
        lang: 'ts',
        note: t('Write-атом: axios.delete + refresh.', 'Write-атом: axios.delete + refresh.'),
        code: `export const DeleteDataAtom = atom(null, async (get, set, id) => {
  try {
    await axios.delete(\`\${api}?id=\${id}\`)
    set(getDataAtom)
  } catch (error) {
    console.error(error)
  }
})`,
        practiceCode: `export const DeleteDataAtom = atom(null, async (get, set, id) => {
  // Шаг 1: await axios.delete(\`\${api}?id=\${id}\`)
  // Шаг 2: set(getDataAtom)
})`,
      },
      {
        path: 'src/pages/Jotai.tsx',
        lang: 'tsx',
        note: t('Тугмаи Delete бо useSetAtom.', 'Кнопка Delete через useSetAtom.'),
        code: `import { useSetAtom } from "jotai"
import { DeleteDataAtom } from "../store/jotaiStore"

const deleteData = useSetAtom(DeleteDataAtom)

<button onClick={() => deleteData(el.id)}>
  Delete
</button>`,
        practiceCode: `// Шаг 1: const deleteData = useSetAtom(DeleteDataAtom)
// Шаг 2: <button onClick={() => deleteData(el.id)}>Delete</button>`,
      },
    ],
    concepts: [
      { name: 'DeleteDataAtom', origin: 'Write Atom', why: t('Барои нест кардан ва refresh-и автоматӣ', 'Для удаления и автоматического refresh.'), missing: t('Бе ин рӯйхат нав намешавад.', 'Без этого список не обновится.') },
    ],
    memory: t('id → axios.delete → set(getDataAtom).', 'id → axios.delete → set(getDataAtom).'),
    result: t('Корт аз рӯйхат нопадид мешавад.', 'Карточка исчезает из списка.'),
  },
  {
    op: 'info',
    mode: 'jotai',
    title: 'INFO · GetInfoAtom & infoUserAtom',
    intro: t(
      'GetInfoAtom маълумотро бо axios.get гирифта, бо set(infoUserAtom, data.data) сабт мекунад. Саҳифаи Info.tsx онро бо useAtomValue мехонад.',
      'GetInfoAtom получает данные через axios.get и записывает через set(infoUserAtom, data.data). Страница Info.tsx читает их через useAtomValue.'
    ),
    flow: ['handleInfo(id)', 'getInfo(id)', 'axios.get(`${api}/${id}`)', 'set(infoUserAtom)', 'navigate("/info")', 'Info.tsx → useAtomValue'],
    steps: [
      { title: 'handleInfo(id)', text: t('getInfo(id) даъват шуда, ба /info мегузарад.', 'Вызывается getInfo(id) и происходит переход на /info.'), code: "getInfo(id) → navigate('/info')" },
      { title: 'axios.get', text: t('Маълумоти вазифа аз рӯи ID гирифта мешавад.', 'Данные задачи берутся по ID.'), code: 'axios.get(...)' },
      { title: 'set(infoUserAtom)', text: t('Атоми infoUserAtom нав мешавад.', 'Атом infoUserAtom обновляется.'), code: 'set(infoUserAtom, data.data)' },
      { title: 'Info.tsx', text: t('Саҳифа infoUserAtom-ро бо useAtomValue мехонад.', 'Страница читает infoUserAtom через useAtomValue.'), code: 'useAtomValue(infoUserAtom)' },
    ],
    files: ['src/store/jotaiStore.ts', 'src/pages/Jotai.tsx', 'src/pages/Info.tsx'],
    relationNote: t('Jotai.tsx GetInfoAtom-ро даъват мекунад ва Info.tsx infoUserAtom-ро мехонад.', 'Jotai.tsx вызывает GetInfoAtom, а Info.tsx читает infoUserAtom.'),
    blocks: [
      {
        path: 'src/store/jotaiStore.ts',
        lang: 'ts',
        note: t('Ду атом: infoUserAtom (state) ва GetInfoAtom (write).', 'Два атома: infoUserAtom (state) и GetInfoAtom (write).'),
        code: `export const infoUserAtom = atom(null)

export const GetInfoAtom = atom(null, async (get, set, id) => {
  try {
    const { data } = await axios.get(\`\${api}/\${id}\`)
    set(infoUserAtom, data.data)
  } catch (error) {
    console.error(error)
  }
})`,
        practiceCode: `export const infoUserAtom = atom(null)

export const GetInfoAtom = atom(null, async (get, set, id) => {
  // Шаг 1: const { data } = await axios.get(\`\${api}/\${id}\`)
  // Шаг 2: set(infoUserAtom, data.data)
})`,
      },
      {
        path: 'src/pages/Jotai.tsx',
        lang: 'tsx',
        note: t('handleInfo: пеш getInfo, баъд navigate.', 'handleInfo: сначала getInfo, потом navigate.'),
        code: `import { useSetAtom } from "jotai"
import { GetInfoAtom } from "../store/jotaiStore"
import { useNavigate } from "react-router"

const getInfo = useSetAtom(GetInfoAtom)
const navigate = useNavigate()

const handleInfo = (id: any) => {
  getInfo(id)
  navigate("/info")
}

<button onClick={() => handleInfo(el.id)}>
  Info
</button>`,
        practiceCode: `const handleInfo = (id: any) => {
  // Шаг 1: getInfo(id)
  // Шаг 2: navigate("/info")
}

<button onClick={() => handleInfo(el.id)}>
  Info
</button>`,
      },
      {
        path: 'src/pages/Info.tsx',
        lang: 'tsx',
        note: t('infoUserAtom-ро бо useAtomValue мехонад.', 'Читает infoUserAtom через useAtomValue.'),
        code: `import { useAtomValue } from "jotai"
import { infoUserAtom } from "../store/jotaiStore"

const infoJotai = useAtomValue(infoUserAtom)

return (
  <div>
    <h1>{infoJotai?.name}</h1>
    <p>{infoJotai?.description}</p>
  </div>
)`,
        practiceCode: `// Шаг 1: const infoJotai = useAtomValue(infoUserAtom)
// Шаг 2: infoJotai?.name ва infoJotai?.description дар JSX`,
      },
    ],
    concepts: [
      { name: 'infoUserAtom', origin: 'State Atom', why: t('Нигоҳдории объекти вазифаи интихобшуда', 'Хранит объект выбранной задачи.'), missing: t('Бе ин саҳифаи Info маълумотро намеёбад.', 'Без этого страница Info не найдёт данные.') },
    ],
    memory: t('id → GetInfoAtom → set(infoUserAtom) → useAtomValue(infoUserAtom).', 'id → GetInfoAtom → set(infoUserAtom) → useAtomValue(infoUserAtom).'),
    result: t('Саҳифаи Info тафсилотро нишон медиҳад.', 'Страница Info показывает детали.'),
  },
  {
    op: 'search',
    mode: 'jotai',
    title: 'SEARCH · Ҷустуҷӯ',
    intro: t(
      'Ҷустуҷӯ бо searchAtom кор мекунад. Чун getDataAtom дар дохили худ get(searchAtom) дорад, тағйири searchAtom худкор getDataAtom-ро дубора ҳисоб мекунад — useEffect лозим нест!',
      'Поиск работает через searchAtom. Так как getDataAtom внутри читает get(searchAtom), изменение searchAtom само пересчитывает getDataAtom — useEffect не нужен!'
    ),
    flow: ['useAtom(searchAtom)', 'setSearch', 'get(searchAtom) реактивӣ', 'getDataAtom нав мешавад', 'UI'],
    steps: [
      { title: 'useAtom(searchAtom)', text: t('[search, setSearch] мисли useState кор мекунад.', '[search, setSearch] работает как useState.'), code: 'useAtom(searchAtom)' },
      { title: 'setSearch(value)', text: t('Корбар дар инпут менависад.', 'Пользователь пишет в инпут.'), code: 'setSearch(e.target.value)' },
      { title: 'Реактивии худкор', text: t('Jotai мебинад, ки searchAtom нав шуд ва getDataAtom-ро аз нав даъват мекунад!', 'Jotai видит, что searchAtom изменился, и сам перевызывает getDataAtom!'), code: 'get(searchAtom)' },
      { title: 'UI нав мешавад', text: t('Саҳифа рӯйхати филтршударо нишон медиҳад.', 'Страница показывает отфильтрованный список.'), code: 'Suspense → useAtomValue' },
    ],
    files: ['src/store/jotaiStore.ts', 'src/pages/Jotai.tsx'],
    relationNote: t('Ҷустуҷӯ дар Jotai комилан реактивӣ ва бе useEffect кор мекунад.', 'Поиск в Jotai полностью реактивный и работает без useEffect.'),
    blocks: [
      {
        path: 'src/store/jotaiStore.ts',
        lang: 'ts',
        note: t('get(searchAtom) — dependency-и худкор.', 'get(searchAtom) — автоматический dependency.'),
        code: `export const searchAtom = atom("")

export const getDataAtom = atomWithRefresh(async (get) => {
  const search = get(searchAtom)
  const page = get(pageAtom)
  const { data } = await axios.get(\`\${api}?query=\${search}&PageNumber=\${page}&PageSize=4\`)
  return data.data || []
})`,
        practiceCode: `// Шаг 1: export const searchAtom = atom("")
// Шаг 2: дар дохили getDataAtom — const search = get(searchAtom)`,
      },
      {
        path: 'src/pages/Jotai.tsx',
        lang: 'tsx',
        note: t('searchAtom бо useAtom нав мешавад — бе useEffect.', 'searchAtom обновляется через useAtom — без useEffect.'),
        code: `const [search, setSearch] = useAtom(searchAtom)

<input
  type="text"
  value={search}
  onChange={(e) => {
    setSearch(e.target.value)
    setPage(1)
  }}
  placeholder="Search..."
/>`,
        practiceCode: `// Шаг 1: const [search, setSearch] = useAtom(searchAtom)
// Шаг 2: setSearch(e.target.value) ва setPage(1) дар onChange`,
      },
    ],
    concepts: [
      { name: 'get(searchAtom)', origin: 'Jotai Dependency', why: t('Атоми search-ро автоматикӣ пайваст мекунад', 'Автоматически связывает атом search.'), missing: t('Аз ин сабаб ҳоҷат ба useEffect-и дастӣ нест.', 'Поэтому ручной useEffect не нужен.') },
    ],
    memory: t('useAtom(searchAtom) → get(searchAtom) → худкор getDataAtom нав мешавад.', 'useAtom(searchAtom) → get(searchAtom) → getDataAtom обновляется сам.'),
    result: t('Ҳар ҳарф навсофт рӯйхат нав мешавад.', 'Список обновляется на каждый ввод символа.'),
  },
  {
    op: 'pagination',
    mode: 'jotai',
    title: 'PAGINATION · Саҳифабандӣ',
    intro: t(
      'Саҳифабандӣ бо pageAtom кор мекунад. Вақте setPage даъват мешавад, getDataAtom бо get(pageAtom) худкор саҳифаи навро мехонад.',
      'Пагинация работает через pageAtom. Когда вызывается setPage, getDataAtom через get(pageAtom) сам берёт новую страницу.'
    ),
    flow: ['useAtom(pageAtom)', 'setPage', 'get(pageAtom) реактивӣ', 'getDataAtom нав мешавад', 'UI'],
    steps: [
      { title: 'useAtom(pageAtom)', text: t('Қимати рақами саҳифа хонда мешавад.', 'Читается номер страницы.'), code: 'useAtom(pageAtom)' },
      { title: 'setPage', text: t('Тугмаҳои Prev ва Next қимати page-ро тағйир медиҳанд.', 'Кнопки Prev и Next меняют значение page.'), code: 'setPage((p) => p + 1)' },
      { title: 'get(pageAtom)', text: t('getDataAtom саҳифаи навро мегирад.', 'getDataAtom берёт новую страницу.'), code: 'get(pageAtom) → API' },
    ],
    files: ['src/store/jotaiStore.ts', 'src/pages/Jotai.tsx'],
    relationNote: t('Ҳарду атомҳои searchAtom ва pageAtom дар getDataAtom пайвастанд.', 'Оба атома searchAtom и pageAtom связаны в getDataAtom.'),
    blocks: [
      {
        path: 'src/store/jotaiStore.ts',
        lang: 'ts',
        note: t('pageAtom — state атом.', 'pageAtom — state-атом.'),
        code: `export const pageAtom = atom(1)

export const getDataAtom = atomWithRefresh(async (get) => {
  const search = get(searchAtom)
  const page = get(pageAtom)
  const { data } = await axios.get(\`\${api}?query=\${search}&PageNumber=\${page}&PageSize=4\`)
  return data.data || []
})`,
        practiceCode: `// Шаг 1: export const pageAtom = atom(1)
// Шаг 2: дар дохили getDataAtom — const page = get(pageAtom)`,
      },
      {
        path: 'src/pages/Jotai.tsx',
        lang: 'tsx',
        note: t('Тугмаҳои Prev/Next бо useAtom(pageAtom).', 'Кнопки Prev/Next через useAtom(pageAtom).'),
        code: `const [page, setPage] = useAtom(pageAtom)

<button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
<span>Page {page}</span>
<button disabled={!data || data.length < 4} onClick={() => setPage((p) => p + 1)}>Next</button>`,
        practiceCode: `// Шаг 1: const [page, setPage] = useAtom(pageAtom)
// Шаг 2: тугмаҳои Prev/Next бо setPage`,
      },
    ],
    concepts: [
      { name: 'pageAtom', origin: 'State Atom', why: t('Нигоҳдории рақами саҳифа', 'Хранит номер страницы.'), missing: t('Саҳифабандӣ реактивӣ кор намекард.', 'Пагинация не была бы реактивной.') },
    ],
    memory: t('setPage → get(pageAtom) → getDataAtom ба таври худкор нав мешавад.', 'setPage → get(pageAtom) → getDataAtom обновляется сам.'),
    result: t('Ҳар клик саҳифаи навро меорад. Санҷиши API (2026-10): сервер ҳоло PageNumber/PageSize-ро игнор мекунад — ҳамаи сабтҳо бармегарданд.', 'Каждый клик приносит новую страницу. Проверка API (2026-10): сервер сейчас игнорирует PageNumber/PageSize — возвращает все записи.'),
  },
  {
    op: 'add-img',
    mode: 'jotai',
    title: 'ADD IMG · AddImgAtom',
    intro: t(
      'AddImgAtom файлҳоро ба FormData гузошта, ба ${api}/${id}/images мефиристад ва set(getDataAtom) мекунад.',
      'AddImgAtom кладёт файлы в FormData, отправляет на ${api}/${id}/images и вызывает set(getDataAtom).'
    ),
    flow: ['e.target.files', 'FormData', 'axios.post', 'set(getDataAtom)', 'UI'],
    steps: [
      { title: 'Интихоби файл', text: t('onChange e.target.files-ро ба addImgData мегузаронад.', 'onChange передаёт e.target.files в addImgData.'), code: 'addImgData({ id, file })' },
      { title: 'FormData', text: t('Файлҳо ба калиди Images зам мешаванд.', 'Файлы кладутся под ключ Images.'), code: "formData.append('Images', file[i])" },
      { title: 'axios.post', text: t('Боргузорӣ ба ${api}/${id}/images.', 'Загрузка на ${api}/${id}/images.'), code: 'axios.post(...)' },
      { title: 'set(getDataAtom)', text: t('Рӯйхат нав мешавад.', 'Список обновляется.'), code: 'set(getDataAtom)' },
    ],
    files: ['src/store/jotaiStore.ts', 'src/pages/Jotai.tsx'],
    relationNote: t("Инпути type='file' дар Jotai.tsx қарор дорад.", 'Инпут type="file" находится в Jotai.tsx.'),
    blocks: [
      {
        path: 'src/store/jotaiStore.ts',
        lang: 'ts',
        note: t('Write-атом бо FormData.', 'Write-атом с FormData.'),
        code: `export const AddImgAtom = atom(null, async (get, set, { id, file }) => {
  try {
    const formData = new FormData()
    for (let i = 0; i < file.length; i++) {
      formData.append("Images", file[i])
    }
    await axios.post(\`\${api}/\${id}/images\`, formData)
    set(getDataAtom)
  } catch (error) {
    console.error(error)
  }
})`,
        practiceCode: `export const AddImgAtom = atom(null, async (get, set, { id, file }) => {
  // Шаг 1: const formData = new FormData()
  // Шаг 2: for (let i = 0; i < file.length; i++) formData.append("Images", file[i])
  // Шаг 3: await axios.post(\`\${api}/\${id}/images\`, formData)
  // Шаг 4: set(getDataAtom)
})`,
      },
      {
        path: 'src/pages/Jotai.tsx',
        lang: 'tsx',
        note: t('Инпути файл бо useSetAtom.', 'Инпут файла через useSetAtom.'),
        code: `const addImgData = useSetAtom(AddImgAtom)

<input
  type="file"
  onChange={(e) =>
    addImgData({ id: el.id, file: e.target.files })
  }
/>`,
        practiceCode: `// Шаг 1: const addImgData = useSetAtom(AddImgAtom)
// Шаг 2: addImgData({ id: el.id, file: e.target.files })
<input
  type="file"
  onChange={(e) => {}}
/>`,
      },
    ],
    concepts: [
      { name: 'AddImgAtom', origin: 'Write Atom', why: t('Боргузории расмҳо ба вазифа', 'Загрузка картинок к задаче.'), missing: t('Бе ин аксҳо сабт намешаванд.', 'Без этого картинки не сохранятся.') },
    ],
    memory: t('file → FormData → axios.post → set(getDataAtom).', 'file → FormData → axios.post → set(getDataAtom).'),
    result: t('Расмҳо ба корти вазифа илова мешаванд.', 'Картинки добавляются к карточке задачи.'),
  },
  {
    op: 'delete-img',
    mode: 'jotai',
    title: 'DELETE IMG · DeleteImgAtom',
    intro: t(
      'DeleteImgAtom расмро бо axios.delete нест мекунад ва set(getDataAtom) менамояд.',
      'DeleteImgAtom удаляет картинку через axios.delete и вызывает set(getDataAtom).'
    ),
    flow: ['Клик дар расм', 'deleteImgData(img.id)', 'axios.delete(/images/id)', 'set(getDataAtom)', 'UI'],
    steps: [
      { title: 'Клик дар расм', text: t('useSetAtom(DeleteImgAtom) даъват мешавад.', 'Вызывается useSetAtom(DeleteImgAtom).'), code: 'deleteImgData(img.id)' },
      { title: 'axios.delete', text: t('Файл аз сервер нест мешавад.', 'Файл удаляется с сервера.'), code: 'axios.delete(`${api}/images/${imageId}`)' },
      { title: 'set(getDataAtom)', text: t('getDataAtom refresh мешавад.', 'getDataAtom обновляется.'), code: 'set(getDataAtom)' },
    ],
    files: ['src/store/jotaiStore.ts', 'src/pages/Jotai.tsx'],
    relationNote: t('Тугмаи Delete дар болои ҳар як расм дар Jotai.tsx қарор дорад.', 'Кнопка Delete находится над каждой картинкой в Jotai.tsx.'),
    blocks: [
      {
        path: 'src/store/jotaiStore.ts',
        lang: 'ts',
        note: t('imageId — ID-и акс, на ID-и todo.', 'imageId — ID картинки, а не todo.'),
        code: `export const DeleteImgAtom = atom(null, async (get, set, imageId) => {
  try {
    await axios.delete(\`\${api}/images/\${imageId}\`)
    set(getDataAtom)
  } catch (error) {
    console.error(error)
  }
})`,
        practiceCode: `export const DeleteImgAtom = atom(null, async (get, set, imageId) => {
  // Шаг 1: await axios.delete(\`\${api}/images/\${imageId}\`)
  // Шаг 2: set(getDataAtom)
})`,
      },
      {
        path: 'src/pages/Jotai.tsx',
        lang: 'tsx',
        note: t('Тугмаи нест кардани расм.', 'Кнопка удаления картинки.'),
        code: `const deleteImgData = useSetAtom(DeleteImgAtom)

<button onClick={() => deleteImgData(img.id)}>
  Delete
</button>`,
        practiceCode: `// Шаг 1: const deleteImgData = useSetAtom(DeleteImgAtom)
// Шаг 2: <button onClick={() => deleteImgData(img.id)}>Delete</button>`,
      },
    ],
    concepts: [
      { name: 'DeleteImgAtom', origin: 'Write Atom', why: t('Барои нест кардани акс ва refresh-и рӯйхат', 'Для удаления картинки и обновления списка.'), missing: t('Бе ин расмҳо тоза намешаванд.', 'Без этого картинки не удалятся.') },
    ],
    memory: t('imageId → axios.delete(/images/id) → set(getDataAtom).', 'imageId → axios.delete(/images/id) → set(getDataAtom).'),
    result: t('Расм аз корт нопадид мешавад.', 'Картинка исчезает из карточки.'),
  },
];
