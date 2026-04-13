import { ActivityType, Prisma, Profile, Role } from "@/generated/prisma/client";
import { BulkLeadActionRequest, BulkReassignLeadsRequest, BulkUpdateLeadsRequest, CreateLeadRequest, EditLeadRequest, ListLeadsParams } from "./schema";
import { dbBulkDeleteLeads, dbBulkReassignLeads, dbBulkUpdateLeads, dbCreateLead, dbGetLeadById, dbListLeads, dbUpdateLead } from "./db";
import { canEditLeadAssignment, canEditLeadContactFields } from "./permissions";
import { ActivityService } from "../activity";
import { prisma } from "@/lib/prisma";
import { buildAssignmentActivity, buildStatusStageActivities, buildLeadUpdatedActivity } from "../activity/helpers";

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
  // Build where clause
  const where: Prisma.LeadWhereInput = {};

  // Role-scoping contract:
  // - AGENT can only read assigned leads.
  // - MANAGER/ADMIN can read all leads.
  // UI-level bulk actions (checkboxes/reassign toolbar) should respect this scope.
  if (profile.role === Role.AGENT) {
    where.assignedToId = profile.id;
  }

  return dbListLeads(where, params);
}

export async function createLead(profile: Profile, data: CreateLeadRequest) {
  const result = await prisma.$transaction(async (tx) => {
    const lead = await dbCreateLead(profile, data, tx);
    await ActivityService.create(
      [
        {
          leadId: lead.id,
          actorId: profile.id,
          type: ActivityType.LEAD_CREATED,
        },
      ],
      tx,
    );

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

  if (!canEditLeadAssignment(profile.role, data)) {
    throw new LeadServiceError("Unauthorized", 403);
  }

  const activities: any[] = [];
  
  activities.push(...buildStatusStageActivities(id, profile.id, existingLead, data));

  if (data.assignedToId && data.assignedToId !== existingLead.assignedToId) {
      // Find the new assignee profile name
      const newAssignee = await prisma.profile.findUnique({ where: { id: data.assignedToId } });
      activities.push(
          buildAssignmentActivity(
              id,
              profile.id,
              existingLead.assignedTo?.name ?? "Unassigned",
              newAssignee?.name ?? "Unassigned"
          )
      );
  }

  // Check if contact fields changed
  if (
      (data.name && data.name !== existingLead.name) ||
      (data.email && data.email !== existingLead.email) ||
      (data.phone && data.phone !== existingLead.phone)
  ) {
      activities.push(buildLeadUpdatedActivity(id, profile.id));
  }

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

export async function handleBulkDelete(profile: Profile, params: BulkLeadActionRequest) {
  // STRICT Constraint: Only Admins/Managers can bulk delete leads.
  if (profile.role === Role.AGENT) {
    throw new LeadServiceError("Agents are not authorized to bulk delete leads.", 403);
  }

  const result = await prisma.$transaction(async (tx) => {
    // Activities auto-delete through Cascade relationship constraints on Prisma
    return dbBulkDeleteLeads(params.leadIds, tx);
  });

  return result;
}

export async function handleBulkReassign(profile: Profile, params: BulkReassignLeadsRequest) {
  // STRICT Constraint: Only Admins/Managers can bulk reassign leads.
  if (profile.role === Role.AGENT) {
    throw new LeadServiceError("Agents are not authorized to bulk reassign leads.", 403);
  }

  const newAssignee = await prisma.profile.findUnique({
    where: { id: params.assignedToId },
  });

  if (!newAssignee) {
    throw new LeadServiceError("Assignee not found", 404);
  }

  const existingLeads = await prisma.lead.findMany({
    where: { id: { in: params.leadIds } },
    include: { assignedTo: true }
  });

  const activities = existingLeads.flatMap((existingLead) =>
    buildAssignmentActivity(
      existingLead.id,
      profile.id,
      existingLead.assignedTo?.name ?? "Unassigned",
      newAssignee.name
    )
  );

  const result = await prisma.$transaction(async (tx) => {
    const updated = await dbBulkReassignLeads(params.leadIds, params.assignedToId, tx);
    await ActivityService.create(activities, tx);
    return updated;
  });

  return result;
}

export async function handleBulkUpdate(profile: Profile, params: BulkUpdateLeadsRequest) {
  // If agent, ensure they own every lead being updated
  if (profile.role === Role.AGENT) {
    const ownedCount = await prisma.lead.count({
      where: {
        id: { in: params.leadIds },
        assignedToId: profile.id,
      },
    });

    if (ownedCount !== params.leadIds.length) {
      throw new LeadServiceError("Unauthorized. One or more leads do not belong to you.", 403);
    }
  }

  const existingLeads = await prisma.lead.findMany({
    where: { id: { in: params.leadIds } },
  });

  const activities = existingLeads.flatMap((existingLead) =>
    buildStatusStageActivities(
      existingLead.id,
      profile.id,
      existingLead,
      params
    )
  );

  const result = await prisma.$transaction(async (tx) => {
    const updated = await dbBulkUpdateLeads(
      params.leadIds,
      { stage: params.stage, status: params.status },
      tx
    );
    await ActivityService.create(activities, tx);
    return updated;
  });

  return result;
}