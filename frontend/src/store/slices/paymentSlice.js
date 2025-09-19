import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"

const API_URL = "/api/payments"

// Get all payments
export const getPayments = createAsyncThunk("payments/getPayments", async (_, { rejectWithValue, getState }) => {
  try {
    const token = getState().auth.token
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data.message)
  }
})

// Create payment
export const createPayment = createAsyncThunk(
  "payments/createPayment",
  async (paymentData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token
      const response = await axios.post(API_URL, paymentData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data.message)
    }
  },
)

// Process UPI payment
export const processUPIPayment = createAsyncThunk(
  "payments/processUPIPayment",
  async ({ loanId, amount, upiId }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token
      const response = await axios.post(
        `${API_URL}/upi`,
        { loanId, amount, upiId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data.message)
    }
  },
)

// Get payment statistics
export const getPaymentStats = createAsyncThunk(
  "payments/getPaymentStats",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token
      const response = await axios.get(`${API_URL}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data.message)
    }
  },
)

// Get payments by loan
export const getPaymentsByLoan = createAsyncThunk(
  "payments/getPaymentsByLoan",
  async (loanId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token
      const response = await axios.get(`${API_URL}/loan/${loanId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data.message)
    }
  },
)

const paymentSlice = createSlice({
  name: "payments",
  initialState: {
    payments: [],
    stats: {
      totalCollected: 0,
      totalPending: 0,
      cashPayments: 0,
      upiPayments: 0,
      monthlyCollection: 0,
    },
    loanPayments: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearLoanPayments: (state) => {
      state.loanPayments = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Get payments
      .addCase(getPayments.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getPayments.fulfilled, (state, action) => {
        state.isLoading = false
        state.payments = action.payload
      })
      .addCase(getPayments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Create payment
      .addCase(createPayment.pending, (state) => {
        state.isLoading = true
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.isLoading = false
        state.payments.unshift(action.payload)
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Process UPI payment
      .addCase(processUPIPayment.pending, (state) => {
        state.isLoading = true
      })
      .addCase(processUPIPayment.fulfilled, (state, action) => {
        state.isLoading = false
        state.payments.unshift(action.payload)
      })
      .addCase(processUPIPayment.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Get payment stats
      .addCase(getPaymentStats.fulfilled, (state, action) => {
        state.stats = action.payload
      })
      // Get payments by loan
      .addCase(getPaymentsByLoan.fulfilled, (state, action) => {
        state.loanPayments = action.payload
      })
  },
})

export const { clearError, clearLoanPayments } = paymentSlice.actions
export default paymentSlice.reducer
