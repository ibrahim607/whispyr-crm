import { Role } from "@/generated/prisma/enums";
import { dbListProfilesByRole } from "./db";
import { AgentSummary } from "./schema";

export async function listAgents(): Promise<AgentSummary[]> {
  return dbListProfilesByRole(Role.AGENT);
}
