# PRD 04: Human-Backing Verification (`packages/world-verify`)
**Target Bounty:** World — AgentKit Continuity — $3,500 (⚠️ Continuity-track only, see note)
**Cost:** $0 — World ID Sandbox is free, no Orb hardware needed for the demo

---

## ⚠️ Important Eligibility Note
This specific bounty is **Continuity-track only** — it requires that AgentPass already existed before the event and this integration is genuinely new work added during the hackathon, documented with commit history/diff. **Build this component regardless** (it's needed for the product to make sense), but only submit it to this specific $3,500 prize if you actually start building a few days before the event opens and can show honest continuity. If you're purely Start Fresh, build this for completeness and simply don't submit to this track — no harm, no foul, and you keep the rest of your Start-Fresh submissions clean.

## 1. Goal
Let the agent prove it's acting on behalf of a **real, unique human** before it's granted spending authority (gates PRD 03's budget) or ENS write access (gates PRD 01's OPERATOR role).

## 2. Prerequisites (all free)
- [ ] Apply for **World ID Sandbox access** immediately — it's a Google Form linked from World's docs (`docs.world.org/world-id/sandbox`). Free, but may take some time to approve, so do this on Day 0/1, not Day 2.
- [ ] A World Developer Portal account (`developer.world.org`) — free signup

## 3. Step-by-Step Build

### Step 1 — Get Sandbox access
1. Fill out the Sandbox Access request form (linked in World's docs)
2. While waiting, read `docs.world.org/agents/agent-kit/integration` and `docs.world.org/world-id/sandbox/testing` fresh — copy the current SDK install commands into your notes, since exact package names can change

### Step 2 — Register your app in the Developer Portal
1. Go to `developer.world.org`
2. Create a new app (free, no payment tier gate for this)
3. Note your `app_id` — this goes in `.env`:
```
WORLD_APP_ID=app_xxxxxxxx
WORLD_ENV=sandbox
```

### Step 3 — Scaffold the package
```bash
mkdir -p packages/world-verify/src
cd packages/world-verify
pnpm init
pnpm add dotenv
pnpm add -D typescript tsx @types/node
# add World's AgentKit SDK package — confirm exact package name in current docs
```

### Step 4 — Build the verification flow
`packages/world-verify/src/agentkit.ts`:
- Trigger a World ID Sandbox verification (simulated proof-of-personhood flow, no physical device needed for testing)
- On success, receive a credential/proof object — store its hash

### Step 5 — Build the authorization gate
`packages/world-verify/src/gate.ts`:
```ts
function isHumanBacked(credential: WorldCredential): boolean { ... }

// Used by other packages:
// - hedera-payments/budget.ts: budget starts at 0 until isHumanBacked() === true
// - ens-identity/roles.ts: OPERATOR role grant requires isHumanBacked() === true
```
This is what makes the integration "meaningful" rather than decorative — it actually gates real functionality in two other components.

### Step 6 — Register in AgentBook
`packages/world-verify/src/agentbook.ts`:
- Register the agent (with its ENS name from PRD 01 as a human-readable identifier) in AgentBook so other services/agents can resolve it as verified.

### Step 7 — Write the required feedback document
`docs/world-feedback.md` — cover, in your own words:
- AgentKit docs / integration flow: what was clear, what wasn't
- Developer Portal navigation, search, product discovery, debugging
- Sandbox App states, proof flows, test users, errors, edge cases you hit
- What was confusing, missing, broken, or hard to test

This is a **required deliverable** for the bounty, not optional polish.

## 4. Demo Script
1. Show the agent attempting to spend HBAR / write an ENS record with **no verification** → both fail, with clear error messages.
2. Walk through the World ID Sandbox verification flow live.
3. Show the credential unlocking both the Hedera budget and the ENS OPERATOR role.
4. Show the AgentBook entry for the now-registered agent.
5. Briefly reference the feedback doc.

## 5. Qualification Checklist (only if submitting to this specific bounty)
- [ ] AgentKit used meaningfully — gates real functionality
- [ ] Working app demonstrating the gate
- [ ] Registered/resolved through AgentBook
- [ ] World ID Sandbox App used to test remotely
- [ ] Feedback document covering all 4 required areas
- [ ] **Registered as Continuity project**, pre-existing work clearly documented (diff/commit history)

## 6. Definition of Done
- [ ] End-to-end gate works: unverified agent provably restricted, verified agent provably unlocked
- [ ] AgentBook registration live
- [ ] Feedback doc complete
- [ ] Total cost: $0
