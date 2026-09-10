export interface WorldCredential {
  verified: boolean;
  hash: string;
  nullifier?: string;
  method: "world-id" | "world-id-sandbox" | "sandbox-demo";
  timestamp: number;
  action: string;
  /** Anonymous AgentBook human id when resolved */
  agentBookHumanId?: string | null;
  /** Session id issued after successful verify */
  sessionId?: string;
}

export class NotHumanBackedError extends Error {
  readonly code = "NOT_HUMAN_BACKED";

  constructor(message = "Agent is not human-backed. Complete World ID verification first.") {
    super(message);
    this.name = "NotHumanBackedError";
  }
}
