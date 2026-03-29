import { Prisma, Profile, Role } from "@/generated/prisma/client";
import { CreateLeadRequest, EditLeadRequest, ListLeadsParams, UpdateAssignmentRequest, UpdateContactRequest } from "./schema";
import { dbCreateLead, dbFindAssignableAgentById, dbGetLeadById, dbListLeads, dbUpdateLead } from "./db";
import { canEditLeadAssignedAgent, canEditLeadContactFields } from "./permissions";
import {
  createActivities,
  buildLeadCreatedActivity,
  buildLeadUpdatedActivity,
  buildNoteActivity,
  buildAssignmentActivity,
  buildStatusStageActivities,
} from "../activity";
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
  const result = await prisma.$transaction(async (tx) => {
    const lead = await dbCreateLead(profile, data, tx);
    const activities = [buildLeadCreatedActivity(lead.id, profile.id)];

    if (data.note) {
      activities.push(buildNoteActivity(lead.id, profile.id, data.note));
    }

    if (data.assignedToId) {
      const agent = await dbFindAssignableAgentById(data.assignedToId);
      if (agent) {
        activities.push(buildAssignmentActivity(lead.id, profile.id, "None", agent.name));
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

  // --- status / stage update ---
  if ("status" in data || "stage" in data) {
    const activities = buildStatusStageActivities(id, profile.id, existingLead, data);

    return prisma.$transaction(async (tx) => {
      const updatedLead = await dbUpdateLead(id, data, tx);
      await createActivities(activities, tx);
      return updatedLead;
    });
  }

  // --- assignment update ---
  if ("assignedToId" in data) {
    const assignmentData = data as UpdateAssignmentRequest;

    if (!canEditLeadAssignedAgent(profile.role)) {
      throw new LeadServiceError("Unauthorized", 403);
    }

    const newAgentId = assignmentData.assignedToId;
    const agent = newAgentId ? await dbFindAssignableAgentById(newAgentId) : null;

    return prisma.$transaction(async (tx) => {
      const updatedLead = await dbUpdateLead(id, assignmentData, tx);
      await createActivities([
        buildAssignmentActivity(
          id,
          profile.id,
          existingLead.assignedTo?.name ?? "None",
          agent?.name ?? "None",
        ),
      ], tx);
      return updatedLead;
    });
  }

  // --- contact info update ---
  const contactData = data as UpdateContactRequest;

  if (!canEditLeadContactFields(profile.role, contactData)) {
    throw new LeadServiceError("Unauthorized", 403);
  }

  return prisma.$transaction(async (tx) => {
    const updatedLead = await dbUpdateLead(id, contactData, tx);
    await createActivities([buildLeadUpdatedActivity(id, profile.id)], tx);
    return updatedLead;
  });
}
