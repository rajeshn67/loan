"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Routes, Route } from "react-router-dom"
import { getLoans } from "../../store/slices/loanSlice"
import { loadUser, logout } from "../../store/slices/authSlice"
import AgentSidebar from "./AgentSidebar"
import AgentOverview from "./AgentOverview"
import AssignedLoans from "./AssignedLoans"
import LoanDetails from "./LoanDetails"
import PaymentCollection from "./PaymentCollection"
import { Users, LogOut } from "lucide-react"

const AgentDashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    dispatch(loadUser())
    dispatch(getLoans())
  }, [dispatch])

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-success-600 p-2 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Agent Portal</h1>
              <p className="text-sm text-gray-600">Loan Recovery Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-600">Agent ID: {user?.agentId}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <AgentSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<AgentOverview />} />
            <Route path="/loans" element={<AssignedLoans />} />
            <Route path="/loan/:id" element={<LoanDetails />} />
            <Route path="/collect/:id" element={<PaymentCollection />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default AgentDashboard
