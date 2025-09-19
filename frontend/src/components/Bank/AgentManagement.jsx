"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Search, Users, FileText, DollarSign, TrendingUp } from "lucide-react"
import axios from "axios"

const AgentManagement = () => {
  const { token } = useSelector((state) => state.auth)
  const { loans } = useSelector((state) => state.loans)

  const [agents, setAgents] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await axios.get("/api/loans/agents", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setAgents(response.data)
    } catch (error) {
      console.error("Error fetching agents:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getAgentStats = (agentId) => {
    const agentLoans = loans.filter((loan) => loan.assignedAgent?._id === agentId)
    const totalLoans = agentLoans.length
    const recoveredLoans = agentLoans.filter((loan) => loan.status === "recovered").length
    const totalAmount = agentLoans.reduce((sum, loan) => sum + loan.loanAmount, 0)
    const recoveredAmount = agentLoans.reduce((sum, loan) => sum + (loan.loanAmount - loan.outstandingAmount), 0)
    const recoveryRate = totalLoans > 0 ? ((recoveredLoans / totalLoans) * 100).toFixed(1) : 0

    return {
      totalLoans,
      recoveredLoans,
      totalAmount,
      recoveredAmount,
      recoveryRate,
    }
  }

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.agentId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agent Management</h1>
        <p className="text-gray-600">Monitor recovery agent performance and assignments</p>
      </div>

      {/* Search */}
      <div className="card p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search agents by name or ID..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">Loading agents...</span>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No agents found</p>
          </div>
        ) : (
          filteredAgents.map((agent) => {
            const stats = getAgentStats(agent._id)
            return (
              <div key={agent._id} className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary-100 p-2 rounded-full">
                    <Users className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                    <p className="text-sm text-gray-600">{agent.agentId}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Assigned Loans</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{stats.totalLoans}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Recovery Rate</span>
                    </div>
                    <span className="text-sm font-medium text-success-600">{stats.recoveryRate}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Total Amount</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">₹{stats.totalAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Recovered</span>
                    </div>
                    <span className="text-sm font-medium text-success-600">
                      ₹{stats.recoveredAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Progress</span>
                    <span className="text-xs text-gray-600">
                      {stats.recoveredLoans}/{stats.totalLoans}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-success-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats.recoveryRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default AgentManagement
