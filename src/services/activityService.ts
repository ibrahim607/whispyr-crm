import {
    GetLeadActivitiesRequest,
    ListLeadActivitiesResponseData,
    CreateCallAttemptRequest,
    CreateNoteRequest,
} from "@/modules/activity";
import { api } from "@/utils/api";

export const activityService = {
    async getActivities(request: GetLeadActivitiesRequest): Promise<ListLeadActivitiesResponseData> {
        const { data } = await api.get(`/leads/${request.leadId}/activities`, {
            params: {
                page: request.page,
                pageSize: request.pageSize,
            },
        });
        return data.data;
    },

    async logCallAttempt(leadId: string, payload: CreateCallAttemptRequest): Promise<unknown> {
        const { data } = await api.post(`/leads/${leadId}/activities/call-attempt`, payload);
        return data;
    },

    async addNote(leadId: string, payload: CreateNoteRequest): Promise<unknown> {
        const { data } = await api.post(`/leads/${leadId}/activities/notes`, payload);
        return data;
    },
};