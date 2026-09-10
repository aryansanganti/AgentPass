# PRD 00: Product Definition — What AgentPass Actually Is
**Read this FIRST, before any technical PRD.** This defines the product. The 6 technical PRDs (01–06) define how to build the pieces of it.

---

## 1. The Product, In Plain English

**AgentPass is a web app where you type a DeFi wallet address (usually your own), and an AI agent — with its own onchain name, its own money, and proof it's working for a real human — checks that wallet's risk across protocols and tells you what to do about it, paying for its own analysis out of a small budget you give it.**

That's it. One product. One core action: **"Check my risk."** Everything else (ENS, Graph, Hedera, World, Bazantic) is *how* that one action gets done safely and verifiably — not six separate features.

## 2. Who It's For
**Primary user:** Someone with money in DeFi lending protocols (Aave, Compound, etc.) who wants an early warning before they get liquidated, but doesn't want to manually check five dashboards or hand an AI agent a permanent API key to their exchange/wallet.

**Secondary "user":** Other AI agents/developers who want to call this risk-check as a tool in their own agent (this is what the Bazantic piece is for).

## 3. The Core User Flow (this is the actual product spec)

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1 — Land on the app                                     │
│ User sees: "AgentPass — an AI agent that checks your DeFi    │
│ risk, verified human, paid per use, no API keys."             │
│ Single input: wallet address. Single button: "Check my risk". │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│ STEP 2 — First-time setup (one-time, ~30 sec)                │
│ "Before your agent can act, verify you're a real human."      │
│ → World ID Sandbox popup → verified                           │
│ → "Fund your agent's budget" → user sends test HBAR to the    │
│   agent's own testnet wallet (or it's pre-funded for demo)    │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│ STEP 3 — Agent identity is shown                              │
│ "Your agent: sentinel.agentpass.eth"                           │
│ (clickable → shows its ENS profile: capabilities, endpoint,    │
│  reputation score — all real onchain text records)             │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│ STEP 4 — User clicks "Check my risk"                          │
│ UI shows a live activity log, in real time:                   │
│  ✓ Querying The Graph (Aave, Compound positions)... done       │
│  ✓ Computing risk score...                                     │
│  ✓ Calling paid analysis endpoint — price: 0.05 HBAR            │
│  ✓ Budget check: 0.95 HBAR remaining — paying...                │
│  ✓ Payment confirmed (tx: 0xabc... — link to HashScan)          │
│  ✓ Analysis complete                                            │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│ STEP 5 — Result screen                                        │
│  Risk Score: 72/100 — "Reduce exposure"                        │
│  Factors: "High LTV on Aave (82%)", "Concentrated in ETH"       │
│  Cost of this check: 0.05 HBAR (~$0.003) — receipt link         │
│  "Your agent's reputation: 14 successful checks"                │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│ STEP 6 (secondary flow) — Developer/agent view                │
│ Separate page: "Use this agent in your own AI app"             │
│ Shows the Bazantic Recipe + MCP endpoint, with a live example  │
│ of another agent calling it and getting a better result         │
│ because the Recipe exists (the A/B comparison)                  │
└─────────────────────────────────────────────────────────────┘
```

## 4. Screens (wireframe-level, for `apps/dashboard`)

| Screen | Purpose | Key elements |
|---|---|---|
| **Home** | Entry point | Wallet input, "Check my risk" button, one-line pitch |
| **Verify** (modal/step) | One-time human verification | World ID Sandbox flow embedded |
| **Agent Profile** | Shows the agent's identity | ENS name, text records, reputation, capabilities |
| **Live Check** | Shows the agent working | Real-time log of: Graph query → risk compute → payment → result (this is your best demo screen — build it first) |
| **Result** | The actual value delivered | Risk score, factors, recommendation, cost + receipt link |
| **History** | Past checks (stretch) | List of previous checks, their scores, their tx hashes |
| **Developer/Agent Access** | Secondary audience | Bazantic Recipe, MCP connection info, A/B proof |

**Build priority:** Home → Live Check → Result are the only 3 screens required for a working demo. Agent Profile, History, and Developer Access are enhancements — build them Day 3 if time allows.

## 5. The Single Demo Narrative (use this for ALL your videos, not 6 separate stories)

> *"Meet AgentPass. It's an AI agent with its own name — sentinel.agentpass.eth — registered on ENS. Before I let it spend anything, it proves it's working for a real human, me, via World ID. Now watch: I ask it to check my DeFi risk. It pulls my live lending positions from The Graph across two protocols, computes a risk score, then — instead of using an API key — it pays for its own analysis with testnet HBAR, live, on Hedera, through x402. Here's the transaction. Here's the result: I'm at 72% risk, mostly from a high LTV position on Aave. And because this agent is registered on Bazantic with a Recipe, any other AI agent can discover and use it too — here's one doing exactly that, getting a measurably better result because the Recipe exists."*

This one narrative, told once well, is what goes in your **main submission video**. Then for each specific bounty, you record a **shorter, focused clip** zooming into just that component (ENS profile screen, the 402→payment flow, the World gate, etc.) — reusing footage from the same running app, not building six different demos.

## 6. What Makes This "One Product" Instead of "Six Features Bolted Together"
- There is **one user action** ("check my risk") — every sponsor integration is a step *inside* that one action, not a separate menu item
- There is **one continuous UI flow** — verify once, see your agent once, run checks repeatedly
- There is **one payment budget** — not six disconnected payment systems, just Hedera, used consistently
- There is **one identity** — the ENS name is shown everywhere (profile, receipts, Bazantic listing) so it visibly *is* the same agent throughout, not a different actor per screen

## 7. What Changes in the Technical PRDs
Re-read PRDs 01–05 with this frame: they are not independent deliverables, they are **implementations of Steps 2–6 above**.
- PRD 01 (ENS) → powers Step 3 (Agent Profile) and the receipts in Step 5
- PRD 02 (Graph) → powers the first line of the Step 4 activity log
- PRD 03 (Hedera) → powers the payment lines of Step 4 and the receipt in Step 5
- PRD 04 (World) → powers Step 2
- PRD 05 (Bazantic) → powers Step 6

Build `apps/dashboard` around this flow from Day 1, even with mocked data at first — it becomes the spine you plug each package into, rather than something you bolt on Day 3.

## 8. Definition of Done (product-level, not per-bounty)
- [ ] A stranger can open the app, verify once, type a wallet, and get a real risk result within ~30 seconds, with visible live activity (not a spinner)
- [ ] The agent's ENS identity is visibly the same entity across every screen and receipt
- [ ] The one demo narrative in Section 5 can be told, live, without cutting between disconnected pieces
- [ ] Every "6 separate technical PRDs" deliverable is traceable to a specific step in Section 3
