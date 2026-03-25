import { ActivityType, LeadStage, LeadStatus } from "@/generated/prisma/enums";
import { PaginationMeta } from "@/utils/pagination";
import { z } from "zod";

const leadStatusSchema = z.enum(LeadStatus);
const leadStageSchema = z.enum(LeadStage);
const createActivitySchema = z
  .object({
    leadId: z.uuid(),
    actorId: z.uuid(),
    type: z.enum(ActivityType),
    meta: z
      .object({
        from: z.unknown(),
        to: z.unknown(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (
      ["STATUS_CHANGE", "STAGE_CHANGE", "ASSIGNMENT_CHANGE"].includes(data.type)
    ) {
      if (!data.meta) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Meta is required for change activities",
          path: ["meta"],
        });
        return;
      }

      try {
        switch (data.type) {
          case ActivityType.STATUS_CHANGE:
            leadStatusSchema.parse(data.meta.from);
            leadStatusSchema.parse(data.meta.to);
            break;
          case ActivityType.STAGE_CHANGE:
            leadStageSchema.parse(data.meta.from);
            leadStageSchema.parse(data.meta.to);
            break;
          case ActivityType.ASSIGNMENT_CHANGE:
            z.string().parse(data.meta.from); // agent name
            z.string().parse(data.meta.to); // agent name
            break;
          default:
            break;
        }
      } catch (e) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid meta data for activity type",
          path: ["meta"],
        });
      }
    }
  });

export const createManyActivitiesSchema = z.array(createActivitySchema);

export type CreateActivityRequest = z.infer<typeof createActivitySchema>;

export const getLeadActivitiesSchema = z.object({
  leadId: z.uuid(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
});

export type GetLeadActivitiesRequest = z.infer<typeof getLeadActivitiesSchema>;

interface ActivitySummaryItem {
  id: string;
  actor: {
    name: string;
  };
  type: ActivityType;
  createdAt: Date;
  content: string | null;
}
export type ListLeadActivitiesResponseData = {
  activities: ActivitySummaryItem[];
  pagination: PaginationMeta;
};