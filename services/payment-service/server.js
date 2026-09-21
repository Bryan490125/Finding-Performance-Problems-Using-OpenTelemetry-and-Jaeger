const express = require("express");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Health-check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    service: "payment-service",
    status: "healthy",
  });
});

// Process a payment
app.post("/api/payments", async (req, res) => {
  const { orderId, amount, scenario = "normal" } = req.body;

  // Validate the request
  if (!orderId || typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "A valid orderId and positive amount are required.",
    });
  }

  // Simulate a payment failure
  if (scenario === "payment-error") {
    await delay(500);

    return res.status(502).json({
      success: false,
      orderId,
      paymentStatus: "failed",
      message: "The payment gateway rejected the payment.",
    });
  }

  // Simulate a slow payment service
  if (scenario === "slow-payment") {
    await delay(4500);
  } else {
    // Normal payment processing time
    await delay(200);
  }

  return res.status(200).json({
    success: true,
    orderId,
    amount,
    paymentStatus: "paid",
    scenario,
  });
});

function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

app.listen(PORT, () => {
  console.log(`Payment Service is running on http://localhost:${PORT}`);
});