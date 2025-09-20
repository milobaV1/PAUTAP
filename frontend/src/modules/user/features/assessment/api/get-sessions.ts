import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import type {
  FullSessionData,
  SessionSummary,
  UsersessionData,
} from "@/service/interfaces/session.interface";
import type { getSessions } from "@/service/interfaces/session.interface";
import { useSessionStore } from "@/store/session.store";

import { useMutation, useQuery } from "@tanstack/react-query";

// export async function getSessions(data: getSessions) {
//   try {
//     const response = await client.get(
//       `/session/user/${data.userId}/statuses?userRoleId=${data.userRoleId}`
//     );
//     return response.data as UsersessionData[]; // Array, not single object
//   } catch (error) {
//     const msg = getAxiosError(error);
//     throw Error(msg);
//   }
// }

// export function useGetSessions(data: getSessions) {
//   const { userId, userRoleId } = data;
//   const setSessions = useSessionStore((state) => state.setSessions); // ✅ only extract action

//   return useQuery({
//     queryKey: ["session-with-status", { userId, userRoleId }],
//     queryFn: async () => {
//       const sessions = await getSessions(data);
//       console.log("Sessions from the api call: ", sessions);
//       setSessions(sessions); // ✅ update store
//       return sessions; // ✅ return to React Query
//     },
//   });
// }

// Updated getSessions function - returns lightweight data
export async function getSessions(
  data: getSessions
): Promise<SessionSummary[]> {
  try {
    console.log("This is point 6 of the api call");
    const response = await client.get(
      `/session/user/${data.userId}/statuses?userRoleId=${data.userRoleId}`
    );
    return response.data as SessionSummary[];
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

// NEW: Function to start/resume session and get full data
export async function startOrResumeSession(
  sessionId: string,
  userId: string,
  roleId: number
): Promise<FullSessionData> {
  try {
    console.log("This is point 1 of the api call");
    const response = await client.post(`/session/${sessionId}/start`, {
      userId,
      roleId,
    });

    console.log("This is point 5 of the api call");
    return response.data as FullSessionData;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

// Hook for lightweight session list
export function useGetSessions(data: getSessions) {
  const { userId, userRoleId } = data;
  const setSessions = useSessionStore((state) => state.setSessions);
  console.log("This is point 7 of the api call");
  return useQuery({
    queryKey: ["sessions-summary", { userId, userRoleId }],
    queryFn: async () => {
      const sessions = await getSessions(data);
      console.log("Lightweight sessions from API:", sessions);
      setSessions(sessions);
      return sessions;
    },
  });
}

// NEW: Hook for initializing full session
export function useStartOrResumeSession() {
  console.log("This is point 2 of the api call");
  const initializeSessionData = useSessionStore(
    (state) => state.initializeSessionData
  );

  console.log("This is point 3 of the api call");

  return useMutation({
    mutationFn: ({
      sessionId,
      userId,
      roleId,
    }: {
      sessionId: string;
      userId: string;
      roleId: number;
    }) => startOrResumeSession(sessionId, userId, roleId),

    onSuccess: (fullSessionData) => {
      console.log("This is point 4 of the api call");
      console.log("Full session data loaded:", fullSessionData);
      initializeSessionData(fullSessionData);
    },

    onError: (error) => {
      console.error("Failed to start/resume session:", error);
      // Handle error appropriately
    },
  });
}
