"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Navigate } from "react-router-dom"
import { loadUser } from "../store/slices/authSlice"

const ProtectedRoute = ({ children, allowedRoles }) => {
  const dispatch = useDispatch()
  const { user, token } = useSelector((state) => state.auth)

  useEffect(() => {
    if (token && !user) {
      dispatch(loadUser())
    }
  }, [dispatch, token, user])

  if (!token) {
    return <Navigate to="/login" />
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />
  }

  return children
}

export default ProtectedRoute
