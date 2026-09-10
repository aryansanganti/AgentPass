import { signRequest } from "@worldcoin/idkit-core/signing";
import {
  WORLD_ACTION,
  WORLD_ALLOW_SANDBOX_DEMO,
  WORLD_APP_ID,
  WORLD_RP_ID,
  WORLD_RP_SIGNING_KEY,
  idkitEnvironment,
  isWorldPortalConfigured,
} from "./config";
import { hashCredentialMaterial } from "./gate";
import { createSession, listNullifiers } from "./session";
import type { WorldCredential } from "./types";
import { lookupAgentHumanId } from "./agentbook";

export interface RpSignaturePayload {
  sig: string;
  nonce: string;
  created_at: number;
  expires_at: number;
  rp_id: string;
  app_id: string;
  action: string;
  environment: "staging" | "production";
}

export interface PublicWorldConfig {
  configured: boolean;
  allowSandboxDemo: boolean;
  appId: string;
  rpId: string;
  action: string;
  environment: "staging" | "production";
  /** Client-facing label for WORLD_ENV */
  worldEnv: string;
}

/** Safe config for the dashboard Verify step (PRD 00 Step 2). */
export function getPublicWorldConfig(): PublicWorldConfig {
  return {
    configured: isWorldPortalConfigured(),
    allowSandboxDemo: WORLD_ALLOW_SANDBOX_DEMO,
    appId: WORLD_APP_ID,
    rpId: WORLD_RP_ID,
    action: WORLD_ACTION,
    environment: idkitEnvironment(),
    worldEnv: process.env.WORLD_ENV || "sandbox",
  };
}

/**
 * Backend-only RP signature for IDKit.request / IDKitRequestWidget.
 * Never expose WORLD_RP_SIGNING_KEY to the client.
 */
export function createRpSignature(action = WORLD_ACTION): RpSignaturePayload {
  if (!isWorldPortalConfigured()) {
    throw new Error(
      "World Developer Portal is not configured. Set WORLD_APP_ID, WORLD_RP_ID, WORLD_RP_SIGNING_KEY."
    );
  }

  const signed = signRequest({
    signingKeyHex: WORLD_RP_SIGNING_KEY,
    action,
  });

  return {
    sig: signed.sig,
    nonce: signed.nonce,
    created_at: signed.createdAt,
    expires_at: signed.expiresAt,
    rp_id: WORLD_RP_ID,
    app_id: WORLD_APP_ID,
    action,
    environment: idkitEnvironment(),
  };
}

type IdKitLikeResult = {
  protocol_version?: string;
  nonce?: string;
  action?: string;
  environment?: string;
  responses?: Array<{
    identifier?: string;
    nullifier?: string;
    proof?: unknown;
    merkle_root?: string;
  }>;
};

/**
 * Forward an IDKit result to the Developer Portal v4 verify endpoint,
 * then mint a local AgentPass session credential.
 */
export async function verifyWorldIdProof(
  idkitResponse: IdKitLikeResult,
  opts?: { agentWallet?: `0x${string}` }
): Promise<WorldCredential> {
  if (!WORLD_RP_ID) {
    throw new Error("WORLD_RP_ID is required to verify World ID proofs");
  }

  const res = await fetch(`https://developer.world.org/api/v4/verify/${WORLD_RP_ID}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(idkitResponse),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`World ID verify failed (${res.status}): ${text.slice(0, 240)}`);
  }

  const nullifier =
    idkitResponse.responses?.[0]?.nullifier ||
    (idkitResponse as { nullifier_hash?: string }).nullifier_hash;

  if (nullifier) {
    const used = listNullifiers();
    if (used.has(nullifier.toLowerCase())) {
      throw new Error("This World ID nullifier was already used for this action");
    }
  }

  const method =
    idkitEnvironment() === "production" ? "world-id" : "world-id-sandbox";

  const hash = hashCredentialMaterial([
    nullifier || "no-nullifier",
    WORLD_ACTION,
    String(Date.now()),
  ]);

  let agentBookHumanId: string | null = null;
  if (opts?.agentWallet) {
    agentBookHumanId = await lookupAgentHumanId(opts.agentWallet);
  }

  return createSession({
    verified: true,
    hash: `0x${hash}`,
    nullifier: nullifier || undefined,
    method,
    timestamp: Date.now(),
    action: WORLD_ACTION,
    agentBookHumanId,
  });
}

/**
 * Labeled local sandbox credential for hackathon demos when portal keys
 * are missing (WORLD_ALLOW_SANDBOX_DEMO). Not a real World ID proof.
 */
export async function verifySandboxDemo(opts?: {
  agentWallet?: `0x${string}`;
}): Promise<WorldCredential> {
  if (!WORLD_ALLOW_SANDBOX_DEMO) {
    throw new Error(
      "Sandbox demo credentials are disabled. Configure World Portal keys or set WORLD_ALLOW_SANDBOX_DEMO=true."
    );
  }

  const hash = hashCredentialMaterial([
    "sandbox-demo",
    WORLD_ACTION,
    String(Date.now()),
    Math.random().toString(36),
  ]);

  let agentBookHumanId: string | null = null;
  if (opts?.agentWallet) {
    agentBookHumanId = await lookupAgentHumanId(opts.agentWallet);
  }

  return createSession({
    verified: true,
    hash: `0x${hash}`,
    nullifier: `sandbox-${hash.slice(0, 16)}`,
    method: "sandbox-demo",
    timestamp: Date.now(),
    action: WORLD_ACTION,
    agentBookHumanId,
  });
}

/** Convenience: portal proof if configured, otherwise sandbox demo. */
export async function verifyHuman(opts?: {
  idkitResponse?: IdKitLikeResult;
  agentWallet?: `0x${string}`;
  forceSandboxDemo?: boolean;
}): Promise<WorldCredential> {
  if (opts?.forceSandboxDemo || (!opts?.idkitResponse && WORLD_ALLOW_SANDBOX_DEMO)) {
    return verifySandboxDemo({ agentWallet: opts?.agentWallet });
  }
  if (!opts?.idkitResponse) {
    throw new Error("idkitResponse required when sandbox demo is not allowed");
  }
  return verifyWorldIdProof(opts.idkitResponse, { agentWallet: opts.agentWallet });
}
