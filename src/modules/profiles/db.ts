import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";
import { AgentSummary } from "./schema";

export async function dbListProfilesByRole(role: Role): Promise<AgentSummary[]> {
  return prisma.profile.findMany({
    where: {
      role,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}
