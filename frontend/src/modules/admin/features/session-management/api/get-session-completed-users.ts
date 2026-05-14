import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import { useQuery } from "@tanstack/react-query";

export interface CompletedUser {
  id: string;
  firstName: string;
  lastName: string;
  overallScore: number;
}

export interface CompletedUsersResponse {
  total: number;
  page: number;
  limit: number;
  data: CompletedUser[];
}

export async function getSessionCompletedUsers(
  sessionId: string,
  page = 1,
  limit = 5,
) {
  try {
    const response = await client.get(`/session/${sessionId}/completed-users`, {
      params: { page, limit },
    });
    return response.data as CompletedUsersResponse;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useGetSessionCompletedUsers(
  sessionId: string | null,
  page: number,
  limit: number,
) {
  return useQuery({
    queryKey: ["session-completed-users", sessionId, page, limit],
    queryFn: () => getSessionCompletedUsers(sessionId!, page, limit),
    enabled: !!sessionId, // only fetches when a session is selected
    placeholderData: (previousData) => previousData,
  });
}
