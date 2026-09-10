# AgentPass API (`apps/api`)

Hono server that wraps `@agentpass/graph-client` behind **x402** on **Hedera testnet**, settled through the **Blocky402** facilitator.

## Run

```bash
# from monorepo root — requires .env with HEDERA_* + GRAPH_API_KEY
pnpm dev:api
# → http://localhost:4001
```

## Endpoints

| Method | Path | Auth |
|--------|------|------|
| GET | `/health` | free |
| POST | `/analyze` | **x402** — `0.05 HBAR` (configurable) |
| GET | `/analyze/health` | free |

Cold `POST /analyze` without payment returns **402** with pricing metadata. After Blocky402 settlement, retry with `X-PAYMENT` to receive the risk report.

## Env

See root `.env.example` (`HEDERA_PAY_TO`, `BLOCKY402_FACILITATOR_URL`, `ANALYZE_PRICE_HBAR`, `API_PORT`).
