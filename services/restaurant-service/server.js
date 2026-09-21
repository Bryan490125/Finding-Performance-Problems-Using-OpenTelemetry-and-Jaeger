const express = require("express");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    service: "restaurant-service",
    status: "healthy",
  });
});

// Check whether a restaurant can accept an order
app.post("/api/restaurant/check", async (req, res) => {
  const { orderId, restaurantId, scenario = "normal" } = req.body;

  if (!orderId || !restaurantId) {
    return res.status(400).json({
      success: false,
      message: "orderId and restaurantId are required.",
    });
  }

  // Simulated restaurant processing time
  await delay(300);

  // Simulate an unavailable restaurant
  if (scenario === "restaurant-unavailable") {
    return res.status(409).json({
      success: false,
      orderId,
      restaurantId,
      availabilityStatus: "unavailable",
      message: "The restaurant is currently unable to accept the order.",
    });
  }

  return res.status(200).json({
    success: true,
    orderId,
    restaurantId,
    availabilityStatus: "available",
    estimatedPreparationMinutes: 20,
  });
});

function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

app.listen(PORT, () => {
  console.log(`Restaurant Service is running on http://localhost:${PORT}`);
});