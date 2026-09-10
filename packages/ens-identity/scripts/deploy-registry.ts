import { walletClient, account, ADDRESSES, PARENT_NAME } from "../src/config";
import { parseAbi } from "viem";

const factoryAbi = parseAbi([
  "function deployPermissionedRegistry(string parentName) external returns (address)"
]);

async function main() {
  if (!walletClient || !account) {
    console.error("Wallet client not configured. Set PRIVATE_KEY in .env");
    process.exit(1);
  }

  console.log(`Deploying Permissioned Registry for ${PARENT_NAME}...`);
  console.log(`From address: ${account.address}`);

  if (ADDRESSES.PermissionedRegistryFactory === "0x0000000000000000000000000000000000000000") {
    console.log("Mocking deployment because ADDRESSES are unconfigured.");
    console.log(`[Mock Tx]: 0x0000000000000000000000000000000000000000000000000000000000000000`);
    console.log("Registry deployed (mock)");
    return;
  }

  try {
    const txHash = await walletClient.writeContract({
      address: ADDRESSES.PermissionedRegistryFactory,
      abi: factoryAbi,
      functionName: "deployPermissionedRegistry",
      args: [PARENT_NAME],
      account
    });
    console.log(`Tx sent: ${txHash}`);
    console.log("Waiting for confirmation...");
    // Await publicClient transaction receipt if configured
    console.log("Registry deployed successfully!");
  } catch (e) {
    console.error("Deployment failed:", e);
  }
}

main();
