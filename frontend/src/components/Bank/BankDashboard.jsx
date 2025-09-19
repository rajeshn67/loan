"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Routes, Route } from "react-router-dom"
import { getLoans } from "../../store/slices/loanSlice"
import { loadUser, logout } from "../../store/slices/authSlice"
import BankSidebar from "./BankSidebar"
import BankOverview from "./BankOverview"
import LoanManagement from "./LoanManagement"
import AddLoan from "./AddLoan"
import AgentManagement from "./AgentManagement"
import { Building2, LogOut } from "lucide-react"

const BankDashboard = () => {
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
            <div className="bg-primary-600 p-2 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Bank Portal</h1>
              <p className="text-sm text-gray-600">Loan Recovery Management</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-600">Bank Staff</p>
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
        <BankSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<BankOverview />} />
            <Route path="/loans" element={<LoanManagement />} />
            <Route path="/add-loan" element={<AddLoan />} />
            <Route path="/agents" element={<AgentManagement />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default BankDashboard
