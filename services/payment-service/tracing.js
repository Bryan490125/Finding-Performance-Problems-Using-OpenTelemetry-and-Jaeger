const { NodeSDK } = require("@opentelemetry/sdk-node");

const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");

const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-http");

const {
  resourceFromAttributes,
} = require("@opentelemetry/resources");

const {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} = require("@opentelemetry/semantic-conventions");

const serviceName =
  process.env.OTEL_SERVICE_NAME || "unknown-service";

const exporterUrl =
  process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
  "http://127.0.0.1:4318/v1/traces";

const traceExporter = new OTLPTraceExporter({
  url: exporterUrl,
});

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: "1.0.0",
  }),

  traceExporter,

  instrumentations: [
    getNodeAutoInstrumentations(),
  ],
});

sdk.start();

console.log(`OpenTelemetry started for ${serviceName}`);
console.log(`Sending traces to ${exporterUrl}`);

async function shutdownOpenTelemetry() {
  try {
    await sdk.shutdown();
    console.log(`OpenTelemetry stopped for ${serviceName}`);
  } catch (error) {
    console.error("OpenTelemetry shutdown error:", error);
  }
}

process.once("SIGTERM", shutdownOpenTelemetry);
process.once("SIGINT", shutdownOpenTelemetry);