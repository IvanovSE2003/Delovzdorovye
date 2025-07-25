import Header from './components/Header/Header'
import Register from './pages/Register'
import Homepage from './pages/Homepage'
import { Routes, Route } from 'react-router'

function App() {
  return (
    <>
      <Header />
      <Routes>
          <Route path='/' element={<Homepage/>} />
          <Route path='/register' element={<Register/>} />
      </Routes>
    </>
  )
}

export default App
