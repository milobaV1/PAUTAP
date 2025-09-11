import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import type { UsersessionData } from "@/service/interfaces/session.interface";
import type { getSessions } from "@/service/interfaces/session.interface";
import { useSessionStore } from "@/store/session.store";

import { useQuery } from "@tanstack/react-query";

export async function getSessions(data: getSessions) {
  try {
    const response = await client.get(
      `/session/user/${data.userId}/statuses?userRoleId=${data.userRoleId}`
    );
    return response.data as UsersessionData[]; // Array, not single object
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useGetSessions(data: getSessions) {
  const { userId, userRoleId } = data;
  const setSessions = useSessionStore((state) => state.setSessions); // ✅ only extract action

  return useQuery({
    queryKey: ["session-with-status", { userId, userRoleId }],
    queryFn: async () => {
      const sessions = await getSessions(data);
      console.log("Sessions from the api call: ", sessions);
      setSessions(sessions); // ✅ update store
      return sessions; // ✅ return to React Query
    },
  });
}
