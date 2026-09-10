import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env") });
dotenv.config({ path: resolve(process.cwd(), "../../.env") });

/** Blocky402 hosted testnet facilitator */
export const FACILITATOR_URL =
  process.env.BLOCKY402_FACILITATOR_URL || "https://api.testnet.blocky402.com";

export const HEDERA_NETWORK =
  (process.env.HEDERA_NETWORK as "testnet" | "mainnet") || "testnet";

export const HEDERA_CAIP2 =
  HEDERA_NETWORK === "mainnet" ? "hedera:mainnet" : "hedera:testnet";

/** Merchant / pay-to account (receives analysis fees) */
export const HEDERA_PAY_TO =
  process.env.HEDERA_PAY_TO || process.env.HEDERA_ACCOUNT_ID || "";

/**
 * Price per /analyze call.
 * 0.05 HBAR = 5_000_000 tinybars (1 HBAR = 1e8 tinybars).
 */
export const ANALYZE_PRICE_HBAR = Number(process.env.ANALYZE_PRICE_HBAR || "0.05");
export const ANALYZE_PRICE_TINYBARS = String(
  Math.round(ANALYZE_PRICE_HBAR * 100_000_000)
);

export const HBAR_ASSET_ID = "0.0.0";

export const API_PORT = Number(process.env.API_PORT || "4001");

export function assertPayToConfigured(): void {
  if (!HEDERA_PAY_TO || !/^0\.\d+\.\d+$/.test(HEDERA_PAY_TO)) {
    throw new Error(
      "HEDERA_PAY_TO or HEDERA_ACCOUNT_ID must be set to a Hedera account id (e.g. 0.0.12345)"
    );
  }
}
