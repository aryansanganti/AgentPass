# PRD 02: Live Data Layer (`packages/graph-client`)
**Target Bounty:** The Graph — Best AI Tooling or AI Use Case (Start Fresh) — $5,000
**Cost:** $0 — Subgraph Studio free plan = 100,000 queries/month, no credit card required

---

## 1. Goal
Wire the agent to **live** blockchain data via The Graph's **Subgraph MCP**, then do real reasoning (a risk score) on top of it — not just print raw query results.

## 2. Prerequisites (confirmed free)
- [ ] Any Web3 wallet (MetaMask etc.) — required just to log into Subgraph Studio, no funds needed
- [ ] Node.js 20+, `npx`/`bunx` available

## 3. Step-by-Step Build

### Step 1 — Get your free Gateway API key
1. Go to `thegraph.com/studio`
2. Connect your wallet (no signature costs gas, it's just a login)
3. Click **API Keys** → **Create API Key** → name it `agentpass-hackathon`
4. Optional but recommended: set a spending/query limit in the key's security settings so you can't accidentally exceed the free 100k/month tier
5. Copy the key into `.env`:
```
GRAPH_API_KEY=your_key_here
```
You are now on the **Free Plan: 100,000 queries/month**, sufficient for an entire hackathon's dev + demo traffic.

### Step 2 — Connect the Subgraph MCP
The MCP server is hosted by The Graph — you don't deploy anything yourself.
```jsonc
// mcp-config.json (used by your agent runtime)
{
  "mcpServers": {
    "subgraph": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "--header", "Authorization:${AUTH_HEADER}",
        "https://subgraphs.mcp.thegraph.com/sse"
      ],
      "env": { "AUTH_HEADER": "Bearer ${GRAPH_API_KEY}" }
    }
  }
}
```

### Step 3 — Scaffold the package
```bash
mkdir -p packages/graph-client/src
cd packages/graph-client
pnpm init
pnpm add @modelcontextprotocol/sdk dotenv
pnpm add -D typescript tsx @types/node
```

### Step 4 — Wrap the MCP client
`packages/graph-client/src/mcp.ts`:
- Connect to the Subgraph MCP using the config above.
- Expose a simple function `queryLendingPositions(wallet: string, protocols: string[])` that uses the MCP's schema + query tools to pull real position data (e.g. Aave, Compound) for a wallet.
- Test it manually first with a well-known public wallet address to confirm live data comes back (don't burn quota with broken queries in a loop).

### Step 5 — Standardized query across protocols (stretch, for the second Graph track)
`packages/graph-client/src/queries/lending.ts`:
- Use a **Messari Standardized Subgraph** schema so the same query shape works whether it's pointed at Aave, Compound, or another lending protocol.
- This one addition makes the package also eligible for "Best Use of Composable or Standardized Graph Products" ($5,000).

### Step 6 — Risk scoring engine
`packages/graph-client/src/risk-engine.ts`:
```ts
interface RiskReport {
  wallet: string;
  riskScore: number;       // 0-100
  factors: string[];       // e.g. "high LTV on Aave (82%)"
  recommendation: "reduce exposure" | "hold" | "safe";
}
function computeRisk(positions: LendingPosition[]): RiskReport { ... }
```
This is the "meaningful work with the data" the bounty requires — raw MCP output is never shown to the user directly, only this reasoned output.

### Step 7 — Local caching (protect your free quota)
`packages/graph-client/src/cache.ts` — a simple in-memory (or file-based) cache with a short TTL (e.g. 60s) so repeated dev-time queries for the same wallet don't multiply your quota usage.

### Step 8 — Export as reusable infra
Add a `README.md` inside `packages/graph-client/` explaining how another project could `import` this package standalone — satisfies the "tooling submissions must be reusable infrastructure" requirement.

## 4. Demo Script
1. In the dashboard, type: "What's my risk exposure on wallet 0x...?"
2. Show the MCP request/response live (open dev console or log output) hitting Subgraph MCP with your free API key.
3. Show `computeRisk()` turning raw positions into a scored, reasoned recommendation.
4. (Stretch) Re-run the same query function against a second protocol to show the standardized-schema composability, same code path.

## 5. Qualification Checklist
- [ ] The Graph is load-bearing (verifiable in code, not decorative)
- [ ] Live data via Subgraph MCP / Subgraph Studio key — no static JSON fixtures
- [ ] Meaningful reasoning output, not a raw query dump
- [ ] Package importable/reusable independent of the rest of the repo
- [ ] Open source, README, demo video (2–4 min)
- [ ] Pool: **Net-new / Start Fresh**

## 6. Definition of Done
- [ ] Live Subgraph MCP connection confirmed working with real data, end to end
- [ ] Risk engine produces non-trivial reasoning
- [ ] Caching in place so you stay comfortably under 100k queries/month
- [ ] Package README documents which subgraphs/schemas are used
- [ ] Total cost: $0
