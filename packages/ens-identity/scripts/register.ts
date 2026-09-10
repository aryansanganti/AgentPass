import { walletClient, account, ADDRESSES, PARENT_NAME } from "../src/config";
import { setTextRecord } from "../src/resolver";
import { parseAbi, namehash } from "viem";

const registryAbi = parseAbi([
  "function register(bytes32 node, string label, address owner, address resolver) external",
  "function registerWithExpiry(bytes32 node, string label, address owner, address resolver, uint64 expiry) external"
]);

async function main() {
  if (!walletClient || !account) {
    console.error("Wallet client not configured. Set PRIVATE_KEY in .env");
    process.exit(1);
  }

  const agentLabel = "sentinel";
  const childLabel = "risk";
  const parentNode = namehash(PARENT_NAME);
  const agentNode = namehash(`${agentLabel}.${PARENT_NAME}`);

  console.log(`Registering ${agentLabel}.${PARENT_NAME}...`);
  console.log(`Registering temporary child ${childLabel}.${agentLabel}.${PARENT_NAME} (24h expiry)...`);

  if (ADDRESSES.Registry === "0x0000000000000000000000000000000000000000") {
    console.log("Mocking registration because ADDRESSES are unconfigured.");
  } else {
    try {
      // 1. Register main agent subname
      const tx1 = await walletClient.writeContract({
        address: ADDRESSES.Registry,
        abi: registryAbi,
        functionName: "register",
        args: [parentNode, agentLabel, account.address, ADDRESSES.PermissionedResolver],
        account
      });
      console.log(`Agent registered: ${tx1}`);

      // 2. Register child subname with 24h expiry
      const expiry = BigInt(Math.floor(Date.now() / 1000) + 86400);
      const tx2 = await walletClient.writeContract({
        address: ADDRESSES.Registry,
        abi: registryAbi,
        functionName: "registerWithExpiry",
        args: [agentNode, childLabel, account.address, ADDRESSES.PermissionedResolver, expiry],
        account
      });
      console.log(`Child registered: ${tx2}`);
    } catch (e) {
      console.error("Registration failed:", e);
    }
  }

  // Set mock text records
  console.log("Setting default agent text records...");
  await setTextRecord(`${agentLabel}.${PARENT_NAME}`, "agent.capabilities", "[\"defi-risk-analysis\",\"portfolio-query\"]");
  await setTextRecord(`${agentLabel}.${PARENT_NAME}`, "agent.endpoint", "https://api.agentpass.eth/analyze");
  await setTextRecord(`${agentLabel}.${PARENT_NAME}`, "agent.human-owner", "0x7a3f...b42c (World ID verified)");
  await setTextRecord(`${agentLabel}.${PARENT_NAME}`, "agent.reputation", "14");
  
  console.log("Registration script complete!");
}

main();
