import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../utils/api";
import { ImportRequest, ImportSummary } from "@/modules/import-export/schema";

export const useImport = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (request: ImportRequest): Promise<ImportSummary> => {
            const { data } = await api.post("/admin/import", request);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
        },
    });
};

// ------------------------------------------------------------------
// EXPORT LEADS (Mutation)
// ------------------------------------------------------------------
export const useExportLeads = () => {
    return useMutation({
        mutationFn: async (): Promise<string> => {
            const { data } = await api.get(`/admin/export`);
            return data;
        },
    });
};