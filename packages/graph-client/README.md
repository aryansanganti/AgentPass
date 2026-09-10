# `@agentpass/graph-client`

Reusable Subgraph MCP wrapper + DeFi risk scoring engine for AgentPass (and any other project).

## What it does

1. Connects to **The Graph's Subgraph MCP** (`https://subgraphs.mcp.thegraph.com/sse`) with your free Studio API key
2. Runs a **Messari standardized lending schema** query against Aave V3 + Compound V3 Ethereum subgraphs
3. Turns raw positions into a reasoned **`RiskReport`** (score, factors, recommendation) — never dumps raw GraphQL to the UI
4. Caches identical wallet queries for **60s** so local hot-reloads don't burn the free 100k queries/month

## Install (standalone)

```bash
# from this package
pnpm add @modelcontextprotocol/sdk dotenv
```

Copy `mcp-config.json` into your agent runtime if you want Claude/Cursor to talk to Subgraph MCP directly.

## Env

```bash
GRAPH_API_KEY=your_subgraph_studio_api_key   # free at https://thegraph.com/studio
```

## Usage

```ts
import { analyzeWalletRisk, queryLendingPositions, computeRisk } from "@agentpass/graph-client";

const report = await analyzeWalletRisk("0x...");
// { riskScore, factors, recommendation, positions, source, ... }

const { positions, source } = await queryLendingPositions("0x...", ["aave", "compound"]);
const scored = computeRisk("0x...", positions, { source });
```

## Subgraphs used (Messari standardized lending schema)

| Protocol     | Network  | Subgraph ID                                      |
|--------------|----------|--------------------------------------------------|
| Aave V3      | Ethereum | `HB1Z2EAw4rtPRYVb2Nz8QGFLHCpym6ByBX6vbCViuE9F` |
| Compound V3  | Ethereum | `AwoxEZbiWLvv6e3QdvdMZw4WDURdGbvPfHmZRc8Dpfz9` |

Schema reference: [messari/subgraphs `schema-lending.graphql`](https://github.com/messari/subgraphs/blob/master/schema-lending.graphql)

## Transport notes

- **Primary:** Subgraph MCP tool `execute_query_by_subgraph_id`
- **Fallback:** Graph Gateway HTTP (`gateway.thegraph.com`) with the same Studio key if MCP SSE fails in the current runtime (e.g. some serverless environments)

Both paths are live network data — no static fixtures.

## Smoke test

```bash
# from monorepo root, with GRAPH_API_KEY in .env
pnpm --filter @agentpass/graph-client exec tsx scripts/smoke-test.ts 0xYourWallet
```

## Cost

$0 — Subgraph Studio Free Plan = 100,000 queries/month.
