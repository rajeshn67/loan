import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { FileText, DollarSign, TrendingUp, Clock, MapPin } from "lucide-react"
import PaymentStats from "./PaymentStats"

const AgentOverview = () => {
  const { loans } = useSelector((state) => state.loans)
  const { user } = useSelector((state) => state.auth)

  // Filter loans assigned to this agent (handles both populated and raw ObjectId)
  const myLoans = loans.filter((loan) => {
    const assigned = loan.assignedAgent
    const assignedId = typeof assigned === "string" ? assigned : assigned?._id
    return assignedId === user?.id
  })

  // Calculate statistics
  const totalAssigned = myLoans.length
  const inRecovery = myLoans.filter((loan) => loan.status === "in_recovery").length
  const recovered = myLoans.filter((loan) => loan.status === "recovered").length
  const pending = myLoans.filter((loan) => loan.status === "assigned").length

  const totalAmount = myLoans.reduce((sum, loan) => sum + loan.loanAmount, 0)
  const outstandingAmount = myLoans.reduce((sum, loan) => sum + loan.outstandingAmount, 0)
  const recoveredAmount = totalAmount - outstandingAmount
  const recoveryRate = totalAssigned > 0 ? ((recovered / totalAssigned) * 100).toFixed(1) : 0

  const stats = [
    {
      name: "Assigned Loans",
      value: totalAssigned,
      icon: FileText,
      color: "bg-primary-500",
    },
    {
      name: "Recovery Rate",
      value: `${recoveryRate}%`,
      icon: TrendingUp,
      color: "bg-success-500",
    },
    {
      name: "Outstanding Amount",
      value: `₹${outstandingAmount.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-warning-500",
    },
    {
      name: "Recovered Amount",
      value: `₹${recoveredAmount.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-success-500",
    },
  ]

  const urgentLoans = myLoans
    .filter((loan) => {
      const dueDate = new Date(loan.dueDate)
      const today = new Date()
      const diffTime = dueDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 7 && loan.status !== "recovered"
    })
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600">Here's your recovery dashboard overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Overview */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Status Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Pending Collection</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                <span className="text-sm text-gray-700">In Recovery</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{inRecovery}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Recovered</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{recovered}</span>
            </div>
          </div>
        </div>

        {/* Urgent Collections */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Urgent Collections</h3>
            <Clock className="h-5 w-5 text-warning-500" />
          </div>
          <div className="space-y-3">
            {urgentLoans.length > 0 ? (
              urgentLoans.map((loan) => {
                const dueDate = new Date(loan.dueDate)
                const today = new Date()
                const diffTime = dueDate - today
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                return (
                  <div
                    key={loan._id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{loan.borrowerName}</p>
                      <p className="text-xs text-gray-600">₹{loan.outstandingAmount.toLocaleString()}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <p className="text-xs text-gray-600 truncate max-w-[150px]">{loan.borrowerAddress}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          diffDays <= 0
                            ? "bg-danger-100 text-danger-800"
                            : diffDays <= 3
                              ? "bg-warning-100 text-warning-800"
                              : "bg-primary-100 text-primary-800"
                        }`}
                      >
                        {diffDays <= 0 ? "Overdue" : `${diffDays} days`}
                      </span>
                      <Link
                        to={`/agent/loan/${loan._id}`}
                        className="block text-xs text-primary-600 hover:text-primary-700 mt-1"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-gray-600 text-center py-4">No urgent collections</p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Statistics */}
      <PaymentStats />

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link to="/agent/loans" className="btn-primary">
            View All Loans
          </Link>
          {myLoans.length > 0 && (
            <Link
              to={`/agent/loan/${myLoans.find((loan) => loan.status !== "recovered")?._id || myLoans[0]._id}`}
              className="btn-secondary"
            >
              Start Collection
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default AgentOverview
