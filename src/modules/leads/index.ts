import { listLeads, createLead, getLead, updateLead } from "./service";
import {
  listLeadsQuerySchema,
  createLeadSchema,
  leadIdParamsSchema,
  editLeadSchema,
} from "./schema";

export const LeadService = {
  list: listLeads,
  create: createLead,
  get: getLead,
  update: updateLead,
} as const;

export const LeadSchema = {
  list: listLeadsQuerySchema,
  create: createLeadSchema,
  get: leadIdParamsSchema,
  update: editLeadSchema,
} as const;

export type {
  ListLeadsParams,
  CreateLeadRequest,
  LeadIdParams,
  EditLeadRequest,
  LeadAssigneeSummary,
  LeadSummary,
  LeadDetail,
  ListLeadsResponseData,
} from "./schema";
