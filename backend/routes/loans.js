const express = require("express")
const { body, validationResult } = require("express-validator")
const Loan = require("../models/Loan")
const User = require("../models/User")
const { auth, authorize } = require("../middleware/auth")

const router = express.Router()

// Get all loans
router.get("/", auth, async (req, res) => {
  try {
    let loans

    if (req.user.role === "bank") {
      // Bank can see all loans
      loans = await Loan.find().populate("assignedAgent", "name agentId").sort({ createdAt: -1 })
    } else {
      // Agent can only see assigned loans
      loans = await Loan.find({ assignedAgent: req.user.id }).sort({ createdAt: -1 })
    }

    res.json(loans)
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ message: "Server error" })
  }
})

// Create loan (Bank only)
router.post(
  "/",
  [auth, authorize("bank")],
  [
    body("borrowerName").notEmpty().withMessage("Borrower name is required"),
    body("borrowerEmail").isEmail().withMessage("Valid email is required"),
    body("borrowerPhone").notEmpty().withMessage("Phone number is required"),
    body("borrowerAddress").notEmpty().withMessage("Address is required"),
    body("loanAmount").isNumeric().withMessage("Loan amount must be a number"),
    body("loanDate").isISO8601().withMessage("Valid loan date is required"),
    body("dueDate").isISO8601().withMessage("Valid due date is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg })
      }

      const { borrowerName, borrowerEmail, borrowerPhone, borrowerAddress, loanAmount, loanDate, dueDate } = req.body

      const loan = new Loan({
        borrowerName,
        borrowerEmail,
        borrowerPhone,
        borrowerAddress,
        loanAmount,
        outstandingAmount: loanAmount,
        loanDate,
        dueDate,
        createdBy: req.user.id,
      })

      await loan.save()
      res.json(loan)
    } catch (error) {
      console.error(error.message)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Assign loan to agent (Bank only)
router.put("/:id/assign", [auth, authorize("bank")], async (req, res) => {
  try {
    const { agentId } = req.body

    const agent = await User.findById(agentId)
    if (!agent || agent.role !== "agent") {
      return res.status(400).json({ message: "Invalid agent" })
    }

    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      { assignedAgent: agentId, status: "assigned" },
      { new: true },
    ).populate("assignedAgent", "name agentId")

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" })
    }

    res.json(loan)
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ message: "Server error" })
  }
})

// Get agents (Bank only)
router.get("/agents", [auth, authorize("bank")], async (req, res) => {
  try {
    const agents = await User.find({ role: "agent" }).select("name agentId")
    res.json(agents)
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
