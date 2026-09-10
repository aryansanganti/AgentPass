import { createAgentBookVerifier } from "@worldcoin/agentkit";
import { AGENT_WALLET_ADDRESS } from "./config";

export interface AgentBookStatus {
  /** Agent wallet looked up on World Chain AgentBook */
  agentWallet: string | null;
  /** Anonymous human id from AgentBook, or null if unregistered */
  humanId: string | null;
  registered: boolean;
  /** Human-readable ENS name (from PRD 01) shown alongside AgentBook */
  ensName?: string;
  /** Lookup error message (RPC / network), if any */
  error?: string;
  chain: "eip155:480";
}

let verifier: ReturnType<typeof createAgentBookVerifier> | null = null;

function getVerifier() {
  if (!verifier) {
    const rpcUrl = process.env.WORLD_CHAIN_RPC_URL || undefined;
    verifier = createAgentBookVerifier(rpcUrl ? { rpcUrl } : undefined);
  }
  return verifier;
}

/**
 * Resolve an agent wallet to an anonymous human identifier via AgentBook
 * (canonical World Chain deployment — eip155:480).
 */
export async function lookupAgentHumanId(
  agentWallet: string
): Promise<string | null> {
  if (!agentWallet || !/^0x[a-fA-F0-9]{40}$/.test(agentWallet)) {
    return null;
  }
  try {
    return await getVerifier().lookupHuman(agentWallet);
  } catch (err) {
    console.warn(
      "[agentbook] lookupHuman failed:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

/**
 * Full AgentBook status for demos / dashboard Agent Profile.
 * Pass the agent's ENS name so the UI ties AgentBook ↔ ENS identity (PRD 00 §6).
 */
export async function getAgentBookStatus(opts?: {
  agentWallet?: string;
  ensName?: string;
}): Promise<AgentBookStatus> {
  const agentWallet =
    opts?.agentWallet || AGENT_WALLET_ADDRESS || null;

  if (!agentWallet) {
    return {
      agentWallet: null,
      humanId: null,
      registered: false,
      ensName: opts?.ensName,
      error: "AGENT_WALLET_ADDRESS not set",
      chain: "eip155:480",
    };
  }

  try {
    const humanId = await getVerifier().lookupHuman(agentWallet);
    return {
      agentWallet,
      humanId,
      registered: Boolean(humanId),
      ensName: opts?.ensName,
      chain: "eip155:480",
    };
  } catch (err) {
    return {
      agentWallet,
      humanId: null,
      registered: false,
      ensName: opts?.ensName,
      error: err instanceof Error ? err.message : "AgentBook lookup failed",
      chain: "eip155:480",
    };
  }
}
