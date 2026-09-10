# AgentPass

> **An AI agent that checks your DeFi risk — verified human, paid per use, no API keys.**

[![ETHOnline 2026](https://img.shields.io/badge/ETHOnline-2026-blueviolet)](https://ethglobal.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Cost: $0](https://img.shields.io/badge/Cost-$0_free_tier_only-brightgreen)]()

## What is AgentPass?

AgentPass is a web app where you type a DeFi wallet address, and an AI agent — with its own onchain name, its own money, and proof it's working for a real human — checks that wallet's risk across protocols and tells you what to do about it, paying for its own analysis out of a small budget you give it.

**One product. One core action: "Check my risk."**

## Quick Start

```bash
# Clone and install
git clone https://github.com/aryansanganti/AgentPass-ETHONLINE.git
cd AgentPass-ETHONLINE
cp .env.example .env   # fill in your free-tier credentials
pnpm install
pnpm dev:all           # dashboard :3000 + x402 API :4001
# or separately: pnpm dev:api   &&   pnpm dev
```

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
