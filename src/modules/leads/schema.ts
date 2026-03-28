import { LeadStage, LeadStatus } from "@/generated/prisma/enums";
import { PaginationMeta } from "@/utils/pagination";
import { z } from "zod";

export const listLeadsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
});

export type ListLeadsParams = z.infer<typeof listLeadsQuerySchema>;

export const createLeadSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(8).max(15),
  email: z.string().email(),
  note: z.string().optional(),
  assignedToId: z.string().uuid().optional(),
});

export type CreateLeadRequest = z.infer<typeof createLeadSchema>;

export const leadIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type LeadIdParams = z.infer<typeof leadIdParamsSchema>;

export const updateContactSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1).max(15),
  email: z.string().email(),
});

export type UpdateContactRequest = z.infer<typeof updateContactSchema>;

export const updateStatusStageSchema = z.object({
  status: z.nativeEnum(LeadStatus).optional(),
  stage: z.nativeEnum(LeadStage).optional(),
}).refine(
  (data) => data.status !== undefined || data.stage !== undefined,
  { message: "At least one of status or stage must be provided" },
);

export type UpdateStatusStageRequest = z.infer<typeof updateStatusStageSchema>;

// Union of all valid PATCH shapes — kept as EditLeadRequest for back-compat
export const editLeadSchema = z.union([updateContactSchema, updateStatusStageSchema]);

export type EditLeadRequest = UpdateContactRequest | UpdateStatusStageRequest;

export interface LeadAssigneeSummary {
  id: string;
  name: string;
  email: string;
}

export interface LeadSummary {
  id: string;
  name: string;
  phone: string;
  email: string;
  stage: LeadStage;
  status: LeadStatus;
  createdAt: Date;
  assignedToId: string | null;
  assignedTo: LeadAssigneeSummary | null;
}

export interface LeadDetail extends LeadSummary {
  updatedAt: Date;
}

export interface ListLeadsResponseData {
  leads: LeadSummary[];
  pagination: PaginationMeta;
}