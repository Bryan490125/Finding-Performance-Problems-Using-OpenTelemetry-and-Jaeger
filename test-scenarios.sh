#!/bin/bash

BASE_URL="http://127.0.0.1:3000"

echo "========================================"
echo "1. NORMAL ORDER TEST"
echo "========================================"

curl -sS -w "\nHTTP Status: %{http_code}\nTotal Time: %{time_total} seconds\n" \
-X POST "$BASE_URL/api/orders" \
-H "Content-Type: application/json" \
-d '{
  "customerId": "customer-normal",
  "restaurantId": "restaurant-001",
  "amount": 150,
  "scenario": "normal"
}'

echo
echo "Waiting for trace export..."
sleep 6

echo
echo "========================================"
echo "2. SLOW PAYMENT TEST"
echo "========================================"

curl -sS -w "\nHTTP Status: %{http_code}\nTotal Time: %{time_total} seconds\n" \
-X POST "$BASE_URL/api/orders" \
-H "Content-Type: application/json" \
-d '{
  "customerId": "customer-slow",
  "restaurantId": "restaurant-001",
  "amount": 200,
  "scenario": "slow-payment"
}'

echo
echo "Waiting for trace export..."
sleep 6

echo
echo "========================================"
echo "3. FAILED PAYMENT TEST"
echo "========================================"

curl -sS -w "\nHTTP Status: %{http_code}\nTotal Time: %{time_total} seconds\n" \
-X POST "$BASE_URL/api/orders" \
-H "Content-Type: application/json" \
-d '{
  "customerId": "customer-error",
  "restaurantId": "restaurant-001",
  "amount": 250,
  "scenario": "payment-error"
}'

echo
echo "Waiting for trace export..."
sleep 6

echo
echo "========================================"
echo "TESTS COMPLETED"
echo "Open Jaeger: http://127.0.0.1:16686"
echo "========================================"