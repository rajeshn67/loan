import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"

const API_URL = "/api/loans"

// Get all loans
export const getLoans = createAsyncThunk("loans/getLoans", async (_, { rejectWithValue, getState }) => {
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

// Create loan
export const createLoan = createAsyncThunk("loans/createLoan", async (loanData, { rejectWithValue, getState }) => {
  try {
    const token = getState().auth.token
    const response = await axios.post(API_URL, loanData, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data.message)
  }
})

// Assign loan to agent
export const assignLoan = createAsyncThunk(
  "loans/assignLoan",
  async ({ loanId, agentId }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token
      const response = await axios.put(
        `${API_URL}/${loanId}/assign`,
        { agentId },
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

const loanSlice = createSlice({
  name: "loans",
  initialState: {
    loans: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLoans.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getLoans.fulfilled, (state, action) => {
        state.isLoading = false
        state.loans = action.payload
      })
      .addCase(getLoans.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(createLoan.fulfilled, (state, action) => {
        state.loans.push(action.payload)
      })
      .addCase(assignLoan.fulfilled, (state, action) => {
        const index = state.loans.findIndex((loan) => loan._id === action.payload._id)
        if (index !== -1) {
          state.loans[index] = action.payload
        }
      })
  },
})

export const { clearError } = loanSlice.actions
export default loanSlice.reducer
