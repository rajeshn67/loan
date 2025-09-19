const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Register
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please include a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").isIn(["bank", "agent"]).withMessage("Role must be bank or agent"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg })
      }

      const { name, email, password, role } = req.body

      // Check if user exists
      let user = await User.findOne({ email })
      if (user) {
        return res.status(400).json({ message: "User already exists" })
      }

      // Create user
      user = new User({
        name,
        email,
        password,
        role,
        agentId: role === "agent" ? `AGT${Date.now()}` : undefined,
      })

      // Hash password
      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(password, salt)

      await user.save()

      // Create JWT token
      const payload = {
        id: user.id,
        role: user.role,
      }

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" })

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          agentId: user.agentId,
        },
      })
    } catch (error) {
      console.error(error.message)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please include a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg })
      }

      const { email, password } = req.body

      // Check if user exists
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" })
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" })
      }

      // Create JWT token
      const payload = {
        id: user.id,
        role: user.role,
      }

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" })

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          agentId: user.agentId,
        },
      })
    } catch (error) {
      console.error(error.message)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        agentId: req.user.agentId,
      },
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
