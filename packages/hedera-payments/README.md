# `@agentpass/hedera-payments`

Agent-side x402 payment client for **Hedera testnet** via the **Blocky402** facilitator.

## Flow

1. `POST` unpaid → receive `402` + price metadata  
2. Check session budget (decline if over)  
3. Sign Hedera transfer with `@x402/hedera` → Blocky402 verify/settle  
4. Retry with `X-PAYMENT` → receive risk report + `PAYMENT-RESPONSE` tx id  
5. Optional: append audit row to an **HCS** topic  

## Env

```bash
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=...          # testnet only
HEDERA_NETWORK=testnet
HEDERA_PAY_TO=0.0.xxxxx         # merchant (defaults to ACCOUNT_ID)
ANALYZE_API_URL=http://localhost:4001/analyze
BLOCKY402_FACILITATOR_URL=https://api.testnet.blocky402.com
AGENT_SESSION_BUDGET_HBAR=1
HCS_TOPIC_ID=                   # optional; auto-created on first log
```

## Usage

```ts
import { analyzePaid, callPaidEndpoint, BudgetDeclinedError } from "@agentpass/hedera-payments";

const { data, receipt, budget, hcs } = await analyzePaid("0x...");
console.log(receipt.explorerUrl); // HashScan

try {
  await analyzePaid("0x...", { maxBudget: 0.01 }); // decline demo
} catch (e) {
  if (e instanceof BudgetDeclinedError) console.log(e.message);
}
```

## Cost

$0 — Hedera testnet HBAR from the portal faucet + open Blocky402 testnet facilitator.
