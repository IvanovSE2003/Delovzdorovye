import { createContext, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './assets/styles/index.scss'
import './assets/styles/normalize.scss'
import App from './App.tsx'
import Store from './store/store.ts'

interface State {
  store: Store,
}

const store = new Store();
export const Context = createContext<State>({
  store,
})

createRoot(document.getElementById('root')!).render(
  <Context.Provider value={{
    store
  }}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Context.Provider>,
)
