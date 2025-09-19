"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { Search, Filter, MapPin, Calendar, DollarSign, Phone, Eye, CreditCard } from "lucide-react"

const AssignedLoans = () => {
  const { loans, isLoading } = useSelector((state) => state.loans)
  const { user } = useSelector((state) => state.auth)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Filter loans assigned to this agent (handles both populated and raw ObjectId)
  const myLoans = loans.filter((loan) => {
    const assigned = loan.assignedAgent
    const assignedId = typeof assigned === "string" ? assigned : assigned?._id
    return assignedId === user?.id
  })

  const filteredLoans = myLoans.filter((loan) => {
    const matchesSearch =
      loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.borrowerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.borrowerPhone.includes(searchTerm)
    const matchesStatus = statusFilter === "all" || loan.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "assigned":
        return "bg-primary-100 text-primary-800"
      case "in_recovery":
        return "bg-warning-100 text-warning-800"
      case "recovered":
        return "bg-success-100 text-success-800"
      case "defaulted":
        return "bg-danger-100 text-danger-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getUrgencyColor = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) return "text-danger-600"
    if (diffDays <= 7) return "text-warning-600"
    return "text-gray-600"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assigned Loans</h1>
        <p className="text-gray-600">Manage your loan recovery assignments</p>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
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
              <option value="assigned">Assigned</option>
              <option value="in_recovery">In Recovery</option>
              <option value="recovered">Recovered</option>
              <option value="defaulted">Defaulted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-success-600"></div>
            <span className="ml-3 text-gray-600">Loading loans...</span>
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">
              <DollarSign className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-600">No loans found matching your criteria</p>
          </div>
        ) : (
          filteredLoans.map((loan) => {
            const dueDate = new Date(loan.dueDate)
            const today = new Date()
            const diffTime = dueDate - today
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            return (
              <div key={loan._id} className="card p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{loan.borrowerName}</h3>
                    <p className="text-sm text-gray-600">{loan.borrowerEmail}</p>
                  </div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(loan.status)}`}
                  >
                    {loan.status.replace("_", " ")}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{loan.borrowerPhone}</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-sm text-gray-700">{loan.borrowerAddress}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      Outstanding: <span className="font-medium">₹{loan.outstandingAmount.toLocaleString()}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className={`text-sm ${getUrgencyColor(loan.dueDate)}`}>
                      Due: {dueDate.toLocaleDateString()}
                      {diffDays <= 0 && <span className="font-medium ml-1">(Overdue)</span>}
                      {diffDays > 0 && diffDays <= 7 && (
                        <span className="font-medium ml-1">({diffDays} days left)</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/agent/loan/${loan._id}`}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Link>
                  {loan.status !== "recovered" && (
                    <Link
                      to={`/agent/collect/${loan._id}`}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      Collect Payment
                    </Link>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default AssignedLoans
