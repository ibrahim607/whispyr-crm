import { useQuery } from "@tanstack/react-query";
import { profileService } from "@/services/profileService";

export function useGetAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: profileService.getAgents,
  });
}
