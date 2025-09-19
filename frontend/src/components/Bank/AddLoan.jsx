"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { createLoan } from "../../store/slices/loanSlice"
import { useNavigate } from "react-router-dom"
import { AlertCircle, CheckCircle } from "lucide-react"

const AddLoan = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoading, error } = useSelector((state) => state.loans)

  const [formData, setFormData] = useState({
    borrowerName: "",
    borrowerEmail: "",
    borrowerPhone: "",
    borrowerAddress: "",
    loanAmount: "",
    loanDate: "",
    dueDate: "",
  })
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await dispatch(createLoan(formData)).unwrap()
      setSuccess(true)
      setTimeout(() => {
        navigate("/bank/loans")
      }, 2000)
    } catch (error) {
      console.error("Error creating loan:", error)
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 text-center">
          <CheckCircle className="h-16 w-16 text-success-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loan Added Successfully!</h2>
          <p className="text-gray-600 mb-4">The loan has been created and is ready for agent assignment.</p>
          <p className="text-sm text-gray-500">Redirecting to loan management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Loan</h1>
        <p className="text-gray-600">Create a new loan record for recovery</p>
      </div>

      <div className="card p-8">
        {error && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-danger-600" />
            <span className="text-danger-700 text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Borrower Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Borrower Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="borrowerName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  id="borrowerName"
                  name="borrowerName"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Enter borrower's full name"
                  value={formData.borrowerName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="borrowerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  id="borrowerEmail"
                  name="borrowerEmail"
                  type="email"
                  required
                  className="input-field"
                  placeholder="Enter email address"
                  value={formData.borrowerEmail}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="borrowerPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                id="borrowerPhone"
                name="borrowerPhone"
                type="tel"
                required
                className="input-field"
                placeholder="Enter phone number"
                value={formData.borrowerPhone}
                onChange={handleChange}
              />
            </div>

            <div className="mt-4">
              <label htmlFor="borrowerAddress" className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                id="borrowerAddress"
                name="borrowerAddress"
                rows={3}
                required
                className="input-field"
                placeholder="Enter complete address"
                value={formData.borrowerAddress}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Loan Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Amount (₹) *
                </label>
                <input
                  id="loanAmount"
                  name="loanAmount"
                  type="number"
                  required
                  min="1"
                  className="input-field"
                  placeholder="Enter loan amount"
                  value={formData.loanAmount}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="loanDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Date *
                </label>
                <input
                  id="loanDate"
                  name="loanDate"
                  type="date"
                  required
                  className="input-field"
                  value={formData.loanDate}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date *
                </label>
                <input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  required
                  className="input-field"
                  value={formData.dueDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Loan..." : "Create Loan"}
            </button>
            <button type="button" onClick={() => navigate("/bank/loans")} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddLoan
