import { Prisma, Profile } from "@/generated/prisma/client";
import { CreateLeadRequest, EditLeadRequest, ListLeadsParams } from "./schema";
import { prisma } from "@/lib/prisma";

export async function dbListLeads(
  where: Prisma.LeadWhereInput,
  params: ListLeadsParams,
) {
  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      take: params.pageSize,
      skip: (params.page - 1) * params.pageSize,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        stage: true,
        status: true,
        createdAt: true,
        assignedToId: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  return { leads, total };
}

export async function dbGetLeadById(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function dbCreateLead(
  profile: Profile,
  data: CreateLeadRequest,
  tx?: Prisma.TransactionClient,
) {
  const client = tx ?? prisma;
  return client.lead.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email,
    },
  });
}

export async function dbUpdateLead(
  id: string,
  data: EditLeadRequest,
  tx?: Prisma.TransactionClient,
) {
  const client = tx ?? prisma;
  return client.lead.update({
    where: { id },
    data,
  });
}