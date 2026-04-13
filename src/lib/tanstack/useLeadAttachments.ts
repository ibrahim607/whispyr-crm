import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AttachmentListItem } from "@/modules/attachments";

export function useLeadAttachments(leadId: string) {
    return useQuery({
        queryKey: ["leads", leadId, "attachments"],
        queryFn: async (): Promise<AttachmentListItem[]> => {
            const res = await fetch(`/api/leads/${leadId}/attachments`);
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to fetch attachments");
            }
            return res.json();
        },
        enabled: !!leadId,
        staleTime: 55 * 60 * 1000, // 55 minutes, safely below 1hr TTL constraint
    });
}

export function useUploadAttachment(leadId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`/api/leads/${leadId}/attachments`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to upload attachment");
            }

            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads", leadId, "attachments"] });
            queryClient.invalidateQueries({ queryKey: ["leads", leadId, "activities"] });
        },
    });
}

export function useDeleteAttachment(leadId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (attachmentId: string) => {
            const res = await fetch(`/api/leads/${leadId}/attachments/${attachmentId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to delete attachment");
            }

            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads", leadId, "attachments"] });
        },
    });
}
