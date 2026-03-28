import { ActivityType, Prisma, Profile, Role } from "@/generated/prisma/client";
import { CreateLeadRequest, EditLeadRequest, ListLeadsParams } from "./schema";
import { dbCreateLead, dbFindAssignableAgentById, dbGetLeadById, dbListLeads, dbUpdateLead } from "./db";
import { canEditLeadContactFields } from "./permissions";
import { CreateActivityRequest, createActivities } from "../activity";
import { prisma } from "@/lib/prisma";

export class LeadServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "LeadServiceError";
  }
}

export async function listLeads(profile: Profile, params: ListLeadsParams) {
  const where: Prisma.LeadWhereInput = {};

  if (profile.role === Role.AGENT) {
    where.assignedToId = profile.id;
  }

  return dbListLeads(where, params);
}

export async function createLead(profile: Profile, data: CreateLeadRequest) {
  const noteAdded = !!data.note;
  const agentAssigned = !!data.assignedToId;

  const result = await prisma.$transaction(async (tx) => {
    const lead = await dbCreateLead(profile, data, tx);
    const activities: CreateActivityRequest[] = [
      {
        leadId: lead.id,
        actorId: profile.id,
        type: ActivityType.LEAD_CREATED,
      },
    ];

    if (noteAdded) {
      activities.push({
        leadId: lead.id,
        actorId: profile.id,
        type: ActivityType.NOTE,
        content: data.note,
      });
    }

    if (agentAssigned) {
      const agent = await dbFindAssignableAgentById(data.assignedToId!);
      if (agent) {
        activities.push({
          leadId: lead.id,
          actorId: profile.id,
          type: ActivityType.ASSIGNMENT_CHANGE,
          meta: {
            from: "None",
            to: agent.name,
          },
        });
      }
    }

    await createActivities(activities, tx);

    return lead;
  });

  return result;
}

export async function getLead(profile: Profile, id: string) {
  const lead = await dbGetLeadById(id);

  if (!lead) {
    throw new LeadServiceError("Lead not found", 404);
  }

  if (profile.role === Role.AGENT && lead.assignedToId !== profile.id) {
    throw new LeadServiceError("Unauthorized", 403);
  }

  return lead;
}

export async function updateLead(
  profile: Profile,
  id: string,
  data: EditLeadRequest,
) {
  const existingLead = await dbGetLeadById(id);

  if (!existingLead) {
    throw new LeadServiceError("Lead not found", 404);
  }

  if (profile.role === Role.AGENT && existingLead.assignedToId !== profile.id) {
    throw new LeadServiceError("Unauthorized", 403);
  }

  // status/stage update
  if ("status" in data || "stage" in data) {
    const activities: CreateActivityRequest[] = [];

    if (data.status && data.status !== existingLead.status) {
      activities.push({
        leadId: id,
        actorId: profile.id,
        type: ActivityType.STATUS_CHANGE,
        meta: { from: existingLead.status, to: data.status },
      });
    }

    if (data.stage && data.stage !== existingLead.stage) {
      activities.push({
        leadId: id,
        actorId: profile.id,
        type: ActivityType.STAGE_CHANGE,
        meta: { from: existingLead.stage, to: data.stage },
      });
    }

    return prisma.$transaction(async (tx) => {
      const updatedLead = await dbUpdateLead(id, data, tx);
      await createActivities(activities, tx);
      return updatedLead;
    });
  }

  // contact info update
  if (!canEditLeadContactFields(profile.role, data)) {
    throw new LeadServiceError("Unauthorized", 403);
  }

  return prisma.$transaction(async (tx) => {
    const updatedLead = await dbUpdateLead(id, data, tx);
    await createActivities([{
      leadId: id,
      actorId: profile.id,
      type: ActivityType.LEAD_UPDATED,
    }], tx);
    return updatedLead;
  });
}
