const express = require("express");
const axios = require("axios");
const { randomUUID } = require("crypto");

const app = express();

const PORT = process.env.PORT || 3000;

const RESTAURANT_SERVICE_URL =
  process.env.RESTAURANT_SERVICE_URL || "http://127.0.0.1:3001";

const PAYMENT_SERVICE_URL =
  process.env.PAYMENT_SERVICE_URL || "http://127.0.0.1:3002";

const DELIVERY_SERVICE_URL =
  process.env.DELIVERY_SERVICE_URL || "http://127.0.0.1:3003";

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    service: "order-service",
    status: "healthy",
  });
});

// Create an order
app.post("/api/orders", async (req, res) => {
  const {
    customerId,
    restaurantId,
    amount,
    scenario = "normal",
  } = req.body;

  if (
    !customerId ||
    !restaurantId ||
    typeof amount !== "number" ||
    amount <= 0
  ) {
    return res.status(400).json({
      success: false,
      message:
        "customerId, restaurantId and a positive amount are required.",
    });
  }

  const orderId = randomUUID();

  console.log(`Processing order: ${orderId}`);
  console.log(`Scenario: ${scenario}`);

  let restaurantResult;
  let paymentResult;

  // Step 1: Check restaurant availability
  try {
    const restaurantResponse = await axios.post(
      `${RESTAURANT_SERVICE_URL}/api/restaurant/check`,
      {
        orderId,
        restaurantId,
        scenario,
      },
      {
        timeout: 3000,
      }
    );

    restaurantResult = restaurantResponse.data;
  } catch (error) {
    console.error(`Restaurant check failed: ${error.message}`);

    if (error.response) {
      return res.status(409).json({
        success: false,
        orderId,
        orderStatus: "rejected",
        message: "The restaurant cannot accept this order.",
        restaurantError: error.response.data,
      });
    }

    return res.status(503).json({
      success: false,
      orderId,
      orderStatus: "failed",
      message: "Restaurant Service is unavailable.",
    });
  }

  // Step 2: Process payment
  try {
    const paymentResponse = await axios.post(
      `${PAYMENT_SERVICE_URL}/api/payments`,
      {
        orderId,
        amount,
        scenario,
      },
      {
        timeout: 8000,
      }
    );

    paymentResult = paymentResponse.data;
  } catch (error) {
    console.error(`Payment failed: ${error.message}`);

    if (error.response) {
      return res.status(502).json({
        success: false,
        orderId,
        orderStatus: "rejected",
        message: "The order failed because payment was unsuccessful.",
        restaurant: restaurantResult,
        paymentError: error.response.data,
      });
    }

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        success: false,
        orderId,
        orderStatus: "timeout",
        message: "Payment Service timed out.",
      });
    }

    return res.status(503).json({
      success: false,
      orderId,
      orderStatus: "failed",
      message: "Payment Service is unavailable.",
    });
  }

  // Step 3: Assign a delivery driver
  try {
    const deliveryResponse = await axios.post(
      `${DELIVERY_SERVICE_URL}/api/delivery/assign`,
      {
        orderId,
        customerId,
        scenario,
      },
      {
        timeout: 3000,
      }
    );

    return res.status(201).json({
      success: true,
      orderId,
      customerId,
      restaurantId,
      orderStatus: "confirmed",
      restaurant: restaurantResult,
      payment: paymentResult,
      delivery: deliveryResponse.data,
    });
  } catch (error) {
    console.error(`Delivery assignment failed: ${error.message}`);

    if (error.response) {
      return res.status(202).json({
        success: true,
        orderId,
        customerId,
        restaurantId,
        orderStatus: "confirmed",
        message:
          "The order and payment succeeded, but delivery assignment is pending.",
        restaurant: restaurantResult,
        payment: paymentResult,
        delivery: error.response.data,
      });
    }

    return res.status(503).json({
      success: false,
      orderId,
      orderStatus: "delivery-pending",
      message: "Delivery Service is unavailable.",
      restaurant: restaurantResult,
      payment: paymentResult,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Order Service is running on http://localhost:${PORT}`);
  console.log(`Restaurant Service URL: ${RESTAURANT_SERVICE_URL}`);
  console.log(`Payment Service URL: ${PAYMENT_SERVICE_URL}`);
  console.log(`Delivery Service URL: ${DELIVERY_SERVICE_URL}`);
});