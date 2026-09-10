// @agentpass/hedera-payments
// x402 payment client (Blocky402) on Hedera testnet
// Real implementation in Phase 4

export const HEDERA_PACKAGE_VERSION = "0.1.0";

export interface PaymentReceipt {
  txHash: string;
  amount: number;
  currency: string;
  timestamp: number;
  explorerUrl: string;
}

export async function callPaidEndpoint(
  url: string,
  body: object,
  maxBudget: number
): Promise<{ data: unknown; receipt: PaymentReceipt }> {
  throw new Error("Not implemented — use mock data until Phase 4");
}
