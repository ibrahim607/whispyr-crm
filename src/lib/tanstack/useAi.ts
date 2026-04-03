import { LeadBrief, CallFollowUp } from "@/modules/ai/schema";
import { api } from "@/utils/api";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useGenerateLeadBrief(leadId: string) {
    return useMutation({
        mutationFn: async (): Promise<LeadBrief> => {
            console.log(`[Frontend] Sending POST request to /Ai/lead-brief for leadId: ${leadId}`);
            try {
                // Fixed path to match the case of the folder (Ai instead of ai)
                const { data } = await api.post("/Ai/lead-brief", { leadId });
                console.log(`[Frontend] Successfully received response from /Ai/lead-brief`, data);
                return data.data;
            } catch (error: any) {
                console.error(`[Frontend] Error making request to /Ai/lead-brief:`, error.message || error);
                throw error;
            }
        },
    });
}

export function useSaveLeadBrief(leadId: string) {
    return useMutation({
        mutationFn: async (brief: LeadBrief): Promise<any> => {
            const { data } = await api.post("/Ai/save-brief", { leadId, brief });
            return data.data;
        },
    });
}

export function useGetLatestLeadBrief(leadId: string) {
    return useQuery({
        queryKey: ["leadBrief", leadId],
        queryFn: async () => {
            const { data } = await api.get(`/Ai/latest-brief/${leadId}`);
            return data.data;
        },
    });
}

export function useGenerateCallFollowup(leadId: string) {
    return useMutation({
        mutationFn: async (): Promise<CallFollowUp> => {
            const { data } = await api.post("/Ai/call-followup", { leadId });
            return data.data;
        },
    });
}