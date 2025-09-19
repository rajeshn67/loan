"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Database, Activity, Users, FileText, CreditCard, TrendingUp } from "lucide-react"
import axios from "axios"

const DatabaseStats = () => {
  const { token } = useSelector((state) => state.auth)
  const [stats, setStats] = useState(null)
  const [health, setHealth] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsResponse, healthResponse] = await Promise.all([
        axios.get("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/admin/health", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      setStats(statsResponse.data)
      setHealth(healthResponse.data)
    } catch (error) {
      console.error("Error fetching database info:", error)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Database className="h-5 w-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">Database Overview</h3>
      </div>

      {/* Database Health */}
      {health && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-success-600" />
            <h4 className="text-md font-semibold text-gray-900">Database Health</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className={`font-medium ${health.status === "connected" ? "text-success-600" : "text-danger-600"}`}>
                {health.status}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Host</p>
              <p className="font-medium text-gray-900">{health.host}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Database</p>
              <p className="font-medium text-gray-900">{health.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Database Statistics */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.users}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-3">
                <div className="bg-warning-100 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-warning-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Loans</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.loans}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-3">
                <div className="bg-success-100 p-2 rounded-lg">
                  <CreditCard className="h-5 w-5 text-success-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.payments}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Loans by Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Loans by Status</h4>
              <div className="space-y-3">
                {stats.loansByStatus.map((item) => (
                  <div key={item._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          item._id === "pending"
                            ? "bg-warning-500"
                            : item._id === "assigned"
                              ? "bg-primary-500"
                              : item._id === "in_recovery"
                                ? "bg-blue-500"
                                : item._id === "recovered"
                                  ? "bg-success-500"
                                  : "bg-gray-500"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-700 capitalize">{item._id.replace("_", " ")}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{item.count}</p>
                      <p className="text-xs text-gray-600">₹{item.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Payments by Method</h4>
              <div className="space-y-3">
                {stats.paymentsByMethod.map((item) => (
                  <div key={item._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {item._id === "cash" ? (
                        <div className="bg-primary-100 p-1 rounded">
                          <TrendingUp className="h-3 w-3 text-primary-600" />
                        </div>
                      ) : (
                        <div className="bg-warning-100 p-1 rounded">
                          <CreditCard className="h-3 w-3 text-warning-600" />
                        </div>
                      )}
                      <span className="text-sm text-gray-700 uppercase">{item._id}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{item.count}</p>
                      <p className="text-xs text-gray-600">₹{item.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default DatabaseStats
