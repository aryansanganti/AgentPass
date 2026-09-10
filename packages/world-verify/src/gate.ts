import { createHash, randomBytes } from "crypto";
import type { WorldCredential } from "./types";
import { NotHumanBackedError } from "./types";

/**
 * Returns true only for credentials that passed verification (or labeled sandbox demo).
 */
export function isHumanBacked(credential: WorldCredential | null | undefined): boolean {
  if (!credential) return false;
  return credential.verified === true && Boolean(credential.hash);
}

/**
 * Hard gate used by Hedera budget + ENS OPERATOR grant.
 * @throws NotHumanBackedError
 */
export function requireHumanBacked(
  credential: WorldCredential | null | undefined
): asserts credential is WorldCredential {
  if (!isHumanBacked(credential)) {
    throw new NotHumanBackedError();
  }
}

export function hashCredentialMaterial(parts: string[]): string {
  return createHash("sha256").update(parts.join("|")).digest("hex");
}

export function newSessionId(): string {
  return randomBytes(24).toString("hex");
}
