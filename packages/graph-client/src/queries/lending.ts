/**
 * Messari standardized lending schema query.
 * Same GraphQL shape works for Aave V3, Compound V3, and other Messari lending subgraphs.
 *
 * Schema: https://github.com/messari/subgraphs/blob/master/schema-lending.graphql
 */
export function lendingPositionsQuery(wallet: string): string {
  const id = wallet.toLowerCase();
  return `{
  account(id: "${id}") {
    id
    openPositionCount
    positions(where: { timestampClosed: null }, first: 100) {
      id
      side
      balance
      isCollateral
      asset {
        id
        symbol
        decimals
      }
      market {
        id
        name
        maximumLTV
        liquidationThreshold
        inputTokenPriceUSD
        inputToken {
          id
          symbol
          decimals
        }
      }
    }
  }
}`;
}

export interface MessariToken {
  id: string;
  symbol: string;
  decimals: number | string;
}

export interface MessariMarket {
  id: string;
  name: string | null;
  maximumLTV: string;
  liquidationThreshold: string;
  inputTokenPriceUSD: string;
  inputToken: MessariToken;
}

export interface MessariPosition {
  id: string;
  side: "LENDER" | "BORROWER" | string;
  balance: string;
  isCollateral: boolean | null;
  asset: MessariToken;
  market: MessariMarket;
}

export interface MessariAccountResponse {
  account: {
    id: string;
    openPositionCount: number;
    positions: MessariPosition[];
  } | null;
}
