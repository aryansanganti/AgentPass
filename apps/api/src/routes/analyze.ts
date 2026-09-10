import { Hono } from "hono";
import { analyzeWalletRisk } from "@agentpass/graph-client";

export const analyzeRoutes = new Hono();

/**
 * Paid risk analysis — gated by x402 middleware on the parent app.
 * Body: { wallet: string, protocols?: string[] }
 */
analyzeRoutes.post("/", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const wallet = typeof body.wallet === "string" ? body.wallet : "";
  const protocols = Array.isArray(body.protocols)
    ? body.protocols.map(String)
    : ["aave", "compound"];

  if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return c.json({ error: "`wallet` must be a valid 0x address" }, 400);
  }

  const report = await analyzeWalletRisk(wallet, protocols);
  return c.json({
    ok: true,
    report,
    meta: {
      pricedIn: "HBAR",
      network: "hedera:testnet",
      agent: "sentinel.agentpass.eth",
    },
  });
});

analyzeRoutes.get("/health", (c) => c.json({ ok: true, route: "/analyze" }));
