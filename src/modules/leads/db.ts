import { prisma } from "@/lib/prisma";
import {
  CreateLeadRequest,
  EditLeadRequest,
  LeadAssigneeSummary,
  LeadDetail,
  ListLeadsParams,
  ListLeadsResponseData,
} from "./schema";
import { Prisma, Profile, Role } from "@/generated/prisma/client";
import { buildPagination } from "@/utils/pagination";

const assigneeSelect = {
  id: true,
  name: true,
  email: true,
} satisfies Prisma.ProfileSelect;

const leadSummarySelect = {
  id: true,
  name: true,
  phone: true,
  email: true,
  stage: true,
  status: true,
  createdAt: true,
  assignedToId: true,
  assignedTo: {
    select: assigneeSelect,
  },
} satisfies Prisma.LeadSelect;

const leadDetailSelect = {
  ...leadSummarySelect,
  updatedAt: true,
} satisfies Prisma.LeadSelect;

export async function dbListLeads(
  where: Prisma.LeadWhereInput,
  params: ListLeadsParams,
): Promise<ListLeadsResponseData> {
  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      select: leadSummarySelect,
      take: params.pageSize,
      skip: (params.page - 1) * params.pageSize,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.lead.count({ where }),
  ]);

  return {
    leads,
    pagination: buildPagination(total, params.page, params.pageSize),
  };
}

export async function dbGetLeadById(id: string): Promise<LeadDetail | null> {
  return prisma.lead.findUnique({
    where: { id },
    select: leadDetailSelect,
  });
}

export async function dbFindAssignableAgentById(
  id: string,
): Promise<LeadAssigneeSummary | null> {
  return prisma.profile.findFirst({
    where: {
      id,
      role: Role.AGENT,
      isActive: true,
    },
    select: assigneeSelect,
  });
}

export async function dbCreateLead(
  profile: Profile,
  data: CreateLeadRequest,
  tx?: Prisma.TransactionClient,
) {
  const client = tx ?? prisma;
  const lead = await client.lead.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email,
    },
  });

  return lead;
}

export async function dbUpdateLead(
  id: string,
  data: EditLeadRequest,
  tx?: Prisma.TransactionClient,
) {
  const client = tx ?? prisma;
  const updatedLead = await client.lead.update({
    where: { id },
    data,
    select: leadDetailSelect,
  });

  return updatedLead;
}

export async function dbBulkDeleteLeads(ids: string[], tx?: Prisma.TransactionClient) {
  const client = tx ?? prisma;
  
  await client.activity.deleteMany({ where: { leadId: { in: ids } } });
  await client.reminder.deleteMany({ where: { leadId: { in: ids } } });
  await client.notification.deleteMany({ where: { leadId: { in: ids } } });
  await client.aILeadBrief.deleteMany({ where: { leadId: { in: ids } } });
  await client.attachment.deleteMany({ where: { leadId: { in: ids } } });

  return client.lead.deleteMany({
    where: { id: { in: ids } },
  });
}

export async function dbBulkReassignLeads(
  ids: string[],
  assignedToId: string,
  tx?: Prisma.TransactionClient
) {
  const client = tx ?? prisma;
  return client.lead.updateMany({
    where: { id: { in: ids } },
    data: { assignedToId },
  });
}

export async function dbBulkUpdateLeads(
  ids: string[],
  data: { stage?: import("@/generated/prisma/enums").LeadStage; status?: import("@/generated/prisma/enums").LeadStatus },
  tx?: Prisma.TransactionClient
) {
  const client = tx ?? prisma;
  return client.lead.updateMany({
    where: { id: { in: ids } },
    data,
  });
}