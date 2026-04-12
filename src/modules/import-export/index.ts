import { csvLeadRowSchema, importRequestSchema } from "./schema";
import { processImport, exportLeads } from "./service";

export const ImportExportService = {
    import: {
        process: processImport,
    },
    export: {
        leads: exportLeads,
    }
};

export const ImportExportSchema = {
    import: {
        request: importRequestSchema,
        csvLeadRow: csvLeadRowSchema,
    },
};