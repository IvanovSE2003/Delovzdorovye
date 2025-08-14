import { createContext } from 'react'
import { createRoot, type Container } from 'react-dom/client'
import { BrowserRouter } from 'react-router'

import './assets/styles/index.scss'
import './assets/styles/normalize.scss'

import App from './App.tsx'
import Store from './store/store.ts'

interface IStore {
  store: Store,
}

const store = new Store();
export const Context = createContext<IStore>({
  store,
})

let container: Container | null = null;

document.addEventListener('DOMContentLoaded', function () {
  if (!container) {
    container = document.getElementById('root') as HTMLElement;
    const root = createRoot(container)
    root.render(
      <Context.Provider value={{ store }}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Context.Provider>,
    );
  }
});
