import { LeadRequest, ListLeadsParams } from "@/modules/leads/schema";
import { api } from "@/utils/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const leadsService = {
    listLeads: async (params?: ListLeadsParams) => {
        const { data } = await api.get("/leads", { params });
        return data.data;
    },
    createLead: async (params: LeadRequest) => {
        const { data } = await api.post("/leads", params);
        return data.data;
    },
    updateLead: async ({ id, data }: { id: string, data: Partial<LeadRequest> }) => {
        const res = await api.patch(`/leads/${id}`, data);
        return res.data.data;
    }

}