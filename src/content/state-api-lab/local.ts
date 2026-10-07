import { t, type LabLesson } from './types';

// Уроки Local — новый материал: тот же API practica.zip, но весь state внутри компонента.
// Цепочка всегда: useState → useEffect → axios → setData → UI.
export const localLessons: LabLesson[] = [
  {
    op: 'setup',
    mode: 'local',
    title: 'SETUP · LocalTodo.tsx',
    intro: t(
      'Дар Local ҳама чиз дар як компонент аст: state, запрос ва UI. Ягон store, ягон Provider — навишта наметаворӣ. Танҳо useState + useEffect + axios.',
      'В Local всё в одном компоненте: state, запрос и UI. Никакого store и Provider — только useState + useEffect + axios.'
    ),
    flow: ['Component', 'useState', 'useEffect', 'axios', 'setData', 'UI'],
    steps: [
      { title: 'Файл месозӣ', text: t('Файли нав: src/pages/LocalTodo.tsx — ҳама чиз дар ҳамин ҷо.', 'Новый файл: src/pages/LocalTodo.tsx — всё будет здесь.'), code: 'src/pages/LocalTodo.tsx' },
      { title: 'Imports', text: t('useState, useEffect аз react ва axios-ро ворид кун.', 'Импортируй useState, useEffect из react и axios.'), code: 'import { useEffect, useState } from "react"' },
      { title: 'api', text: t('Адреси API-ро як маротиба дар болои файл менависӣ.', 'Адрес API один раз пишется вверху файла.'), code: 'const api = "https://to-dos-api.softclub.tj/api/to-dos"' },
      { title: 'State ва функсияҳо', text: t('Ҳамаи state ва функсияҳо дар дохили компонент ҷойгиранд.', 'Все state и функции живут внутри компонента.'), code: 'const LocalTodo = () => { ... }' },
    ],
    files: ['src/pages/LocalTodo.tsx'],
    relationNote: t('Дар Local ягон файл асосӣ аст — store ва Provider лозим нест.', 'В Local один основной файл — store и Provider не нужны.'),
    blocks: [
      {
        path: 'src/pages/LocalTodo.tsx',
        lang: 'tsx',
        note: t('Скелети компоненти локалӣ — ҳамаи амалиётҳо ҳамин ҷо илова мешаванд.', 'Скелет локального компонента — все операции добавляются сюда.'),
        code: `import { useEffect, useState } from "react"
import axios from "axios"

const api = "https://to-dos-api.softclub.tj/api/to-dos"

const LocalTodo = () => {
  // ҳамаи state ва функсияҳо ҳамин ҷо
  return <div></div>
}

export default LocalTodo`,
        practiceCode: `import { useEffect, useState } from "react"
import axios from "axios"

const api = "https://to-dos-api.softclub.tj/api/to-dos"

const LocalTodo = () => {
  // Шаг 1: imports кун — useState, useEffect, axios
  // Шаг 2: const api = "https://to-dos-api.softclub.tj/api/to-dos"
  // Шаг 3: state-ҳо ва функсияҳо ҳамин ҷо мешаванд

  return <div></div>
}

export default LocalTodo`,
      },
    ],
    concepts: [
      { name: 'useState', origin: 'react', why: t('State-и мустақими компонент — бе ҳеҷ store', 'Прямой state компонента — без всякого store.'), missing: t('Данные нигоҳ дошта намешаванд ва UI нав намешавад.', 'Данные не сохранятся и UI не обновится.') },
      { name: 'useEffect', origin: 'react', why: t('Барои иҷрои корҳо баъди render — масалан GET-и аввал', 'Выполняет действия после render — например первый GET.'), missing: t('Запрос худкор иҷро намешавад.', 'Запрос сам не запустится.') },
      { name: 'axios', origin: 'axios', why: t('Китобхонаи запросҳо ба сервер', 'Библиотека запросов к серверу.'), missing: t('Бо сервер гап задан намешавад.', 'С сервером не о чём разговаривать.') },
    ],
    memory: t('Local = useState + useEffect + axios дар як компонент.', 'Local = useState + useEffect + axios в одном компоненте.'),
    result: t('Компонент бе хато compile мешавад ва саҳифа кушода мешавад.', 'Компонент компилируется без ошибок и страница открывается.'),
  },
  {
    op: 'get',
    mode: 'local',
    title: 'GET · getData',
    intro: t(
      'Дар Local GET хеле содда аст: useEffect axios.get мезанад ва натиҷаро бо setData ба state мегузорад. Ягон middleware нест.',
      'В Local GET очень простой: useEffect делает axios.get, а результат кладётся в state через setData. Никакого middleware.'
    ),
    flow: ['useEffect', 'getData()', 'axios.get', 'setData(res.data.data)', 'UI'],
    steps: [
      { title: 'State созӣ', text: t('data ва isLoading — ду useState-и оддӣ.', 'data и isLoading — два обычных useState.'), code: 'const [data, setData] = useState([])' },
      { title: 'getData нависӣ', text: t('Функсияи async бо axios.get ва try/catch.', 'Асинхронная функция с axios.get и try/catch.'), code: 'const res = await axios.get(`${api}?query=&PageNumber=1&PageSize=4`)' },
      { title: 'Дар useEffect даъват кун', text: t('Гузошта мешавад дар useEffect бо [] — ҳангоми кушодан як маротиба.', 'Вызывается в useEffect с [] — один раз при открытии.'), code: 'useEffect(() => { getData() }, [])' },
      { title: 'Нишон деҳ', text: t('data.map карда, isLoading-ро ҳам нишон деҳ.', 'Покажи через data.map и не забудь isLoading.'), code: '{data.map((el) => <div key={el.id}>{el.name}</div>)}' },
    ],
    files: ['src/pages/LocalTodo.tsx'],
    relationNote: t('State ва GET дар як файл — аз компонент ба ҷои дигар намеравад.', 'State и GET в одном файле — никуда из компонента не уходят.'),
    blocks: [
      {
        path: 'src/pages/LocalTodo.tsx',
        lang: 'tsx',
        note: t('Ҳама чиз дар як компонент: state, функсия, useEffect ва JSX.', 'Всё в одном компоненте: state, функция, useEffect и JSX.'),
        code: `import { useEffect, useState } from "react"
import axios from "axios"

const api = "https://to-dos-api.softclub.tj/api/to-dos"

const LocalTodo = () => {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const getData = async () => {
    setIsLoading(true)
    try {
      const res = await axios.get(\`\${api}?query=&PageNumber=1&PageSize=4\`)
      setData(res.data.data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getData()
  }, [])

  return (
    <div>
      <h1>Local To-Do</h1>
      {isLoading && <h2>Loading...</h2>}
      {data.map((el: any) => (
        <div key={el.id}>
          <h2>{el.name}</h2>
          <p>{el.description}</p>
        </div>
      ))}
    </div>
  )
}

export default LocalTodo`,
        practiceCode: `import { useEffect, useState } from "react"
import axios from "axios"

const api = "https://to-dos-api.softclub.tj/api/to-dos"

const LocalTodo = () => {
  // Шаг 1: const [data, setData] = useState([])
  // Шаг 2: const [isLoading, setIsLoading] = useState(false)
  // Шаг 3: getData = async () => { axios.get(\`\${api}?...&PageSize=4\`) → setData(res.data.data) }
  // Шаг 4: useEffect(() => { getData() }, [])

  return (
    <div>
      {/* Шаг 5: isLoading && <h2>Loading...</h2> */}
      {/* Шаг 6: data.map((el) => <div key={el.id}>{el.name}</div>) */}
    </div>
  )
}

export default LocalTodo`,
      },
    ],
    concepts: [
      { name: 'res.data.data', origin: 'axios response', why: t('Сервер ҷавобро дар { data: [...] } медиҳад — аз ин сабаб ду маротиба .data', 'Сервер присылает ответ в { data: [...] } — поэтому два раза .data.'), missing: t('Агар data.data накунӣ, объекти пурра меорад, на рӯйхат.', 'Без data.data придёт целый объект, а не список.') },
      { name: 'useEffect(..., [])', origin: 'react', why: t('Массиви холӣ = танҳо як маротиба ҳангоми mount', 'Пустой массив = только один раз при mount.'), missing: t('getData ҳар render дубора кор мекард.', 'getData запускался бы на каждом render.') },
      { name: 'finally', origin: 'try/catch', why: t('isLoading дар ҳар ҳолат false мешавад — хато ҳам бошад', 'isLoading в любом случае станет false — даже при ошибке.'), missing: t('Дар хато Loading ҳамеша мемонад.', 'При ошибке Loading останется навсегда.') },
    ],
    memory: t('useState → useEffect → axios.get → setData → UI.', 'useState → useEffect → axios.get → setData → UI.'),
    result: t('Рӯйхати todo-ҳо бе ягон store нишон дода мешавад.', 'Список todo показывается без всякого store.'),
  },
  {
    op: 'post',
    mode: 'local',
    title: 'POST · addData',
    intro: t(
      'POST дар Local: форма FormData-ро мебандад, axios.post мефиристад ва getData() рӯйхатро нав мекунад. Ҳамааш дар як файл.',
      'POST в Local: форма собирает FormData, axios.post отправляет и getData() обновляет список. Всё в одном файле.'
    ),
    flow: ['Форма submit', 'FormData', 'axios.post', 'getData()', 'setData', 'UI'],
    steps: [
      { title: 'Modal state', text: t('showAdd — модал кушода шавад ё не.', 'showAdd — открыта ли модалка.'), code: 'const [showAdd, setShowAdd] = useState(false)' },
      { title: 'FormData созӣ', text: t('e.preventDefault() карда, Name ва Description-ро append кун.', 'Сделай e.preventDefault() и append Name и Description.'), code: 'formData.append("Name", e.target.name.value)' },
      { title: 'axios.post', text: t('FormData-ро ба сервер фирист.', 'Отправь FormData на сервер.'), code: 'await axios.post(api, formData)' },
      { title: 'getData() даъват кун', text: t('Баъди сабт рӯйхатро аз нав биёр — бе ягон dispatch!', 'После сохранения перечитай список — без всякого dispatch!'), code: 'getData()' },
    ],
    files: ['src/pages/LocalTodo.tsx'],
    relationNote: t('Дар Local DialogAdd-и алоҳида нест — форма дар ҳамин компонент аст.', 'В Local нет отдельного DialogAdd — форма в этом же компоненте.'),
    blocks: [
      {
        path: 'src/pages/LocalTodo.tsx',
        lang: 'tsx',
        note: t('Функсияи addData ва формаи модалӣ — ҳарду дар як файл.', 'Функция addData и модальная форма — обе в одном файле.'),
        code: `const [showAdd, setShowAdd] = useState(false)

const addData = async (e: any) => {
  e.preventDefault()
  const formData = new FormData()
  formData.append("Name", e.target.name.value)
  formData.append("Description", e.target.description.value)
  try {
    await axios.post(api, formData)
    setShowAdd(false)
    getData()
  } catch (error) {
    console.error(error)
  }
}

return (
  <div>
    <button onClick={() => setShowAdd(true)}>+ Add Task</button>

    {showAdd && (
      <form onSubmit={addData}>
        <input name="name" required placeholder="Title" />
        <input name="description" required placeholder="Description" />
        <button type="submit">Add</button>
        <button type="button" onClick={() => setShowAdd(false)}>Cancel</button>
      </form>
    )}
  </div>
)`,
        practiceCode: `// Шаг 1: const [showAdd, setShowAdd] = useState(false)
// Шаг 2: addData = async (e) => {
//   e.preventDefault()
//   const formData = new FormData()
//   formData.append("Name", e.target.name.value)
//   formData.append("Description", e.target.description.value)
//   await axios.post(api, formData)
//   setShowAdd(false)
//   getData()
// }
// Шаг 3: <button onClick={() => setShowAdd(true)}>+ Add Task</button>
// Шаг 4: {showAdd && <form onSubmit={addData}>...inputs...</form>}`,
      },
    ],
    concepts: [
      { name: 'getData() баъди POST', origin: 'Функсияи ҳамин компонент', why: t('State-и локалӣ худаш нав намешавад — рӯйхатро боз мехонӣ', 'Локальный state сам не обновится — перечитываешь список.'), missing: t('Вазифаи нав танҳо баъди refresh пайдо мешавад.', 'Новая задача появится только после refresh.') },
      { name: 'e.preventDefault()', origin: 'DOM event', why: t('Саҳифа refresh намешавад — ҷои он axios кор мекунад', 'Страница не перезагружается — вместо этого работает axios.'), missing: t('Браузер форма action-ро иҷро мекард ва саҳифа refresh мешуд.', 'Браузер выполнял бы action формы и перезагружал страницу.') },
    ],
    memory: t('form → addData → axios.post → getData() → setData → UI.', 'form → addData → axios.post → getData() → setData → UI.'),
    result: t('Вазифаи нав фавран дар рӯйхат пайдо мешавад.', 'Новая задача сразу появляется в списке.'),
  },
  {
    op: 'put',
    mode: 'local',
    title: 'PUT · editData & isCompleted',
    intro: t(
      'Ду навъ таҳрир дар як компонент: editData барои ном ва тавсиф (бо editobj), isCompleted барои чекбокс. Ҳарду axios.put ва баъд getData().',
      'Два вида правки в одном компоненте: editData для имени и описания (с editobj), isCompleted для чекбокса. Оба делают axios.put и затем getData().'
    ),
    flow: ['setEditUser(el)', 'editobj / checkbox', 'axios.put', 'getData()', 'UI'],
    steps: [
      { title: 'editUser state', text: t('Кадом вазифа таҳрир мешавад — объект ё null.', 'Какая задача редактируется — объект или null.'), code: 'const [editUser, setEditUser] = useState<any>(null)' },
      { title: 'editData нависӣ', text: t('editobj сохта, axios.put(api, editobj) кун — id ҳатман бошад.', 'Собери editobj и сделай axios.put(api, editobj) — id обязателен.'), code: 'const editobj = { id: editUser.id, name: ..., description: ... }' },
      { title: 'isCompleted нависӣ', text: t('Барои чекбокс endpoint-и алоҳида: /completed?id=', 'Для чекбокса отдельный endpoint: /completed?id='), code: 'axios.put(`https://to-dos-api.softclub.tj/completed?id=${id}`)' },
      { title: 'UI пайваст кун', text: t('Тугмаи Edit setEditUser(el) мекунад, чекбокс isCompleted(el.id).', 'Кнопка Edit делает setEditUser(el), чекбокс — isCompleted(el.id).'), code: 'onClick={() => setEditUser(el)}' },
    ],
    files: ['src/pages/LocalTodo.tsx'],
    relationNote: t('editUser ҳам ҳолати модалро ва ҳам объекти таҳриршавандаро нигоҳ медорад.', 'editUser хранит и состояние модалки, и объект для правки.'),
    blocks: [
      {
        path: 'src/pages/LocalTodo.tsx',
        lang: 'tsx',
        note: t('Ду функсияи PUT ва формаи таҳрир — ҳамааш ҳамин ҷо.', 'Две функции PUT и форма правки — всё здесь.'),
        code: `const [editUser, setEditUser] = useState<any>(null)

const editData = async (e: any) => {
  e.preventDefault()
  const editobj = {
    id: editUser.id,
    name: e.target.name.value,
    description: e.target.description.value,
  }
  try {
    await axios.put(api, editobj)
    setEditUser(null)
    getData()
  } catch (error) {
    console.error(error)
  }
}

const isCompleted = async (id: any) => {
  try {
    await axios.put(\`https://to-dos-api.softclub.tj/completed?id=\${id}\`)
    getData()
  } catch (error) {
    console.error(error)
  }
}

return (
  <div>
    {data.map((el: any) => (
      <div key={el.id}>
        <input
          type="checkbox"
          checked={el.isCompleted}
          onChange={() => isCompleted(el.id)}
        />
        <button onClick={() => setEditUser(el)}>Edit</button>
      </div>
    ))}

    {editUser && (
      <form onSubmit={editData}>
        <input name="name" defaultValue={editUser.name} placeholder="Title" />
        <input name="description" defaultValue={editUser.description} placeholder="Description" />
        <button type="submit">Save</button>
        <button type="button" onClick={() => setEditUser(null)}>Cancel</button>
      </form>
    )}
  </div>
)`,
        practiceCode: `// Шаг 1: const [editUser, setEditUser] = useState<any>(null)
// Шаг 2: editData = async (e) => {
//   e.preventDefault()
//   const editobj = { id: editUser.id, name: ..., description: ... }
//   await axios.put(api, editobj)
//   setEditUser(null)
//   getData()
// }
// Шаг 3: isCompleted = async (id) => {
//   await axios.put(\`https://to-dos-api.softclub.tj/completed?id=\${id}\`)
//   getData()
// }
// Шаг 4: тугмаи Edit — setEditUser(el), чекбокс — onChange={() => isCompleted(el.id)}`,
      },
    ],
    concepts: [
      { name: 'editobj бо id', origin: 'editData', why: t('Сервер бояд донад кадом вазифа тағйир меёбад', 'Сервер должен знать, какая задача меняется.'), missing: t('Сервер намедонад чиро навсозӣ кунад.', 'Сервер не знает, что обновлять.') },
      { name: 'defaultValue', origin: 'uncontrolled input', why: t('Қимати кӯҳнаро дар инпути таҳрир нишон медиҳад', 'Показывает старое значение в инпуте правки.'), missing: t('Инпутҳо холӣ кушода мешаванд.', 'Инпуты откроются пустыми.') },
      { name: 'if (!user) return null', origin: 'Dialog pattern', why: t('Модал танҳо вакте кушода мешавад, ки editUser объект дорад', 'Модалка открыта только когда editUser — объект.'), missing: t('Форма ҳамеша дар экран мемонад.', 'Форма всё время была бы на экране.') },
    ],
    memory: t('editobj → axios.put → getData() → UI нав мешавад.', 'editobj → axios.put → getData() → UI обновляется.'),
    result: t('Матн ва чекбокс фавран нав мешаванд.', 'Текст и чекбокс сразу обновляются.'),
  },
  {
    op: 'delete',
    mode: 'local',
    title: 'DELETE · deleteData',
    intro: t(
      'Дар Local DELETE хеле кӯтоҳ аст: тугма id-ро медиҳад, axios.delete мезанад ва getData() рӯйхатро нав мекунад.',
      'В Local DELETE очень короткий: кнопка передаёт id, axios.delete отправляет и getData() обновляет список.'
    ),
    flow: ['Клик ба Delete', 'deleteData(el.id)', 'axios.delete', 'getData()', 'UI'],
    steps: [
      { title: 'deleteData нависӣ', text: t('id мегирад, axios.delete мезанад, баъд getData().', 'Принимает id, делает axios.delete, затем getData().'), code: 'await axios.delete(`${api}?id=${id}`)' },
      { title: 'Тугмаро пайваст кун', text: t('Дар дохили .map() тугмаи Delete.', 'Внутри .map() кнопка Delete.'), code: 'onClick={() => deleteData(el.id)}' },
      { title: 'UI санҷ', text: t('Корт фавран нопадид мешавад — чун getData() дубора меорад.', 'Карточка сразу исчезает — getData() перечитывает список.'), code: 'getData()' },
    ],
    files: ['src/pages/LocalTodo.tsx'],
    relationNote: t('deleteData мисли дигар функсияҳо дар дохили ҳамин компонент аст.', 'deleteData как и остальные функции — внутри этого же компонента.'),
    blocks: [
      {
        path: 'src/pages/LocalTodo.tsx',
        lang: 'tsx',
        note: t('Функсияи кӯтоҳи delete ва тугмаи он.', 'Короткая функция delete и её кнопка.'),
        code: `const deleteData = async (id: any) => {
  try {
    await axios.delete(\`\${api}?id=\${id}\`)
    getData()
  } catch (error) {
    console.error(error)
  }
}

// Дар дохили .map() ҳар як корт:
<button onClick={() => deleteData(el.id)}>Delete</button>`,
        practiceCode: `const deleteData = async (id: any) => {
  // Шаг 1: await axios.delete(\`\${api}?id=\${id}\`)
  // Шаг 2: getData()
}

// Шаг 3: <button onClick={() => deleteData(el.id)}>Delete</button>`,
      },
    ],
    concepts: [
      { name: '?id=${id}', origin: 'query param', why: t('Ин API id-ро дар query қабул мекунад', 'Этот API принимает id в query.'), missing: t('Сервер намедонад кадом сабт нест шавад.', 'Сервер не знает, какую запись удалять.') },
      { name: 'getData() баъди delete', origin: 'refetch', why: t('State-и локалӣ дар бораи нестшудагӣ намедонад — аз нав мегирад', 'Локальный state не знает про удаление — перечитывает.'), missing: t('Корт то refresh дар экран мемонад.', 'Карточка оставалась бы на экране до refresh.') },
    ],
    memory: t('button → deleteData(id) → axios.delete → getData() → UI.', 'button → deleteData(id) → axios.delete → getData() → UI.'),
    result: t('Корт аз рӯйхат нопадид мешавад.', 'Карточка исчезает из списка.'),
  },
  {
    op: 'info',
    mode: 'local',
    title: 'INFO · по id из URL',
    intro: t(
      'Фарқи муҳими Local: navigate карда state гум мешавад! Аз ин сабаб Info.tsx худаш axios.get по id мезанад, ки аз URL мегирад.',
      'Важное отличие Local: после navigate state теряется! Поэтому Info.tsx сам делает axios.get по id, который берёт из URL.'
    ),
    flow: ['openInfo(id)', 'navigate(/info?id=...)', 'InfoLocal: useSearchParams', 'axios.get(`${api}/${id}`)', 'setInfo', 'UI'],
    steps: [
      { title: 'id-ро ба URL гузор', text: t('Дар LocalTodо: navigate ба /info?id=${id}.', 'В LocalTodo: navigate на /info?id=${id}.'), code: 'navigate(`/info?id=${id}`)' },
      { title: 'id-ро аз URL бигир', text: t('Дар InfoLocal: useSearchParams.', 'В InfoLocal: useSearchParams.'), code: 'const id = params.get("id")' },
      { title: 'GET-и нав дар InfoLocal', text: t('useEffect бо [id] — ҳар id-и нав запроси нав.', 'useEffect с [id] — новый id, новый запрос.'), code: 'axios.get(`${api}/${id}`)' },
      { title: 'Нишон деҳ', text: t('info?.name ва info?.description.', 'Покажи info?.name и info?.description.'), code: '<h1>{info?.name}</h1>' },
    ],
    files: ['src/pages/LocalTodo.tsx', 'src/pages/InfoLocal.tsx'],
    relationNote: t('Дар Global todoinfo дар store мемонад; дар Local Info худаш запрос мезанад.', 'В Global todoinfo хранится в store; в Local Info запрашивает сама.'),
    blocks: [
      {
        path: 'src/pages/LocalTodo.tsx',
        lang: 'tsx',
        note: t('Тугмаи Info — id-ро ба URL мебарад.', 'Кнопка Info — кладёт id в URL.'),
        code: `import { useNavigate } from "react-router"

const navigate = useNavigate()

const openInfo = (id: any) => {
  navigate(\`/info?id=\${id}\`)
}

<button onClick={() => openInfo(el.id)}>Info</button>`,
        practiceCode: `import { useNavigate } from "react-router"

// Шаг 1: const navigate = useNavigate()
// Шаг 2: openInfo = (id) => navigate(\`/info?id=\${id}\`)
// Шаг 3: <button onClick={() => openInfo(el.id)}>Info</button>`,
      },
      {
        path: 'src/pages/InfoLocal.tsx',
        lang: 'tsx',
        note: t('Саҳифаи алоҳида — худаш маълумотро аз рӯи id аз URL меорад.', 'Отдельная страница — сама приносит данные по id из URL.'),
        code: `import { useEffect, useState } from "react"
import { useSearchParams } from "react-router"
import axios from "axios"

const api = "https://to-dos-api.softclub.tj/api/to-dos"

const InfoLocal = () => {
  const [params] = useSearchParams()
  const id = params.get("id")
  const [info, setInfo] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    axios
      .get(\`\${api}/\${id}\`)
      .then((res) => setInfo(res.data.data))
      .catch((error) => console.error(error))
  }, [id])

  if (!info) return <p>Загрузка...</p>

  return (
    <div>
      <h1>{info.name}</h1>
      <p>{info.description}</p>
      <div>
        {info.images?.map((img: any) => (
          <img key={img.id} src={"https://to-dos-api.softclub.tj/images/" + img.imageName} alt="" />
        ))}
      </div>
    </div>
  )
}

export default InfoLocal`,
        practiceCode: `import { useEffect, useState } from "react"
import { useSearchParams } from "react-router"
import axios from "axios"

const api = "https://to-dos-api.softclub.tj/api/to-dos"

const InfoLocal = () => {
  // Шаг 1: const [params] = useSearchParams()
  // Шаг 2: const id = params.get("id")
  // Шаг 3: const [info, setInfo] = useState<any>(null)
  // Шаг 4: useEffect(() => { if (id) axios.get(\`\${api}/\${id}\`).then(...) }, [id])

  return (
    <div>
      {/* Шаг 5: info.name, info.description, info.images?.map(...) */}
    </div>
  )
}

export default InfoLocal`,
      },
    ],
    concepts: [
      { name: 'useSearchParams', origin: 'react-router', why: t('id-ро аз query-и URL мехонад', 'Читает id из query URL.'), missing: t('Саҳифа намедонад кадом вазифа кушода шудааст.', 'Страница не знает, какая задача открыта.') },
      { name: 'Local state + navigate', origin: 'React Router', why: t('State-и компонент ҳангоми navigate нобуд мешавад — аз ин сабаб Info худаш мегирад', 'State компонента при navigate исчезает — поэтому Info запрашивает сама.'), missing: t('Баъди navigate саҳифаи холӣ мешавад.', 'После navigate осталась бы пустая страница.') },
      { name: 'F5-proof', origin: 'URL param', why: t('Агар саҳифаро refresh кунӣ, Info кор мекунад — чун ҳама чиз дар URL аст', 'После refresh страницы Info работает — всё нужное в URL.'), missing: t('State дар хотира фақат то refresh зиндагӣ мекунад.', 'State в памяти живёт только до refresh.') },
    ],
    memory: t('navigate(/info?id=) → InfoLocal: useSearchParams → axios.get → setInfo.', 'navigate(/info?id=) → InfoLocal: useSearchParams → axios.get → setInfo.'),
    result: t('Саҳифаи Info ҳатто баъди refresh кор мекунад.', 'Страница Info работает даже после refresh.'),
  },
  {
    op: 'search',
    mode: 'local',
    title: 'SEARCH · search state',
    intro: t(
      'Дар Local ҷустуҷӯ ҳамон getData-и оддӣ аст: search ба state мегузарад, useEffect дубора axios мезанад ва ?query= филтр мекунад.',
      'В Local поиск — это тот же обычный getData: search уходит в state, useEffect снова делает axios и ?query= фильтрует.'
    ),
    flow: ['setSearch', 'useEffect([search])', 'getData()', 'axios.get(?query=...)', 'setData', 'UI'],
    steps: [
      { title: 'search state', text: t('Инпути контролируемый сохта, value={search} гузор.', 'Сделай контролируемый инпут с value={search}.'), code: 'const [search, setSearch] = useState("")' },
      { title: 'getData-ро навсозӣ кун', text: t('Дар дохили axios.get search-ро ба query гузор.', 'Внутри axios.get подставь search в query.'), code: 'axios.get(`${api}?query=${search}&...`)' },
      { title: 'Deps-ро навсозӣ кун', text: t('Дар useEffect [search, page] гузор — ҳар тағйир запроси нав.', 'В useEffect поставь [search, page] — каждое изменение = новый запрос.'), code: 'useEffect(() => { getData() }, [search, page])' },
      { title: 'setPage(1)', text: t('Ҳангоми ҷустуҷӯ саҳифаро ба 1 бармегардон.', 'При поиске возвращай страницу на 1.'), code: 'onChange: setSearch + setPage(1)' },
    ],
    files: ['src/pages/LocalTodo.tsx'],
    relationNote: t('Барои ҷустуҷӯ ягон функсияи нав лозим нест — getData-и мавҷуда бояд search-ро бифаҳмад.', 'Для поиска не нужна новая функция — существующий getData должен понимать search.'),
    blocks: [
      {
        path: 'src/pages/LocalTodo.tsx',
        lang: 'tsx',
        note: t('Инпут + deps-и useEffect — ҳамаи моҷарои ҷустуҷӯ ҳамин аст.', 'Инпут + deps useEffect — вся магия поиска в этом.'),
        code: `const [search, setSearch] = useState("")
const [page, setPage] = useState(1)

const getData = async () => {
  setIsLoading(true)
  try {
    const res = await axios.get(\`\${api}?query=\${search}&PageNumber=\${page}&PageSize=4\`)
    setData(res.data.data)
  } catch (error) {
    console.error(error)
  } finally {
    setIsLoading(false)
  }
}

useEffect(() => {
  getData()
}, [search, page])

<input
  type="text"
  value={search}
  onChange={(e) => {
    setSearch(e.target.value)
    setPage(1)
  }}
  placeholder="Search..."
/>`,
        practiceCode: `// Шаг 1: const [search, setSearch] = useState("")
// Шаг 2: дар axios.get — ?query=\${search}&PageNumber=\${page}&PageSize=4
// Шаг 3: useEffect(() => { getData() }, [search, page])
// Шаг 4: onChange={(e) => { setSearch(e.target.value); setPage(1) }}
<input
  type="text"
  value={search}
  onChange={(e) => {}}
/>`,
      },
    ],
    concepts: [
      { name: '[search, page] дар deps', origin: 'useEffect', why: t('Ҳар тағйири search ё page — запроси нав', 'Каждое изменение search или page — новый запрос.'), missing: t('Ҷустуҷӯ кор намекард — рӯйхати кӯҳна мемонад.', 'Поиск не работал бы — оставался старый список.') },
      { name: 'setPage(1)', origin: 'useState', why: t('Ҳангоми нави ҷустуҷӯ натиҷа аз саҳифаи 1 оғоз мешавад', 'При новом поиске результаты начинаются с 1-й страницы.'), missing: t('Мумкин натиҷаҳо дар саҳифаҳои холӣ мемонанд.', 'Могут остаться результаты на пустых страницах.') },
    ],
    memory: t('setSearch → useEffect([search]) → axios.get(?query=) → setData.', 'setSearch → useEffect([search]) → axios.get(?query=) → setData.'),
    result: t('Ҳар навиштан рӯйхатро филтр мекунад.', 'Каждый ввод фильтрует список.'),
  },
  {
    op: 'pagination',
    mode: 'local',
    title: 'PAGINATION · page state',
    intro: t(
      'Пагинация дар Local як useState-и дигар аст: page ба URL мегузарад ва useEffect саҳифаи навро меорад.',
      'Пагинация в Local — ещё один useState: page уходит в URL и useEffect приносит новую страницу.'
    ),
    flow: ['Клик Next/Prev', 'setPage', 'useEffect([page])', 'axios.get(PageNumber=...)', 'setData', 'UI'],
    steps: [
      { title: 'page state', text: t('Аввали саҳифа — 1.', 'Первая страница — 1.'), code: 'const [page, setPage] = useState(1)' },
      { title: 'Дар getData гузор', text: t('PageNumber=${page} дар axios.get.', 'PageNumber=${page} внутри axios.get.'), code: '&PageNumber=${page}&PageSize=4' },
      { title: 'Тугмаҳо созӣ', text: t('Prev ва Next бо шартҳои disabled.', 'Prev и Next с условиями disabled.'), code: 'onClick={() => setPage((p) => p + 1)}' },
      { title: 'Санҷ', text: t('disabled={!data || data.length < 4} — чун PageSize=4.', 'disabled={!data || data.length < 4} — потому что PageSize=4.'), code: 'disabled={!data || data.length < 4}' },
    ],
    files: ['src/pages/LocalTodo.tsx'],
    relationNote: t('page ва search дар як useEffect муттаҳид ҳастанд.', 'page и search объединены в одном useEffect.'),
    blocks: [
      {
        path: 'src/pages/LocalTodo.tsx',
        lang: 'tsx',
        note: t('Тугмаҳои Prev/Next — page-ро иваз мекунанд, боқӣ худаш мешавад.', 'Кнопки Prev/Next меняют page, остальное происходит само.'),
        code: `const [page, setPage] = useState(1)

// axios.get дар getData:
// \`\${api}?query=\${search}&PageNumber=\${page}&PageSize=4\`

<div className="pagination">
  <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
    &larr; Prev
  </button>
  <span>Page {page}</span>
  <button disabled={!data || data.length < 4} onClick={() => setPage((p) => p + 1)}>
    Next &rarr;
  </button>
</div>`,
        practiceCode: `// Шаг 1: const [page, setPage] = useState(1)
// Шаг 2: дар axios.get — &PageNumber=\${page}&PageSize=4
// Шаг 3: Prev — disabled={page <= 1}, onClick={() => setPage((p) => Math.max(1, p - 1))}
// Шаг 4: Next — disabled={!data || data.length < 4}, onClick={() => setPage((p) => p + 1)}

<div className="pagination"></div>`,
      },
    ],
    concepts: [
      { name: 'PageSize=4', origin: 'API query param', why: t('Сервер ҳар саҳифа 4 вазифа медиҳад', 'Сервер отдаёт 4 задачи на страницу.'), missing: t('Ҳамаи вазифаҳо якбора меомаданд.', 'Все задачи приходили бы разом.') },
      { name: 'Math.max(1, p - 1)', origin: 'JavaScript', why: t('page аз 1 камтар нашавад', 'Не даёт page стать меньше 1.'), missing: t('page=0 запроси хато мегардад.', 'page=0 дал бы ошибочный запрос.') },
    ],
    memory: t('setPage → useEffect([page]) → axios.get(PageNumber=) → setData.', 'setPage → useEffect([page]) → axios.get(PageNumber=) → setData.'),
    result: t('Ҳар клик 4 вазифаи нав меорад. Санҷиши API (2026-10): сервер метавонад PageNumber/PageSize-ро игнор кунад — бо дархости воқеӣ санҷ.', 'Каждый клик приносит 4 новые задачи. Проверка API (2026-10): сервер может игнорировать PageNumber/PageSize — проверь реальным запросом.'),
  },
  {
    op: 'add-img',
    mode: 'local',
    title: 'ADD IMG · addImgData',
    intro: t(
      'Расм илова кардан дар Local: инпути file дар корт, FormData бо полея Images ва axios.post ба ${api}/${id}/images.',
      'Добавление картинки в Local: инпут file в карточке, FormData с полем Images и axios.post на ${api}/${id}/images.'
    ),
    flow: ['e.target.files', 'FormData.append("Images")', 'axios.post', 'getData()', 'UI'],
    steps: [
      { title: 'Инпут гузор', text: t('Дар дохили корт: input type="file" multiple.', 'Внутри карточки: input type="file" multiple.'), code: '<input type="file" multiple onChange={...} />' },
      { title: 'FormData созӣ', text: t('Ҳар файлро ба полея Images append кун.', 'Каждый файл добавь под поле Images.'), code: 'formData.append("Images", file[i])' },
      { title: 'axios.post', text: t('Фиристодан ба ${api}/${id}/images.', 'Отправка на ${api}/${id}/images.'), code: 'await axios.post(`${api}/${id}/images`, formData)' },
      { title: 'getData()', text: t('Рӯйхатро нав кун, то расмҳо пайдо шаванд.', 'Обнови список, чтобы картинки появились.'), code: 'getData()' },
    ],
    files: ['src/pages/LocalTodo.tsx'],
    relationNote: t('Инпути file дар ҳар корт аст — id-и ҳамон вазифаро мегирад.', 'Инпут file в каждой карточке — берёт id той самой задачи.'),
    blocks: [
      {
        path: 'src/pages/LocalTodo.tsx',
        lang: 'tsx',
        note: t('Функсияи addImgData ва инпути файл — дар як компонент.', 'Функция addImgData и инпут файла — в одном компоненте.'),
        code: `const addImgData = async (id: any, file: any) => {
  const formData = new FormData()
  for (let i = 0; i < file.length; i++) {
    formData.append("Images", file[i])
  }
  try {
    await axios.post(\`\${api}/\${id}/images\`, formData)
    getData()
  } catch (error) {
    console.error(error)
  }
}

// Дар дохили ҳар корт:
<input
  type="file"
  multiple
  onChange={(e) => addImgData(el.id, e.target.files)}
/>`,
        practiceCode: `const addImgData = async (id: any, file: any) => {
  // Шаг 1: const formData = new FormData()
  // Шаг 2: for (let i = 0; i < file.length; i++) formData.append("Images", file[i])
  // Шаг 3: await axios.post(\`\${api}/\${id}/images\`, formData)
  // Шаг 4: getData()
}

// Шаг 5: <input type="file" multiple onChange={(e) => addImgData(el.id, e.target.files)} />`,
      },
    ],
    concepts: [
      { name: 'e.target.files', origin: 'DOM FileList', why: t('Списки файлҳои интихобшуда — онро ба loop медиҳӣ', 'Список выбранных файлов — его кладёшь в loop.'), missing: t('Файлҳо ба функсия намерасиданд.', 'Файлы не доходили бы до функции.') },
      { name: 'FormData', origin: 'Browser API', why: t('Файлро JSON фиристода намешавад — FormData лозим аст', 'Файл нельзя отправить JSON-ом — нужен FormData.'), missing: t('Сервер файлро қабул намекард.', 'Сервер не принял бы файл.') },
    ],
    memory: t('file → FormData("Images") → axios.post(/id/images) → getData().', 'file → FormData("Images") → axios.post(/id/images) → getData().'),
    result: t('Расмҳо дар корт пайдо мешаванд.', 'Картинки появляются в карточке.'),
  },
  {
    op: 'delete-img',
    mode: 'local',
    title: 'DELETE IMG · deleteImgData',
    intro: t(
      'Нест кардани расм дар Local: img.id мегирад, axios.delete ба /images/${imageId} мезанад ва getData() рӯйхатро нав мекунад.',
      'Удаление картинки в Local: берём img.id, axios.delete на /images/${imageId} и getData() обновляет список.'
    ),
    flow: ['Клик ба Delete', 'deleteImgData(img.id)', 'axios.delete(/images/id)', 'getData()', 'UI'],
    steps: [
      { title: 'deleteImgData нависӣ', text: t('imageId мегирад — он ID-и акс аст, на ID-и вазифа.', 'Принимает imageId — это ID картинки, а не задачи.'), code: 'await axios.delete(`${api}/images/${imageId}`)' },
      { title: 'getData()', text: t('Баъди нест кардан рӯйхатро нав кун.', 'После удаления обнови список.'), code: 'getData()' },
      { title: 'Тугма гузор', text: t('Дар дохили .map() расмҳо тугмаи хурди Delete.', 'Внутри .map() картинок маленькая кнопка Delete.'), code: 'onClick={() => deleteImgData(img.id)}' },
    ],
    files: ['src/pages/LocalTodo.tsx'],
    relationNote: t('Ҳар акс тугмаи алоҳида дорад — img.id-и худро мегузорад.', 'У каждой картинки своя кнопка — передаёт свой img.id.'),
    blocks: [
      {
        path: 'src/pages/LocalTodo.tsx',
        lang: 'tsx',
        note: t('Дар дохили корт расмҳо бо тугмаи Delete.', 'Внутри карточки картинки с кнопкой Delete.'),
        code: `const deleteImgData = async (imageId: any) => {
  try {
    await axios.delete(\`\${api}/images/\${imageId}\`)
    getData()
  } catch (error) {
    console.error(error)
  }
}

// Дар дохили корт:
<div className="images">
  {el.images?.map((img: any) => (
    <div key={img.id}>
      <img src={"https://to-dos-api.softclub.tj/images/" + img.imageName} alt="" />
      <button onClick={() => deleteImgData(img.id)}>×</button>
    </div>
  ))}
</div>`,
        practiceCode: `const deleteImgData = async (imageId: any) => {
  // Шаг 1: await axios.delete(\`\${api}/images/\${imageId}\`)
  // Шаг 2: getData()
}

// Шаг 3: <button onClick={() => deleteImgData(img.id)}>×</button>`,
      },
    ],
    concepts: [
      { name: 'img.id', origin: 'массиви images', why: t('ID-и худи акс — на ID-и todo', 'ID самой картинки — не ID todo.'), missing: t('Сервер намедонад кадом расмро нест кунад.', 'Сервер не знает, какую картинку удалить.') },
      { name: 'img.imageName', origin: 'API response', why: t('Номи файл дар сервер — бо img_URL пайваст мешавад', 'Имя файла на сервере — соединяется с img_URL.'), missing: t('Сурат наменамуд.', 'Картинка не показывалась бы.') },
    ],
    memory: t('img.id → axios.delete(/images/id) → getData() → UI.', 'img.id → axios.delete(/images/id) → getData() → UI.'),
    result: t('Акс фавран аз корт нопадид мешавад.', 'Картинка сразу исчезает из карточки.'),
  },
];
