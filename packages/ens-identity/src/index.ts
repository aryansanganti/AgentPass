import { PARENT_NAME } from "./config";
import { getTextRecord } from "./resolver";

export interface AgentIdentity {
  name: string;
  parentName: string;
  childName: string;
  capabilities: string[];
  endpoint: string;
  humanOwner: string;
  reputation: number;
}

export async function getAgentIdentity(): Promise<AgentIdentity> {
  const agentName = `sentinel.${PARENT_NAME}`;
  const tempAgentName = `risk.sentinel.${PARENT_NAME}`;

  // Fetch from the resolver
  const capabilitiesStr = await getTextRecord(agentName, "agent.capabilities");
  let capabilities: string[] = [];
  try {
    capabilities = JSON.parse(capabilitiesStr);
  } catch (e) {
    capabilities = ["defi-risk-analysis"];
  }

  const endpoint = await getTextRecord(agentName, "agent.endpoint") || "https://api.agentpass.eth/analyze";
  const humanOwner = await getTextRecord(agentName, "agent.human-owner") || "Unknown";
  
  const repStr = await getTextRecord(agentName, "agent.reputation");
  const reputation = parseInt(repStr, 10) || 0;

  return {
    name: agentName,
    parentName: PARENT_NAME,
    childName: tempAgentName,
    capabilities,
    endpoint,
    humanOwner,
    reputation,
  };
}

export * from "./config";
export * from "./roles";
export * from "./resolver";
