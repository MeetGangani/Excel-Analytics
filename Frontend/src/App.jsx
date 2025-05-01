import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Register from './components/Auth/Register';
import Header from './components/Header';
import Login from './components/Auth/Login';


function App() {

  return (
    <>
      <BrowserRouter>
      <Header />
        <Routes>
          <Route path='/' element={<Login />} />
        <Route path='/register' element={<Register />} /> 
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
