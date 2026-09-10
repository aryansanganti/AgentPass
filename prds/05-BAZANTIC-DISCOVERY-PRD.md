# PRD 05: Discoverability Layer (`packages/bazantic-discovery`)
**Target Bounties:**
- Best Recipe using EthGlobal Sponsor APIs — $1,000 (Start Fresh eligible)
- Agentify a New API — $1,000 (Start Fresh eligible)
- Help an Agent Use Your Project — $1,000 (⚠️ Continuity-track only, same note as PRD 04)

**Cost:** $0 — Bazantic account signup is free

---

## 1. Goal
Make the `/analyze` endpoint from PRD 03 discoverable and usable by **any** agent (not just your own) via a Bazantic Gateway + Recipe, and prove a Recipe measurably improves how well an LLM uses it.

## 2. Prerequisites (free)
- [ ] Account at `bazantic.com`
- [ ] Your Hedera `/analyze` endpoint already live (from PRD 03)

## 3. Step-by-Step Build

### Step 1 — Create your Bazantic account
1. Sign up at `bazantic.com` (free, no payment tier mentioned in docs)
2. Note your account identifier (email or GitHub handle) — you'll need to include this in every submission for attribution

### Step 2 — Deploy an x402/MPP Gateway
1. In Bazantic, create a new **x402/MPP Gateway** pointed at your `/analyze` endpoint
2. This wraps your Hedera-testnet-priced endpoint so Bazantic-connected agents can discover and pay for it through the same x402 flow

### Step 3 — Deploy an MCP server for the endpoint
1. Use Bazantic's flow to also expose `/analyze` as an **MCP server**, so Claude/Cursor/etc. can call it directly as a tool, not just via raw HTTP

### Step 4 — Write your Recipe
`docs/bazantic/recipe.md` (also entered into Bazantic's Recipe builder):
- **When**: before executing a large trade, rebalance, or lending action
- **Why**: avoid liquidation / unexpected loss
- **How**: call `/analyze` with a wallet address → pay per call via x402 → parse the returned `riskScore` and `recommendation` → act accordingly

### Step 5 — Run the A/B improvement test
1. Pick one fixed prompt, model, and settings.
2. **Run 1 (no Recipe):** give an agent only the raw API spec for `/analyze`. Record what it does — does it correctly handle the `402`, pay, and parse the result?
3. **Run 2 (with Recipe):** give the same agent your Recipe. Record the same.
4. Document both runs, side by side, in `docs/bazantic/ab-test.md` — this is your evidence of "measurable, repeatable improvement."

### Step 6 — Chain a second service (for the "Best Recipe" track)
- Pick one other sponsor API already available in Bazantic or from this event's sponsor list (e.g. a Uniswap swap-quote endpoint).
- Extend your Recipe so the risk score from `/analyze` feeds into a decision about whether to also fetch a swap quote — producing "risk-adjusted swap recommendation," a result neither service alone could produce.

## 4. Demo Script
1. Show an agent calling the raw API with no Recipe → it fumbles (misses payment step, or misreads the JSON).
2. Show the same agent with the Recipe loaded → correctly pays and acts on the risk score.
3. Show the chained two-service Recipe completing the combined task.

## 5. Qualification Checklist

**Agentify a New API:**
- [ ] Account created, Gateway deployed
- [ ] Service not previously on Bazantic, not offered by another sponsor at event start
- [ ] Working Gateway + Recipe, screen recording, Bazantic username included

**Best Recipe with Sponsor APIs:**
- [ ] Uses ≥1 other Bazantic/sponsor service alongside your own
- [ ] Result depends meaningfully on both services
- [ ] Screen recording of the full flow

**Help an Agent Use Your Project (Continuity only — submit only if eligible per PRD 04's note):**
- [ ] Same prompt/model/settings, Recipe is the only variable
- [ ] Documented, repeatable improvement
- [ ] Video walking through the difference

## 6. Definition of Done
- [ ] Live Gateway + MCP server on bazantic.com
- [ ] ≥1 Recipe fully documented and demoed
- [ ] A/B comparison documented with concrete before/after evidence
- [ ] Bazantic username included in every relevant submission
- [ ] Total cost: $0
