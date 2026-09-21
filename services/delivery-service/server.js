const express = require("express");

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    service: "delivery-service",
    status: "healthy",
  });
});

// Assign a driver to an order
app.post("/api/delivery/assign", async (req, res) => {
  const { orderId, customerId, scenario = "normal" } = req.body;

  if (!orderId || !customerId) {
    return res.status(400).json({
      success: false,
      message: "orderId and customerId are required.",
    });
  }

  // Simulated delivery processing time
  await delay(100);

  // Simulate no available driver
  if (scenario === "no-driver") {
    return res.status(503).json({
      success: false,
      orderId,
      deliveryStatus: "waiting",
      message: "No delivery driver is currently available.",
    });
  }

  return res.status(200).json({
    success: true,
    orderId,
    customerId,
    deliveryStatus: "driver-assigned",
    driverId: "driver-101",
    estimatedDeliveryMinutes: 35,
  });
});

function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

app.listen(PORT, () => {
  console.log(`Delivery Service is running on http://localhost:${PORT}`);
});