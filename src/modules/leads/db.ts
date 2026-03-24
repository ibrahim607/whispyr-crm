import { ActivityType, Prisma, Profile } from "@/generated/prisma/client";
import { LeadRequest, ListLeadsParams } from "./schema";
import { prisma } from "@/lib/prisma";
import { UUID } from "crypto";
import { Activity } from "react";

export async function dbListLeads(
    where: Prisma.LeadWhereInput,
    params: ListLeadsParams,
) {

    const [leads, total] = await prisma.$transaction([
        prisma.lead.findMany({
            where,
            take: params.pageSize,
            skip: (params.page - 1) * params.pageSize,
            orderBy: {
                createdAt: "desc"
            },
            include: {
                assignedTo: true,
            }
        }),
        prisma.lead.count({
            where
        })
    ])

    return { leads, total };
}

export async function createLead(profile: Profile, data: LeadRequest) {
    return await prisma.$transaction(async (tx) => {
        const lead = await tx.lead.create({
            data: {
                name: data.name,
                phone: data.phone,
                email: data.email,
                stage: data.stage,
                status: data.status,
            }
        })

        await tx.activity.create({
            data: {
                leadId: lead.id,
                actorId: profile.id,
                type: ActivityType.LEAD_CREATED,
                content: data.note
            }
        })

        return lead;
    })
}

export async function updateLead(id: string, profile: Profile, data: Partial<LeadRequest>) {
    return await prisma.$transaction(async (tx) => {
        const oldLead = await tx.lead.findUnique({ where: { id } })
        if (!oldLead) throw new Error("Lead not found");

        const lead = await tx.lead.update({
            where: { id },
            data
        })

        if (data.status && data.status !== oldLead.status) {
            await tx.activity.create({
                data: {
                    leadId: lead.id,
                    actorId: profile.id,
                    type: ActivityType.STATUS_CHANGE,
                    content: JSON.stringify({ from: oldLead.status, to: data.status })
                }
            })
        }

        if (data.stage && data.stage !== oldLead.stage) {
            await tx.activity.create({
                data: {
                    leadId: lead.id,
                    actorId: profile.id,
                    type: ActivityType.STAGE_CHANGE,
                    content: JSON.stringify({ from: oldLead.stage, to: data.stage })
                }
            })
        }
        
        if (data.note) {
            await tx.activity.create({
                data: {
                    leadId: lead.id,
                    actorId: profile.id,
                    type: ActivityType.LEAD_UPDATED,
                    content: data.note
                }
            })
        }

        return lead;
    })
}