#!/usr/bin/env tsx
/**
 * Smoke: cold 402 → budget → pay → analyze
 * Usage: pnpm --filter @agentpass/hedera-payments exec tsx scripts/smoke-pay.ts [wallet] [maxBudget]
 */
import { analyzePaid, BudgetDeclinedError } from "../src/index";

const wallet =
  process.argv[2] || "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503";
const maxBudget = process.argv[3] != null ? Number(process.argv[3]) : undefined;

async function main() {
  console.log(`Paid analyze for ${wallet} (maxBudget=${maxBudget ?? "session default"})`);
  try {
    const result = await analyzePaid(wallet, { maxBudget });
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    if (err instanceof BudgetDeclinedError) {
      console.error("DECLINED:", err.message);
      process.exit(2);
    }
    throw err;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
