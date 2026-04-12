import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function dbGetTotalLeads(where: Prisma.LeadWhereInput) {
    return await prisma.lead.count({ where });
}

export async function dbGetLeadsByStatus(where: Prisma.LeadWhereInput) {
    const result = await prisma.lead.groupBy({
        by: ["status"],
        where,
        _count: {
            _all: true,
        },

    });

    return result.map((r) => ({
        status: r.status,
        count: r._count._all,
    }));

}

export async function dbGetLeadsByStage(where: Prisma.LeadWhereInput) {
    const result = await prisma.lead.groupBy({
        by: ["stage"],
        where,
        _count: {
            _all: true,
        },

    });

    return result.map((r) => ({
        stage: r.stage,
        count: r._count._all,
    }));

}