import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@agentpass/ens-identity",
    "@agentpass/graph-client",
    "@agentpass/hedera-payments",
  ],
  serverExternalPackages: [
    "@modelcontextprotocol/sdk",
    "eventsource",
    "@hiero-ledger/sdk",
    "@x402/hedera",
    "@x402/fetch",
    "@x402/core",
  ],
};

export default nextConfig;
