import { CreateLeadRequest, EditLeadRequest, ListLeadsParams } from "@/modules/leads";
import { api } from "@/utils/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const leadsService = {
    listLeads: async (params?: ListLeadsParams) => {
        const { data } = await api.get("/leads", { params });
        return data.data;
    },
    createLead: async (params: CreateLeadRequest) => {
        const { data } = await api.post("/leads", params);
        return data.data;
    },
    updateLead: async ({ id, data }: { id: string, data: EditLeadRequest }) => {
        const res = await api.patch(`/leads/${id}`, data);
        return res.data.data;
    }

}