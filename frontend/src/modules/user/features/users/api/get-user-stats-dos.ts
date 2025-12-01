import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import type { HODStatsUserResponse } from "@/service/interfaces/user.interface";
import { useQuery } from "@tanstack/react-query";

export async function getUserForDOS(page = 1, limit = 5, searchTerm = "") {
  try {
    const response = await client.get(`/users/director-of-services/stats`, {
      params: { page, limit, search: searchTerm },
    });
    return response.data as HODStatsUserResponse;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useGetUserForDOS(
  page: number,
  limit: number,
  searchTerm: string
) {
  return useQuery({
    queryKey: ["dos-user", page, limit, searchTerm],
    queryFn: () => getUserForDOS(page, limit, searchTerm),
    placeholderData: (previousData) => previousData,
  });
}
