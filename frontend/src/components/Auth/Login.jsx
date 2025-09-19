"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { login, clearError } from "../../store/slices/authSlice"
import { Building2, Users, AlertCircle } from "lucide-react"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const dispatch = useDispatch()
  const { isLoading, error } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(login(formData))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-600 p-3 rounded-full">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Loan Recovery System</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-danger-600" />
              <span className="text-danger-700 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Register here
              </Link>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="card p-4 text-center">
            <Building2 className="h-6 w-6 text-primary-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Bank Portal</h3>
            <p className="text-xs text-gray-600 mt-1">Manage loans and agents</p>
          </div>
          <div className="card p-4 text-center">
            <Users className="h-6 w-6 text-success-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Agent Portal</h3>
            <p className="text-xs text-gray-600 mt-1">Collect payments</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
