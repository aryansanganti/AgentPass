# PRD 01: ENS Identity Layer (`packages/ens-identity`)
**Target Bounty:** ENS — Best Use of ENSv2 — $4,500
**Cost:** $0 — Sepolia testnet, free faucet ETH, free ENS app

---

## 1. Goal
Give the agent a hierarchical, permissioned onchain identity on **ENSv2 (Sepolia beta)** — a subname that owns its own resolver, enforces role-based write permissions, and can spawn child sub-agent names.

## 2. Prerequisites (all free)
- [ ] MetaMask (or any EVM wallet) installed
- [ ] Sepolia ETH in that wallet — get free from a Sepolia faucet (search "Sepolia faucet", e.g. Alchemy's or Google Cloud's free Sepolia faucet; you generally just need to connect a wallet, no payment)
- [ ] Node.js 20+, `pnpm`

## 3. Step-by-Step Build

### Step 1 — Get a parent ENS name on Sepolia
1. Go to the ENS app, switch network to **Sepolia** in your wallet.
2. Register a test parent name, e.g. `agentpass.eth` (Sepolia names are free/cheap test registrations — you're not touching mainnet).
3. Confirm ownership shows in the ENS app under your wallet.

### Step 2 — Read the ENSv2 docs for the exact current contract addresses
ENSv2 is a Sepolia-only beta, so addresses can shift. Before writing code:
- Open `docs.ens.domains/ensv2/overview` and the **Permissioned Registry** + **Permissioned Resolver** + **Enhanced Access Control** pages, and copy the current Sepolia deployment addresses into `docs/ens-addresses.md` in your repo. Do this fresh at hackathon start — don't hardcode from memory/old blog posts.

### Step 3 — Scaffold the package
```bash
mkdir -p packages/ens-identity/src packages/ens-identity/scripts
cd packages/ens-identity
pnpm init
pnpm add viem dotenv
pnpm add -D typescript tsx @types/node
```

### Step 4 — Environment file (`.env`, gitignored)
```
SEPOLIA_RPC_URL=https://sepolia.gateway.tenderly.co   # or any free public Sepolia RPC
PRIVATE_KEY=your_test_wallet_private_key_NEVER_a_real_wallet
PARENT_NAME=agentpass.eth
```
Use a **fresh burner wallet** for this, funded only with free faucet ETH. Never use a real wallet's key in a hackathon repo.

### Step 5 — Deploy your Permissioned Subname Registry
`packages/ens-identity/scripts/deploy-registry.ts`:
- Use viem to call the ENSv2 Permissioned Registry factory (address from Step 2) to create a registry scoped under `agentpass.eth`.
- Log the deployed registry address to `docs/ens-addresses.md`.

### Step 6 — Register the agent's subname
`packages/ens-identity/scripts/register.ts`:
- Call the registry to mint `sentinel.agentpass.eth`, owned by your burner wallet (this becomes the agent's operational identity).
- Attach a **Permissioned Resolver** to it.

### Step 7 — Define roles with Enhanced Access Control
`packages/ens-identity/src/roles.ts`:
- `OWNER` — your human wallet, full control
- `OPERATOR` — a second burner key representing "the agent," can only write specific text record keys (`agent.reputation`, `agent.last-active`)
- `DELEGATE` — a third burner key representing a sub-agent, read-only

Write a `grantRole()` / `revokeRole()` helper calling Enhanced Access Control's role-grant functions.

### Step 8 — Set text records
`packages/ens-identity/src/resolver.ts` — write helpers to set/read:
```
agent.capabilities = ["defi-risk-analysis","portfolio-query"]
agent.endpoint      = "<your Hedera /analyze URL from PRD 03>"
agent.human-owner    = "<World ID verification hash from PRD 04>"
agent.reputation     = "0"   // agent updates this itself over time
```

### Step 9 — Register a child sub-agent name (proves hierarchy)
- Mint `risk.sentinel.agentpass.eth` under the same registry, owned by the `DELEGATE` key, with a **24-hour expiry** (ENSv2 supports expiring names — use this to show you understand the flexible ownership model).

### Step 10 — Write a verification script
`packages/ens-identity/scripts/verify-permissions.ts`:
- Attempt an `agent.reputation` write using the `OPERATOR` key → should succeed.
- Attempt the same write using the `DELEGATE` key → should **fail** (proves Enhanced Access Control is actually enforced, not just app-level).
- Print both results clearly — this becomes your demo video's centerpiece.

## 4. Demo Script
1. Show `agentpass.eth` owned by you on the ENS app (Sepolia).
2. Run `register.ts` live → `sentinel.agentpass.eth` appears with its Permissioned Resolver.
3. Run `verify-permissions.ts` live → OPERATOR write succeeds, DELEGATE write fails on camera.
4. Show the 24h-expiry child name and explain it in one sentence.

## 5. Qualification Checklist (from ETHGlobal)
- [ ] Built on ENSv2 Sepolia, features central not cosmetic
- [ ] Functional demo (no hardcoded values)
- [ ] Video + live demo link
- [ ] Open source on GitHub

## 6. Definition of Done
- [ ] `agentpass.eth` → `sentinel.agentpass.eth` → `risk.sentinel.agentpass.eth` hierarchy live on Sepolia
- [ ] 3 roles enforced on-chain (not just in your app code)
- [ ] ≥4 text records set on the Permissioned Resolver, one agent-writable
- [ ] `docs/ens-addresses.md` lists every contract address used, for judge verification
- [ ] Total cost: $0 (only Sepolia testnet ETH used)
