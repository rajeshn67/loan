import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import loanReducer from "./slices/loanSlice"
import paymentReducer from "./slices/paymentSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    loans: loanReducer,
    payments: paymentReducer,
  },
})
