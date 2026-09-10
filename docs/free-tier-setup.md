# AgentPass — Free-Tier Setup Guide

> Every service below is **free** — no credit card required anywhere. Complete each signup and paste the credentials into your `.env` file.

## Prerequisites

- [ ] **Node.js 20+** — [nodejs.org](https://nodejs.org)
- [ ] **pnpm** — `npm install -g pnpm`
- [ ] **Git** — [git-scm.com](https://git-scm.com)

## Service Signups (~20 minutes total)

### 1. MetaMask Wallet (or any EVM wallet)
- [ ] Install from [metamask.io](https://metamask.io)
- [ ] Create or import a **burner/test wallet** (never use a real wallet for hackathon dev)
- Needed for: ENS Studio login, Hedera testnet, everything

### 2. The Graph — Subgraph Studio API Key
- [ ] Go to [thegraph.com/studio](https://thegraph.com/studio)
- [ ] Connect wallet (no gas cost, just a login signature)
- [ ] Click **API Keys** → **Create API Key** → name it `agentpass-hackathon`
- [ ] Optional: set query limit in security settings to stay under 100k/month
- [ ] Copy key → paste into `.env` as `GRAPH_API_KEY`
- **Free tier:** 100,000 queries/month — more than enough for hackathon dev + demo

### 3. Sepolia Testnet ETH
- [ ] Use a free Sepolia faucet:
  - [Google Cloud Sepolia Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
  - [Alchemy Sepolia Faucet](https://sepoliafaucet.com)
  - [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
- [ ] Fund your burner wallet with Sepolia ETH
- Needed for: ENS name registration on Sepolia

### 4. Hedera Testnet Account
- [ ] Sign up at [portal.hedera.com](https://portal.hedera.com)
- [ ] Create a **testnet** account → gives you Account ID (`0.0.xxxxx`) + private key
- [ ] Use the portal's built-in faucet to top up free test HBAR (repeatable)
- [ ] Copy credentials → paste into `.env` as `HEDERA_ACCOUNT_ID` and `HEDERA_PRIVATE_KEY`
- **Free:** Testnet HBAR from faucet, unlimited top-ups

### 5. World ID Sandbox Access
- [ ] ⚠️ **Apply IMMEDIATELY** — may take time to approve
- [ ] Fill out the sandbox access form: [docs.world.org/world-id/sandbox](https://docs.world.org/world-id/sandbox)
- [ ] Create app in Developer Portal: [developer.world.org](https://developer.world.org)
- [ ] Copy `app_id` → paste into `.env` as `WORLD_APP_ID`
- **Free:** Sandbox is remote, no Orb hardware needed

### 6. Bazantic Account
- [ ] Sign up at [bazantic.com](https://bazantic.com)
- [ ] Note your username → paste into `.env` as `BAZANTIC_USERNAME`
- **Free:** No payment tier mentioned in docs

### 7. GitHub Repository
- [ ] Already done — this repo!

## Quick Verification
After completing all signups, every checkbox above should be checked, and your `.env` file should have all variables filled in (based on `.env.example`).
