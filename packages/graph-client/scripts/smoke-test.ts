#!/usr/bin/env tsx
/**
 * Manual smoke test for live Subgraph MCP / Gateway queries.
 * Usage: pnpm --filter @agentpass/graph-client exec tsx scripts/smoke-test.ts [wallet]
 */
import { analyzeWalletRisk } from "../src/index";

const wallet =
  process.argv[2] ||
  // Well-known public address — replace with one that has open positions for demos
  "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503";

async function main() {
  console.log(`Analyzing ${wallet}...\n`);
  const report = await analyzeWalletRisk(wallet);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
