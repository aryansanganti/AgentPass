import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { paymentMiddleware, x402ResourceServer } from "@x402/hono";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactHederaScheme } from "@x402/hedera/exact/server";
import {
  API_PORT,
  ANALYZE_PRICE_TINYBARS,
  assertPayToConfigured,
  FACILITATOR_URL,
  HBAR_ASSET_ID,
  HEDERA_CAIP2,
  HEDERA_PAY_TO,
} from "./x402-config";
import { analyzeRoutes } from "./routes/analyze";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "X-PAYMENT", "PAYMENT-SIGNATURE", "X-PAYMENT-RESPONSE"],
    exposeHeaders: ["PAYMENT-RESPONSE", "X-PAYMENT-RESPONSE"],
  })
);

app.get("/health", (c) =>
  c.json({
    ok: true,
    service: "agentpass-api",
    facilitator: FACILITATOR_URL,
    network: HEDERA_CAIP2,
    priceTinybars: ANALYZE_PRICE_TINYBARS,
    payTo: HEDERA_PAY_TO,
  })
);

const facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });
const resourceServer = new x402ResourceServer(facilitatorClient).register(
  "hedera:*",
  new ExactHederaScheme({
    defaultAssets: {
      "hedera:testnet": { asset: HBAR_ASSET_ID, decimals: 8 },
      "hedera:mainnet": { asset: HBAR_ASSET_ID, decimals: 8 },
    },
  })
);

app.use(
  paymentMiddleware(
    {
      "POST /analyze": {
        accepts: {
          scheme: "exact",
          price: { amount: ANALYZE_PRICE_TINYBARS, asset: HBAR_ASSET_ID },
          network: HEDERA_CAIP2,
          payTo: HEDERA_PAY_TO,
          maxTimeoutSeconds: 300,
        },
        description: "AgentPass DeFi risk analysis (The Graph + risk engine)",
        mimeType: "application/json",
      },
    },
    resourceServer
  )
);

app.route("/analyze", analyzeRoutes);

if (process.env.DEMO_MODE === "false") {
  assertPayToConfigured();
}

console.log(`AgentPass API listening on http://localhost:${API_PORT}`);
console.log(`  POST /analyze  → x402 gated @ ${ANALYZE_PRICE_TINYBARS} tinybars HBAR`);
console.log(`  Facilitator    → ${FACILITATOR_URL}`);
console.log(`  Pay to         → ${HEDERA_PAY_TO}`);

serve({ fetch: app.fetch, port: API_PORT });
