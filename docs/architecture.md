# AgentPass — Architecture

> See `prds/07-TECHNICAL-MASTER-PRD.md` for the full technical spec. This document will be expanded as the build progresses.

## System Overview

```
                    ┌───────────────────────────┐
                    │   You (human)               │
                    │   verify via World ID Sandbox│
                    └─────────────┬────────────────┘
                                  │ authorizes
                                  ▼
                    ┌───────────────────────────┐
                    │   AgentPass Agent            │
                    │   identity: sentinel.<you>.eth│
                    │   (ENSv2, Sepolia testnet)     │
                    └─────────────┬────────────────┘
        ┌─────────────────────────┼─────────────────────────┐
        ▼                         ▼                         ▼
┌────────────────┐     ┌────────────────────┐     ┌────────────────────┐
│ DATA LAYER        │     │ PAYMENT LAYER          │     │ DISCOVERY LAYER        │
│ The Graph          │     │ Hedera testnet + x402   │     │ Bazantic MCP + Recipe   │
│ Subgraph MCP        │     │ (free testnet HBAR)     │     │ (free account)          │
│ (100k free q/mo)    │     └────────────────────┘     └────────────────────┘
└────────────────┘
```

## Repo Structure
- `apps/dashboard` — Next.js 15 demo UI (Home → Live Check → Result)
- `apps/api` — x402-gated risk analysis endpoint (Hono)
- `apps/agent` — Core agent runtime
- `packages/ens-identity` — ENSv2 Sepolia subname management
- `packages/graph-client` — Subgraph MCP wrapper + risk engine
- `packages/hedera-payments` — x402 payment client
- `packages/world-verify` — World ID Sandbox verification
- `packages/bazantic-discovery` — Gateway + Recipe registration
