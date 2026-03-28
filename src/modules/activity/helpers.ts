import { Lead } from "@/generated/prisma/client";
import { ActivityType } from "@/generated/prisma/enums";
import { EditLeadRequest } from "../leads/schema";
import { CreateActivityRequest } from ".";

export function buildActivityContent(
  activityType: ActivityType,
  meta:
    | {
      from: unknown;
      to: unknown;
    }
    | undefined,
) {
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
    case ActivityType.LEAD_UPDATED:
      return "Lead information updated";
    default:
      return null;
  }
}