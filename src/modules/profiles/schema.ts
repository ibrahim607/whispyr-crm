import { z } from "zod";

export const agentSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  avatarUrl: z.string().url().nullable().optional(),
});

export type AgentSummary = z.infer<typeof agentSummarySchema>;
