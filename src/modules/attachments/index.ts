import { uploadAttachmentSchema } from "./schema";
import { listForLead, uploadForLead, deleteForLead } from "./service";
export type { AttachmentListItem } from "./schema";
export { AttachmentServiceError } from "./service";

export const AttachmentService = {
    listForLead: listForLead,
    uploadForLead: uploadForLead,
    deleteForLead: deleteForLead,
} as const;

export const AttachmentSchema = {
    uploadForLead: uploadAttachmentSchema,
} as const;