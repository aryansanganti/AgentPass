export const HEDERA_PACKAGE_VERSION = "0.1.0";

export {
  callPaidEndpoint,
  analyzePaid,
  BudgetDeclinedError,
  AgentBudget,
  createSessionBudget,
  unlockSessionBudget,
  getSessionBudget,
  NotHumanBackedError,
} from "./client";

export type {
  PaymentReceipt,
  PaidCallResult,
  BudgetState,
  HcsLogEntry,
} from "./client";

export { logPaymentToHcs } from "./hcs-log";
export {
  FACILITATOR_URL,
  ANALYZE_API_URL,
  DEFAULT_SESSION_BUDGET_HBAR,
  HEDERA_CAIP2,
} from "./config";
