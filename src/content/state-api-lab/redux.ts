import { t, type LabLesson } from './types';

// Уроки Redux Toolkit — перенесены из Practice-Antigraviti.html (реальный проект practica.zip).
export const reduxLessons: LabLesson[] = [
  {
    op: 'setup',
    mode: 'redux',
    title: 'SETUP · store.ts + counterSlice.ts',
    intro: t(
      'Танзимоти асосии Redux Toolkit: файли store.ts ва counterSlice.ts. Ҳамаи амалиётҳои лоиҳа (GET, INFO, DELETE, PUT, расм) дар ҳамин ҷо ҷамъ мешаванд.',
      'Базовая настройка Redux Toolkit: файлы store.ts и counterSlice.ts. Все операции проекта (GET, INFO, DELETE, PUT, картинки) собираются здесь.'
    ),
    flow: ['main.tsx', '<Provider store={store}>', 'configureStore', 'todo: todoReducer', 'component → useSelector'],
    steps: [
      { title: 'store.ts', text: t('configureStore бо reducer: { todo: todoReducer } сохта мешавад.', 'Создаётся configureStore с reducer: { todo: todoReducer }.'), code: 'configureStore({ reducer: { todo: todoReducer } })' },
      { title: 'counterSlice.ts', text: t('Тамоми createAsyncThunk ва extraReducers дар ин ҷо ҷойгиранд.', 'Все createAsyncThunk и extraReducers живут здесь.'), code: "createSlice({ name: 'counter', ... })" },
      { title: 'Provider дар main.tsx', text: t('Дар main.tsx <Provider store={store}> гузошта мешавад.', 'В main.tsx оборачиваем приложение в <Provider store={store}>.'), code: '<Provider store={store}>' },
    ],
    files: ['src/main.tsx', 'src/store/store.ts', 'src/store/counterSlice.ts'],
    relationNote: t('store.ts аз counterSlice.ts reducer-ро ворид мекунад ва ба main.tsx дода мешавад.', 'store.ts импортирует reducer из counterSlice.ts и передаётся в main.tsx.'),
    blocks: [
      {
        path: 'src/store/store.ts',
        lang: 'ts',
        note: t('Файли марказии store — ҳамаи slice-ҳо дар ин ҷо пайваст мешаванд.', 'Центральный файл store — здесь соединяются все slice-ы.'),
        code: `import { configureStore } from "@reduxjs/toolkit"
import todoReducer from "./counterSlice"

export const store = configureStore({
  reducer: {
    todo: todoReducer,
  },
})`,
        practiceCode: `import { configureStore } from "@reduxjs/toolkit"
import todoReducer from "./counterSlice"

export const store = configureStore({
  // Шаг 1: объект reducer открой
  // Шаг 2: todoReducer из counterSlice подключи:
  // reducer: {
  //   todo: todoReducer,
  // }
})`,
      },
      {
        path: 'src/store/counterSlice.ts',
        lang: 'ts',
        note: t('Дар ин ҷо тамоми thunk-ҳо ва slice-и асосӣ аст. Аввали кор аз bisyорӣ нагаранг, аввал сохторро бинӯш.', 'Здесь живут все thunk-и и основной slice. Сначала напиши структуру, потом операции по одной.'),
        code: `import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from "axios";
import { img_URL } from "../pages/Redux";
let api = 'https://to-dos-api.softclub.tj/api/to-dos'

//гет
export const getData = createAsyncThunk("todo/getData", async (params = {}) => {
    const search = params?.search || ""
    const page = params?.page || 1
    try {
        const { data } = await axios.get(\`\${api}?query=\${search}&PageNumber=\${page}&PageSize=4\`)
        return data.data
    } catch (error) {
        console.error(error);
    }
})

//инфо
export const getByIdData = createAsyncThunk("todo/getByIdData", async (id) => {
    try {
        const { data } = await axios.get(\`\${api}/\${id}\`)
        return data.data
    } catch (error) {
        console.error(error);
    }
})

//удалить
export const deleteData = createAsyncThunk("todo/deleteData", async (id, { dispatch }) => {
    try {
        await axios.delete(\`\${api}?id=\${id}\`)
        dispatch(getData())
    } catch (error) {
        console.error(error);
    }
})

//удалить img
export const deleteImgData = createAsyncThunk("todo/deleteImgData", async (id, { dispatch }) => {
    try {
        await axios.delete(\`\${api}/images/\${id}\`)
        dispatch(getData())
    } catch (error) {
        console.error(error);
    }
})

//эдит
export const EditData = createAsyncThunk("todo/EditData", async (user, { dispatch }) => {
    try {
        await axios.put(api, user)
        dispatch(getData())
    } catch (error) {
        console.error(error);
    }
})

//checkbox
export const isCompleted = createAsyncThunk("todo/isComplete", async (id, { dispatch }) => {
    try {
        await axios.put(\`https://to-dos-api.softclub.tj/completed?id=\${id}\`)
        dispatch(getData())
    } catch (error) {
        console.error(error);
    }
})

//добавить
export const AddData = createAsyncThunk("todo/AddData", async (user, { dispatch }) => {
    try {
        await axios.post(api, user)
        dispatch(getData())
    } catch (error) {
        console.error(error);
    }
})

//добавить img
export const AddImgData = createAsyncThunk("todo/AddImgData", async ({ id, file }, { dispatch }) => {
    const formData = new FormData()
    for (let i = 0; i < file.length; i++) {
        formData.append("Images", file[i])
    }
    try {
        await axios.post(\`\${api}/\${id}/images\`, formData)
        dispatch(getByIdData(id))
    } catch (error) {
        console.error(error);
    }
})

//тодослайс
export const TodaSlice = createSlice({
  name: 'counter',
  initialState: {
    data: [],
    isLoading: false,
    todoinfo: null
  },
  reducers: {},
  //эустра редусер
  extraReducers: (builder) => {
    builder.addCase(getData.pending, (state) => {
        state.isLoading = true
    })
    builder.addCase(getData.fulfilled, (state, action) => {
        state.data = action.payload
        state.isLoading = false
    })
    builder.addCase(getByIdData.fulfilled, (state, action) => {
        state.todoinfo = action.payload
        state.isLoading = false
    })
  },
})

//экспорт 
export const { increment, decrement, incrementByAmount } = TodaSlice.actions

export default TodaSlice.reducer`,
        practiceCode: `import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from "axios"

const api = 'https://to-dos-api.softclub.tj/api/to-dos'

// Шаг 1: getData — createAsyncThunk + axios.get + return data.data
// Шаг 2: getByIdData — axios.get(\`\${api}/\${id}\`)
// Шаг 3: deleteData / deleteImgData — axios.delete + dispatch(getData())
// Шаг 4: EditData / isCompleted — axios.put + dispatch(getData())
// Шаг 5: AddData — axios.post(api, user)
// Шаг 6: AddImgData — FormData + axios.post(\`\${api}/\${id}/images\`)
// Шаг 7: createSlice — initialState { data, isLoading, todoinfo }
// Шаг 8: extraReducers — getData.pending/fulfilled + getByIdData.fulfilled

export const TodaSlice = createSlice({
  name: 'counter',
  initialState: {
    data: [],
    isLoading: false,
    todoinfo: null
  },
  reducers: {},
  extraReducers: (builder) => {
    // thunk-ҳоро бо builder.addCase пайваст кун
  },
})

export default TodaSlice.reducer`,
      },
    ],
    concepts: [
      { name: 'configureStore', origin: '@reduxjs/toolkit', why: t('Барои сохтани маркази асосии store', 'Создаёт центральный store.'), missing: t('Бе ин store сохта намешавад.', 'Без него store не создать.') },
      { name: 'createSlice', origin: '@reduxjs/toolkit', why: t('Reducers ва extraReducers-ро якҷо мекунад', 'Объединяет reducers и extraReducers.'), missing: t('Бе ин slice сохта намешавад.', 'Без него slice не создать.') },
      { name: 'createAsyncThunk', origin: '@reduxjs/toolkit', why: t('Барои запросҳои асинхронӣ бо axios', 'Для асинхронных запросов через axios.'), missing: t('Reducer худаш асинхрон кор карда наметавонад.', 'Reducer сам не умеет асинхронщину.') },
    ],
    memory: t('store.ts → reducer.todo: counterSlice → Provider.', 'store.ts → reducer.todo: counterSlice → Provider.'),
    result: t('Саҳифа кушода мешавад ва console-да хато нест: store кор мекунад.', 'Страница открывается без ошибок в console: store работает.'),
  },
  {
    op: 'get',
    mode: 'redux',
    title: 'GET · getData',
    intro: t(
      'getData — createAsyncThunk барои дарёфти рӯйхати todo-ҳо бо параметрҳои search ва page. pending isLoading-ро фаъол мекунад, fulfilled маълумотро ба state.data сабт мекунад.',
      'getData — createAsyncThunk для получения списка todo с параметрами search и page. pending включает isLoading, fulfilled записывает данные в state.data.'
    ),
    flow: ['dispatch(getData)', 'axios.get', 'fulfilled', 'state.data = action.payload', 'useSelector', 'UI'],
    steps: [
      { title: 'dispatch(getData())', text: t('Дар useEffect thunk бо search ва page даъват мешавад.', 'В useEffect вызывается thunk с search и page.'), code: 'dispatch(getData({ search, page }))' },
      { title: 'pending', text: t('Redux Toolkit isLoading-ро true мекунад.', 'Redux Toolkit ставит isLoading = true.'), code: 'builder.addCase(getData.pending)' },
      { title: 'axios.get', text: t('Запрос ба сервер рафта, рӯйхатро бармегардонад.', 'Запрос уходит на сервер и возвращает список.'), code: 'axios.get(`${api}?query=${search}&PageNumber=${page}&PageSize=4`)' },
      { title: 'fulfilled', text: t('action.payload ба state.data сабт шуда, isLoading = false мешавад.', 'action.payload записывается в state.data, isLoading = false.'), code: 'state.data = action.payload' },
      { title: 'useSelector', text: t('Component data-ро гирифта, бо .map() нишон медиҳад.', 'Компонент берёт data и показывает через .map().'), code: 'useSelector((store) => store.todo)' },
    ],
    files: ['src/store/counterSlice.ts', 'src/store/store.ts', 'src/pages/Redux.tsx'],
    relationNote: t('Дар Redux.tsx useEffect ба dispatch, search ва page вобаста аст.', 'В Redux.tsx useEffect зависит от dispatch, search и page.'),
    blocks: [
      {
        path: 'src/store/counterSlice.ts',
        lang: 'ts',
        note: t('Thunk ва extraReducers — ҷафти асосии GET дар Redux.', 'Thunk и extraReducers — основная пара GET в Redux.'),
        code: `export const getData = createAsyncThunk("todo/getData", async (params = {}) => {
    const search = params?.search || ""
    const page = params?.page || 1
    try {
        const { data } = await axios.get(\`\${api}?query=\${search}&PageNumber=\${page}&PageSize=4\`)
        return data.data
    } catch (error) {
        console.error(error);
    }
})

// extraReducers дар дохили createSlice:
builder.addCase(getData.pending, (state) => {
    state.isLoading = true
})
builder.addCase(getData.fulfilled, (state, action) => {
    state.data = action.payload
    state.isLoading = false
})`,
        practiceCode: `export const getData = createAsyncThunk("todo/getData", async (params = {}) => {
    // Шаг 1: search и page с default возьми: params?.search || "", params?.page || 1
    // Шаг 2: const { data } = await axios.get(\`\${api}?query=...&PageNumber=...&PageSize=4\`)
    // Шаг 3: return data.data
})

// extraReducers дар дохили createSlice:
builder.addCase(getData.pending, (state) => {
    // state.isLoading = true
})
builder.addCase(getData.fulfilled, (state, action) => {
    // state.data = action.payload
    // state.isLoading = false
})`,
      },
      {
        path: 'src/pages/Redux.tsx',
        lang: 'tsx',
        note: t('Истифодаи dispatch ва useSelector дар компонент.', 'Использование dispatch и useSelector в компоненте.'),
        code: `const dispatch = useDispatch()
const { data, isLoading } = useSelector((store) => store.todo)

useEffect(() => {
  dispatch(getData({ search, page }))
}, [dispatch, search, page])`,
        practiceCode: `import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getData } from "../store/counterSlice"

const Redux = () => {
  // Шаг 1: const dispatch = useDispatch()
  // Шаг 2: const { data, isLoading } = useSelector((store: any) => store.todo)
  // Шаг 3: useEffect(() => { dispatch(getData({ search: "", page: 1 })) }, [dispatch])

  return (
    <div>
      {/* Шаг 4: isLoading && <h1>Loading...</h1> */}
      {/* Шаг 5: data?.map((el) => <div key={el.id}>{el.name}</div>) */}
    </div>
  )
}

export default Redux`,
      },
    ],
    concepts: [
      { name: 'createAsyncThunk', origin: '@reduxjs/toolkit', why: t('Барои сохтани асинхрон thunk барои запросҳои API', 'Создаёт асинхронный thunk для API-запросов.'), missing: t('Бе ин Redux асинхрон кор намекунад.', 'Без него Redux не умеет асинхрон.') },
      { name: 'builder', origin: 'extraReducers', why: t('Action-ҳои асинхронро ба state пайваст мекунад', 'Подключает асинхронные actions к state.'), missing: t('Бе builder ҳолатҳои thunk пайваст намешаванд.', 'Без builder состояния thunk не подключить.') },
      { name: 'fulfilled', origin: 'getData.fulfilled', why: t('Ҳолати бомуваффақият анҷом ёфтани запрос', 'Состояние успешного завершения запроса.'), missing: t('Бе ин маълумоти сервер ба state дохил намешавад.', 'Без него данные сервера не попадут в state.') },
      { name: 'action.payload', origin: 'Параметри action дар callback', why: t('Маълумоте, ки аз return data.data баргашт', 'Данные, которые вернул return data.data.'), missing: t('Бе ин маълумоти омада гум мешавад.', 'Без него пришедшие данные теряются.') },
    ],
    memory: t('dispatch(getData) → axios.get → fulfilled → state.data → useSelector.', 'dispatch(getData) → axios.get → fulfilled → state.data → useSelector.'),
    result: t('Рӯйхати todo-ҳо аз сервер дар экран нишон дода мешавад.', 'Список todo с сервера появляется на экране.'),
  },
  {
    op: 'post',
    mode: 'redux',
    title: 'POST · AddData',
    intro: t(
      'AddData вазифаи навро бо axios.post ба сервер мефиристад ва пас аз он бо dispatch(getData()) рӯйхатро аз нав меорад.',
      'AddData отправляет новую задачу через axios.post и после этого обновляет список через dispatch(getData()).'
    ),
    flow: ['Форма submit', 'new FormData()', 'dispatch(AddData)', 'axios.post', 'dispatch(getData())', 'UI'],
    steps: [
      { title: 'Форма submit', text: t('DialogAdd.tsx маълумоти корбарро ба FormData мебандад.', 'DialogAdd.tsx собирает данные пользователя в FormData.'), code: 'new FormData() + append' },
      { title: 'dispatch(AddData)', text: t('FormData ба thunk-и AddData фиристода мешавад.', 'FormData уходит в thunk AddData.'), code: 'dispatch(AddData(formData))' },
      { title: 'axios.post', text: t('Запрос ба сервер меравад.', 'Запрос уходит на сервер.'), code: 'await axios.post(api, user)' },
      { title: 'dispatch(getData())', text: t('Пас аз сабт, рӯйхати нав фавран хонда мешавад.', 'После сохранения список сразу перечитывается.'), code: 'dispatch(getData())' },
    ],
    files: ['src/pages/Redux.tsx', 'src/components/dialog/DialogAdd.tsx', 'src/store/counterSlice.ts'],
    relationNote: t('DialogAdd.tsx мустақиман AddData-ро dispatch мекунад ва равзана пӯшида мешавад.', 'DialogAdd.tsx напрямую dispatch-ит AddData и окно закрывается.'),
    blocks: [
      {
        path: 'src/store/counterSlice.ts',
        lang: 'ts',
        note: t('Thunk-и AddData — axios.post ва навсозии рӯйхат.', 'Thunk AddData — axios.post и обновление списка.'),
        code: `export const AddData = createAsyncThunk("todo/AddData", async (user, { dispatch }) => {
    try {
        await axios.post(api, user)
        dispatch(getData())
    } catch (error) {
        console.error(error);
    }
})`,
        practiceCode: `export const AddData = createAsyncThunk("todo/AddData", async (user, { dispatch }) => {
    // Шаг 1: await axios.post(api, user)
    // Шаг 2: dispatch(getData()) — список обновить
})`,
      },
      {
        path: 'src/pages/Redux.tsx',
        lang: 'tsx',
        note: t('Тугмаи «+ Add Task» ва кушодани модал.', 'Кнопка «+ Add Task» и открытие модалки.'),
        code: `import { useState } from "react"
import DialogAdd from "../components/dialog/DialogAdd"

// Дар дохили компоненти Redux:
const [add, setAdd] = useState(false)

return (
  <div>
    <button onClick={() => setAdd(true)}>
      + Add Task
    </button>

    <DialogAdd user={add} setUser={setAdd} />
  </div>
)`,
        practiceCode: `import { useState } from "react"
import DialogAdd from "../components/dialog/DialogAdd"

// Дар дохили компоненти Redux:
const [add, setAdd] = useState(false)

return (
  <div>
    {/* Шаг 1: <button onClick={() => setAdd(true)}>+ Add Task</button> */}
    {/* Шаг 2: <DialogAdd user={add} setUser={setAdd} /> */}
  </div>
)`,
      },
      {
        path: 'src/components/dialog/DialogAdd.tsx',
        lang: 'tsx',
        note: t('Форма ва фиристодани FormData ба thunk.', 'Форма и отправка FormData в thunk.'),
        code: `import { useDispatch } from "react-redux"
import { AddData } from "../../store/counterSlice"

const DialogAdd = ({ user, setUser }: any) => {
  const dispatch = useDispatch()

  function AddUser(e: any) {
    e.preventDefault()
    const formData = new FormData()
    formData.append("Name", e.target.name.value)
    formData.append("Description", e.target.description.value)
    for (const el of e.target.images.files) {
      formData.append("Images", el)
    }
    dispatch(AddData(formData))
    setUser(null)
  }

  if (!user) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <form onSubmit={AddUser}>
        <input name="name" required placeholder="Title" />
        <input name="description" required placeholder="Description" />
        <input type="file" name="images" multiple />
        <button type="submit">Add</button>
        <button type="button" onClick={() => setUser(null)}>Cancel</button>
      </form>
    </div>
  )
}

export default DialogAdd`,
        practiceCode: `import { useDispatch } from "react-redux"
import { AddData } from "../../store/counterSlice"

const DialogAdd = ({ user, setUser }: any) => {
  const dispatch = useDispatch()

  function AddUser(e: any) {
    e.preventDefault()
    // Шаг 1: const formData = new FormData()
    // Шаг 2: formData.append("Name", e.target.name.value)
    // Шаг 3: formData.append("Description", e.target.description.value)
    // Шаг 4: for (const el of e.target.images.files) formData.append("Images", el)
    // Шаг 5: dispatch(AddData(formData))
    // Шаг 6: setUser(null)
  }

  if (!user) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      {/* форма: input name, description, images и submit button */}
    </div>
  )
}

export default DialogAdd`,
      },
    ],
    concepts: [
      { name: 'FormData', origin: 'Web API-и браузер', why: t('Файлҳо ва матнҳо дар як multipart дархост фиристода мешаванд', 'Отправляет файлы и текст одним multipart-запросом.'), missing: t('Бе FormData расмҳо ба сервер намегузаранд.', 'Без FormData картинки на сервер не пройдут.') },
      { name: '{ dispatch } дар thunk', origin: 'thunkAPI', why: t('Аз даруни thunk дигар action даъват кардан мумкин аст', 'Позволяет вызвать другой action прямо из thunk.'), missing: t('Бе ин компонент бояд алоҳида getData-ро даъват мекард.', 'Без него компонент должен был бы отдельно перезапрашивать getData.') },
    ],
    memory: t('FormData → dispatch(AddData) → axios.post → dispatch(getData()).', 'FormData → dispatch(AddData) → axios.post → dispatch(getData()).'),
    result: t('Вазифаи нав дар рӯйхат пайдо мешавад.', 'Новая задача появляется в списке.'),
  },
  {
    op: 'put',
    mode: 'redux',
    title: 'PUT · EditData & isCompleted',
    intro: t(
      'Ду намуди таҳрир: EditData барои тағйири ному тавсиф ва isCompleted барои чекбокси иҷрошавӣ. Ҳарду бо axios.put кор мекунанд ва рӯйхатро бо dispatch(getData()) нав мекунанд.',
      'Два вида редактирования: EditData меняет имя и описание, isCompleted — чекбокс выполненности. Оба работают через axios.put и обновляют список через dispatch(getData()).'
    ),
    flow: ['Форма / checkbox', 'dispatch(EditData / isCompleted)', 'axios.put', 'dispatch(getData())', 'UI'],
    steps: [
      { title: 'Форма / Чекбокс', text: t('Корбар матнро таҳрир мекунад ё чекбоксро мепарронад.', 'Пользователь правит текст или переключает чекбокс.'), code: 'EditUser ё onChange' },
      { title: 'dispatch(EditData / isCompleted)', text: t('Маълумоти нав ба thunk меравад.', 'Новые данные уходят в thunk.'), code: 'dispatch(EditData(editobj))' },
      { title: 'axios.put', text: t('Дархости PUT ба сервери API ирсол мешавад.', 'PUT-запрос уходит на сервер API.'), code: 'axios.put(...)' },
      { title: 'dispatch(getData())', text: t('Рӯйхат аз нав боргирӣ шуда, UI фавран нав мешавад.', 'Список перезагружается, UI сразу обновляется.'), code: 'dispatch(getData())' },
    ],
    files: ['src/store/counterSlice.ts', 'src/pages/Redux.tsx', 'src/components/dialog/DialogEdit.tsx'],
    relationNote: t('Дар Redux.tsx ҳам модали DialogEdit ва ҳам чекбокси мустақими isCompleted кор мекунанд.', 'В Redux.tsx работают и модалка DialogEdit, и отдельный чекбокс isCompleted.'),
    blocks: [
      {
        path: 'src/store/counterSlice.ts',
        lang: 'ts',
        note: t('Ду thunk: EditData барои матн, isCompleted барои чекбокс.', 'Два thunk: EditData для текста, isCompleted для чекбокса.'),
        code: `export const EditData = createAsyncThunk("todo/EditData", async (user, { dispatch }) => {
    try {
        await axios.put(api, user)
        dispatch(getData())
    } catch (error) {
        console.error(error);
    }
})

export const isCompleted = createAsyncThunk("todo/isComplete", async (id, { dispatch }) => {
    try {
        await axios.put(\`https://to-dos-api.softclub.tj/completed?id=\${id}\`)
        dispatch(getData())
    } catch (error) {
        console.error(error);
    }
})`,
        practiceCode: `export const EditData = createAsyncThunk("todo/EditData", async (user, { dispatch }) => {
    // Шаг 1: await axios.put(api, user)
    // Шаг 2: dispatch(getData())
})

export const isCompleted = createAsyncThunk("todo/isComplete", async (id, { dispatch }) => {
    // Шаг 1: await axios.put(\`https://to-dos-api.softclub.tj/completed?id=\${id}\`)
    // Шаг 2: dispatch(getData())
})`,
      },
      {
        path: 'src/pages/Redux.tsx',
        lang: 'tsx',
        note: t('Тугмаи Edit, чекбокс ва кушодани модал.', 'Кнопка Edit, чекбокс и открытие модалки.'),
        code: `import { useState } from "react"
import { useDispatch } from "react-redux"
import { isCompleted } from "../store/counterSlice"
import DialogEdit from "../components/dialog/DialogEdit"

// Дар дохили компоненти Redux:
const dispatch = useDispatch()
const [edit, setEdit] = useState<any>(null)

return (
  <div>
    {/* Тугмаи таҳрир */}
    <button onClick={() => setEdit(el)}>
      Edit
    </button>

    {/* Чекбокси ба итмом расидан */}
    <input
      type="checkbox"
      checked={el.isCompleted}
      onChange={() => dispatch(isCompleted(el.id))}
    />

    <DialogEdit user={edit} setUser={setEdit} />
  </div>
)`,
        practiceCode: `// Дар дохили компоненти Redux:
const dispatch = useDispatch()
const [edit, setEdit] = useState<any>(null)

return (
  <div>
    {/* Шаг 1: <button onClick={() => setEdit(el)}>Edit</button> */}
    {/* Шаг 2: <input type="checkbox" checked={el.isCompleted} onChange={() => dispatch(isCompleted(el.id))} /> */}
    {/* Шаг 3: <DialogEdit user={edit} setUser={setEdit} /> */}
  </div>
)`,
      },
      {
        path: 'src/components/dialog/DialogEdit.tsx',
        lang: 'tsx',
        note: t('editobj сохта, ба EditData фиристода мешавад. id ҳатман нигоҳ дошта мешавад.', 'Собирается editobj и отправляется в EditData. id обязательно сохраняется.'),
        code: `import { useDispatch } from "react-redux"
import { EditData } from "../../store/counterSlice"

const DialogEdit = ({ user, setUser }: any) => {
  const dispatch = useDispatch()

  function EditUser(e: any) {
    e.preventDefault()
    const editobj = {
      id: user.id,
      name: e.target.name.value,
      description: e.target.description.value,
    }
    dispatch(EditData(editobj))
    setUser(null)
  }

  if (!user) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <form onSubmit={EditUser}>
        <input name="name" defaultValue={user.name} placeholder="Title" />
        <input name="description" defaultValue={user.description} placeholder="Description" />
        <button type="submit">Save</button>
        <button type="button" onClick={() => setUser(null)}>Cancel</button>
      </form>
    </div>
  )
}

export default DialogEdit`,
        practiceCode: `import { useDispatch } from "react-redux"
import { EditData } from "../../store/counterSlice"

const DialogEdit = ({ user, setUser }: any) => {
  const dispatch = useDispatch()

  function EditUser(e: any) {
    e.preventDefault()
    // Шаг 1: const editobj = { id: user.id, name: ..., description: ... }
    // Шаг 2: dispatch(EditData(editobj))
    // Шаг 3: setUser(null)
  }

  if (!user) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      {/* input name и description с defaultValue={user.name} */}
    </div>
  )
}

export default DialogEdit`,
      },
    ],
    concepts: [
      { name: 'axios.put', origin: 'HTTP PUT', why: t('Маълумоти аллакай вуҷуддоштаро навсозӣ мекунад', 'Обновляет уже существующие данные.'), missing: t('Бе PUT тағйирот дар сервер сабт намешавад.', 'Без PUT изменения на сервере не сохранятся.') },
      { name: 'defaultValue', origin: 'uncontrolled input', why: t('Қимати ибтидоии инпутро дар модали таҳрир мегузорад', 'Задаёт начальное значение инпута в модалке редактирования.'), missing: t('Инпутҳо холӣ кушода мешаванд.', 'Инпуты откроются пустыми.') },
    ],
    memory: t('editobj → axios.put → dispatch(getData()) → UI нав мешавад.', 'editobj → axios.put → dispatch(getData()) → UI обновляется.'),
    result: t('Ном ё тавсиф тағйир меёбад, чекбокс ҳолатро нигоҳ медорад.', 'Имя или описание меняются, чекбокс сохраняет состояние.'),
  },
  {
    op: 'delete',
    mode: 'redux',
    title: 'DELETE · deleteData',
    intro: t(
      'deleteData вазифаро аз рӯи id бо axios.delete нест мекунад ва сипас бо dispatch(getData()) кортро аз экран мебардорад.',
      'deleteData удаляет задачу по id через axios.delete и затем убирает карточку с экрана через dispatch(getData()).'
    ),
    flow: ['Клик ба Delete', 'dispatch(deleteData)', 'axios.delete', 'dispatch(getData())', 'UI'],
    steps: [
      { title: 'Клик ба Delete', text: t('Корбар тугмаи Delete-ро пахш мекунад.', 'Пользователь нажимает кнопку Delete.'), code: 'dispatch(deleteData(el.id))' },
      { title: 'axios.delete', text: t('Запрос ба сервер меравад ва сабт тоза мешавад.', 'Запрос уходит на сервер, запись удаляется.'), code: 'axios.delete(`${api}?id=${id}`)' },
      { title: 'dispatch(getData())', text: t('Рӯйхати тозашуда боз аз нав хонда мешавад.', 'Обновлённый список перечитывается заново.'), code: 'dispatch(getData())' },
    ],
    files: ['src/pages/Redux.tsx', 'src/store/counterSlice.ts'],
    relationNote: t('Ҳар як корти todo дар Redux.tsx тугмаи Delete дорад.', 'У каждой карточки todo в Redux.tsx есть кнопка Delete.'),
    blocks: [
      {
        path: 'src/store/counterSlice.ts',
        lang: 'ts',
        note: t('Thunk-и deleteData: axios.delete + навсозии рӯйхат.', 'Thunk deleteData: axios.delete + обновление списка.'),
        code: `export const deleteData = createAsyncThunk("todo/deleteData", async (id, { dispatch }) => {
    try {
        await axios.delete(\`\${api}?id=\${id}\`)
        dispatch(getData())
    } catch (error) {
        console.error(error);
    }
})`,
        practiceCode: `export const deleteData = createAsyncThunk("todo/deleteData", async (id, { dispatch }) => {
    // Шаг 1: await axios.delete(\`\${api}?id=\${id}\`)
    // Шаг 2: dispatch(getData()) — список обновить
})`,
      },
      {
        path: 'src/pages/Redux.tsx',
        lang: 'tsx',
        note: t('Дар дохили .map() ҳар як корт тугмаи Delete дорад.', 'Внутри .map() у каждой карточки кнопка Delete.'),
        code: `import { useDispatch } from "react-redux"
import { deleteData } from "../store/counterSlice"

// Дар дохили .map() ҳар як корти todo:
<button
  onClick={() => dispatch(deleteData(el.id))}
  className="px-3 py-1 bg-red-50 text-red-600 rounded-lg"
>
  Delete
</button>`,
        practiceCode: `// Дар дохили .map() ҳар як корти todo:
// Шаг 1: onClick={() => dispatch(deleteData(el.id))}
<button onClick={() => {}}>
  Delete
</button>`,
      },
    ],
    concepts: [
      { name: 'axios.delete', origin: 'HTTP DELETE', why: t('Маълумотро дар сервери backend нест мекунад', 'Удаляет данные на backend-сервере.'), missing: t('Бе ин маълумот танҳо дар UI нест мешавад ва бо refresh бозмегашт.', 'Без этого данные пропадут только в UI и вернутся после refresh.') },
    ],
    memory: t('el.id → dispatch(deleteData) → axios.delete → dispatch(getData()).', 'el.id → dispatch(deleteData) → axios.delete → dispatch(getData()).'),
    result: t('Корт аз рӯйхат нопадид мешавад.', 'Карточка исчезает из списка.'),
  },
  {
    op: 'info',
    mode: 'redux',
    title: 'INFO · getByIdData',
    intro: t(
      'getByIdData вазифаро бо тамоми тафсилоташ аз рӯи ID мегирад ва дар state.todoinfo сабт мекунад. Саҳифаи Info.tsx он бо useSelector мехонад.',
      'getByIdData берёт задачу со всеми деталями по ID и записывает в state.todoinfo. Страница Info.tsx читает её через useSelector.'
    ),
    flow: ['handleInfo(id)', 'dispatch(getByIdData)', 'axios.get(`${api}/${id}`)', 'state.todoinfo', 'navigate("/info")', 'Info.tsx → useSelector'],
    steps: [
      { title: 'handleInfo(id)', text: t('Клик ба тугмаи info: getByIdData dispatch мешавад.', 'Клик на кнопку info: dispatch-ится getByIdData.'), code: 'dispatch(getByIdData(id))' },
      { title: "navigate('/info')", text: t('Корбар ба саҳифаи Info мегузарад.', 'Пользователь переходит на страницу Info.'), code: "navigate('/info')" },
      { title: 'axios.get(`${api}/${id}`)', text: t('Сервер маълумоти пурраи ҳамон todo-ро мефиристад.', 'Сервер присылает полные данные этого todo.'), code: 'axios.get(`${api}/${id}`)' },
      { title: 'state.todoinfo', text: t('extraReducers маълумотро ба todoinfo мегузорад.', 'extraReducers кладёт данные в todoinfo.'), code: 'state.todoinfo = action.payload' },
      { title: 'Info.tsx', text: t('Саҳифа маълумотро аз todoinfo мехонад ва render мекунад.', 'Страница читает данные из todoinfo и рендерит.'), code: 'useSelector((store) => store.todo)' },
    ],
    files: ['src/pages/Redux.tsx', 'src/store/counterSlice.ts', 'src/pages/Info.tsx'],
    relationNote: t('Redux.tsx navigate("/info") мекунад ва Info.tsx todoinfo-ро мехонад.', 'Redux.tsx делает navigate("/info"), а Info.tsx читает todoinfo.'),
    blocks: [
      {
        path: 'src/store/counterSlice.ts',
        lang: 'ts',
        note: t('getByIdData thunk ва addCase-и он дар extraReducers.', 'Thunk getByIdData и его addCase в extraReducers.'),
        code: `export const getByIdData = createAsyncThunk("todo/getByIdData", async (id) => {
    try {
        const { data } = await axios.get(\`\${api}/\${id}\`)
        return data.data
    } catch (error) {
        console.error(error);
    }
})

// extraReducers:
builder.addCase(getByIdData.fulfilled, (state, action) => {
    state.todoinfo = action.payload
    state.isLoading = false
})`,
        practiceCode: `export const getByIdData = createAsyncThunk("todo/getByIdData", async (id) => {
    // Шаг 1: const { data } = await axios.get(\`\${api}/\${id}\`)
    // Шаг 2: return data.data
})

// extraReducers:
builder.addCase(getByIdData.fulfilled, (state, action) => {
    // state.todoinfo = action.payload
    // state.isLoading = false
})`,
      },
      {
        path: 'src/pages/Redux.tsx',
        lang: 'tsx',
        note: t('handleInfo: пеш dispatch, баъд navigate.', 'handleInfo: сначала dispatch, потом navigate.'),
        code: `import { useDispatch } from "react-redux"
import { useNavigate } from "react-router"
import { getByIdData } from "../store/counterSlice"

const dispatch = useDispatch()
const navigate = useNavigate()

const handleInfo = (id: any) => {
  dispatch(getByIdData(id))
  navigate("/info")
}

<button onClick={() => handleInfo(el.id)}>
  Info
</button>`,
        practiceCode: `const handleInfo = (id: any) => {
  // Шаг 1: dispatch(getByIdData(id))
  // Шаг 2: navigate("/info")
}

<button onClick={() => handleInfo(el.id)}>
  Info
</button>`,
      },
      {
        path: 'src/pages/Info.tsx',
        lang: 'tsx',
        note: t('Саҳифаи алоҳида — todoinfo-ро аз store мехонад.', 'Отдельная страница — читает todoinfo из store.'),
        code: `import { useSelector } from "react-redux"
import { useNavigate } from "react-router"

const Info = () => {
  const navigate = useNavigate()
  const { todoinfo, isLoading } = useSelector((store: any) => store.todo)

  if (isLoading) return <h1>Loading...</h1>
  if (!todoinfo) return <p>Ягон todo интихоб нашудааст</p>

  return (
    <div>
      <button onClick={() => navigate(-1)}>&larr; Баргаштан</button>
      <h1>{todoinfo.name}</h1>
      <p>{todoinfo.description}</p>
      <div>
        {todoinfo.images?.map((img: any) => (
          <img key={img.id} src={"https://to-dos-api.softclub.tj/images/" + img.imageName} alt="" />
        ))}
      </div>
    </div>
  )
}

export default Info`,
        practiceCode: `const Info = () => {
  // Шаг 1: const { todoinfo, isLoading } = useSelector((store: any) => store.todo)
  // Шаг 2: if (isLoading) return <h1>Loading...</h1>
  // Шаг 3: if (!todoinfo) return <p>...</p>

  return (
    <div>
      {/* todoinfo.name, todoinfo.description, todoinfo.images?.map(...) */}
    </div>
  )
}

export default Info`,
      },
    ],
    concepts: [
      { name: 'todoinfo', origin: 'initialState дар counterSlice', why: t('Майдон барои нигоҳдории як вазифаи интихобшуда', 'Поле для хранения одной выбранной задачи.'), missing: t('Агар набошад, саҳифаи Info намедонад чиро нишон диҳад.', 'Без него страница Info не знает, что показать.') },
      { name: 'navigate(-1)', origin: 'react-router', why: t('Ба саҳифаи қаблӣ бармегардонад', 'Возвращает на предыдущую страницу.'), missing: t('Корбар роҳи баргаштро гум мекунад.', 'Пользователь теряет путь назад.') },
    ],
    memory: t('id → dispatch(getByIdData) → fulfilled → state.todoinfo → Info.tsx.', 'id → dispatch(getByIdData) → fulfilled → state.todoinfo → Info.tsx.'),
    result: t('Саҳифаи Info тафсилоти пурраи вазифаро нишон медиҳад.', 'Страница Info показывает полные детали задачи.'),
  },
  {
    op: 'search',
    mode: 'redux',
    title: 'SEARCH · Ҷустуҷӯ',
    intro: t(
      'Ҷустуҷӯ бо параметри query дар URL-и API кор мекунад. Дар Redux.tsx state-и search ҳаст, ки ба getData({ search, page }) дода мешавад.',
      'Поиск работает через параметр query в URL API. В Redux.tsx есть state search, который передаётся в getData({ search, page }).'
    ),
    flow: ['setSearch', 'setPage(1)', 'useEffect', 'dispatch(getData({ search }))', '?query=${search}'],
    steps: [
      { title: 'Инпут тағйир меёбад', text: t('Корбар дар инпут менависад: setSearch ва setPage(1).', 'Пользователь пишет в инпут: setSearch и setPage(1).'), code: 'setSearch(e.target.value)' },
      { title: 'useEffect', text: t('search дар dependency аст, бинобар ин dispatch даъват мешавад.', 'search в dependency, поэтому dispatch вызывается заново.'), code: 'dispatch(getData({ search, page }))' },
      { title: 'API Query', text: t('Сервер бо калимаи ҷустуҷӯ натиҷаҳоро филтр мекунад.', 'Сервер фильтрует результаты по поисковому слову.'), code: '?query=${search}' },
    ],
    files: ['src/pages/Redux.tsx', 'src/store/counterSlice.ts'],
    relationNote: t('Ҷустуҷӯ мустақиман дар дохили thunk-и асосии getData иҷро мешавад.', 'Поиск выполняется прямо внутри основного thunk getData.'),
    blocks: [
      {
        path: 'src/pages/Redux.tsx',
        lang: 'tsx',
        note: t('Инпути ҷустуҷӯ ва state-и search/page.', 'Инпут поиска и state search/page.'),
        code: `const [search, setSearch] = useState("")
const [page, setPage] = useState(1)

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
  dispatch(getData({ search, page }))
}, [dispatch, search, page])`,
        practiceCode: `const [search, setSearch] = useState("")
const [page, setPage] = useState(1)

<input
  type="text"
  value={search}
  onChange={(e) => {
    // Шаг 1: setSearch(e.target.value)
    // Шаг 2: setPage(1) — поиск с 1-й страницы
  }}
/>

// Шаг 3: useEffect бо [dispatch, search, page] ва dispatch(getData({ search, page }))`,
      },
      {
        path: 'src/store/counterSlice.ts',
        lang: 'ts',
        note: t('search ба query URL мегузарад.', 'search уходит в query URL.'),
        code: `export const getData = createAsyncThunk("todo/getData", async (params = {}) => {
    const search = params?.search || ""
    const page = params?.page || 1
    const { data } = await axios.get(\`\${api}?query=\${search}&PageNumber=\${page}&PageSize=4\`)
    return data.data
})`,
        practiceCode: `export const getData = createAsyncThunk("todo/getData", async (params = {}) => {
    // axios.get(\`\${api}?query=\${search}&PageNumber=\${page}&PageSize=4\`)
})`,
      },
    ],
    concepts: [
      { name: 'setPage(1)', origin: 'useState', why: t('Ҳангоми ҷустуҷӯ саҳифаро ба 1 бармегардонад', 'При поиске возвращает на 1-ю страницу.'), missing: t('Натиҷаҳо дар саҳифаҳои холӣ мемонанд.', 'Результаты останутся на пустых страницах.') },
    ],
    memory: t('setSearch → useEffect → dispatch(getData({ search })) → ?query=${search}.', 'setSearch → useEffect → dispatch(getData({ search })) → ?query=${search}.'),
    result: t('Рӯйхат танҳо вазифаҳои мувофиқро нишон медиҳад.', 'Список показывает только подходящие задачи.'),
  },
  {
    op: 'pagination',
    mode: 'redux',
    title: 'PAGINATION · Саҳифабандӣ',
    intro: t(
      'Саҳифабандӣ бо ?PageNumber=${page}&PageSize=4 кор мекунад. Тугмаҳои Prev ва Next рақами page-ро иваз мекунанд.',
      'Пагинация работает через ?PageNumber=${page}&PageSize=4. Кнопки Prev и Next меняют номер страницы.'
    ),
    flow: ['Клик ба Next/Prev', 'setPage', 'useEffect', 'dispatch(getData({ page }))', 'PageNumber=${page}'],
    steps: [
      { title: 'Клик ба Next / Prev', text: t('Қимати page зиёд ё кам мешавад.', 'Значение page увеличивается или уменьшается.'), code: 'setPage((p) => p + 1)' },
      { title: 'useEffect', text: t('page нав шуд — getData бо саҳифаи нав dispatch мешавад.', 'page обновился — getData dispatch-ится с новой страницей.'), code: 'dispatch(getData({ search, page }))' },
      { title: 'PageNumber дар API', text: t('Сервер 4 вазифаи саҳифаи навро мефиристад.', 'Сервер присылает 4 задачи новой страницы.'), code: '&PageNumber=${page}&PageSize=4' },
    ],
    files: ['src/pages/Redux.tsx', 'src/store/counterSlice.ts'],
    relationNote: t('Саҳифабандӣ ва ҷустуҷӯ якҷоя дар thunk-и getData кор мекунанд.', 'Пагинация и поиск вместе работают в thunk getData.'),
    blocks: [
      {
        path: 'src/pages/Redux.tsx',
        lang: 'tsx',
        note: t('Тугмаҳои Prev/Next бо шартҳои disabled.', 'Кнопки Prev/Next с условиями disabled.'),
        code: `const [page, setPage] = useState(1)

<div className="flex items-center gap-2">
  <button onClick={() => setPage((p) => Math.max(1, p - 1))}>
    Ба қафо
  </button>
  <span>Саҳифа: {page}</span>
  <button onClick={() => setPage((p) => p + 1)}>
    Ба пеш
  </button>
</div>`,
        practiceCode: `const [page, setPage] = useState(1)

// Шаг 1: Prev — disabled={page <= 1}, onClick={() => setPage((p) => Math.max(1, p - 1))}
// Шаг 2: Next — disabled={!data || data.length < 4}, onClick={() => setPage((p) => p + 1)}
// Шаг 3: <span>Page {page}</span>`,
      },
      {
        path: 'src/store/counterSlice.ts',
        lang: 'ts',
        note: t('page ба PageNumber дар axios.get мегузарад.', 'page передаётся в PageNumber внутри axios.get.'),
        code: `const page = params?.page || 1
const { data } = await axios.get(\`\${api}?query=\${search}&PageNumber=\${page}&PageSize=4\`)`,
        practiceCode: `// axios.get(\`\${api}?query=\${search}&PageNumber=\${page}&PageSize=4\`)`,
      },
    ],
    concepts: [
      { name: 'PageSize=4', origin: 'Query Param', why: t('Дар як саҳифа на зиёда аз 4 вазифа мефиристад', 'За раз присылает не больше 4 задач на страницу.'), missing: t('Ҳамаи маълумот якбора омада метавонад.', 'Все данные могут прийти разом.') },
      { name: 'Math.max(1, p - 1)', origin: 'JavaScript', why: t('page аз 1 камтар нашавад', 'Не даёт page стать меньше 1.'), missing: t('page 0 ва манфӣ шуда метавонад.', 'page может стать 0 и отрицательным.') },
    ],
    memory: t('setPage → useEffect → dispatch(getData({ page })) → PageNumber=${page}.', 'setPage → useEffect → dispatch(getData({ page })) → PageNumber=${page}.'),
    result: t('Ҳар клик 4 вазифаи навро меорад. Санҷиши API (2026-10): сервер ҳоло PageNumber/PageSize-ро игнор мекунад ва ҳамаи сабтҳоро бармегардонад — коди лоиҳа бошад ҳамон тавр кор мекунад.', 'Каждый клик приносит 4 новые задачи. Проверка API (2026-10): сервер сейчас игнорирует PageNumber/PageSize и возвращает все записи — код проекта при этом прежний.'),
  },
  {
    op: 'add-img',
    mode: 'redux',
    title: 'ADD IMG · AddImgData',
    intro: t(
      'AddImgData расмҳои интихобшударо бо FormData гирифта, ба ${api}/${id}/images мефиристад ва баъд dispatch(getByIdData(id)) мекунад.',
      'AddImgData берёт выбранные картинки через FormData, отправляет на ${api}/${id}/images и затем вызывает dispatch(getByIdData(id)).'
    ),
    flow: ['e.target.files', 'FormData.append("Images")', 'axios.post', 'dispatch(getByIdData(id))', 'UI'],
    steps: [
      { title: 'Интихоби файл', text: t('Корбар дар корт файлро интихоб мекунад.', 'Пользователь выбирает файл в карточке.'), code: 'e.target.files' },
      { title: 'dispatch(AddImgData)', text: t('ID ва файлҳо ба thunk фиристода мешаванд.', 'ID и файлы уходят в thunk.'), code: 'dispatch(AddImgData({ id: el.id, file }))' },
      { title: 'axios.post', text: t('Расмҳо ба ${api}/${id}/images боргузорӣ мешаванд.', 'Картинки загружаются на ${api}/${id}/images.'), code: 'axios.post(url, formData)' },
      { title: 'dispatch(getByIdData(id))', text: t('Маълумоти вазифа бо расмҳои нав навсозӣ мешавад.', 'Данные задачи обновляются с новыми картинками.'), code: 'dispatch(getByIdData(id))' },
    ],
    files: ['src/pages/Redux.tsx', 'src/store/counterSlice.ts'],
    relationNote: t('Дар Redux.tsx дар дохили ҳар як корт input-и type="file" мавҷуд аст.', 'В Redux.tsx внутри каждой карточки есть input type="file".'),
    blocks: [
      {
        path: 'src/store/counterSlice.ts',
        lang: 'ts',
        note: t('FormData бо поле-и Images — номи калидро сервер талаб мекунад.', 'FormData с полем Images — имя ключа требует сервер.'),
        code: `export const AddImgData = createAsyncThunk("todo/AddImgData", async ({ id, file }, { dispatch }) => {
    const formData = new FormData()
    for (let i = 0; i < file.length; i++) {
        formData.append("Images", file[i])
    }
    try {
        await axios.post(\`\${api}/\${id}/images\`, formData)
        dispatch(getByIdData(id))
    } catch (error) {
        console.error(error);
    }
})`,
        practiceCode: `export const AddImgData = createAsyncThunk("todo/AddImgData", async ({ id, file }, { dispatch }) => {
    // Шаг 1: const formData = new FormData()
    // Шаг 2: for (let i = 0; i < file.length; i++) formData.append("Images", file[i])
    // Шаг 3: await axios.post(\`\${api}/\${id}/images\`, formData)
    // Шаг 4: dispatch(getByIdData(id))
})`,
      },
      {
        path: 'src/pages/Redux.tsx',
        lang: 'tsx',
        note: t('Инпути файл дар дохили корт.', 'Инпут файла внутри карточки.'),
        code: `import { useDispatch } from "react-redux"
import { AddImgData } from "../store/counterSlice"

<input
  type="file"
  onChange={(e) =>
    dispatch(AddImgData({ id: el.id, file: e.target.files }))
  }
/>`,
        practiceCode: `// Шаг 1: dispatch(AddImgData({ id: el.id, file: e.target.files }))
<input
  type="file"
  onChange={(e) => {}}
/>`,
      },
    ],
    concepts: [
      { name: "formData.append('Images')", origin: 'FormData', why: t('Сервер майдони Images-ро ҳамчун массив интизор аст', 'Сервер ждёт поле Images как массив.'), missing: t('Агар номи калид Images набошад, backend қабул намекунад.', 'Если ключ не называется Images, backend не примет.') },
    ],
    memory: t("file → FormData.append('Images') → axios.post → dispatch(getByIdData).", "file → FormData.append('Images') → axios.post → dispatch(getByIdData)."),
    result: t('Расмҳо дар корти вазифа пайдо мешаванд.', 'Картинки появляются в карточке задачи.'),
  },
  {
    op: 'delete-img',
    mode: 'redux',
    title: 'DELETE IMG · deleteImgData',
    intro: t(
      'deleteImgData расмро бо axios.delete нест мекунад ва фавран бо dispatch(getData()) рӯйхатро нав месозад.',
      'deleteImgData удаляет картинку через axios.delete и сразу обновляет список через dispatch(getData()).'
    ),
    flow: ['Клик дар расм', 'dispatch(deleteImgData)', 'axios.delete(/images/id)', 'dispatch(getData())', 'UI'],
    steps: [
      { title: 'Клик дар расм', text: t('Корбар тугмаи Delete-и аксро пахш мекунад.', 'Пользователь нажимает Delete у картинки.'), code: 'dispatch(deleteImgData(img.id))' },
      { title: 'axios.delete', text: t('Файл аз сервер пок мешавад.', 'Файл удаляется с сервера.'), code: 'axios.delete(`${api}/images/${id}`)' },
      { title: 'dispatch(getData())', text: t('Рӯйхат нав мешавад.', 'Список обновляется.'), code: 'dispatch(getData())' },
    ],
    files: ['src/pages/Redux.tsx', 'src/store/counterSlice.ts'],
    relationNote: t('Ҳар як расм дар корт тугмаи алоҳидаи Delete дорад.', 'У каждой картинки в карточке отдельная кнопка Delete.'),
    blocks: [
      {
        path: 'src/store/counterSlice.ts',
        lang: 'ts',
        note: t('Дар ин ҷо id — ID-и худи акс аст, на ID-и todo.', 'Здесь id — ID самой картинки, а не todo.'),
        code: `export const deleteImgData = createAsyncThunk("todo/deleteImgData", async (id, { dispatch }) => {
    try {
        await axios.delete(\`\${api}/images/\${id}\`)
        dispatch(getData())
    } catch (error) {
        console.error(error);
    }
})`,
        practiceCode: `export const deleteImgData = createAsyncThunk("todo/deleteImgData", async (id, { dispatch }) => {
    // Шаг 1: await axios.delete(\`\${api}/images/\${id}\`)
    // Шаг 2: dispatch(getData())
})`,
      },
      {
        path: 'src/pages/Redux.tsx',
        lang: 'tsx',
        note: t('Тугмаи нест кардани расм — img.id мегузарад.', 'Кнопка удаления картинки — передаёт img.id.'),
        code: `import { useDispatch } from "react-redux"
import { deleteImgData } from "../store/counterSlice"

<button
  onClick={() => dispatch(deleteImgData(img.id))}
  className="bg-red-600 text-white text-xs px-2.5 py-1 rounded"
>
  Delete
</button>`,
        practiceCode: `// Шаг 1: onClick={() => dispatch(deleteImgData(img.id))}
<button onClick={() => {}}>
  Delete
</button>`,
      },
    ],
    concepts: [
      { name: 'img.id', origin: 'Массиви images дар todo', why: t('ID-и шахсии худи акс (на ID-и todo)', 'Личный ID картинки (не ID todo).'), missing: t('Агар ID-и акс набошад, сервер намедонад кадом расмро нест кунад.', 'Без ID картинки сервер не знает, что удалять.') },
    ],
    memory: t('img.id → axios.delete(/images/id) → dispatch(getData()).', 'img.id → axios.delete(/images/id) → dispatch(getData()).'),
    result: t('Акс аз корт нопадид мешавад.', 'Картинка исчезает из карточки.'),
  },
];
