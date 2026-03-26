import {
  GetLeadActivitiesRequest,
} from "@/modules/activity/schema";
import { useQuery } from "@tanstack/react-query";
import { activityService } from "@/services/activityService";

export function useGetLeadActivities(request: GetLeadActivitiesRequest) {
  return useQuery({
    queryKey: ["activities", request],
    queryFn: () => activityService.getActivities(request),
  });
}

