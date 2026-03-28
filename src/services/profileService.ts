import { AgentSummary } from "@/modules/profiles/schema";

export const profileService = {
  async getAgents(): Promise<AgentSummary[]> {
    const response = await fetch("/api/profiles/agents");
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch agents");
    }
    const { data } = await response.json();
    return data;
  },
};
