"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { DollarSign, CreditCard, Banknote } from "lucide-react"
import axios from "axios"

const PaymentStats = () => {
  const { token } = useSelector((state) => state.auth)
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/payments/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setStats(response.data)
    } catch (error) {
      console.error("Error fetching payment stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="card p-6 text-center">
        <p className="text-gray-600">Unable to load payment statistics</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Payment Statistics</h3>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="bg-success-100 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Collected</p>
              <p className="text-lg font-bold text-gray-900">₹{stats.totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 p-2 rounded-lg">
              <Banknote className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Cash Payments</p>
              <p className="text-lg font-bold text-gray-900">₹{stats.cashPayments.amount.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{stats.cashPayments.count} transactions</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="bg-warning-100 p-2 rounded-lg">
              <CreditCard className="h-5 w-5 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">UPI Payments</p>
              <p className="text-lg font-bold text-gray-900">₹{stats.upiPayments.amount.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{stats.upiPayments.count} transactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      {stats.recentPayments.length > 0 && (
        <div className="card p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Recent Payments</h4>
          <div className="space-y-3">
            {stats.recentPayments.map((payment) => (
              <div
                key={payment._id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  {payment.paymentMethod === "cash" ? (
                    <Banknote className="h-4 w-4 text-primary-600" />
                  ) : (
                    <CreditCard className="h-4 w-4 text-warning-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">₹{payment.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">{payment.paymentMethod.toUpperCase()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">{new Date(payment.collectionDate).toLocaleDateString()}</p>
                  {payment.transactionId && (
                    <p className="text-xs text-gray-500 font-mono">{payment.transactionId.slice(-8)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentStats
