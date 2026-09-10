// @agentpass/world-verify
// World ID Sandbox / AgentKit human verification
// Real implementation in Phase 5

export const WORLD_PACKAGE_VERSION = "0.1.0";

export interface WorldCredential {
  verified: boolean;
  hash: string;
  timestamp: number;
}

export function isHumanBacked(credential: WorldCredential): boolean {
  return credential.verified;
}

export async function verifyHuman(): Promise<WorldCredential> {
  throw new Error("Not implemented — use mock data until Phase 5");
}
