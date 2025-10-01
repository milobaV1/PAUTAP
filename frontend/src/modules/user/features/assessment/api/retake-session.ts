import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import type { RetakeSessionDto } from "@/service/interfaces/session.interface";
import { useMutation } from "@tanstack/react-query";

export async function retakeSession(data: RetakeSessionDto) {
  const { sessionId, userId } = data;
  try {
    console.log("This is point 1 of the api call");
    const response = await client.post(`/session/${sessionId}/reset-progress`, {
      userId,
    });

    console.log("This is point 5 of the api call");
    return response.data;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useRetakeSession() {
  return useMutation({
    mutationFn: retakeSession,

    onSuccess: () => {
      console.log("This is point 4 of the api call");
    },

    onError: (error) => {
      console.error("Failed to retake session:", error);
      // Handle error appropriately
    },
  });
}
