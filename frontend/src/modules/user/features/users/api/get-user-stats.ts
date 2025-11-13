import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import type { HODStatsUserResponse } from "@/service/interfaces/user.interface";
import { useQuery } from "@tanstack/react-query";

export async function getUserForHOD(
  roleId: number,
  page = 1,
  limit = 5,
  searchTerm = ""
) {
  try {
    const response = await client.get(`/users/hod/stats`, {
      params: { roleId, page, limit, search: searchTerm },
    });
    return response.data as HODStatsUserResponse;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useGetUserForHOD(
  roleId: number,
  page: number,
  limit: number,
  searchTerm: string
) {
  return useQuery({
    queryKey: ["admin-user", roleId, page, limit, searchTerm],
    queryFn: () => getUserForHOD(roleId, page, limit, searchTerm),
    placeholderData: (previousData) => previousData,
  });
}
