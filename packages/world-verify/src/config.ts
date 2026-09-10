import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env") });
dotenv.config({ path: resolve(process.cwd(), "../../.env") });

export const WORLD_APP_ID = process.env.WORLD_APP_ID || "";
export const WORLD_RP_ID = process.env.WORLD_RP_ID || "";
export const WORLD_RP_SIGNING_KEY = process.env.WORLD_RP_SIGNING_KEY || "";
export const WORLD_ACTION = process.env.WORLD_ACTION || "agentpass-human-gate";
/** staging = simulator / sandbox testing; production = live World App */
export const WORLD_ENV = (process.env.WORLD_ENV || "sandbox") as
  | "sandbox"
  | "staging"
  | "production";

/**
 * When true (and portal keys are missing), allow a clearly labeled local sandbox
 * credential for UX demos. Real portal verification is preferred.
 */
export const WORLD_ALLOW_SANDBOX_DEMO =
  process.env.WORLD_ALLOW_SANDBOX_DEMO === "true" ||
  (!WORLD_APP_ID && process.env.NODE_ENV !== "production");

export const AGENT_WALLET_ADDRESS =
  (process.env.AGENT_WALLET_ADDRESS || process.env.PRIVATE_KEY_ADDRESS || "") as
    | `0x${string}`
    | "";

export function isWorldPortalConfigured(): boolean {
  return Boolean(WORLD_APP_ID && WORLD_RP_ID && WORLD_RP_SIGNING_KEY);
}

export function idkitEnvironment(): "staging" | "production" {
  if (WORLD_ENV === "production") return "production";
  return "staging"; // sandbox + staging both use simulator-friendly staging
}
