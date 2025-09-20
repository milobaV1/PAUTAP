import { client } from "@/lib/api/client";
import type {
  CompleteSessionPayload,
  SessionCompletionResult,
} from "@/service/interfaces/session.interface";
import { useMutation } from "@tanstack/react-query";

const completeSession = async (
  sessionId: string,
  payload: CompleteSessionPayload
): Promise<SessionCompletionResult> => {
  const { data } = await client.post(`/session/${sessionId}/complete`, payload);
  return data;
};

export const useCompleteSession = () => {
  return useMutation({
    mutationFn: ({
      sessionId,
      payload,
    }: {
      sessionId: string;
      payload: CompleteSessionPayload;
    }) => completeSession(sessionId, payload),
    onSuccess: (data) => {
      console.log("Session completed successfully:", data);
    },
    onError: (error) => {
      console.error("Failed to complete session:", error);
    },
  });
};
