import { ActivityType } from "@/generated/prisma/enums";
import { Lead } from "@/generated/prisma/client";
import { CreateActivityRequest } from ".";
import { UpdateStatusStageRequest } from "../leads/schema";

// ── Content builder (used internally & for display) ──────────────────────────

export function buildActivityContent(
  activityType: ActivityType,
  meta?: { from: unknown; to: unknown },
): string | null {
  const metaRequiredTypes: ActivityType[] = [
    ActivityType.STAGE_CHANGE,
    ActivityType.STATUS_CHANGE,
    ActivityType.ASSIGNMENT_CHANGE,
  ];

  if (!meta && metaRequiredTypes.includes(activityType)) {
    return null;
  }

  switch (activityType) {
    case ActivityType.STATUS_CHANGE:
      return `Status changed from ${meta?.from} to ${meta?.to}`;
    case ActivityType.STAGE_CHANGE:
      return `Stage changed from ${meta?.from} to ${meta?.to}`;
    case ActivityType.ASSIGNMENT_CHANGE:
      return `Assignment changed from ${meta?.from} to ${meta?.to}`;
    case ActivityType.NOTE:
      return null; // content is stored directly on the activity
    case ActivityType.LEAD_CREATED:
      return null;
    default:
      return null;
  }
}

// ── Activity builders ─────────────────────────────────────────────────────────

export function buildLeadCreatedActivity(
  leadId: string,
  actorId: string,
): CreateActivityRequest {
  return { leadId, actorId, type: ActivityType.LEAD_CREATED };
}

export function buildNoteActivity(
  leadId: string,
  actorId: string,
  content: string,
): CreateActivityRequest {
  return { leadId, actorId, type: ActivityType.NOTE, content };
}

export function buildAssignmentActivity(
  leadId: string,
  actorId: string,
  fromName: string,
  toName: string,
): CreateActivityRequest {
  return {
    leadId,
    actorId,
    type: ActivityType.ASSIGNMENT_CHANGE,
    meta: { from: fromName, to: toName },
  };
}

/**
 * Returns 0–2 activities for a status/stage update.
 * Only pushes an activity when the value actually changed.
 */
export function buildStatusStageActivities(
  leadId: string,
  actorId: string,
  existingLead: Pick<Lead, "status" | "stage">,
  data: UpdateStatusStageRequest,
): CreateActivityRequest[] {
  const activities: CreateActivityRequest[] = [];

  if (data.status && data.status !== existingLead.status) {
    activities.push({
      leadId,
      actorId,
      type: ActivityType.STATUS_CHANGE,
      meta: { from: existingLead.status, to: data.status },
    });
  }

  if (data.stage && data.stage !== existingLead.stage) {
    activities.push({
      leadId,
      actorId,
      type: ActivityType.STAGE_CHANGE,
      meta: { from: existingLead.stage, to: data.stage },
    });
  }

  return activities;
}

export function buildAiLeadBriefGeneratedActivity(
  leadId: string,
  actorId: string,
): CreateActivityRequest {
  return { leadId, actorId, type: ActivityType.AI_LEAD_BRIEF_GENERATED };
}