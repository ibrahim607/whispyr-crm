import { api } from "@/utils/api";
import {
    CreateLeadRequest,
    EditLeadRequest,
    LeadDetail,
    ListLeadsParams,
    ListLeadsResponseData,
} from "@/modules/leads/schema";

export const leadService = {
    async getLeads(params: ListLeadsParams): Promise<ListLeadsResponseData> {
        const { data } = await api.get("/leads", { params });
        return data.data;
    },

    async getLeadById(id: string): Promise<LeadDetail> {
        const { data } = await api.get(`/leads/${id}`);
        return data.data;
    },

    async createLead(lead: CreateLeadRequest): Promise<LeadDetail> {
        const { data } = await api.post("/leads", lead);
        return data.data;
    },

    async editLead(id: string, payload: EditLeadRequest): Promise<LeadDetail> {
        const { data } = await api.patch(`/leads/${id}`, payload);
        return data.data;
    },
};