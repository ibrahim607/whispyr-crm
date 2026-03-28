import {
  GetLeadActivitiesRequest,
  CreateCallAttemptRequest,
  CreateNoteRequest,
} from "@/modules/activity";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activityService } from "@/services/activityService";

export function useGetLeadActivities(request: GetLeadActivitiesRequest) {
  return useQuery({
    queryKey: ["activities", request],
    queryFn: () => activityService.getActivities(request),
  });
}

export function useLogCallAttempt(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCallAttemptRequest) =>
      activityService.logCallAttempt(leadId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

export function useAddNote(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateNoteRequest) =>
      activityService.addNote(leadId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}
