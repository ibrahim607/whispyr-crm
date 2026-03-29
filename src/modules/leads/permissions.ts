import { Role } from "@/generated/prisma/client";
import { UpdateContactRequest } from "@/modules/leads/schema";

const contactFields: (keyof UpdateContactRequest)[] = ["name", "phone", "email"];

export function canEditLeadContactFields(
  role: Role,
  data: UpdateContactRequest,
) {
  if (role !== Role.AGENT) {
    return true;
  }

  return !contactFields.some((field) => data[field] !== undefined);
}

export function canEditLeadAssignedAgent(role: Role) {
  return role !== Role.AGENT;
}