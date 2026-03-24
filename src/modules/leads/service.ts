import { Profile, Role } from "@/generated/prisma/client";
import { LeadWhereInput } from "@/generated/prisma/models";
import { ListLeadsParams } from "./schema";
import { dbListLeads } from "./db";

export async function listLeads(profile: Profile, params: ListLeadsParams) {

    const where: LeadWhereInput = {}

    if (profile.role === Role.AGENT) {
        where.assignedToId = profile.id
    }

    return await dbListLeads(where, params)

}