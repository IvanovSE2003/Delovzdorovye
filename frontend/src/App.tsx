import RegisterPage from './pages/RegisterPage'
import Homepage from './pages/Homepage'
import PersonalAccount from './pages/PersonalAccount'
import RecoverPass from './pages/RecoverPass'
import { Routes, Route } from 'react-router'
import { useContext, useEffect } from 'react'
import { Context } from './main'
import { observer } from 'mobx-react-lite'


import ProtectedRoute from './components/ProtectedRoute' // Неавторизированному пользователю нельзя
import AuthProtectedRoute from './components/AuthProtectedRoute' // Авторизированному пользователю нельзя

function App() {
  const { store } = useContext(Context);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      store.checkAuth();
    }
  }, [])

  return (
    <>
      <h2>{store.isAuth ? "Пользователь авторизован" : "Пользователь не авторизован"}</h2>

      <Routes>
        <Route path='/' element={<Homepage />} />

        <Route
          path='/register'
          element={
            <AuthProtectedRoute isAuth={store.isAuth}>
              <RegisterPage />
            </AuthProtectedRoute>
          }
        />

        <Route
          path='/personal'
          element={
            <ProtectedRoute isAuth={store.isAuth}>
              <PersonalAccount />
            </ProtectedRoute>
          }
        />

        <Route
          path='/password-reset/:token'
          element={<RecoverPass />}
        />
      </Routes>
    </>
  )
}

export default observer(App)