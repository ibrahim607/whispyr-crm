import { ActivityType, Prisma, Profile, Role } from "@/generated/prisma/client";
import { CreateLeadRequest, EditLeadRequest, ListLeadsParams } from "./schema";
import { dbCreateLead, dbGetLeadById, dbListLeads, dbUpdateLead } from "./db";
import { buildLeadChangeActivities } from "./helpers";
import { canEditLeadContactFields } from "./permissions";
import { ActivityService, CreateActivityRequest } from "../activity";
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
  const noteAdded = data.note ? true : false;

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
      });
    }
    await ActivityService.create(activities, tx);

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

  if (profile.role === Role.AGENT && data.assignedToId !== undefined) {
    throw new LeadServiceError("Unauthorized", 403);
  }

  if (!canEditLeadContactFields(profile.role, data)) {
    throw new LeadServiceError("Unauthorized", 403);
  }

  const activities = buildLeadChangeActivities({
    leadId: id,
    actorId: profile.id,
    existingLead,
    newLead: data,
  });

  const result = await prisma.$transaction(async (tx) => {
    const updatedLead = await dbUpdateLead(id, data, tx);
    const activitiesCreated = await ActivityService.create(activities, tx);
    if (!activitiesCreated.success)
      throw new Error("Failed to create activities");

    return {
      lead: updatedLead,
      activities: activitiesCreated.count,
    };
  });

  return result;
}