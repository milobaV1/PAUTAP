import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import type { AdminSessionsResponse } from "@/service/interfaces/session.interface";
import { useQuery } from "@tanstack/react-query";

export async function getSessionsForAdmin(
  page = 1,
  limit = 5,
  searchTerm = ""
) {
  try {
    const response = await client.get(`/session/admin/stats`, {
      params: { page, limit, search: searchTerm },
    });
    return response.data as AdminSessionsResponse;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useGetSessionsForAdmin(
  page: number,
  limit: number,
  searchTerm: string
) {
  return useQuery({
    queryKey: ["admin-session", page, limit, searchTerm],
    queryFn: () => getSessionsForAdmin(page, limit, searchTerm),
    placeholderData: (previousData) => previousData,
  });
}
