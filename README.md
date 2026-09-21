# Finding Performance Problems Using OpenTelemetry and Jaeger

A distributed food-delivery backend that demonstrates how OpenTelemetry and Jaeger can identify slow services and failed requests.

## Team Members

- Nyi Min Htet — 6622132
- Phone Maung — 6632110
- Kemmarat Kemsirirat — 6610914

## Project Problem

A food-delivery request travels through several backend services. When an order is slow or fails, separate application logs make it difficult to determine which service caused the problem.

This project uses OpenTelemetry to collect distributed traces and Jaeger to display and analyze the complete request journey.

## Architecture

The system contains four Node.js microservices:

1. Order Service — coordinates the order workflow
2. Restaurant Service — checks restaurant availability
3. Payment Service — processes or simulates payment
4. Delivery Service — assigns a delivery driver

Request flow:

Customer → Order Service → Restaurant Service → Payment Service → Delivery Service

OpenTelemetry exports the trace data to Jaeger using OTLP over HTTP.

## Ports

| Component | Port |
|---|---:|
| Order Service | 3000 |
| Restaurant Service | 3001 |
| Payment Service | 3002 |
| Delivery Service | 3003 |
| Jaeger UI | 16686 |
| OTLP gRPC | 4317 |
| OTLP HTTP | 4318 |

## Technologies

- Node.js
- Express
- Axios
- OpenTelemetry
- Jaeger 2.21
- Docker
- Docker Compose

## Run the Project

Requirements:

- Docker Desktop
- Docker Compose

Start the complete system:

```bash
docker compose up --build -d