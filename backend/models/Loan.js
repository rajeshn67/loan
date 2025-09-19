const mongoose = require("mongoose")

const loanSchema = new mongoose.Schema(
  {
    borrowerName: {
      type: String,
      required: true,
    },
    borrowerEmail: {
      type: String,
      required: true,
    },
    borrowerPhone: {
      type: String,
      required: true,
    },
    borrowerAddress: {
      type: String,
      required: true,
    },
    loanAmount: {
      type: Number,
      required: true,
    },
    outstandingAmount: {
      type: Number,
      required: true,
    },
    loanDate: {
      type: Date,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "assigned", "in_recovery", "recovered", "defaulted"],
      default: "pending",
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Loan", loanSchema)
