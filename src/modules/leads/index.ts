import { createLead, updateLead, handleBulkDelete, handleBulkReassign, handleBulkUpdate } from "./service";

export const LeadService = {
    createLead: createLead,
    updateLead: updateLead,
    bulkDelete: handleBulkDelete,
    bulkReassign: handleBulkReassign,
    bulkUpdate: handleBulkUpdate,
};