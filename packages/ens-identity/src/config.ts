import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" }); // Assuming we run from package root

const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
const rawPrivateKey = process.env.PRIVATE_KEY || "";
const privateKey = /^0x[a-fA-F0-9]{64}$/.test(rawPrivateKey)
  ? (rawPrivateKey as `0x${string}`)
  : null;

if (!rawPrivateKey) {
  console.warn("WARNING: PRIVATE_KEY not set in .env. Some scripts will fail.");
} else if (!privateKey) {
  console.warn(
    "WARNING: PRIVATE_KEY is set but not a valid 32-byte hex value. Ignoring invalid key."
  );
}

export const account = privateKey ? privateKeyToAccount(privateKey) : null;

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(rpcUrl),
});

export const walletClient = account
  ? createWalletClient({
    account,
    chain: sepolia,
    transport: http(rpcUrl),
  })
  : null;

// Official or placeholder ENSv2 Sepolia addresses
// TO BE UPDATED when verified against latest ENSv2 documentation
export const ADDRESSES = {
  // Placeholder addresses
  Registry: "0x0000000000000000000000000000000000000000" as `0x${string}`,
  PermissionedRegistryFactory: "0x0000000000000000000000000000000000000000" as `0x${string}`,
  PermissionedResolver: "0x0000000000000000000000000000000000000000" as `0x${string}`,
  EnhancedAccessControl: "0x0000000000000000000000000000000000000000" as `0x${string}`,
};

export const PARENT_NAME = process.env.PARENT_NAME || "agentpass.eth";
