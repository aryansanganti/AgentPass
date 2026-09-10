// @agentpass/world-verify
// World ID Sandbox / AgentKit human verification — gates Hedera budget + ENS OPERATOR

export const WORLD_PACKAGE_VERSION = "0.1.0";

export type { WorldCredential } from "./types";
export { NotHumanBackedError } from "./types";

export {
  WORLD_APP_ID,
  WORLD_RP_ID,
  WORLD_ACTION,
  WORLD_ENV,
  WORLD_ALLOW_SANDBOX_DEMO,
  AGENT_WALLET_ADDRESS,
  isWorldPortalConfigured,
  idkitEnvironment,
} from "./config";

export { isHumanBacked, requireHumanBacked, hashCredentialMaterial, newSessionId } from "./gate";

export {
  createSession,
  getSession,
  clearSession,
  listNullifiers,
} from "./session";

export {
  getPublicWorldConfig,
  createRpSignature,
  verifyWorldIdProof,
  verifySandboxDemo,
  verifyHuman,
} from "./agentkit";
export type { RpSignaturePayload, PublicWorldConfig } from "./agentkit";

export { lookupAgentHumanId, getAgentBookStatus } from "./agentbook";
export type { AgentBookStatus } from "./agentbook";
