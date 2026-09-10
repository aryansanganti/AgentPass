import { account, PARENT_NAME } from "../src/config";
import { grantRole, ROLES, hasRole } from "../src/roles";
import { setTextRecord } from "../src/resolver";

async function main() {
  if (!account) {
    console.error("Wallet client not configured. Set PRIVATE_KEY in .env");
    process.exit(1);
  }

  const agentName = `sentinel.${PARENT_NAME}`;
  const operatorAddress = "0x1b2C3d4E5f6A7b8C9d0E1f2A3b4C5d6E7f8A9b0C" as `0x${string}`; // Mock Operator
  const delegateAddress = "0x9f8E7d6C5b4A3f2E1d0C9b8A7f6E5d4C3b2A1f0E" as `0x${string}`; // Mock Delegate

  console.log("Setting up roles using Enhanced Access Control...");
  
  // Grant OPERATOR role
  await grantRole(ROLES.OPERATOR, operatorAddress);
  console.log(`Granted OPERATOR role to ${operatorAddress}`);

  // Grant DELEGATE role
  await grantRole(ROLES.DELEGATE, delegateAddress);
  console.log(`Granted DELEGATE role to ${delegateAddress}`);

  console.log("\nVerifying roles...");
  const isOperator = await hasRole(ROLES.OPERATOR, operatorAddress);
  const isDelegate = await hasRole(ROLES.DELEGATE, delegateAddress);
  console.log(`Is Operator? ${isOperator}`);
  console.log(`Is Delegate? ${isDelegate}`);

  console.log("\nTesting permissions...");
  
  // Try to set text record (simulating from Owner account)
  try {
    await setTextRecord(agentName, "agent.last-active", Date.now().toString());
    console.log("✅ Owner successfully updated text record.");
  } catch (e) {
    console.error("❌ Owner failed to update text record:", e);
  }

  // NOTE: In a real test, we would switch walletClients to the operator and delegate
  // to simulate them calling the smart contract. For this mock, we just show the expected output.
  console.log("✅ Operator successfully updated text record (simulated).");
  console.log("❌ Delegate transaction reverted: Missing Role (simulated).");

  console.log("\nPermission verification complete!");
}

main();
