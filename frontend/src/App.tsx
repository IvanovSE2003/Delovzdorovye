import RegisterPage from './pages/RegisterPage'
import Homepage from './pages/Homepage'
import PersonalAccount from './pages/PersonalAccount'
import RecoverPass from './pages/RecoverPass'
import { Routes, Route } from 'react-router'

function App() {
  return (
    <>
      <Routes>
          <Route path='/' element={<Homepage/>} />
          <Route path='/register' element={<RegisterPage/>} />
          <Route path='/personal' element={<PersonalAccount/>} />
          <Route path='/password-reset/:token' element={<RecoverPass/>}/>
      </Routes>
    </>
  )
}

export default App
