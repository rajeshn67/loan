// Simple payment gateway simulation for UPI payments
// In production, integrate with actual payment gateways like Razorpay, Paytm, etc.

const generateTransactionId = () => {
  return `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}

const simulateUPIPayment = async (amount, upiId) => {
  // Simulate payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Simulate 95% success rate
  const isSuccess = Math.random() > 0.05

  if (isSuccess) {
    return {
      success: true,
      transactionId: generateTransactionId(),
      amount: amount,
      timestamp: new Date(),
      method: "UPI",
      upiId: upiId,
    }
  } else {
    throw new Error("Payment failed. Please try again.")
  }
}

const validateUPIId = (upiId) => {
  // Basic UPI ID validation
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/
  return upiRegex.test(upiId)
}

module.exports = {
  generateTransactionId,
  simulateUPIPayment,
  validateUPIId,
}
