const express = require("express")
const { body, validationResult } = require("express-validator")
const Payment = require("../models/Payment")
const Loan = require("../models/Loan")
const { auth, authorize } = require("../middleware/auth")
const { simulateUPIPayment, validateUPIId, generateTransactionId } = require("../utils/paymentGateway")

const router = express.Router()

// Record payment (Agent only)
router.post(
  "/",
  [auth, authorize("agent")],
  [
    body("loanId").notEmpty().withMessage("Loan ID is required"),
    body("amount").isNumeric().withMessage("Amount must be a number"),
    body("paymentMethod").isIn(["cash", "upi"]).withMessage("Payment method must be cash or upi"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg })
      }

      const { loanId, amount, paymentMethod, transactionId, notes, upiId } = req.body

      // Check if loan exists and is assigned to this agent
      const loan = await Loan.findOne({ _id: loanId, assignedAgent: req.user.id })
      if (!loan) {
        return res.status(404).json({ message: "Loan not found or not assigned to you" })
      }

      let paymentResult = {
        transactionId: transactionId || generateTransactionId(),
        success: true,
      }

      // Process UPI payment through gateway
      if (paymentMethod === "upi") {
        if (!upiId) {
          return res.status(400).json({ message: "UPI ID is required for UPI payments" })
        }

        if (!validateUPIId(upiId)) {
          return res.status(400).json({ message: "Invalid UPI ID format" })
        }

        try {
          paymentResult = await simulateUPIPayment(amount, upiId)
        } catch (error) {
          return res.status(400).json({ message: error.message })
        }
      }

      // Create payment record
      const payment = new Payment({
        loanId,
        amount,
        paymentMethod,
        transactionId: paymentResult.transactionId,
        notes,
        collectedBy: req.user.id,
        upiId: paymentMethod === "upi" ? upiId : undefined,
      })

      await payment.save()

      // Update loan outstanding amount
      const newOutstanding = Math.max(0, loan.outstandingAmount - amount)
      loan.outstandingAmount = newOutstanding
      loan.status = newOutstanding === 0 ? "recovered" : "in_recovery"
      await loan.save()

      res.json({
        payment,
        paymentResult,
        loanStatus: loan.status,
        remainingAmount: newOutstanding,
      })
    } catch (error) {
      console.error(error.message)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Process UPI payment (Agent only)
router.post(
  "/upi/process",
  [auth, authorize("agent")],
  [
    body("amount").isNumeric().withMessage("Amount must be a number"),
    body("upiId").notEmpty().withMessage("UPI ID is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg })
      }

      const { amount, upiId } = req.body

      if (!validateUPIId(upiId)) {
        return res.status(400).json({ message: "Invalid UPI ID format" })
      }

      try {
        const paymentResult = await simulateUPIPayment(amount, upiId)
        res.json(paymentResult)
      } catch (error) {
        res.status(400).json({ message: error.message })
      }
    } catch (error) {
      console.error(error.message)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get payments for a loan
router.get("/loan/:loanId", auth, async (req, res) => {
  try {
    const { loanId } = req.params

    // Check if user has access to this loan
    let loan
    if (req.user.role === "bank") {
      loan = await Loan.findById(loanId)
    } else {
      loan = await Loan.findOne({ _id: loanId, assignedAgent: req.user.id })
    }

    if (!loan) {
      return res.status(404).json({ message: "Loan not found or access denied" })
    }

    const payments = await Payment.find({ loanId }).populate("collectedBy", "name agentId").sort({ createdAt: -1 })
    res.json(payments)
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ message: "Server error" })
  }
})

// Get payment statistics (Agent only)
router.get("/stats", [auth, authorize("agent")], async (req, res) => {
  try {
    const payments = await Payment.find({ collectedBy: req.user.id })

    const totalCollected = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const cashPayments = payments.filter((p) => p.paymentMethod === "cash")
    const upiPayments = payments.filter((p) => p.paymentMethod === "upi")

    const stats = {
      totalPayments: payments.length,
      totalAmount: totalCollected,
      cashPayments: {
        count: cashPayments.length,
        amount: cashPayments.reduce((sum, p) => sum + p.amount, 0),
      },
      upiPayments: {
        count: upiPayments.length,
        amount: upiPayments.reduce((sum, p) => sum + p.amount, 0),
      },
      recentPayments: payments.slice(0, 5),
    }

    res.json(stats)
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
