import { Profile } from "@/generated/prisma/client";
import { LeadRequest, ListLeadsParams } from "@/modules/leads/schema";
import { leadsService } from "@/services/leadsService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetLeads(params?: ListLeadsParams) {
    return useQuery({
        queryKey: ["leads"],
        queryFn: () => leadsService.listLeads(params),
    })
}

export function useCreateLead(params: LeadRequest) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => leadsService.createLead(params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
        }
    })
}

export function useUpdateLead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<LeadRequest> }) => leadsService.updateLead({ id, data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
        }
    })
}