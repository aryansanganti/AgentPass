import {
  isHumanBacked,
  requireHumanBacked,
  type WorldCredential,
  NotHumanBackedError,
} from "@agentpass/world-verify";

export interface BudgetState {
  total: number;
  remaining: number;
  spent: number;
  currency: "HBAR";
  /** False until World ID human-backing unlocks spend (PRD 04 → PRD 03) */
  unlocked: boolean;
}

/**
 * Per-session agent spend budget. Declines payments that would overspend.
 * Starts locked (remaining 0) until a verified WorldCredential unlocks it.
 */
export class AgentBudget {
  private remaining: number;
  readonly total: number;
  readonly currency = "HBAR" as const;
  private unlocked: boolean;

  constructor(totalHbar: number, unlocked = true) {
    if (totalHbar < 0) throw new Error("Budget cannot be negative");
    this.total = totalHbar;
    this.unlocked = unlocked;
    this.remaining = unlocked ? totalHbar : 0;
  }

  get state(): BudgetState {
    return {
      total: this.total,
      remaining: round6(this.remaining),
      spent: round6(this.unlocked ? this.total - this.remaining : 0),
      currency: "HBAR",
      unlocked: this.unlocked,
    };
  }

  /**
   * @throws if locked or price exceeds remaining budget
   */
  assertCanAfford(priceHbar: number): void {
    if (!this.unlocked) {
      throw new NotHumanBackedError(
        "Agent budget is locked until World ID human verification completes."
      );
    }
    if (priceHbar > this.remaining) {
      throw new BudgetDeclinedError(priceHbar, this.remaining);
    }
  }

  deduct(priceHbar: number): BudgetState {
    this.assertCanAfford(priceHbar);
    this.remaining = round6(this.remaining - priceHbar);
    return this.state;
  }
}

export class BudgetDeclinedError extends Error {
  readonly code = "BUDGET_DECLINED";

  constructor(
    readonly price: number,
    readonly remaining: number
  ) {
    super(
      `Over budget, declining: price ${price} HBAR exceeds remaining budget ${remaining} HBAR`
    );
    this.name = "BudgetDeclinedError";
  }
}

function round6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

/** Process-wide default session budget (reset via createSessionBudget) */
let sessionBudget: AgentBudget | null = null;

/**
 * Create a session budget. Without a verified WorldCredential the budget
 * stays locked at 0 remaining (PRD 04 gates PRD 03).
 */
export function createSessionBudget(
  totalHbar: number,
  credential?: WorldCredential | null
): AgentBudget {
  const unlocked = isHumanBacked(credential);
  sessionBudget = new AgentBudget(totalHbar, unlocked);
  return sessionBudget;
}

/**
 * Unlock (or create) a spendable budget after World ID verification.
 * @throws NotHumanBackedError
 */
export function unlockSessionBudget(
  totalHbar: number,
  credential: WorldCredential
): AgentBudget {
  requireHumanBacked(credential);
  sessionBudget = new AgentBudget(totalHbar, true);
  return sessionBudget;
}

export function getSessionBudget(defaultTotal: number): AgentBudget {
  if (!sessionBudget) {
    // Locked until verify — callers that need spend must unlock first
    sessionBudget = new AgentBudget(defaultTotal, false);
  }
  return sessionBudget;
}

export { NotHumanBackedError };
