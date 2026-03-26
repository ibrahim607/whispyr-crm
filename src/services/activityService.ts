import { GetLeadActivitiesRequest, ListLeadActivitiesResponseData } from "@/modules/activity/schema";
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
    }
}