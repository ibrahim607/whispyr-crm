import { LeadStage, LeadStatus } from "@/generated/prisma/enums"
import { z } from "zod"

export const listLeadsQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).max(100).default(10),
})

export type ListLeadsParams = z.infer<typeof listLeadsQuerySchema>

export const leadsSchema = z.object({
    name: z.string().min(1),
    phone: z.string().min(8).max(15).e164(),
    email: z.email(),
    note: z.string().optional(),
    stage: z.nativeEnum(LeadStage),
    status: z.nativeEnum(LeadStatus),
})

export type LeadRequest = z.infer<typeof leadsSchema>
/*
  id String @id @default(uuid())
  name  String
  phone String
  email String
  stage  LeadStage  @default(NEW)
  status LeadStatus @default(OPEN)

  assignedToId String?
  assignedTo   Profile? @relation(fields: [assignedToId], references: [id])

  activities Activity[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  */