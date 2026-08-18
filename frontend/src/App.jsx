import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Profile from './pages/Profile.jsx'
import SignUp from './pages/SignUp.jsx'
import getCurrentUser from './customHooks/getCurrentUser.jsx'
import Home from './pages/Home.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import ChangePassword from './pages/ChangePassword.jsx'



function App() {
  const userData = getCurrentUser() // check karega ki redux me user ka hai ya nahi, warna backed me cookie se data mangaega
  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/signup' element={<SignUp />} />
      <Route path='/profile' element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path='/change-password' element={
        <ProtectedRoute>
          <ChangePassword />
        </ProtectedRoute>
      } />
      <Route path='/' element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App