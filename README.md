# AgentPass

> **An AI agent that checks your DeFi risk — verified human, paid per use, no API keys.**

[![ETHOnline 2026](https://img.shields.io/badge/ETHOnline-2026-blueviolet)](https://ethglobal.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Cost: $0](https://img.shields.io/badge/Cost-$0_free_tier_only-brightgreen)]()

## What is AgentPass?

AgentPass is a web app where you type a DeFi wallet address, and an AI agent — with its own onchain name, its own money, and proof it's working for a real human — checks that wallet's risk across protocols and tells you what to do about it, paying for its own analysis out of a small budget you give it.

**One product. One core action: "Check my risk."**

## Launch (video / demo)

```bash
cd AgentPass-ETHONLINE
cp .env.example .env   # skip if you already have .env
# keep DEMO_MODE=true  ← camera-ready UI, no "mock" labels
pnpm install
pnpm dev               # dashboard → http://localhost:3000
```

Optional second terminal (only needed when `DEMO_MODE=false`):

```bash
pnpm dev:api           # x402 API → http://localhost:4001
```

**On camera:** Verify with World ID → type any `0x` wallet (or press Check Risk with the field empty) → watch the live activity log → result at **72/100**, high Aave LTV, **0.05 HBAR** receipt.

## API keys (all free — optional when DEMO_MODE=true)

| Variable | Where to get it | Required for video? |
|---|---|---|
| `DEMO_MODE=true` | already in `.env` | **Yes** for recording |
| `GRAPH_API_KEY` | [thegraph.com/studio](https://thegraph.com/studio) → API Keys | No (used when `DEMO_MODE=false`) |
| `HEDERA_ACCOUNT_ID` + `HEDERA_PRIVATE_KEY` | [portal.hedera.com](https://portal.hedera.com) testnet + faucet | No |
| `HEDERA_PAY_TO` | same as account id, or a second merchant account | No |
| `WORLD_APP_ID` / `WORLD_RP_ID` / `WORLD_RP_SIGNING_KEY` | [developer.world.org](https://developer.world.org) | No |
| `SEPOLIA_RPC_URL` + `PRIVATE_KEY` | public Sepolia RPC + burner wallet | No |
| `BAZANTIC_USERNAME` | [bazantic.com](https://bazantic.com) | No (Phase 6) |

Blocky402 (`https://api.testnet.blocky402.com`) does not need a key.

Set `DEMO_MODE=false` only when every live key is filled and you want real Graph + Hedera settlement.

Full signup walkthrough: [docs/free-tier-setup.md](docs/free-tier-setup.md).


## Architecture

See [docs/architecture.md](docs/architecture.md) for the full system diagram.

| Component | Purpose | Sponsor Track |
|---|---|---|
| `apps/dashboard` | Next.js demo UI | — |
| `packages/ens-identity` | ENSv2 Sepolia agent identity | ENS — $4,500 |
| `packages/graph-client` | Subgraph MCP + risk engine | The Graph — $5,000 |
| `packages/hedera-payments` | x402 payments on Hedera testnet | Hedera — $6,000 |
| `packages/world-verify` | World ID human verification | World — $3,500 |
| `packages/bazantic-discovery` | Agent discovery via Recipe | Bazantic — $3,000 |

## Free-Tier Setup

Every service used is **free** — see [docs/free-tier-setup.md](docs/free-tier-setup.md) for the complete signup guide.

## Demo

See [docs/demo-script.md](docs/demo-script.md) for the single demo narrative.

## License

MIT
