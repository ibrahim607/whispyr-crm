import { Role } from "@/generated/prisma/client";
import { EditLeadRequest } from "@/modules/leads/schema";

const contactFields = ["name", "email", "phone"] as const;

export function canEditLeadContactFields(
  role: Role,
  data: EditLeadRequest,
) {
  if (role !== Role.AGENT) {
    return true;
  }

  return !contactFields.some((field) => data[field] !== undefined);
}