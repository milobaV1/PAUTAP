import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import type {
  AdminSessionsResponse,
  AdminSessionSummary,
} from "@/service/interfaces/session.interface";
import { useQuery } from "@tanstack/react-query";

export async function getSessionsForAdmin(page = 1, limit = 5) {
  try {
    const response = await client.get(`/session/admin/stats`, {
      params: { page, limit },
    });
    return response.data as AdminSessionsResponse;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useGetSessionsForAdmin(page: number, limit: number) {
  return useQuery({
    queryKey: ["admin-session", page, limit],
    queryFn: () => getSessionsForAdmin(page, limit),
    placeholderData: (previousData) => previousData,
  });
}
