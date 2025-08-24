import Login from './components/login/Login.jsx'
import { Routes, Route } from 'react-router-dom'
import Home from './components/Homepage/Home.jsx'
import Navbar from './components/Navbar/Navbar.jsx'
import OrderForm from './components/Order/Order.jsx';
import Queue from './components/Queue/Queue.jsx';
import SignupForm from './components/signUp/signup.jsx';
import PrivateRoute from './components/ProtectedRoute/PrivateRoute.jsx';
function App() {

  return (
    <>
      <div>
        <Navbar/>
        <main>
          <Routes>
            <Route path='/' element={<Home/>} />
            <Route path='/Login' element={<Login />} />
            <Route path='/Signup' element={<SignupForm/>}></Route>
            <Route
          path="/order"
          element={
            <PrivateRoute>
              <OrderForm />
            </PrivateRoute>
          }
        />
            <Route path="/queue" element={<Queue />} />
          </Routes>
        </main>
      </div>
        
    </>
  )
}

export default App
