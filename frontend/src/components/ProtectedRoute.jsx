import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

function ProtectedRoute({ children }) {
  const userData = useSelector(state => state.user.userData)

  if (!userData) {
    return <Navigate to="/login" />
  }

  return children
}

export default ProtectedRoute