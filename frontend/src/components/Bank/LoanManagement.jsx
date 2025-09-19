"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getLoans, assignLoan } from "../../store/slices/loanSlice"
import { Search, Filter, MapPin, Calendar, DollarSign, User } from "lucide-react"
import axios from "axios"

const LoanManagement = () => {
  const dispatch = useDispatch()
  const { loans, isLoading } = useSelector((state) => state.loans)
  const { token } = useSelector((state) => state.auth)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [agents, setAgents] = useState([])
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [selectedAgent, setSelectedAgent] = useState("")

  useEffect(() => {
    dispatch(getLoans())
    fetchAgents()
  }, [dispatch])

  const fetchAgents = async () => {
    try {
      const response = await axios.get("/api/loans/agents", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setAgents(response.data)
    } catch (error) {
      console.error("Error fetching agents:", error)
    }
  }

  const filteredLoans = loans.filter((loan) => {
    const matchesSearch =
      loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.borrowerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || loan.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAssignLoan = async () => {
    if (selectedLoan && selectedAgent) {
      await dispatch(assignLoan({ loanId: selectedLoan._id, agentId: selectedAgent }))
      setSelectedLoan(null)
      setSelectedAgent("")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-warning-100 text-warning-800"
      case "assigned":
        return "bg-primary-100 text-primary-800"
      case "in_recovery":
        return "bg-blue-100 text-blue-800"
      case "recovered":
        return "bg-success-100 text-success-800"
      case "defaulted":
        return "bg-danger-100 text-danger-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loan Management</h1>
          <p className="text-gray-600">Manage and assign loans to recovery agents</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by borrower name or email..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select className="input-field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_recovery">In Recovery</option>
              <option value="recovered">Recovered</option>
              <option value="defaulted">Defaulted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loans Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Borrower
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loan Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                      <span className="ml-2 text-gray-600">Loading loans...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-600">
                    No loans found
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => (
                  <tr key={loan._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{loan.borrowerName}</div>
                        <div className="text-sm text-gray-600">{loan.borrowerEmail}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {loan.borrowerAddress}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />₹{loan.loanAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Outstanding: ₹{loan.outstandingAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        Due: {new Date(loan.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(loan.status)}`}
                      >
                        {loan.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {loan.assignedAgent ? (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-900">{loan.assignedAgent.name}</span>
                          <span className="text-xs text-gray-600">({loan.assignedAgent.agentId})</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-600">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {loan.status === "pending" && (
                        <button
                          onClick={() => setSelectedLoan(loan)}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          Assign Agent
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Agent Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Agent to Loan</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Borrower: <span className="font-medium">{selectedLoan.borrowerName}</span>
              </p>
              <p className="text-sm text-gray-600">
                Amount: <span className="font-medium">₹{selectedLoan.loanAmount.toLocaleString()}</span>
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Agent</label>
              <select className="input-field" value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)}>
                <option value="">Choose an agent...</option>
                {agents.map((agent) => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name} ({agent.agentId})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAssignLoan}
                disabled={!selectedAgent}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                Assign
              </button>
              <button
                onClick={() => {
                  setSelectedLoan(null)
                  setSelectedAgent("")
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoanManagement
