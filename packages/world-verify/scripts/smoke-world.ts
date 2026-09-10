/**
 * Quick Phase 5 smoke: sandbox credential + gates.
 * Run: pnpm exec tsx scripts/smoke-world.ts  (from packages/world-verify)
 */
import {
  verifySandboxDemo,
  isHumanBacked,
  requireHumanBacked,
  NotHumanBackedError,
  getSession,
  getAgentBookStatus,
} from "../src/index";

async function main() {
  console.log("=== world-verify smoke ===\n");

  try {
    requireHumanBacked(null);
    console.error("FAIL: expected NotHumanBackedError");
    process.exit(1);
  } catch (e) {
    if (e instanceof NotHumanBackedError) {
      console.log("OK  unverified gate blocks:", e.code);
    } else {
      throw e;
    }
  }

  const cred = await verifySandboxDemo();
  console.log("OK  sandbox credential", {
    method: cred.method,
    hash: cred.hash.slice(0, 18) + "…",
    sessionId: cred.sessionId?.slice(0, 12) + "…",
  });

  if (!isHumanBacked(cred)) {
    console.error("FAIL: sandbox cred should be human-backed");
    process.exit(1);
  }
  requireHumanBacked(cred);
  console.log("OK  requireHumanBacked passes");

  const again = getSession(cred.sessionId);
  console.log("OK  session round-trip", Boolean(again?.sessionId));

  const book = await getAgentBookStatus({
    ensName: "sentinel.agentpass.eth",
  });
  console.log("OK  AgentBook status", {
    registered: book.registered,
    wallet: book.agentWallet ? book.agentWallet.slice(0, 10) + "…" : null,
    error: book.error || null,
  });

  console.log("\nSmoke complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
