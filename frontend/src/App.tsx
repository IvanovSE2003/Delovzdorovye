import { useContext, useEffect } from 'react'
import { Context } from './main'
import { observer } from 'mobx-react-lite'
import AppRouter from './components/AppRouter'

const App:React.FC = () => {
  const { store } = useContext(Context);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      store.checkAuth();
    }
  }, [store])

  return (
    <>
      <AppRouter/>
    </>
  )
}

export default observer(App)