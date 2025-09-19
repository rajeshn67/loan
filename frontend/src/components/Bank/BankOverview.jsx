import { useSelector } from "react-redux"
import { FileText, DollarSign, AlertTriangle, TrendingUp } from "lucide-react"
import DatabaseStats from "./DatabaseStats"

const BankOverview = () => {
  const { loans } = useSelector((state) => state.loans)

  // Calculate statistics
  const totalLoans = loans.length
  const pendingLoans = loans.filter((loan) => loan.status === "pending").length
  const assignedLoans = loans.filter((loan) => loan.status === "assigned").length
  const recoveredLoans = loans.filter((loan) => loan.status === "recovered").length
  const totalAmount = loans.reduce((sum, loan) => sum + loan.loanAmount, 0)
  const outstandingAmount = loans.reduce((sum, loan) => sum + loan.outstandingAmount, 0)
  const recoveredAmount = totalAmount - outstandingAmount

  const stats = [
    {
      name: "Total Loans",
      value: totalLoans,
      icon: FileText,
      color: "bg-primary-500",
      change: "+12%",
      changeType: "positive",
    },
    {
      name: "Outstanding Amount",
      value: `₹${outstandingAmount.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-warning-500",
      change: "-8%",
      changeType: "negative",
    },
    {
      name: "Recovered Amount",
      value: `₹${recoveredAmount.toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-success-500",
      change: "+15%",
      changeType: "positive",
    },
    {
      name: "Pending Assignment",
      value: pendingLoans,
      icon: AlertTriangle,
      color: "bg-danger-500",
      change: "-5%",
      changeType: "negative",
    },
  ]

  const recentLoans = loans.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Monitor your loan recovery operations</p>
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
            <div className="mt-4 flex items-center">
              <span
                className={`text-sm font-medium ${
                  stat.changeType === "positive" ? "text-success-600" : "text-danger-600"
                }`}
              >
                {stat.change}
              </span>
              <span className="text-sm text-gray-600 ml-2">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Status Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Pending Assignment</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{pendingLoans}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Assigned to Agents</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{assignedLoans}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Recovered</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{recoveredLoans}</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Loans</h3>
          <div className="space-y-3">
            {recentLoans.length > 0 ? (
              recentLoans.map((loan) => (
                <div
                  key={loan._id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{loan.borrowerName}</p>
                    <p className="text-xs text-gray-600">₹{loan.loanAmount.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        loan.status === "pending"
                          ? "bg-warning-100 text-warning-800"
                          : loan.status === "assigned"
                            ? "bg-primary-100 text-primary-800"
                            : loan.status === "recovered"
                              ? "bg-success-100 text-success-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {loan.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600 text-center py-4">No loans found</p>
            )}
          </div>
        </div>
      </div>

      {/* Database Statistics */}
      <DatabaseStats />
    </div>
  )
}

export default BankOverview
