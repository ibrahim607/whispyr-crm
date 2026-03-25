import { Role } from "@/generated/prisma/enums";

export interface UserSnapshot {
  id: string;
  role: Role;
  name?: string;
  email?: string;
}
