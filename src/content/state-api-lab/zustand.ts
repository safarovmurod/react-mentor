import { t, type LabLesson } from './types';

// Уроки Zustand — перенесены из Practice-Antigraviti.html (реальный проект practica.zip).
export const zustandLessons: LabLesson[] = [
  {
    op: 'setup',
    mode: 'zustand',
    title: 'SETUP · useTodoStore.ts',
    intro: t(
      'Store-и ягонаи Zustand бо create((set, get) => ({ ... })) сохта мешавад. Ҳамаи амалиётҳо дар як ҷо қарор доранд.',
      'Единый store Zustand создаётся через create((set, get) => ({ ... })). Все операции лежат в одном месте.'
    ),
    flow: ['create((set, get))', 'state + actions', 'hook дар компонент', 'UI'],
    steps: [
      { title: 'create((set, get))', text: t('Zustand hook месозад: set барои update ва get барои хондан.', 'Создаёт Zustand hook: set для обновления, get для чтения.'), code: 'create((set, get) => ({ ... }))' },
      { title: 'State', text: t('data: [] ва infoUser: null дар як ҷо.', 'data: [] и infoUser: null в одном месте.'), code: 'data: [], infoUser: null' },
      { title: 'Методҳо', text: t('Ҳамаи функсияҳои API мустақиман дар дохили ҳамин як store ҳастанд.', 'Все функции API находятся прямо внутри этого одного store.'), code: 'getData, addData, deleteData...' },
    ],
    files: ['src/store/useTodoStore.ts', 'src/pages/Zustand.tsx'],
    relationNote: t('Дар Zustand ягон Provider лозим нест, hook дар ҳар компонент мустақиман даъват мешавад.', 'В Zustand Provider не нужен: hook вызывается прямо в каждом компоненте.'),
    blocks: [
      {
        path: 'src/store/useTodoStore.ts',
        lang: 'ts',
        note: t('Ягона файли store — ягон Provider низ лозим нест.', 'Один файл store — даже Provider не нужен.'),
        code: `import { create } from "zustand"
import axios from "axios"

let api = "https://to-dos-api.softclub.tj/api/to-dos"

export const useTodoStore = create((set, get) => ({
  data: [],
  isLoading: false,
  infoUser: null,
  
  getData: async (params = {}) => {
    set({ isLoading: true })
    const search = params?.search || ""
    const page = params?.page || 1
    const { data } = await axios.get(\`\${api}?query=\${search}&PageNumber=\${page}&PageSize=4\`)
    set({ data: data.data, isLoading: false })
  },
}))`,
        practiceCode: `import { create } from "zustand"
import axios from "axios"

const api = "https://to-dos-api.softclub.tj/api/to-dos"

export const useTodoStore = create((set, get) => ({
  // Шаг 1: state — data: [], isLoading: false, infoUser: null
  // Шаг 2: getData: async (params = {}) => { ... }
}))`,
      },
      {
        path: 'src/pages/Zustand.tsx',
        lang: 'tsx',
        note: t('Hook-ро даъват мекунӣ ва ҳама чизро мегирӣ.', 'Вызываешь hook и берёшь всё, что нужно.'),
        code: `import { useEffect } from "react"
import { useTodoStore } from "../store/useTodoStore"

const Zustand = () => {
  const { data, isLoading, getData } = useTodoStore()

  useEffect(() => {
    getData({ search: "", page: 1 })
  }, [])

  return (
    <div>
      <h1>Zustand To-Do</h1>
      {data?.map((el: any) => (
        <div key={el.id}>{el.name}</div>
      ))}
    </div>
  )
}

export default Zustand`,
        practiceCode: `import { useEffect } from "react"
import { useTodoStore } from "../store/useTodoStore"

const Zustand = () => {
  // Шаг 1: const { data, isLoading, getData } = useTodoStore()
  // Шаг 2: useEffect(() => { getData() }, [])
  // Шаг 3: data?.map((el) => <div key={el.id}>{el.name}</div>)

  return (
    <div>

    </div>
  )
}

export default Zustand`,
      },
    ],
    concepts: [
      { name: 'create', origin: 'zustand', why: t('Функсияи сохтани custom hook барои store', 'Функция создания custom hook для store.'), missing: t('Бе create store-и Zustand сохта намешавад.', 'Без create store Zustand не создать.') },
      { name: 'set', origin: 'create callback', why: t('Барои нав кардани state', 'Обновляет state.'), missing: t('Бе set ҳолати store-ро иваз карда наметавонӣ.', 'Без set состояние store не изменить.') },
      { name: 'get', origin: 'create callback', why: t('Барои хондани state ва даъвати дигар функсияҳо', 'Читает state и вызывает другие функции.'), missing: t('Бе get наметавонӣ get().getData() кунӣ.', 'Без get не вызвать get().getData().') },
    ],
    memory: t('create((set, get)) → state + actions дар як ҷо.', 'create((set, get)) → state + actions в одном месте.'),
    result: t('Hook дар ҳар ҷо кор мекунад — Provider лозим нест.', 'Hook работает везде — Provider не нужен.'),
  },
  {
    op: 'get',
    mode: 'zustand',
    title: 'GET · getData',
    intro: t(
      'getData дар Zustand бо axios.get маълумотро мегирад ва бо set({ data: data.data }) state-ро нав мекунад.',
      'getData в Zustand берёт данные через axios.get и обновляет state через set({ data: data.data }).'
    ),
    flow: ['useEffect', 'getData()', 'axios.get', 'set({ data: data.data })', 'UI'],
    steps: [
      { title: 'useTodoStore()', text: t('Component мустақиман data ва getData-ро мегирад.', 'Компонент напрямую берёт data и getData.'), code: 'const { data, getData } = useTodoStore()' },
      { title: 'getData({ search, page })', text: t('Дар useEffect бо параметрҳо даъват мешавад.', 'В useEffect вызывается с параметрами.'), code: 'getData({ search, page })' },
      { title: 'axios.get', text: t('Дархост ба сервер фиристода мешавад.', 'Запрос уходит на сервер.'), code: 'axios.get(...)' },
      { title: 'set({ data: data.data })', text: t('State нав мешавад ва React UI-ро нав мекунад.', 'State обновляется и React перерисовывает UI.'), code: 'set({ data: data.data })' },
    ],
    files: ['src/store/useTodoStore.ts', 'src/pages/Zustand.tsx'],
    relationNote: t('Zustand.tsx мустақиман { data, getData }-ро аз useTodoStore мегирад.', 'Zustand.tsx напрямую берёт { data, getData } из useTodoStore.'),
    blocks: [
      {
        path: 'src/store/useTodoStore.ts',
        lang: 'ts',
        note: t('Методи store: axios.get + set. Дигар чизе лозим нест.', 'Метод store: axios.get + set. Больше ничего не нужно.'),
        code: `getData: async (params = {}) => {
  set({ isLoading: true })
  const search = params?.search || ""
  const page = params?.page || 1
  try {
    const { data } = await axios.get(\`\${api}?query=\${search}&PageNumber=\${page}&PageSize=4\`)
    set({ data: data.data, isLoading: false })
  } catch (error) {
    console.error(error)
    set({ isLoading: false })
  }
}`,
        practiceCode: `getData: async (params = {}) => {
  // Шаг 1: set({ isLoading: true })
  // Шаг 2: search и page из params возьми
  // Шаг 3: const { data } = await axios.get(\`\${api}?query=...&PageNumber=...&PageSize=4\`)
  // Шаг 4: set({ data: data.data, isLoading: false })
},`,
      },
      {
        path: 'src/pages/Zustand.tsx',
        lang: 'tsx',
        note: t('Даъвати getData дар useEffect ва намоиши рӯйхат.', 'Вызов getData в useEffect и показ списка.'),
        code: `import { useEffect } from "react"
import { useTodoStore } from "../store/useTodoStore"

const { data, getData, isLoading } = useTodoStore()

useEffect(() => {
  getData({ search, page })
}, [search, page])

return (
  <div>
    {data?.map((el: any) => (
      <div key={el.id}>
        <h2>{el.name}</h2>
        <p>{el.description}</p>
      </div>
    ))}
  </div>
)`,
        practiceCode: `// Шаг 1: const { data, getData } = useTodoStore()
// Шаг 2: useEffect(() => { getData({ search, page }) }, [search, page])
// Шаг 3: isLoading && <h2>Loading...</h2>
// Шаг 4: data?.map((el) => <div key={el.id}>{el.name}</div>)`,
      },
    ],
    concepts: [
      { name: 'set({ data })', origin: 'Zustand setter', why: t('Фақат майдони data-ро иваз мекунад ва боқимондаро нигоҳ медорад', 'Меняет только поле data, остальное сохраняет.'), missing: t('Бе ин маълумотро ба store нависед намешавад.', 'Без этого данные в store не записать.') },
    ],
    memory: t('useTodoStore → getData → axios.get → set({ data: data.data }).', 'useTodoStore → getData → axios.get → set({ data: data.data }).'),
    result: t('Рӯйхати todo-ҳо дар экран пайдо мешавад.', 'Список todo появляется на экране.'),
  },
  {
    op: 'post',
    mode: 'zustand',
    title: 'POST · addData',
    intro: t(
      'addData вазифаи навро бо axios.post сабт карда, фавран бо get().getData() рӯйхатро нав мекунад.',
      'addData сохраняет новую задачу через axios.post и сразу обновляет список через get().getData().'
    ),
    flow: ['Форма submit', 'new FormData()', 'addData(formData)', 'axios.post', 'get().getData()', 'UI'],
    steps: [
      { title: 'Форма submit', text: t('Маълумот ба FormData зам мешавад.', 'Данные собираются в FormData.'), code: 'new FormData()' },
      { title: 'addData(formData)', text: t('Функсияи store даъват мешавад.', 'Вызывается функция store.'), code: 'addData(formData)' },
      { title: 'axios.post', text: t('Запрос ба сервер фиристода мешавад.', 'Запрос отправляется на сервер.'), code: 'await axios.post(api, newTodo)' },
      { title: 'get().getData()', text: t('Рӯйхат аз нав бор мешавад.', 'Список перезагружается.'), code: 'get().getData()' },
    ],
    files: ['src/pages/Zustand.tsx', 'src/components/dialogZustand/DialogAddZustand.tsx', 'src/store/useTodoStore.ts'],
    relationNote: t('DialogAddZustand.tsx барои сабуктар кор кардан аз selector истифода мебарад.', 'DialogAddZustand.tsx использует selector для более лёгкой работы.'),
    blocks: [
      {
        path: 'src/store/useTodoStore.ts',
        lang: 'ts',
        note: t('Дар дохили store get().getData() — рӯйхат худаш нав мешавад.', 'Внутри store get().getData() — список обновляется сам.'),
        code: `addData: async (user) => {
  try {
    await axios.post(api, user)
    get().getData()
  } catch (error) {
    console.error(error)
  }
}`,
        practiceCode: `addData: async (user) => {
  // Шаг 1: await axios.post(api, user)
  // Шаг 2: get().getData() — обновить список прямо из store!
},`,
      },
      {
        path: 'src/pages/Zustand.tsx',
        lang: 'tsx',
        note: t('Тугмаи «+ Add Task» ва кушодани модал.', 'Кнопка «+ Add Task» и открытие модалки.'),
        code: `const [add, setAdd] = useState(false)

<button onClick={() => setAdd(true)}>
  + Add Task
</button>

<DialogAddZustand user={add} setUser={setAdd} />`,
        practiceCode: `// Шаг 1: const [add, setAdd] = useState(false)
// Шаг 2: <button onClick={() => setAdd(true)}>+ Add Task</button>
// Шаг 3: <DialogAddZustand user={add} setUser={setAdd} />`,
      },
      {
        path: 'src/components/dialogZustand/DialogAddZustand.tsx',
        lang: 'tsx',
        note: t('Selector: танҳо addData мегирад — component сабуктар мешавад.', 'Selector: берёт только addData — компонент легче.'),
        code: `import { useTodoStore } from "../../store/useTodoStore"

const DialogAddZustand = ({ user, setUser }: any) => {
  const addData = useTodoStore((state) => state.addData)

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

export default DialogAddZustand`,
        practiceCode: `import { useTodoStore } from "../../store/useTodoStore"

const DialogAddZustand = ({ user, setUser }: any) => {
  // Шаг 1: const addData = useTodoStore((state) => state.addData)

  function AddUser(e: any) {
    e.preventDefault()
    // Шаг 2: const formData = new FormData()
    // Шаг 3: formData.append("Name", ...), formData.append("Description", ...)
    // Шаг 4: for (const el of e.target.images.files) formData.append("Images", el)
    // Шаг 5: addData(formData)
    // Шаг 6: setUser(null)
  }

  if (!user) return null
  return <div></div>
}

export default DialogAddZustand`,
      },
    ],
    concepts: [
      { name: 'get().getData()', origin: 'Zustand getter', why: t('Аз дохили як функсия дигар функсияи store-ро даъват мекунад', 'Из одной функции вызывает другую функцию store.'), missing: t('Бе get наметавонӣ getData-ро аз даруни addData даъват кунӣ.', 'Без get не вызвать getData изнутри addData.') },
      { name: 'Selector', origin: 'useTodoStore((state) => ...)', why: t('Фақат як аъзои store-ро мегирад ва re-render кам мекунад', 'Берёт только один член store и уменьшает re-render.'), missing: t('Ҳар тағйири store компонентро дубора render мекард.', 'Любое изменение store рендерило бы компонент заново.') },
    ],
    memory: t('newTodo → axios.post → get().getData().', 'newTodo → axios.post → get().getData().'),
    result: t('Вазифаи нав фавран дар рӯйхат пайдо мешавад.', 'Новая задача сразу появляется в списке.'),
  },
  {
    op: 'put',
    mode: 'zustand',
    title: 'PUT · editData & isCompleted',
    intro: t(
      'editData барои таҳрири матн ва isCompleted барои чекбокс. Ҳарду бо axios.put кор карда, бо get().getData() рӯйхатро нав месозанд.',
      'editData — для правки текста, isCompleted — для чекбокса. Оба работают через axios.put и обновляют список через get().getData().'
    ),
    flow: ['editobj / checkbox', 'editData(user) / isCompleted(id)', 'axios.put', 'get().getData()', 'UI'],
    steps: [
      { title: 'Таҳрир ё Чекбокс', text: t('Корбар тугмаи Save ё чекбоксро пахш мекунад.', 'Пользователь нажимает Save или чекбокс.'), code: 'editData ё isCompleted' },
      { title: 'axios.put', text: t('Запрос ба сервер меравад.', 'Запрос уходит на сервер.'), code: 'axios.put(...)' },
      { title: 'get().getData()', text: t('Рӯйхат нав мешавад.', 'Список обновляется.'), code: 'get().getData()' },
    ],
    files: ['src/pages/Zustand.tsx', 'src/components/dialogZustand/DialogEditZustand.tsx', 'src/store/useTodoStore.ts'],
    relationNote: t('Zustand.tsx мустақиман isCompleted-ро даъват мекунад.', 'Zustand.tsx напрямую вызывает isCompleted.'),
    blocks: [
      {
        path: 'src/store/useTodoStore.ts',
        lang: 'ts',
        note: t('Ду методи store — сохторашон якхела.', 'Два метода store — структура одинаковая.'),
        code: `editData: async (user) => {
  try {
    await axios.put(api, user)
    get().getData()
  } catch (error) {
    console.error(error)
  }
},

isCompleted: async (id) => {
  try {
    await axios.put(\`https://to-dos-api.softclub.tj/completed?id=\${id}\`)
    get().getData()
  } catch (error) {
    console.error(error)
  }
}`,
        practiceCode: `editData: async (user) => {
  // Шаг 1: await axios.put(api, user)
  // Шаг 2: get().getData()
},
isCompleted: async (id) => {
  // Шаг 1: await axios.put(\`https://to-dos-api.softclub.tj/completed?id=\${id}\`)
  // Шаг 2: get().getData()
},`,
      },
      {
        path: 'src/pages/Zustand.tsx',
        lang: 'tsx',
        note: t('Тугмаи Edit ва чекбокс.', 'Кнопка Edit и чекбокс.'),
        code: `const { isCompleted } = useTodoStore()
const [edit, setEdit] = useState(null)

<button onClick={() => setEdit(el)}>Edit</button>

<input
  type="checkbox"
  checked={el.isCompleted}
  onChange={() => isCompleted(el.id)}
/>

<DialogEditZustand user={edit} setUser={setEdit} />`,
        practiceCode: `// Шаг 1: setEdit(el) — тугмаи Edit
// Шаг 2: onChange={() => isCompleted(el.id)} — чекбокс
// Шаг 3: <DialogEditZustand user={edit} setUser={setEdit} />`,
      },
      {
        path: 'src/components/dialogZustand/DialogEditZustand.tsx',
        lang: 'tsx',
        note: t('editobj сохта, ба editData дода мешавад.', 'Собирается editobj и передаётся в editData.'),
        code: `import { useTodoStore } from "../../store/useTodoStore"

const DialogEditZustand = ({ user, setUser }: any) => {
  const editData = useTodoStore((state) => state.editData)

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

export default DialogEditZustand`,
        practiceCode: `import { useTodoStore } from "../../store/useTodoStore"

const DialogEditZustand = ({ user, setUser }: any) => {
  // Шаг 1: const editData = useTodoStore((state) => state.editData)

  function EditUser(e: any) {
    e.preventDefault()
    // Шаг 2: const editobj = { id: user.id, name: ..., description: ... }
    // Шаг 3: editData(editobj)
    // Шаг 4: setUser(null)
  }

  if (!user) return null

  return (
    <div className="modal">
      {/* форма бо defaultValue={user.name} */}
    </div>
  )
}

export default DialogEditZustand`,
      },
    ],
    concepts: [
      { name: 'isCompleted(id)', origin: 'useTodoStore action', why: t('Барои ивази зуди ҳолати онлайн/офлайн бе фиристодани тамоми форма', 'Быстро переключает состояние выполненности без отправки формы.'), missing: t('Барои чекбокс бояд формаи пурра мекардӣ.', 'Для чекбокса пришлось бы отправлять целую форму.') },
    ],
    memory: t('user → axios.put → get().getData().', 'user → axios.put → get().getData().'),
    result: t('Тағйирот фавран дар рӯйхат пайдо мешаванд.', 'Изменения сразу появляются в списке.'),
  },
  {
    op: 'delete',
    mode: 'zustand',
    title: 'DELETE · deleteData',
    intro: t(
      'deleteData вазифаро аз рӯи ID нест мекунад ва get().getData() мекунад.',
      'deleteData удаляет задачу по ID и вызывает get().getData().'
    ),
    flow: ['Клик ба Delete', 'deleteData(el.id)', 'axios.delete', 'get().getData()', 'UI'],
    steps: [
      { title: 'Клик ба Delete', text: t('Корбар тугмаро пахш мекунад.', 'Пользователь нажимает кнопку.'), code: 'deleteData(el.id)' },
      { title: 'axios.delete', text: t('Сабт тоза мешавад.', 'Запись удаляется.'), code: 'axios.delete(`${api}?id=${id}`)' },
      { title: 'get().getData()', text: t('Рӯйхат фавран нав мешавад.', 'Список сразу обновляется.'), code: 'get().getData()' },
    ],
    files: ['src/pages/Zustand.tsx', 'src/store/useTodoStore.ts'],
    relationNote: t('Тугмаи Delete дар кортҳои Zustand.tsx қарор дорад.', 'Кнопка Delete находится в карточках Zustand.tsx.'),
    blocks: [
      {
        path: 'src/store/useTodoStore.ts',
        lang: 'ts',
        note: t('Методи store: axios.delete + get().getData().', 'Метод store: axios.delete + get().getData().'),
        code: `deleteData: async (id) => {
  try {
    await axios.delete(\`\${api}?id=\${id}\`)
    get().getData()
  } catch (error) {
    console.error(error)
  }
}`,
        practiceCode: `deleteData: async (id) => {
  // Шаг 1: await axios.delete(\`\${api}?id=\${id}\`)
  // Шаг 2: get().getData()
},`,
      },
      {
        path: 'src/pages/Zustand.tsx',
        lang: 'tsx',
        note: t('Тугмаи Delete дар дохили корт.', 'Кнопка Delete внутри карточки.'),
        code: `const { deleteData } = useTodoStore()

<button onClick={() => deleteData(el.id)}>
  Delete
</button>`,
        practiceCode: `// Шаг 1: onClick={() => deleteData(el.id)}
<button onClick={() => {}}>Delete</button>`,
      },
    ],
    concepts: [
      { name: 'deleteData', origin: 'Store action', why: t('Вазифаро бо ID нест мекунад', 'Удаляет задачу по ID.'), missing: t('Бе ин маълумот дар сервер боқӣ мемонад.', 'Без этого данные останутся на сервере.') },
    ],
    memory: t('id → axios.delete → get().getData().', 'id → axios.delete → get().getData().'),
    result: t('Корт аз рӯйхат нопадид мешавад.', 'Карточка исчезает из списка.'),
  },
  {
    op: 'info',
    mode: 'zustand',
    title: 'INFO · getInfo',
    intro: t(
      'getInfo вазифаро аз рӯи ID мегирад ва бо set({ infoUser: data.data }) сабт мекунад. Саҳифаи Info.tsx он бо selector мехонад.',
      'getInfo берёт задачу по ID и записывает через set({ infoUser: data.data }). Страница Info.tsx читает её через selector.'
    ),
    flow: ['handleInfo(id)', 'getInfo(id)', 'axios.get(`${api}/${id}`)', 'set({ infoUser })', 'navigate("/info")', 'Info.tsx → selector'],
    steps: [
      { title: 'handleInfo(id)', text: t('getInfo(id) даъват шуда, navigate("/info") мешавад.', 'Вызывается getInfo(id), затем navigate("/info").'), code: "getInfo(id) → navigate('/info')" },
      { title: 'axios.get', text: t('Маълумоти вазифа аз рӯи ID гирифта мешавад.', 'Данные задачи берутся по ID.'), code: 'axios.get(`${api}/${id}`)' },
      { title: 'set({ infoUser })', text: t('State-и infoUser нав мешавад.', 'State infoUser обновляется.'), code: 'set({ infoUser: data.data })' },
      { title: 'Info.tsx', text: t('Саҳифа infoUser-ро хонда, ному шарҳро нишон медиҳад.', 'Страница читает infoUser и показывает имя и описание.'), code: 'useTodoStore((s) => s.infoUser)' },
    ],
    files: ['src/pages/Zustand.tsx', 'src/store/useTodoStore.ts', 'src/pages/Info.tsx'],
    relationNote: t('Zustand.tsx navigate мекунад ва Info.tsx infoUser-ро мехонад.', 'Zustand.tsx делает navigate, а Info.tsx читает infoUser.'),
    blocks: [
      {
        path: 'src/store/useTodoStore.ts',
        lang: 'ts',
        note: t('getInfo: axios.get + set({ infoUser }).', 'getInfo: axios.get + set({ infoUser }).'),
        code: `getInfo: async (id) => {
  try {
    const { data } = await axios.get(\`\${api}/\${id}\`)
    set({ infoUser: data.data })
  } catch (error) {
    console.error(error)
  }
}`,
        practiceCode: `getInfo: async (id) => {
  // Шаг 1: const { data } = await axios.get(\`\${api}/\${id}\`)
  // Шаг 2: set({ infoUser: data.data })
},`,
      },
      {
        path: 'src/pages/Zustand.tsx',
        lang: 'tsx',
        note: t('handleInfo: пеш getInfo, баъд navigate.', 'handleInfo: сначала getInfo, потом navigate.'),
        code: `const { getInfo } = useTodoStore()
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
        note: t('infoUser-ро бо selector мехонад.', 'Читает infoUser через selector.'),
        code: `import { useTodoStore } from "../store/useTodoStore"

const infoZustand = useTodoStore((s) => s.infoUser)

return (
  <div>
    <h1>{infoZustand?.name}</h1>
    <p>{infoZustand?.description}</p>
  </div>
)`,
        practiceCode: `// Шаг 1: const infoZustand = useTodoStore((s) => s.infoUser)
// Шаг 2: infoZustand?.name ва infoZustand?.description дар JSX`,
      },
    ],
    concepts: [
      { name: 'infoUser', origin: 'Zustand State', why: t('Нигоҳдории вазифаи интихобшуда', 'Хранит выбранную задачу.'), missing: t('Бе ин саҳифаи Info чизе нишон дода наметавонад.', 'Без этого страница Info не сможет ничего показать.') },
    ],
    memory: t('id → getInfo → set({ infoUser }) → useTodoStore((s) => s.infoUser).', 'id → getInfo → set({ infoUser }) → useTodoStore((s) => s.infoUser).'),
    result: t('Саҳифаи Info тафсилоти вазифаро нишон медиҳад.', 'Страница Info показывает детали задачи.'),
  },
  {
    op: 'search',
    mode: 'zustand',
    title: 'SEARCH · Ҷустуҷӯ',
    intro: t(
      'Ҷустуҷӯ дар Zustand: параметри search аз component ба getData({ search, page }) меравад.',
      'Поиск в Zustand: параметр search из компонента уходит в getData({ search, page }).'
    ),
    flow: ['setSearch', 'setPage(1)', 'useEffect', 'getData({ search })', '?query=${search}'],
    steps: [
      { title: 'Инпут тағйир меёбад', text: t('setSearch ва setPage(1) даъват мешаванд.', 'Вызываются setSearch и setPage(1).'), code: 'setSearch(e.target.value)' },
      { title: 'useEffect', text: t('getData({ search, page }) дубора ба кор медарояд.', 'getData({ search, page }) запускается заново.'), code: 'getData({ search, page })' },
      { title: 'API', text: t('Сервер натиҷаҳоро филтр мекунад.', 'Сервер фильтрует результаты.'), code: '?query=${search}' },
    ],
    files: ['src/pages/Zustand.tsx', 'src/store/useTodoStore.ts'],
    relationNote: t('Дар Zustand ҳам ҷустуҷӯ мустақиман дар дохили getData аст.', 'В Zustand поиск тоже прямо внутри getData.'),
    blocks: [
      {
        path: 'src/pages/Zustand.tsx',
        lang: 'tsx',
        note: t('State-и search ва useEffect — ҳамон услуби Redux, аммо бе dispatch.', 'State search и useEffect — тот же стиль, что в Redux, но без dispatch.'),
        code: `const [search, setSearch] = useState("")

<input
  type="text"
  value={search}
  onChange={(e) => {
    setSearch(e.target.value)
    setPage(1)
  }}
  placeholder="Search..."
/>

useEffect(() => {
  getData({ search, page })
}, [search, page])`,
        practiceCode: `// Шаг 1: setSearch(e.target.value)
// Шаг 2: setPage(1)
// Шаг 3: useEffect(() => { getData({ search, page }) }, [search, page])`,
      },
      {
        path: 'src/store/useTodoStore.ts',
        lang: 'ts',
        note: t('search дар дохили getData ба query мегузарад.', 'search внутри getData уходит в query.'),
        code: `const search = params?.search || ""
const { data } = await axios.get(\`\${api}?query=\${search}&PageNumber=\${page}&PageSize=4\`)`,
        practiceCode: `// Шаг 1: const search = params?.search || ""
// Шаг 2: axios.get(\`\${api}?query=\${search}&...\`)`,
      },
    ],
    concepts: [
      { name: 'search state', origin: 'useState', why: t('Матни инпутро нигоҳ медорад', 'Хранит текст инпута.'), missing: t('Бе ин ҷустуҷӯ имконнопазир аст.', 'Без этого поиск невозможен.') },
    ],
    memory: t('setSearch → useEffect → getData({ search }) → ?query=${search}.', 'setSearch → useEffect → getData({ search }) → ?query=${search}.'),
    result: t('Рӯйхат бо натиҷаҳои ҷустуҷӯ нав мешавад.', 'Список обновляется результатами поиска.'),
  },
  {
    op: 'pagination',
    mode: 'zustand',
    title: 'PAGINATION · Саҳифабандӣ',
    intro: t(
      'Саҳифабандӣ дар Zustand: page дар useEffect вобаста аст ва ба getData({ search, page }) меравад.',
      'Пагинация в Zustand: page в dependency useEffect и уходит в getData({ search, page }).'
    ),
    flow: ['Next / Prev', 'setPage', 'useEffect', 'getData({ page })', 'PageNumber=${page}'],
    steps: [
      { title: 'Next / Prev', text: t('setPage рақамро иваз мекунад.', 'setPage меняет номер.'), code: 'setPage((p) => p + 1)' },
      { title: 'useEffect', text: t('getData бо саҳифаи нав даъват мешавад.', 'getData вызывается с новой страницей.'), code: 'getData({ search, page })' },
      { title: 'API', text: t('Сервер саҳифаи навро мефиристад.', 'Сервер присылает новую страницу.'), code: 'PageNumber=${page}' },
    ],
    files: ['src/pages/Zustand.tsx', 'src/store/useTodoStore.ts'],
    relationNote: t('Саҳифабандӣ бо ҷустуҷӯ дар getData муттаҳид аст.', 'Пагинация объединена с поиском в getData.'),
    blocks: [
      {
        path: 'src/pages/Zustand.tsx',
        lang: 'tsx',
        note: t('Тугмаҳои Prev/Next ва page state.', 'Кнопки Prev/Next и state page.'),
        code: `const [page, setPage] = useState(1)

<button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
<span>Page {page}</span>
<button disabled={!data || data.length < 4} onClick={() => setPage((p) => p + 1)}>Next</button>`,
        practiceCode: `// Шаг 1: Prev — disabled={page <= 1}, setPage((p) => Math.max(1, p - 1))
// Шаг 2: Next — disabled={!data || data.length < 4}, setPage((p) => p + 1)
// Шаг 3: useEffect бояд page-ро дар бошад [search, page]`,
      },
      {
        path: 'src/store/useTodoStore.ts',
        lang: 'ts',
        note: t('page ба PageNumber мегузарад.', 'page уходит в PageNumber.'),
        code: `const page = params?.page || 1
const { data } = await axios.get(\`\${api}?query=\${search}&PageNumber=\${page}&PageSize=4\`)`,
        practiceCode: `// Шаг 1: const page = params?.page || 1
// Шаг 2: PageNumber=\${page} дар axios.get`,
      },
    ],
    concepts: [
      { name: 'PageNumber', origin: 'Query Param', why: t('Рақами саҳифа дар сервер', 'Номер страницы на сервере.'), missing: t('Бе ин ҳамеша фақат саҳифаи 1 меояд.', 'Без этого всегда приходит только 1-я страница.') },
    ],
    memory: t('setPage → useEffect → getData({ page }) → PageNumber=${page}.', 'setPage → useEffect → getData({ page }) → PageNumber=${page}.'),
    result: t('Ҳар саҳифа 4 вазифаи нав меорад. Санҷиши API (2026-10): сервер ҳоло PageNumber/PageSize-ро игнор мекунад — ҳамаи сабтҳо бармегарданд.', 'Каждая страница приносит 4 новые задачи. Проверка API (2026-10): сервер сейчас игнорирует PageNumber/PageSize — возвращает все записи.'),
  },
  {
    op: 'add-img',
    mode: 'zustand',
    title: 'ADD IMG · addImgData',
    intro: t(
      'addImgData файлҳоро ба FormData гузошта, бо POST ба сервер мефиристад ва get().getData() мекунад.',
      'addImgData кладёт файлы в FormData, отправляет POST на сервер и вызывает get().getData().'
    ),
    flow: ['e.target.files', 'FormData', 'axios.post', 'get().getData()', 'UI'],
    steps: [
      { title: 'Интихоби файл', text: t('onChange e.target.files-ро ба функсия мегузаронад.', 'onChange передаёт e.target.files в функцию.'), code: 'addImgData({ id, file })' },
      { title: 'FormData', text: t('Файлҳо ба калиди Images зам мешаванд.', 'Файлы кладутся под ключ Images.'), code: "formData.append('Images', file[i])" },
      { title: 'axios.post', text: t('Боргузорӣ ба ${api}/${id}/images.', 'Загрузка на ${api}/${id}/images.'), code: 'axios.post(...)' },
      { title: 'get().getData()', text: t('Рӯйхат нав мешавад.', 'Список обновляется.'), code: 'get().getData()' },
    ],
    files: ['src/pages/Zustand.tsx', 'src/store/useTodoStore.ts'],
    relationNote: t('Ҳар як корт дар Zustand.tsx инпути file дорад.', 'У каждой карточки в Zustand.tsx есть инпут file.'),
    blocks: [
      {
        path: 'src/store/useTodoStore.ts',
        lang: 'ts',
        note: t('Методи store бо FormData — ҳамон сохтори Redux, аммо соддатар.', 'Метод store с FormData — та же структура, что в Redux, но проще.'),
        code: `addImgData: async ({ id, file }) => {
  try {
    const formData = new FormData()
    for (let i = 0; i < file.length; i++) {
      formData.append("Images", file[i])
    }
    await axios.post(\`\${api}/\${id}/images\`, formData)
    get().getData()
  } catch (error) {
    console.error(error)
  }
},`,
        practiceCode: `addImgData: async ({ id, file }) => {
  // Шаг 1: const formData = new FormData()
  // Шаг 2: for (let i = 0; i < file.length; i++) formData.append("Images", file[i])
  // Шаг 3: await axios.post(\`\${api}/\${id}/images\`, formData)
  // Шаг 4: get().getData()
},`,
      },
      {
        path: 'src/pages/Zustand.tsx',
        lang: 'tsx',
        note: t('Инпути файл дар дохили корт.', 'Инпут файла внутри карточки.'),
        code: `<input
  type="file"
  onChange={(e) =>
    addImgData({ id: el.id, file: e.target.files })
  }
/>`,
        practiceCode: `// Шаг 1: addImgData({ id: el.id, file: e.target.files })
<input
  type="file"
  onChange={(e) => {}}
/>`,
      },
    ],
    concepts: [
      { name: 'addImgData', origin: 'Zustand Action', why: t('Боргузории расмҳо ба вазифа', 'Загрузка картинок к задаче.'), missing: t('Бе ин файлҳо фиристода намешаванд.', 'Без этого файлы не отправятся.') },
    ],
    memory: t('file → FormData → axios.post → get().getData().', 'file → FormData → axios.post → get().getData().'),
    result: t('Расмҳо ба корти вазифа илова мешаванд.', 'Картинки добавляются к карточке задачи.'),
  },
  {
    op: 'delete-img',
    mode: 'zustand',
    title: 'DELETE IMG · deleteImgData',
    intro: t(
      'deleteImgData(imageId) расмро бо axios.delete нест мекунад ва get().getData() мекунад.',
      'deleteImgData(imageId) удаляет картинку через axios.delete и вызывает get().getData().'
    ),
    flow: ['Клик ба Delete', 'deleteImgData(img.id)', 'axios.delete(/images/id)', 'get().getData()', 'UI'],
    steps: [
      { title: 'Клик ба Delete', text: t('Корбар тугмаи Delete-ро дар расм пахш мекунاد.', 'Пользователь нажимает Delete у картинки.'), code: 'deleteImgData(img.id)' },
      { title: 'axios.delete', text: t('Расм аз сервер нест мешавад.', 'Картинка удаляется с сервера.'), code: 'axios.delete(`${api}/images/${imageId}`)' },
      { title: 'get().getData()', text: t('Рӯйхат нав мешавад.', 'Список обновляется.'), code: 'get().getData()' },
    ],
    files: ['src/pages/Zustand.tsx', 'src/store/useTodoStore.ts'],
    relationNote: t('Расмҳо дар Zustand.tsx кортҳои алоҳида доранд.', 'Картинки в Zustand.tsx имеют отдельные карточки.'),
    blocks: [
      {
        path: 'src/store/useTodoStore.ts',
        lang: 'ts',
        note: t('imageId — ID-и акс, на ID-и todo.', 'imageId — ID картинки, а не todo.'),
        code: `deleteImgData: async (imageId) => {
  try {
    await axios.delete(\`\${api}/images/\${imageId}\`)
    get().getData()
  } catch (error) {
    console.error(error)
  }
},`,
        practiceCode: `deleteImgData: async (imageId) => {
  // Шаг 1: await axios.delete(\`\${api}/images/\${imageId}\`)
  // Шаг 2: get().getData()
},`,
      },
      {
        path: 'src/pages/Zustand.tsx',
        lang: 'tsx',
        note: t('Тугмаи нест кардани расм.', 'Кнопка удаления картинки.'),
        code: `<button onClick={() => deleteImgData(img.id)}>
  Delete
</button>`,
        practiceCode: `// Шаг 1: onClick={() => deleteImgData(img.id)}
<button onClick={() => {}}>Delete</button>`,
      },
    ],
    concepts: [
      { name: 'imageId', origin: 'Параметри функсия', why: t('ID-и акс', 'ID картинки.'), missing: t('Бе ин сервер намедонад кадом расмро нест кунад.', 'Без этого сервер не знает, какую картинку удалять.') },
    ],
    memory: t('imageId → axios.delete(/images/id) → get().getData().', 'imageId → axios.delete(/images/id) → get().getData().'),
    result: t('Расм аз корт нопадид мешавад.', 'Картинка исчезает из карточки.'),
  },
];
