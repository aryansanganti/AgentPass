# World / AgentKit Feedback — AgentPass

Required deliverable for the World AgentKit Continuity bounty (PRD 04).
Update this with notes from real Sandbox / Portal usage during the hackathon.

## 1. AgentKit docs / integration flow

**What was clear**
- `createAgentBookVerifier().lookupHuman(address)` is a clean single call for resolving an agent wallet to an anonymous human id on World Chain (`eip155:480`).
- The gate pattern (human-backing before spend / role grant) maps well onto product flows.

**What wasn’t**
- Package naming: `@worldcoin/agentkit` vs older “IDKit” mental model — AgentKit is primarily the *agent continuity / x402* layer; World ID personhood still goes through IDKit + Developer Portal verify.
- Exact boundary between “register in AgentBook” (onchain write) vs “lookup in AgentBook” (read) could be clearer for hackathon demos that only have a test wallet.

## 2. Developer Portal navigation / discovery / debugging

**Notes**
- App creation is free and straightforward; you need `app_id`, `rp_id`, and `signing_key`.
- RP signature must stay server-side — easy to miss if following older IDKit v3 tutorials that put more on the client.
- Sandbox / staging simulator vs production environment naming (`WORLD_ENV=sandbox` → IDKit `staging`) should be documented in one place.

## 3. Sandbox App states, proof flows, test users, errors

**Notes**
- When portal keys are not yet approved, AgentPass falls back to a clearly labeled `sandbox-demo` credential (`WORLD_ALLOW_SANDBOX_DEMO`) so the product gate still demos.
- Nullifier reuse must be enforced by the app (we store nullifiers in `.data/world-sessions.json`).
- Edge case: AgentBook `lookupHuman` returns `null` for unregistered wallets — product should treat that as “not registered yet,” not a hard fail of World ID itself.

## 4. Confusing / missing / broken / hard to test

**Fill in during live Sandbox testing**
- [ ] Time to Sandbox form approval
- [ ] Simulator QR / connect reliability
- [ ] v4 verify endpoint error messages quality
- [ ] AgentBook registration path for a fresh agent wallet
- [ ] Anything broken in IDKit React widget with Next.js App Router

---

*AgentPass wires World ID as Step 2 of one product flow (verify → agent identity → check risk → pay), not as a standalone demo.*
