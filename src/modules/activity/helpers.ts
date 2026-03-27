import { ActivityType } from "@/generated/prisma/enums";

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

  if (!meta && activityType === ActivityType.NOTE) {
    return "Note added";
  }

  switch (activityType) {
    case ActivityType.STATUS_CHANGE:
      return `Status changed from ${meta?.from} to ${meta?.to}`;
    case ActivityType.STAGE_CHANGE:
      return `Stage changed from ${meta?.from} to ${meta?.to}`;
    case ActivityType.ASSIGNMENT_CHANGE:
      return `Assignment changed from ${meta?.from} to ${meta?.to}`;
    default:
      return null;
  }
}