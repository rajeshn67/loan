"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { ArrowLeft, MapPin, Phone, Mail, Calendar, CreditCard, History } from "lucide-react"
import axios from "axios"

const LoanDetails = () => {
  const { id } = useParams()
  const { loans } = useSelector((state) => state.loans)
  const { token } = useSelector((state) => state.auth)

  const [payments, setPayments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const loan = loans.find((l) => l._id === id)

  useEffect(() => {
    if (loan) {
      fetchPayments()
    }
  }, [loan])

  const fetchPayments = async () => {
    try {
      const response = await axios.get(`/api/payments/loan/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPayments(response.data)
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!loan) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loan not found</p>
        <Link to="/agent/loans" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          Back to Loans
        </Link>
      </div>
    )
  }

  const dueDate = new Date(loan.dueDate)
  const today = new Date()
  const diffTime = dueDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/agent/loans"
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loan Details</h1>
          <p className="text-gray-600">Complete information and payment history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Borrower Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Borrower Information</h2>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(loan.status)}`}>
                {loan.status.replace("_", " ")}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{loan.borrowerName}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{loan.borrowerEmail}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{loan.borrowerPhone}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Address</h4>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-700">{loan.borrowerAddress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-6">
              <History className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                <span className="ml-2 text-gray-600">Loading payments...</span>
              </div>
            ) : payments.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No payments recorded yet</p>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-success-600" />
                        <span className="font-medium text-gray-900">₹{payment.amount.toLocaleString()}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {new Date(payment.collectionDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Method: {payment.paymentMethod.toUpperCase()}</span>
                      {payment.transactionId && <span>ID: {payment.transactionId}</span>}
                    </div>
                    {payment.notes && <p className="text-sm text-gray-600 mt-2">{payment.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Loan Summary */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Loan Summary</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Original Amount</span>
                <span className="font-medium text-gray-900">₹{loan.loanAmount.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Outstanding</span>
                <span className="font-medium text-warning-600">₹{loan.outstandingAmount.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Recovered</span>
                <span className="font-medium text-success-600">
                  ₹{(loan.loanAmount - loan.outstandingAmount).toLocaleString()}
                </span>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Due Date</span>
                </div>
                <p
                  className={`text-sm font-medium ${
                    diffDays <= 0 ? "text-danger-600" : diffDays <= 7 ? "text-warning-600" : "text-gray-900"
                  }`}
                >
                  {dueDate.toLocaleDateString()}
                  {diffDays <= 0 && " (Overdue)"}
                  {diffDays > 0 && diffDays <= 7 && ` (${diffDays} days left)`}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Recovery Progress</span>
                <span className="text-sm text-gray-600">
                  {(((loan.loanAmount - loan.outstandingAmount) / loan.loanAmount) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-success-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((loan.loanAmount - loan.outstandingAmount) / loan.loanAmount) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {loan.status !== "recovered" && (
              <Link
                to={`/agent/collect/${loan._id}`}
                className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Collect Payment
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoanDetails
