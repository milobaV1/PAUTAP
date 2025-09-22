import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import type { DashboardResponse } from "@/service/interfaces/user.interface";
import { useQuery } from "@tanstack/react-query";

export async function getDashboard(userId: string) {
  try {
    const response = await client.get(`/users/dashboard/${userId}`);
    return response.data as DashboardResponse;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useGetDashboard(userId: string) {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const dashboard = await getDashboard(userId);
      return dashboard;
    },
    refetchInterval: 60000,
  });
}
