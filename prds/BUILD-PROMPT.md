# AgentPass — Build Prompt for AI Coding Agent

> Paste everything below this line into your AI coding agent (Claude Code, Cursor, etc.) as the first message in a fresh session, with all 8 PRD files attached/available in the working directory under `/prds/`.

---

## ROLE

You are the lead engineer building **AgentPass** end-to-end, from an empty repository to a working, demoable product. You have 8 PRD files available at `/prds/`:

```
/prds/00-PRODUCT-DEFINITION-PRD.md   ← what the product IS. Read this first, always.
/prds/07-TECHNICAL-MASTER-PRD.md     ← architecture, stack, repo layout, build order
/prds/01-ENS-IDENTITY-PRD.md
/prds/02-GRAPH-DATA-PRD.md
/prds/03-HEDERA-PAYMENTS-PRD.md
/prds/04-WORLD-AGENTKIT-PRD.md
/prds/05-BAZANTIC-DISCOVERY-PRD.md
/prds/06-LEDGER-SECURITY-PRD-OPTIONAL.md   ← SKIP unless told otherwise, see rules below
```

Before writing any code, **read all 8 files in full**, in this order: `00`, `07`, `01`, `02`, `03`, `04`, `05`, `06`. Do not skim. `00` defines the product; `07` and `01–06` define how to build it. If anything in `01–06` seems to contradict `00`'s product flow, `00` wins — the product experience is the source of truth, the technical PRDs are implementation detail.

## NON-NEGOTIABLE CONSTRAINTS

1. **Zero paid services.** Every external service used must be free-tier, testnet, or sandbox, exactly as specified in each PRD's "Prerequisites" section. If you are about to use anything that requires a credit card or real-money mainnet transaction, stop and ask me first instead of proceeding.
2. **Skip PRD 06 (Ledger) entirely** unless I explicitly tell you I own a physical Ledger device. Do not scaffold it, do not leave TODOs for it in the main flow — treat it as out of scope for this build.
3. **Never hardcode secrets.** All API keys, private keys, and account IDs go in `.env` (gitignored), with a matching `.env.example` committed showing the required variable names with placeholder values.
4. **Use burner/test credentials only.** Any wallet private key you generate or ask me for must be a fresh testnet-only key. If I paste anything that looks like a real mainnet key or seed phrase, stop and warn me instead of using it.
5. **Build the product flow first, integrations second.** Follow the phased plan below — do not jump straight to wiring all 6 sponsor integrations before the app shell and mock flow exist.
6. **When a PRD references external docs/contract addresses that may have changed** (ENSv2 Sepolia addresses, Blocky402 facilitator endpoint, World AgentKit package names), do not guess from training data — either ask me to paste the current value from the linked docs, or use a web search / fetch tool if you have one available, and record whatever you find in `docs/ens-addresses.md` / equivalent, exactly as each PRD instructs.

## BUILD PHASES

Work through these phases **in order**. At the end of each phase, stop, summarize what you built, list what's mocked vs. real, and wait for my go-ahead before starting the next phase — unless I've told you to run autonomously through all phases.

### Phase 0 — Setup
- Initialize the monorepo exactly per the repo structure in `07-TECHNICAL-MASTER-PRD.md` Section 6
- Set up `pnpm` workspaces, TypeScript config, ESLint/Prettier, a root `README.md` stub, `.gitignore`, `.env.example`
- Create `docs/free-tier-setup.md` and pre-fill it with every signup link from `07`'s Section 7, with empty checkboxes — I will fill in actual keys as I complete signups
- Do NOT wire any real external service yet

### Phase 1 — Product Shell (mocked data)
- Build `apps/dashboard` implementing the **Home → Live Check → Result** flow from `00-PRODUCT-DEFINITION-PRD.md` Section 3–4, using **hardcoded mock data** for now (fake risk score, fake ENS name, fake activity log with realistic timing/animation)
- This is the single most important phase — it defines the shape every real integration will plug into. Get the UX right before touching any blockchain SDK.
- Deliverable: I can run `pnpm dev`, type any wallet address, click "Check my risk", and watch a believable (but fake) end-to-end flow

### Phase 2 — ENS Identity (real, per PRD 01)
- Follow PRD 01 step-by-step exactly
- Build `packages/ens-identity` as specified
- Replace the mocked "agent identity" data in the dashboard with real ENS Sepolia reads
- Deliverable: the Agent Profile view shows real, live text records from a real Sepolia subname

### Phase 3 — Graph Data (real, per PRD 02)
- Follow PRD 02 step-by-step exactly
- Build `packages/graph-client`
- Replace the mocked "querying positions" step in the Live Check activity log with a real Subgraph MCP call, and the mocked risk score with real `computeRisk()` output
- Deliverable: typing a real wallet address returns a real, live-computed risk score

### Phase 4 — Hedera Payments (real, per PRD 03)
- Follow PRD 03 step-by-step exactly
- Build `apps/api` and `packages/hedera-payments`
- Replace the mocked "paying via x402" step with a real 402 → pay → retry flow against Hedera testnet
- Deliverable: the Result screen shows a real, verifiable Hedera testnet transaction hash

### Phase 5 — World Verification (real, per PRD 04)
- Follow PRD 04 step-by-step exactly
- Build `packages/world-verify`
- Wire the one-time Verify step from `00`'s flow to a real World ID Sandbox check, and make it actually gate the Hedera budget and ENS write access (not just a UI checkbox)
- Deliverable: an unverified session provably cannot spend or write; a verified one can

### Phase 6 — Bazantic Discovery (real, per PRD 05)
- Follow PRD 05 step-by-step exactly
- Build `packages/bazantic-discovery`
- Build the secondary "Developer/Agent Access" screen from `00`'s Section 4, including the A/B comparison artifact
- Deliverable: the `/analyze` endpoint is a live Bazantic Gateway + Recipe, with recorded before/after evidence

### Phase 7 — Polish & Submission Artifacts
- Write/finalize: root `README.md` (architecture diagram + per-track section, per `07` Section 9), `FEEDBACK.md`, `docs/world-feedback.md`, `docs/ens-addresses.md`, `docs/bazantic/recipe.md`, `docs/bazantic/ab-test.md`
- Add a `docs/demo-script.md` that is literally the narrative from `00` Section 5, ready to read on camera
- Run through every "Qualification Requirements Checklist" in PRDs 01–05 and mark each item done/not-done honestly
- Flag anything still mocked or incomplete — do not silently leave fake data in a "done" build

## HOW TO HANDLE BLOCKERS

- If a sponsor's free tier, sandbox, or docs turn out to have changed or broken since the PRD was written, tell me immediately with specifics, propose the smallest viable fallback (see each PRD's "Risk Notes"), and wait for my decision rather than silently improvising a workaround that might drift from the product spec in `00`.
- If you're unsure whether something counts as "meaningfully using" a sponsor's product (vs. decorative), re-read that PRD's "Why This Wins the Bounty" section and match your implementation to that bar, not the minimum technically-required bar.
- If a phase is taking much longer than expected, tell me — don't silently cut corners on Phase 1's UX quality to rush ahead, since that phase is the foundation every later phase plugs into.

## OUTPUT STYLE WHILE BUILDING

- Work in small, reviewable commits, one logical change per commit, with clear commit messages (this also helps prove genuine Start-Fresh build history if anyone checks)
- After each phase, give me a short status report: what's built, what's real vs. mocked, what I need to do manually (signups, funding a testnet wallet, approving a sandbox request), and what's next
- Don't ask me to re-explain the product — everything you need is in the 8 PRD files. Ask me only for things only I can provide: API keys, approvals, and judgment calls on tradeoffs.

---

**Start now with Phase 0.** Confirm you've read all 8 PRD files first, then proceed.
