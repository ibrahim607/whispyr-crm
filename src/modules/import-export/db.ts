import { prisma } from "@/lib/prisma";

export async function dbFindProfileByEmail(email: string) {
    return await prisma.profile.findUnique({
        where: { email },
        select: { id: true, isActive: true },
    });
}

export async function dbGetAllLeads() {
    return await prisma.lead.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            stage: true,
            status: true,
            createdAt: true,
            assignedTo: {
                select: {
                    email: true,
                    name: true,
                }
            }
        },
    });
}