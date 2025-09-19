const mongoose = require("mongoose")

const paymentSchema = new mongoose.Schema(
  {
    loanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Loan",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "upi"],
      required: true,
    },
    transactionId: {
      type: String,
    },
    upiId: {
      type: String,
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collectionDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Payment", paymentSchema)
