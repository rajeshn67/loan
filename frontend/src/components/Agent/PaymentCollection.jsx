"use client"

import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { ArrowLeft, CreditCard, Banknote, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { getLoans } from "../../store/slices/loanSlice"
import axios from "axios"

const PaymentCollection = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loans } = useSelector((state) => state.loans)
  const { token } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    amount: "",
    paymentMethod: "cash",
    transactionId: "",
    notes: "",
    upiId: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessingUPI, setIsProcessingUPI] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [paymentResult, setPaymentResult] = useState(null)

  const loan = loans.find((l) => l._id === id)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError("")
  }

  const processUPIPayment = async () => {
    if (!formData.upiId || !formData.amount) {
      setError("UPI ID and amount are required")
      return false
    }

    setIsProcessingUPI(true)
    try {
      const response = await axios.post(
        "/api/payments/upi/process",
        {
          amount: Number.parseFloat(formData.amount),
          upiId: formData.upiId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setPaymentResult(response.data)
      setFormData({
        ...formData,
        transactionId: response.data.transactionId,
      })
      return true
    } catch (error) {
      setError(error.response?.data?.message || "UPI payment failed")
      return false
    } finally {
      setIsProcessingUPI(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // For UPI payments, process through gateway first
      if (formData.paymentMethod === "upi" && !paymentResult) {
        const upiSuccess = await processUPIPayment()
        if (!upiSuccess) {
          setIsLoading(false)
          return
        }
      }

      const paymentData = {
        loanId: id,
        amount: Number.parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId || undefined,
        notes: formData.notes || undefined,
        upiId: formData.paymentMethod === "upi" ? formData.upiId : undefined,
      }

      const response = await axios.post("/api/payments", paymentData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setSuccess(true)
      dispatch(getLoans()) // Refresh loans data

      setTimeout(() => {
        navigate(`/agent/loan/${id}`)
      }, 2000)
    } catch (error) {
      setError(error.response?.data?.message || "Error recording payment")
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

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 text-center">
          <CheckCircle className="h-16 w-16 text-success-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Recorded Successfully!</h2>
          <p className="text-gray-600 mb-4">The payment has been processed and loan status updated.</p>
          {paymentResult && (
            <div className="bg-success-50 border border-success-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-success-700">
                Transaction ID: <span className="font-mono">{paymentResult.transactionId}</span>
              </p>
              <p className="text-sm text-success-700">Amount: ₹{paymentResult.amount?.toLocaleString()}</p>
            </div>
          )}
          <p className="text-sm text-gray-500">Redirecting to loan details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to={`/agent/loan/${id}`}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collect Payment</h1>
          <p className="text-gray-600">Record payment for {loan.borrowerName}</p>
        </div>
      </div>

      {/* Loan Summary */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Borrower</p>
            <p className="font-medium text-gray-900">{loan.borrowerName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Outstanding Amount</p>
            <p className="font-medium text-warning-600">₹{loan.outstandingAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="card p-8">
        {error && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-danger-600" />
            <span className="text-danger-700 text-sm">{error}</span>
          </div>
        )}

        {paymentResult && (
          <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-success-600" />
              <span className="text-success-700 font-medium">UPI Payment Processed</span>
            </div>
            <p className="text-sm text-success-700">Transaction ID: {paymentResult.transactionId}</p>
            <p className="text-sm text-success-700">Amount: ₹{paymentResult.amount?.toLocaleString()}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Amount (₹) *
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              required
              min="1"
              max={loan.outstandingAmount}
              step="0.01"
              className="input-field"
              placeholder="Enter payment amount"
              value={formData.amount}
              onChange={handleChange}
              disabled={paymentResult}
            />
            <p className="text-xs text-gray-600 mt-1">Maximum: ₹{loan.outstandingAmount.toLocaleString()}</p>
          </div>

          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.paymentMethod === "cash"}
                  onChange={handleChange}
                  className="sr-only"
                  disabled={paymentResult}
                />
                <div
                  className={`flex items-center gap-3 ${
                    formData.paymentMethod === "cash" ? "text-primary-600" : "text-gray-600"
                  }`}
                >
                  <Banknote className="h-5 w-5" />
                  <span className="font-medium">Cash</span>
                </div>
                {formData.paymentMethod === "cash" && (
                  <div className="ml-auto w-2 h-2 bg-primary-600 rounded-full"></div>
                )}
              </label>

              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={formData.paymentMethod === "upi"}
                  onChange={handleChange}
                  className="sr-only"
                  disabled={paymentResult}
                />
                <div
                  className={`flex items-center gap-3 ${
                    formData.paymentMethod === "upi" ? "text-primary-600" : "text-gray-600"
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="font-medium">UPI</span>
                </div>
                {formData.paymentMethod === "upi" && (
                  <div className="ml-auto w-2 h-2 bg-primary-600 rounded-full"></div>
                )}
              </label>
            </div>
          </div>

          {formData.paymentMethod === "upi" && (
            <>
              <div>
                <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-2">
                  UPI ID *
                </label>
                <input
                  id="upiId"
                  name="upiId"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Enter UPI ID (e.g., user@paytm)"
                  value={formData.upiId}
                  onChange={handleChange}
                  disabled={paymentResult}
                />
                <p className="text-xs text-gray-600 mt-1">Format: username@bankname</p>
              </div>

              {!paymentResult && (
                <button
                  type="button"
                  onClick={processUPIPayment}
                  disabled={isProcessingUPI || !formData.amount || !formData.upiId}
                  className="w-full btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessingUPI ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing UPI Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Process UPI Payment
                    </>
                  )}
                </button>
              )}

              {paymentResult && (
                <div>
                  <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction ID
                  </label>
                  <input
                    id="transactionId"
                    name="transactionId"
                    type="text"
                    className="input-field"
                    value={formData.transactionId}
                    readOnly
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="input-field"
              placeholder="Add any additional notes about the payment"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={isLoading || (formData.paymentMethod === "upi" && !paymentResult)}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Recording Payment...
                </>
              ) : (
                "Record Payment"
              )}
            </button>
            <Link to={`/agent/loan/${id}`} className="btn-secondary flex-1 text-center">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PaymentCollection
