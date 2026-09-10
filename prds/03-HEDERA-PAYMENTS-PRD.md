# PRD 03: Agentic Payments Layer (`apps/api` + `packages/hedera-payments`)
**Target Bounty:** Hedera — AI & Agentic Payments on Hedera — $6,000
**Cost:** $0 — Hedera testnet + free faucet HBAR, Blocky402 facilitator (free testnet use)

---

## 1. Goal
Stand up a **real x402-gated service** (wrapping the risk engine from PRD 02) on **Hedera testnet**, and build the agent-side client that discovers, budgets for, and autonomously pays for it — all using free testnet funds.

## 2. Prerequisites (all free)
- [ ] Hedera testnet account — go to `portal.hedera.com`, create a free account, use the built-in **testnet faucet** to fund it with free test HBAR (no card required)
- [ ] Node.js 20+
- [ ] Read `hedera.com/blog/hedera-and-the-x402...` and the Blocky402 docs (`blocky402.com`) fresh, since facilitator setup details can change

## 3. Step-by-Step Build

### Step 1 — Create and fund your Hedera testnet account
1. Sign up at `portal.hedera.com`
2. Create a testnet account — this gives you an account ID (e.g. `0.0.xxxxx`) and a testnet private key
3. Use the portal's built-in faucet to top up free test HBAR (repeatable, free, for dev use only)
4. Store credentials in `.env`:
```
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=your_testnet_private_key
HEDERA_NETWORK=testnet
```

### Step 2 — Scaffold the API app
```bash
mkdir -p apps/api/src/routes
cd apps/api
pnpm init
pnpm add hono @hashgraph/sdk dotenv
pnpm add -D typescript tsx @types/node
```
(`hono` is a lightweight free/open-source web framework; swap for Express if you prefer.)

### Step 3 — Build the `/analyze` route
`apps/api/src/routes/analyze.ts`:
- Accepts `{ wallet: string }`
- Calls `graph-client`'s `queryLendingPositions()` + `computeRisk()` from PRD 02
- Returns the `RiskReport` JSON

### Step 4 — Gate it with x402 via Blocky402
`apps/api/src/x402-config.ts`:
- Set a price per call, e.g. `0.05 HBAR` (trivially cheap, funded entirely by free faucet HBAR)
- Wrap the `/analyze` route with x402 middleware pointed at the **Blocky402 facilitator** (get the current facilitator endpoint from `blocky402.com`'s docs — confirm it's testnet-compatible before building further)
- Unauthenticated/unpaid requests should return `402 Payment Required` with pricing metadata

### Step 5 — Build the agent-side payment client
`packages/hedera-payments/src/client.ts`:
```ts
async function callPaidEndpoint(url: string, body: object, maxBudget: number) {
  const res1 = await fetch(url, { method: "POST", body: JSON.stringify(body) });
  if (res1.status === 402) {
    const { price } = await res1.json();
    if (price > maxBudget) throw new Error("Over budget, declining");
    await payViaX402(price);           // signs + submits payment via Blocky402
    return fetch(url, { method: "POST", body: JSON.stringify(body) }); // retry
  }
  return res1;
}
```

### Step 6 — Budget logic
`packages/hedera-payments/src/budget.ts`:
- Give the agent a session budget (e.g. 1 HBAR)
- Deduct after every successful paid call
- Demonstrate a **decline** path: intentionally set a low budget in one demo run and show the agent refusing to pay, with a clear log message explaining why

### Step 7 — Payment receipt / audit trail (extra points)
`packages/hedera-payments/src/hcs-log.ts`:
- After each paid call, write a small message (tx hash + result hash) to a **Hedera Consensus Service (HCS) topic** — HCS testnet usage is also free with testnet HBAR
- This gives you a verifiable, judge-checkable audit trail

### Step 8 — Custom HTS token (extra points, optional)
- Mint a free testnet **HTS token** (e.g. `APASS`) and accept it as an alternate settlement asset — minting/testing on testnet costs only testnet HBAR (free)

## 4. Demo Script
1. Call `/analyze` cold → show the `402 Payment Required` response.
2. Show the agent's budget check passing → payment signed and submitted → show the transaction live on **HashScan testnet explorer** (free, public, just paste the tx hash).
3. Show the retried request now succeeding, returning the real risk report.
4. Show a second run where the budget is set too low → agent declines, explains why (not a silent failure).
5. (If built) show the HCS audit log entry for the payment.

## 5. Qualification Checklist
- [ ] Live x402-gated service on **Hedera testnet**, settled through **Blocky402 facilitator**
- [ ] Agent/platform completes ≥1 real paid request end-to-end
- [ ] Public GitHub repo, README covering setup/architecture/payment flow
- [ ] Demo video ≤5 minutes showing the paid request live

## 6. Definition of Done
- [ ] `/analyze` live and callable on Hedera testnet
- [ ] End-to-end paid request completed with a real, verifiable testnet tx hash in the README
- [ ] Budget decline path demonstrably works, not just the happy path
- [ ] At least one extra-points feature attempted (recommend: HCS audit log — cheap to build, strong demo value)
- [ ] Total cost: $0 (testnet HBAR only)
