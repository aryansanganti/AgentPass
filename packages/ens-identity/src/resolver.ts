import { publicClient, walletClient, account, ADDRESSES } from "./config";
import { parseAbi, namehash } from "viem";

const resolverAbi = parseAbi([
  "function setText(bytes32 node, string key, string value) external",
  "function text(bytes32 node, string key) external view returns (string)",
]);

export async function setTextRecord(name: string, key: string, value: string) {
  if (!walletClient || !account) {
    throw new Error("Wallet client not configured. Set PRIVATE_KEY in .env");
  }

  const node = namehash(name);

  if (ADDRESSES.PermissionedResolver === "0x0000000000000000000000000000000000000000") {
    console.log(`[Mock] Set text record for ${name}: ${key} = ${value}`);
    return "0xmocktxhash1234567890abcdef";
  }

  const { request } = await publicClient.simulateContract({
    address: ADDRESSES.PermissionedResolver,
    abi: resolverAbi,
    functionName: "setText",
    args: [node, key, value],
    account,
  });

  const txHash = await walletClient.writeContract(request);
  await publicClient.waitForTransactionReceipt({ hash: txHash });
  
  return txHash;
}

export async function getTextRecord(name: string, key: string): Promise<string> {
  const node = namehash(name);

  if (ADDRESSES.PermissionedResolver === "0x0000000000000000000000000000000000000000") {
    // Return mock data if unconfigured
    const mockDb: Record<string, string> = {
      "agent.capabilities": "[\"defi-risk-analysis\",\"portfolio-query\"]",
      "agent.endpoint": "https://api.agentpass.eth/analyze",
      "agent.human-owner": "0x7a3f8E2d1C9b4A5e6F0d7B8c9E1a2D3f4C5b6A7c",
      "agent.reputation": "14",
    };
    return mockDb[key] || "";
  }

  return await publicClient.readContract({
    address: ADDRESSES.PermissionedResolver,
    abi: resolverAbi,
    functionName: "text",
    args: [node, key],
  });
}
