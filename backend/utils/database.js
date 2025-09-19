const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log(`MongoDB Connected: ${conn.connection.host}`)

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err)
    })

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected")
    })

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close()
      console.log("MongoDB connection closed through app termination")
      process.exit(0)
    })
  } catch (error) {
    console.error("Database connection failed:", error)
    process.exit(1)
  }
}

// Database health check
const checkDBHealth = async () => {
  try {
    const state = mongoose.connection.readyState
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    }

    return {
      status: states[state],
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      collections: Object.keys(mongoose.connection.collections),
    }
  } catch (error) {
    return {
      status: "error",
      error: error.message,
    }
  }
}

// Get database statistics
const getDBStats = async () => {
  try {
    const User = require("../models/User")
    const Loan = require("../models/Loan")
    const Payment = require("../models/Payment")

    const [userCount, loanCount, paymentCount] = await Promise.all([
      User.countDocuments(),
      Loan.countDocuments(),
      Payment.countDocuments(),
    ])

    const loanStats = await Loan.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$loanAmount" },
          outstandingAmount: { $sum: "$outstandingAmount" },
        },
      },
    ])

    const paymentStats = await Payment.aggregate([
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ])

    return {
      users: userCount,
      loans: loanCount,
      payments: paymentCount,
      loansByStatus: loanStats,
      paymentsByMethod: paymentStats,
    }
  } catch (error) {
    throw new Error(`Error getting database stats: ${error.message}`)
  }
}

module.exports = {
  connectDB,
  checkDBHealth,
  getDBStats,
}
