import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import * as dotenv from "dotenv";
import { resolve } from "path";
import { queryCache } from "./cache";
import { lendingPositionsQuery, type MessariAccountResponse } from "./queries/lending";
import {
  LENDING_SUBGRAPHS,
  type LendingPosition,
  type ProtocolSubgraph,
} from "./types";

dotenv.config({ path: resolve(process.cwd(), ".env") });
dotenv.config({ path: resolve(process.cwd(), "../../.env") });

export const SUBGRAPH_MCP_URL = "https://subgraphs.mcp.thegraph.com/sse";
export const GRAPH_GATEWAY_BASE = "https://gateway.thegraph.com/api";

function getApiKey(): string {
  const key = process.env.GRAPH_API_KEY;
  if (!key || key === "your_subgraph_studio_api_key") {
    throw new Error(
      "GRAPH_API_KEY is not set. Create a free key at https://thegraph.com/studio and add it to .env"
    );
  }
  return key;
}

function parseToolText(result: unknown): unknown {
  const r = result as {
    content?: Array<{ type: string; text?: string }>;
    structuredContent?: unknown;
    isError?: boolean;
  };

  if (r?.isError) {
    const msg = r.content?.map((c) => c.text).filter(Boolean).join("\n") || "MCP tool error";
    throw new Error(msg);
  }

  if (r?.structuredContent) return r.structuredContent;

  const text = r?.content?.find((c) => c.type === "text")?.text;
  if (!text) return result;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Connect to The Graph's hosted Subgraph MCP over SSE and execute a GraphQL query
 * via `execute_query_by_subgraph_id`.
 */
export async function executeViaMcp(
  subgraphId: string,
  query: string
): Promise<{ data: unknown; source: "subgraph-mcp" }> {
  const apiKey = getApiKey();
  const transport = new SSEClientTransport(new URL(SUBGRAPH_MCP_URL), {
    requestInit: {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  });

  const client = new Client({ name: "agentpass-graph-client", version: "0.1.0" });

  try {
    await client.connect(transport);

    const toolResult = await client.callTool({
      name: "execute_query_by_subgraph_id",
      arguments: {
        subgraph_id: subgraphId,
        query,
      },
    });

    const parsed = parseToolText(toolResult);
    // MCP may wrap as { data: ... } or return the GraphQL payload directly
    const data =
      parsed && typeof parsed === "object" && "data" in (parsed as object)
        ? (parsed as { data: unknown }).data
        : parsed;

    return { data, source: "subgraph-mcp" };
  } finally {
    try {
      await client.close();
    } catch {
      // ignore close errors
    }
  }
}

/**
 * Direct Gateway HTTP fallback — same Studio API key, same live subgraphs.
 * Used if MCP SSE is unavailable in the current runtime.
 */
export async function executeViaGateway(
  subgraphId: string,
  query: string
): Promise<{ data: unknown; source: "gateway-fallback" }> {
  const apiKey = getApiKey();
  const url = `${GRAPH_GATEWAY_BASE}/${apiKey}/subgraphs/id/${subgraphId}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gateway query failed (${res.status}): ${body.slice(0, 200)}`);
  }

  const json = (await res.json()) as { data?: unknown; errors?: Array<{ message: string }> };
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }

  return { data: json.data, source: "gateway-fallback" };
}

export async function executeSubgraphQuery(
  subgraphId: string,
  query: string
): Promise<{ data: unknown; source: "subgraph-mcp" | "gateway-fallback" }> {
  const cacheKey = `q:${subgraphId}:${query}`;
  const cached = queryCache.get<{ data: unknown; source: "subgraph-mcp" | "gateway-fallback" }>(
    cacheKey
  );
  if (cached) return cached;

  try {
    const result = await executeViaMcp(subgraphId, query);
    queryCache.set(cacheKey, result);
    return result;
  } catch (mcpError) {
    console.warn(
      "[graph-client] Subgraph MCP failed, falling back to Gateway:",
      mcpError instanceof Error ? mcpError.message : mcpError
    );
    const result = await executeViaGateway(subgraphId, query);
    queryCache.set(cacheKey, result);
    return result;
  }
}

function toNumber(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function nativeAmount(balance: string, decimals: string | number): number {
  const d = toNumber(decimals);
  const raw = BigInt(balance || "0");
  // Avoid float overflow for huge balances — divide via Number after scaling
  const scale = 10 ** Math.min(d, 18);
  return Number(raw) / scale;
}

/**
 * Collapse Messari LENDER/BORROWER position rows into one LendingPosition per market asset.
 */
export function mapMessariPositions(
  protocolName: string,
  data: MessariAccountResponse
): LendingPosition[] {
  const account = data?.account;
  if (!account?.positions?.length) return [];

  type Agg = {
    protocol: string;
    asset: string;
    supplied: number;
    borrowed: number;
    suppliedUsd: number;
    borrowedUsd: number;
    liquidationThreshold: number;
    maximumLTV: number;
  };

  const byMarket = new Map<string, Agg>();

  for (const pos of account.positions) {
    const marketId = pos.market?.id || pos.id;
    const symbol = pos.asset?.symbol || pos.market?.inputToken?.symbol || "UNKNOWN";
    const decimals = pos.asset?.decimals ?? pos.market?.inputToken?.decimals ?? 18;
    const price = toNumber(pos.market?.inputTokenPriceUSD);
    const amount = nativeAmount(pos.balance, decimals);
    const usd = amount * price;
    const lt = toNumber(pos.market?.liquidationThreshold);
    const maxLtv = toNumber(pos.market?.maximumLTV);

    const existing = byMarket.get(marketId) || {
      protocol: protocolName,
      asset: symbol,
      supplied: 0,
      borrowed: 0,
      suppliedUsd: 0,
      borrowedUsd: 0,
      liquidationThreshold: lt,
      maximumLTV: maxLtv,
    };

    if (String(pos.side).toUpperCase() === "BORROWER") {
      existing.borrowed += amount;
      existing.borrowedUsd += usd;
    } else {
      existing.supplied += amount;
      existing.suppliedUsd += usd;
    }

    existing.liquidationThreshold = lt || existing.liquidationThreshold;
    existing.maximumLTV = maxLtv || existing.maximumLTV;
    byMarket.set(marketId, existing);
  }

  return Array.from(byMarket.values()).map((row) => {
    const ltv =
      row.suppliedUsd > 0 ? Math.round((row.borrowedUsd / row.suppliedUsd) * 1000) / 10 : 0;
    const collateralValue = row.suppliedUsd * (row.liquidationThreshold / 100);
    // Use a large finite number (not Infinity) so JSON serialization stays valid
    const healthFactor =
      row.borrowedUsd > 0
        ? Math.round((collateralValue / row.borrowedUsd) * 100) / 100
        : 999;

    return {
      protocol: row.protocol,
      asset: row.asset,
      supplied: Math.round(row.supplied * 1e6) / 1e6,
      borrowed: Math.round(row.borrowed * 1e6) / 1e6,
      suppliedUsd: Math.round(row.suppliedUsd * 100) / 100,
      borrowedUsd: Math.round(row.borrowedUsd * 100) / 100,
      ltv,
      liquidationThreshold: row.liquidationThreshold,
      healthFactor,
    };
  });
}

function resolveProtocols(protocols: string[]): ProtocolSubgraph[] {
  if (!protocols.length) return Object.values(LENDING_SUBGRAPHS);

  return protocols.map((p) => {
    const key = p.toLowerCase().replace(/\s+/g, "").replace(/v3/g, "");
    if (key.includes("aave")) return LENDING_SUBGRAPHS.aave;
    if (key.includes("compound")) return LENDING_SUBGRAPHS.compound;
    const found = LENDING_SUBGRAPHS[key];
    if (!found) {
      throw new Error(`Unknown protocol "${p}". Supported: aave, compound`);
    }
    return found;
  });
}

/**
 * Query live lending positions for a wallet across Messari-standardized subgraphs
 * via Subgraph MCP (with Gateway fallback).
 */
export async function queryLendingPositions(
  wallet: string,
  protocols: string[] = ["aave", "compound"]
): Promise<{ positions: LendingPosition[]; source: "subgraph-mcp" | "gateway-fallback" }> {
  if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    throw new Error(`Invalid wallet address: ${wallet}`);
  }

  const cacheKey = `positions:${wallet.toLowerCase()}:${protocols.join(",")}`;
  const cached = queryCache.get<{
    positions: LendingPosition[];
    source: "subgraph-mcp" | "gateway-fallback";
  }>(cacheKey);
  if (cached) return cached;

  const targets = resolveProtocols(protocols);
  const query = lendingPositionsQuery(wallet);
  const all: LendingPosition[] = [];
  let source: "subgraph-mcp" | "gateway-fallback" = "subgraph-mcp";

  for (const protocol of targets) {
    try {
      const result = await executeSubgraphQuery(protocol.subgraphId, query);
      if (result.source === "gateway-fallback") source = "gateway-fallback";
      const mapped = mapMessariPositions(
        protocol.name,
        result.data as MessariAccountResponse
      );
      all.push(...mapped);
    } catch (err) {
      console.warn(
        `[graph-client] Failed querying ${protocol.name}:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  const out = { positions: all, source };
  queryCache.set(cacheKey, out);
  return out;
}
