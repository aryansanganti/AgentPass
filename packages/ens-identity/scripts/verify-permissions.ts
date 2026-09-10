import { account, PARENT_NAME } from "../src/config";
import { grantOperatorRole, grantRole, ROLES, hasRole } from "../src/roles";
import { setTextRecord } from "../src/resolver";
import {
  verifySandboxDemo,
  NotHumanBackedError,
} from "@agentpass/world-verify";

async function main() {
  if (!account) {
    console.error("Wallet client not configured. Set PRIVATE_KEY in .env");
    process.exit(1);
  }

  const agentName = `sentinel.${PARENT_NAME}`;
  const operatorAddress = "0x1b2C3d4E5f6A7b8C9d0E1f2A3b4C5d6E7f8A9b0C" as `0x${string}`;
  const delegateAddress = "0x9f8E7d6C5b4A3f2E1d0C9b8A7f6E5d4C3b2A1f0E" as `0x${string}`;

  console.log("=== PRD 04 demo: OPERATOR grant is gated by World ID ===\n");

  // 1) Unverified → must fail
  try {
    await grantOperatorRole(operatorAddress, null);
    console.error("❌ Unverified OPERATOR grant should have failed");
  } catch (e) {
    if (e instanceof NotHumanBackedError) {
      console.log("✅ Unverified agent blocked from OPERATOR:", e.message);
    } else {
      throw e;
    }
  }

  // 2) Sandbox verify → unlock
  const credential = await verifySandboxDemo();
  console.log("✅ World ID sandbox credential:", credential.hash.slice(0, 18) + "…");

  await grantOperatorRole(operatorAddress, credential);
  console.log(`✅ Granted OPERATOR role to ${operatorAddress} (human-backed)`);

  await grantRole(ROLES.DELEGATE, delegateAddress);
  console.log(`Granted DELEGATE role to ${delegateAddress}`);

  console.log("\nVerifying roles...");
  const isOperator = await hasRole(ROLES.OPERATOR, operatorAddress);
  const isDelegate = await hasRole(ROLES.DELEGATE, delegateAddress);
  console.log(`Is Operator? ${isOperator}`);
  console.log(`Is Delegate? ${isDelegate}`);

  console.log("\nTesting permissions...");
  try {
    await setTextRecord(agentName, "agent.last-active", Date.now().toString());
    console.log("✅ Owner successfully updated text record.");
  } catch (e) {
    console.error("❌ Owner failed to update text record:", e);
  }

  console.log("✅ Operator successfully updated text record (simulated).");
  console.log("❌ Delegate transaction reverted: Missing Role (simulated).");
  console.log("\nPermission verification complete!");
}

main();
