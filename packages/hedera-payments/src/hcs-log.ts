import {
  Client,
  PrivateKey,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
} from "@hiero-ledger/sdk";
import { createHash } from "crypto";
import {
  HCS_TOPIC_ID,
  HEDERA_ACCOUNT_ID,
  HEDERA_NETWORK,
  HEDERA_PRIVATE_KEY,
  assertPayerConfigured,
} from "./config";

export interface HcsLogEntry {
  topicId: string;
  sequenceNumber: string | null;
  transactionId: string;
  explorerUrl: string;
  messagePreview: string;
}

function operatorKey(): PrivateKey {
  const raw = HEDERA_PRIVATE_KEY;
  try {
    return PrivateKey.fromStringECDSA(raw);
  } catch {
    try {
      return PrivateKey.fromStringED25519(raw);
    } catch {
      return PrivateKey.fromString(raw);
    }
  }
}

function clientWithOperator(): Client {
  assertPayerConfigured();
  const client =
    HEDERA_NETWORK === "mainnet" ? Client.forMainnet() : Client.forTestnet();
  client.setOperator(HEDERA_ACCOUNT_ID, operatorKey());
  return client;
}

async function ensureTopicId(client: Client): Promise<string> {
  if (HCS_TOPIC_ID) return HCS_TOPIC_ID;

  const tx = await new TopicCreateTransaction()
    .setTopicMemo("AgentPass payment audit trail")
    .execute(client);
  const receipt = await tx.getReceipt(client);
  const topicId = receipt.topicId?.toString();
  if (!topicId) throw new Error("Failed to create HCS topic");
  console.warn(
    `[hedera-payments] Created HCS topic ${topicId} — add HCS_TOPIC_ID=${topicId} to .env to reuse it`
  );
  return topicId;
}

/**
 * Append a payment audit message to an HCS topic (testnet = free with faucet HBAR).
 */
export async function logPaymentToHcs(input: {
  paymentTxHash: string;
  wallet: string;
  riskScore: number;
  amountHbar: number;
}): Promise<HcsLogEntry> {
  const client = clientWithOperator();
  try {
    const topicId = await ensureTopicId(client);
    const resultHash = createHash("sha256")
      .update(`${input.wallet}:${input.riskScore}:${input.paymentTxHash}`)
      .digest("hex")
      .slice(0, 16);

    const message = JSON.stringify({
      type: "agentpass.payment",
      paymentTx: input.paymentTxHash,
      wallet: input.wallet,
      riskScore: input.riskScore,
      amountHbar: input.amountHbar,
      resultHash,
      ts: Date.now(),
    });

    const submit = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(message)
      .execute(client);

    const record = await submit.getRecord(client);
    const txId = submit.transactionId.toString();
    const seq = record.receipt.topicSequenceNumber?.toString() ?? null;
    const net = HEDERA_NETWORK === "mainnet" ? "mainnet" : "testnet";

    return {
      topicId,
      sequenceNumber: seq,
      transactionId: txId,
      explorerUrl: `https://hashscan.io/${net}/transaction/${txId}`,
      messagePreview: message.slice(0, 120),
    };
  } finally {
    client.close();
  }
}
