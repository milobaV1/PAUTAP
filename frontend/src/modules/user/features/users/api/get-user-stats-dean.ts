import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import type { HODStatsUserResponse } from "@/service/interfaces/user.interface";
import { useQuery } from "@tanstack/react-query";

export async function getUserForDean(
  departmentId: number,
  page = 1,
  limit = 5,
  searchTerm = ""
) {
  try {
    const response = await client.get(`/users/dean/stats`, {
      params: { departmentId, page, limit, search: searchTerm },
    });
    return response.data as HODStatsUserResponse;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useGetUserForDean(
  departmentId: number,
  page: number,
  limit: number,
  searchTerm: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["dean-user", departmentId, page, limit, searchTerm],
    queryFn: () => getUserForDean(departmentId, page, limit, searchTerm),
    placeholderData: (previousData) => previousData,
    enabled: enabled && departmentId > 0,
  });
}
