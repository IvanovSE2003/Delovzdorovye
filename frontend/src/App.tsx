import RegisterPage from './pages/RegisterPage'
import Homepage from './pages/Homepage'
import PersonalAccount from './pages/PersonalAccount'
import ProtectedRoute from './components/ProtectedRoute'
import RecoverPass from './pages/RecoverPass'
import { Routes, Route } from 'react-router'
import { useContext } from 'react'
import { Context } from './main'

function App() {
  const { store } = useContext(Context);
  if (localStorage.getItem('token')) {
    store.checkAuth();
  }

  return (
    <>
      <Routes>
        <Route path='/' element={<Homepage />} />

        <Route
          path='/register'
          element={
            <ProtectedRoute isAuth={store.isAuth}>
              <RegisterPage />
            </ProtectedRoute>
          }
        />

        <Route
          path='/personal'
          element={<PersonalAccount />}
        />

        <Route
          path='/password-reset/:token'
          element={<RecoverPass />}
        />
      </Routes>
    </>
  )
}

export default App