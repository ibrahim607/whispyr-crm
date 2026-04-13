import { api } from "@/utils/api";
import {
    CreateLeadRequest,
    EditLeadRequest,
    LeadDetail,
    ListLeadsParams,
    ListLeadsResponseData,
    BulkLeadActionRequest,
    BulkReassignLeadsRequest,
    BulkUpdateLeadsRequest,
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

    async bulkDelete(payload: BulkLeadActionRequest): Promise<any> {
        const { data } = await api.post("/leads/bulk-delete", payload);
        return data.data;
    },

    async bulkReassign(payload: BulkReassignLeadsRequest): Promise<any> {
        const { data } = await api.post("/leads/bulk-reassign", payload);
        return data.data;
    },

    async bulkUpdate(payload: BulkUpdateLeadsRequest): Promise<any> {
        const { data } = await api.post("/leads/bulk-update", payload);
        return data.data;
    },
};