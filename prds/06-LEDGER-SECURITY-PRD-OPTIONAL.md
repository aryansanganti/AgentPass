# PRD 06 (OPTIONAL): Non-Leaking Key Layer (`packages/ledger-signer`)
**Target Bounty:** Ledger — AI Agents x Ledger — $3,500
**Cost: ⚠️ NOT FREE unless you already own a Ledger hardware device.**

---

## 1. Read This First
Per Ledger's own current documentation, `wallet-cli ring init` — the command that provisions the Key Ring — **must be run once via a physical Ledger device**. After that one-time setup, `ring encrypt`/`ring decrypt` work without the device plugged in, but the initial provisioning is hardware-gated. A Ledger device (Nano/Flex/Stax) costs roughly $79–$249.

**If you don't already own one: skip this PRD entirely.** Nothing else in AgentPass depends on it — PRDs 01–05 form a complete, demoable, free product on their own, addressing up to $19,000 in Start-Fresh-eligible prizes.

**If you already own a Ledger device**, this component is a strong addition — proceed below.

## 2. Goal
Route all signing for the agent's Hedera payments (PRD 03) and ENS writes (PRD 01) through a capability broker backed by the Ledger Key Ring, so the agent never holds a raw private key, and high-risk actions require physical device confirmation.

## 3. Step-by-Step Build (only if you own the hardware)

### Step 1 — Install the Ledger Wallet CLI
```bash
# follow current install instructions at developers.ledger.com/docs/ai-tools/ledger-cli
```
Confirm your device is genuine:
```bash
wallet-cli genuine-check
```

### Step 2 — Provision the Key Ring (one-time, requires the device)
```bash
wallet-cli ring init
```
You'll be prompted for a password — set one; do **not** use `--unsecure-no-password` for anything beyond throwaway testing.

### Step 3 — Enroll a second, headless host (no device needed after this point)
On your VPS/CI runner (or just a second terminal to simulate this for the demo):
```bash
# ring encrypt/decrypt need network access to restore the trustchain, but no device
wallet-cli ring encrypt --key agentpass-signing -i ./secret.txt -o ./secret.enc
```
This demonstrates: *"Bring the Key Ring to hosts with no USB port."*

### Step 4 — Build the capability broker
`packages/ledger-signer/src/broker.ts`:
- Agent requests a scoped capability ("sign one Hedera payment ≤ 0.1 HBAR")
- Broker checks a threshold policy (`policy.ts`)
- Below threshold → auto-relay to `wallet-cli` for signing
- Above threshold → require live device confirmation before relaying

### Step 5 — Wire into PRD 03 and PRD 01
- Replace any raw key usage in `hedera-payments/client.ts` and `ens-identity/roles.ts` with calls through this broker.

## 4. Demo Script
1. Show the broker rejecting a direct raw-key request from the agent.
2. Show a low-value payment auto-signed via the Key Ring.
3. Show a high-value payment triggering a live device confirmation — approve it on camera.
4. Show the headless `ring encrypt`/`decrypt` flow running against a machine with no device attached.

## 5. Qualification Checklist
- [ ] Built on the Ledger Agent Stack, specifically `wallet-cli ring`
- [ ] Device-backed security demonstrably central — no raw-key code path exists
- [ ] Demonstrates scoped capability + headless host + human-in-the-loop threshold

## 6. Definition of Done
- [ ] Capability broker fully intermediates signing
- [ ] Threshold-based confirmation demonstrably triggers, not just configured
- [ ] Headless enrollment demonstrated
- [ ] README documents the threat model clearly
- [ ] **Total cost: $0 in software, but requires hardware you must already own**
