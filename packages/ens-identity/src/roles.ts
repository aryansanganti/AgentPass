import { publicClient, walletClient, account, ADDRESSES } from "./config";
import { parseAbi } from "viem";
import {
  requireHumanBacked,
  type WorldCredential,
  NotHumanBackedError,
} from "@agentpass/world-verify";

// Based on ENSv2 Enhanced Access Control documentation
export const ROLES = {
  OWNER: "0x0000000000000000000000000000000000000000000000000000000000000000",
  OPERATOR: "0x1000000000000000000000000000000000000000000000000000000000000000",
  DELEGATE: "0x2000000000000000000000000000000000000000000000000000000000000000",
} as const;

const accessControlAbi = parseAbi([
  "function grantRole(bytes32 role, address account) external",
  "function revokeRole(bytes32 role, address account) external",
  "function hasRole(bytes32 role, address account) external view returns (bool)",
]);

export async function grantRole(role: `0x${string}`, targetAddress: `0x${string}`) {
  if (!walletClient || !account) {
    throw new Error("Wallet client not configured. Set PRIVATE_KEY in .env");
  }

  // NOTE: This will fail until ADDRESSES are properly populated with real Sepolia deployments
  if (ADDRESSES.EnhancedAccessControl === "0x0000000000000000000000000000000000000000") {
    console.log(`[Mock] Granted role ${role} to ${targetAddress}`);
    return "0xmocktxhash1234567890abcdef";
  }

  const { request } = await publicClient.simulateContract({
    address: ADDRESSES.EnhancedAccessControl,
    abi: accessControlAbi,
    functionName: "grantRole",
    args: [role, targetAddress],
    account,
  });

  const txHash = await walletClient.writeContract(request);
  await publicClient.waitForTransactionReceipt({ hash: txHash });

  return txHash;
}

/**
 * OPERATOR role requires human-backing (PRD 04 gates PRD 01).
 * Demo path: unverified → NotHumanBackedError; verified → grantRole(OPERATOR).
 */
export async function grantOperatorRole(
  targetAddress: `0x${string}`,
  credential: WorldCredential | null | undefined
) {
  requireHumanBacked(credential);
  return grantRole(ROLES.OPERATOR, targetAddress);
}

export async function hasRole(role: `0x${string}`, targetAddress: `0x${string}`): Promise<boolean> {
  if (ADDRESSES.EnhancedAccessControl === "0x0000000000000000000000000000000000000000") {
    // Mock logic: assume owner has all roles, others depend on what was "granted"
    if (account && targetAddress.toLowerCase() === account.address.toLowerCase()) {
      return true;
    }
    return false;
  }

  return await publicClient.readContract({
    address: ADDRESSES.EnhancedAccessControl,
    abi: accessControlAbi,
    functionName: "hasRole",
    args: [role, targetAddress],
  });
}

export { NotHumanBackedError };
