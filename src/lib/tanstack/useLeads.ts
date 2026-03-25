import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leadService } from "@/services/leadsService";
import {
    CreateLeadRequest,
    EditLeadRequest,
    ListLeadsParams
} from "@/modules/leads/schema";

export function useGetLeads(params: ListLeadsParams) {
    return useQuery({
        queryKey: ["leads", params],
        queryFn: () => leadService.getLeads(params),
    });
}

export function useGetLead(id: string) {
    return useQuery({
        queryKey: ["lead", id],
        queryFn: () => leadService.getLeadById(id),
        enabled: Boolean(id),
    });
}

export function useCreateLead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (lead: CreateLeadRequest) => leadService.createLead(lead),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
        },
    });
}

export function useEditLead(id: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: EditLeadRequest) => leadService.editLead(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lead", id] });
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            queryClient.invalidateQueries({
                queryKey: ["activities", { leadId: id }],
            });
        },
    });
}