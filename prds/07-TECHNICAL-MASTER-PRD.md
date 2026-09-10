# AgentPass — Technical Master PRD (v2, Free-Tier Only)
### The Identity, Data & Payment Layer for Autonomous Agents
**Event:** ETHOnline 2026 · **Pool:** Start Fresh (Net-new) for every track
**Cost to build:** $0 — every component below uses a free tier, testnet, or sandbox. No credit card required anywhere.

> ⚠️ **Read `00-PRODUCT-DEFINITION-PRD.md` first.** That file defines what AgentPass actually *is* as a product — the user, the core flow, the screens, the single demo narrative. This file (renumbered internally as the technical companion) defines the architecture and build order for the 6 components that implement that product. Building from this file alone, without the product definition, is how you end up with 6 disconnected integrations instead of one coherent app.

---

## 1. What You're Building
An autonomous agent that:
1. Has its own onchain **name and identity** (ENS, free — Sepolia testnet)
2. Reads **live blockchain data** to reason about DeFi risk (The Graph, free — 100k queries/month)
3. **Pays for its own compute/data** per request instead of using a static API key (Hedera testnet + x402, free — testnet HBAR from faucet)
4. Proves it's **backed by a real human**, not a bot (World ID Sandbox, free)
5. Is **discoverable by other agents** (Bazantic, free account)

Every piece is independently useful and independently submittable to a separate ETHGlobal bounty — see the mapping table below.

## 2. What Costs Money (and how we avoid it)
| Thing | Normally costs | Our workaround |
|---|---|---|
| ENS mainnet name | ~$5–$640/yr in ETH | Use **ENSv2 Sepolia testnet** — free, and it's literally what the bounty requires anyway |
| Hedera mainnet HBAR | Real money | Use **Hedera testnet** — faucet gives free test HBAR |
| The Graph paid queries | GRT/credit card past 100k/mo | Stay under the **100k free queries/month** — trivial for a hackathon demo |
| Ledger hardware device | ~$79–$249 | **Skip this component if you don't already own a Ledger device.** `ring init` requires physical hardware once. Everything else in this project works without it — see Section 6. |
| World ID Orb verification | N/A (this part's already free) | Use **World ID Sandbox App** — free, remote, no Orb needed |
| Bazantic | Free signup | No cost found in docs |

## 3. System Architecture

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

## 4. Bounty Mapping & Priority Order

Build in this order — each stage is a complete, demoable milestone on its own, so if you run out of time you still have submittable work.

| Priority | Component | Track | Prize | Cost |
|---|---|---|---|---|
| **1 (Day 1)** | ENS identity | ENS — Best Use of ENSv2 | $4,500 | $0 |
| **2 (Day 1)** | Graph data | The Graph — Best AI Use Case | $5,000 | $0 |
| **3 (Day 2)** | Hedera payments | Hedera — AI & Agentic Payments | $6,000 | $0 |
| **4 (Day 2)** | World verification | World — AgentKit *(Continuity only — see note)* | $3,500 | $0 |
| **5 (Day 3)** | Bazantic discovery | Bazantic — Agentify/Recipe | up to $3,000 | $0 |
| **Optional** | Ledger security | Ledger — AI Agents x Ledger | $3,500 | **Requires owning a Ledger device** |

**Realistically achievable free-tier total: up to $19,000** across tracks 1–5 (World track only if you register as Continuity honestly — see PRD 04).

## 5. Tech Stack (all free/open source)

| Layer | Choice | Cost |
|---|---|---|
| Runtime | Node.js 20 + TypeScript | Free |
| Package manager | pnpm | Free |
| Agent framework | MCP client (`@modelcontextprotocol/sdk`) | Free |
| Blockchain lib | `viem` | Free |
| Identity | ENSv2 contracts on Sepolia | Free (testnet) |
| Data | Subgraph MCP via free Studio API key | Free (100k q/mo) |
| Payments | x402 protocol + Blocky402 facilitator, Hedera testnet | Free (testnet) |
| Human verification | World ID Sandbox App | Free |
| Discovery | Bazantic free account | Free |
| Frontend | Next.js 14 + Tailwind (deploy to Vercel free tier) | Free |
| Hosting | Vercel (frontend) + Render/Railway free tier or your own laptop (agent + API) | Free tier sufficient for a demo |
| Version control | GitHub (public repo, free) | Free |

## 6. Repo Structure

```
agentpass/
├── apps/
│   ├── agent/              # core agent runtime
│   ├── api/                # x402-gated risk endpoint
│   └── dashboard/           # Next.js demo UI
├── packages/
│   ├── ens-identity/         # ENSv2 Sepolia subname + Enhanced Access Control
│   ├── graph-client/          # Subgraph MCP wrapper + risk engine
│   ├── hedera-payments/        # x402 client (Blocky402) on Hedera testnet
│   ├── world-verify/           # World ID Sandbox / AgentKit helper
│   └── bazantic-discovery/      # Gateway + Recipe registration
├── docs/
│   ├── architecture.md
│   ├── demo-script.md
│   └── free-tier-setup.md      # every signup link + free-tier limit, in one place
├── FEEDBACK.md
└── README.md
```

## 7. Prerequisite Signups (do these FIRST, all free, ~20 min total)
1. **MetaMask wallet** (or any EVM wallet) — needed for ENS Studio, Hedera testnet, everything
2. **thegraph.com/studio** → connect wallet → create free API key (100k queries/month)
3. **Sepolia testnet ETH** → use a public Sepolia faucet (e.g. `sepoliafaucet.com`, or Alchemy/Infura's free Sepolia faucet)
4. **Hedera testnet account** → `portal.hedera.com` → free testnet account + free test HBAR from the built-in faucet
5. **World ID Sandbox access** → fill the sandbox access form linked in World's docs (free, may take a short approval time — apply Day 0/1 immediately)
6. **Bazantic account** → sign up at bazantic.com (free)
7. **GitHub repo** → create public repo `agentpass`

## 8. Build Timeline (3-day hackathon)

**Day 1 — Identity + Data**
- Morning: run through Section 7 signups, scaffold monorepo (`pnpm init`, folder structure above)
- Midday: register ENSv2 subname on Sepolia (`packages/ens-identity`) — see PRD 01
- Afternoon: wire Subgraph MCP + risk engine (`packages/graph-client`) — see PRD 02
- ✅ Milestone: agent has a name, can query live chain data, both fully free

**Day 2 — Payments + Human Trust**
- Morning: stand up x402-gated `/analyze` endpoint on Hedera testnet — see PRD 03
- Afternoon: World ID Sandbox verification gate — see PRD 04
- ✅ Milestone: agent pays for its own queries with free testnet HBAR, gated by human verification

**Day 3 — Discovery + Polish**
- Morning: Bazantic Gateway + Recipe — see PRD 05
- Afternoon: record all demo videos, write READMEs, FEEDBACK.md, submission forms
- (Optional, only if you own a Ledger device) — see PRD 06

## 9. Definition of Done
- [ ] Entire stack runs with `pnpm dev` from a single free-tier setup — no paid API keys anywhere
- [ ] `docs/free-tier-setup.md` documents every signup + limit so judges can reproduce it for $0
- [ ] Live testnet transactions for: ENS subname registration, Hedera x402 payment, Graph query
- [ ] One demo video per track, within that sponsor's time limit
- [ ] Public MIT-licensed GitHub repo with per-track README sections

## 10. Risk Notes
- **Subgraph Studio 100k/month limit**: trivial for hackathon demo traffic, but cache repeated queries locally during development so you don't burn quota on hot-reloads.
- **World ID Sandbox approval**: apply the moment you start — don't leave it for Day 2.
- **ENSv2 is beta**: budget extra time; if it breaks, fall back to a simpler ENSv1 Sepolia subname registration so you still have *something* to demo (though it won't fully qualify for the ENSv2-specific bounty).
- **Ledger track needs real hardware**: if you don't own a Ledger device, skip PRD 06 entirely — nothing else in this project depends on it.
