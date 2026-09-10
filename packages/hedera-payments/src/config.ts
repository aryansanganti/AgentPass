import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env") });
dotenv.config({ path: resolve(process.cwd(), "../../.env") });

export const FACILITATOR_URL =
  process.env.BLOCKY402_FACILITATOR_URL || "https://api.testnet.blocky402.com";

export const HEDERA_ACCOUNT_ID = process.env.HEDERA_ACCOUNT_ID || "";
export const HEDERA_PRIVATE_KEY = process.env.HEDERA_PRIVATE_KEY || "";
export const HEDERA_NETWORK =
  (process.env.HEDERA_NETWORK as "testnet" | "mainnet") || "testnet";
export const HEDERA_CAIP2 =
  HEDERA_NETWORK === "mainnet" ? "hedera:mainnet" : "hedera:testnet";

/** Session budget in HBAR (agent declines if price would exceed remaining) */
export const DEFAULT_SESSION_BUDGET_HBAR = Number(
  process.env.AGENT_SESSION_BUDGET_HBAR || "1"
);

export const ANALYZE_API_URL =
  process.env.ANALYZE_API_URL || "http://localhost:4001/analyze";

export const HCS_TOPIC_ID = process.env.HCS_TOPIC_ID || "";

export function assertPayerConfigured(): void {
  if (!HEDERA_ACCOUNT_ID || !HEDERA_PRIVATE_KEY) {
    throw new Error(
      "HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be set (portal.hedera.com testnet account)"
    );
  }
}
