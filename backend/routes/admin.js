const express = require("express")
const { auth, authorize } = require("../middleware/auth")
const { checkDBHealth, getDBStats } = require("../utils/database")

const router = express.Router()

// Database health check (Bank only)
router.get("/health", [auth, authorize("bank")], async (req, res) => {
  try {
    const health = await checkDBHealth()
    res.json(health)
  } catch (error) {
    res.status(500).json({ message: "Error checking database health", error: error.message })
  }
})

// Database statistics (Bank only)
router.get("/stats", [auth, authorize("bank")], async (req, res) => {
  try {
    const stats = await getDBStats()
    res.json(stats)
  } catch (error) {
    res.status(500).json({ message: "Error getting database statistics", error: error.message })
  }
})

module.exports = router
